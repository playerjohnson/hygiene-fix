/**
 * HygieneFix Daily Pipeline
 *
 * Pulls all 0-2 rated establishments from the FSA API,
 * upserts to Supabase, detects rating changes, and logs run stats.
 *
 * Designed to run daily via Vercel Cron (/api/pipeline/run).
 */

import {
  upsertEstablishments,
  getEstablishmentsByFhrsids,
  recordRatingChange,
  startPipelineRun,
  completePipelineRun,
  EstablishmentRow,
} from './supabase';

const FSA_BASE_URL = 'https://api.ratings.food.gov.uk';
const FSA_HEADERS = {
  'x-api-version': '2',
  Accept: 'application/json',
};

// FSA API page size — 200 is reliable without timeouts
const PAGE_SIZE = 200;
// Max pages to prevent runaway loops
const MAX_PAGES = 500;
// Batch size for Supabase upserts (avoid payload limits)
const UPSERT_BATCH_SIZE = 100;
// Delay between FSA API calls to be respectful
const API_DELAY_MS = 300;

interface PipelineStats {
  totalFetched: number;
  newEstablishments: number;
  ratingChanges: number;
  errors: number;
  errorLog: string[];
}

interface FSAEstablishmentRaw {
  FHRSID: number;
  BusinessName: string;
  BusinessType: string;
  BusinessTypeID: number;
  RatingValue: string;
  RatingDate: string;
  AddressLine1: string;
  AddressLine2: string;
  AddressLine3: string;
  AddressLine4: string;
  PostCode: string;
  LocalAuthorityName: string;
  LocalAuthorityCode: string;
  LocalAuthorityEmailAddress: string;
  geocode: { longitude: string; latitude: string };
  scores: {
    Hygiene: number | null;
    Structural: number | null;
    ConfidenceInManagement: number | null;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a single page of low-rated establishments from the FSA API.
 */
async function fetchLowRatedPage(
  page: number,
  maxRating: number = 2
): Promise<{ establishments: FSAEstablishmentRaw[]; totalPages: number; totalCount: number }> {
  const params = new URLSearchParams({
    ratingKey: String(maxRating),
    ratingOperatorKey: 'LessThanOrEqual',
    pageNumber: String(page),
    pageSize: String(PAGE_SIZE),
    sortOptionKey: 'rating',
  });

  const url = `${FSA_BASE_URL}/Establishments?${params.toString()}`;

  const res = await fetch(url, {
    headers: FSA_HEADERS,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`FSA API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return {
    establishments: data.establishments || [],
    totalPages: data.meta?.totalPages || 0,
    totalCount: data.meta?.totalCount || 0,
  };
}

/**
 * Convert an FSA API establishment to our Supabase row format.
 */
function toEstablishmentRow(est: FSAEstablishmentRaw): EstablishmentRow {
  return {
    fhrsid: est.FHRSID,
    business_name: est.BusinessName,
    business_type: est.BusinessType,
    business_type_id: est.BusinessTypeID,
    rating_value: est.RatingValue,
    rating_date: est.RatingDate || undefined,
    address_line1: est.AddressLine1 || undefined,
    address_line2: est.AddressLine2 || undefined,
    address_line3: est.AddressLine3 || undefined,
    postcode: est.PostCode || undefined,
    local_authority_name: est.LocalAuthorityName || undefined,
    local_authority_code: est.LocalAuthorityCode || undefined,
    local_authority_email: est.LocalAuthorityEmailAddress || undefined,
    hygiene_score: est.scores?.Hygiene ?? undefined,
    structural_score: est.scores?.Structural ?? undefined,
    management_score: est.scores?.ConfidenceInManagement ?? undefined,
    latitude: est.geocode?.latitude ? parseFloat(est.geocode.latitude) : undefined,
    longitude: est.geocode?.longitude ? parseFloat(est.geocode.longitude) : undefined,
  };
}

/**
 * Check a batch of establishments for rating changes against existing DB records.
 * Uses a single batch query instead of per-record lookups.
 */
async function detectRatingChanges(
  rows: EstablishmentRow[],
  stats: PipelineStats
): Promise<number> {
  let changes = 0;

  try {
    // Batch lookup: get all existing records for these FHRSIDs in one query
    const fhrsids = rows.map((r) => r.fhrsid);
    const existing = await getEstablishmentsByFhrsids(fhrsids);

    // Build lookup map
    const existingMap = new Map<number, typeof existing[0]>();
    for (const e of existing) {
      existingMap.set(e.fhrsid, e);
    }

    for (const row of rows) {
      const old = existingMap.get(row.fhrsid);

      if (!old) {
        // New establishment
        stats.newEstablishments++;
        continue;
      }

      // Compare rating
      if (old.rating_value !== row.rating_value) {
        try {
          await recordRatingChange({
            fhrsid: row.fhrsid,
            old_rating: old.rating_value,
            new_rating: row.rating_value,
            old_hygiene: old.hygiene_score ?? undefined,
            new_hygiene: row.hygiene_score,
            old_structural: old.structural_score ?? undefined,
            new_structural: row.structural_score,
            old_management: old.management_score ?? undefined,
            new_management: row.management_score,
          });
          changes++;
        } catch (err) {
          stats.errors++;
          stats.errorLog.push(`Rating change record error FHRSID ${row.fhrsid}: ${err}`);
        }
      }
    }
  } catch (err) {
    stats.errors++;
    stats.errorLog.push(`Batch change detection error: ${err}`);
  }

  return changes;
}

/**
 * Upsert a batch of establishment rows to Supabase.
 */
async function upsertBatch(rows: EstablishmentRow[], stats: PipelineStats): Promise<void> {
  try {
    await upsertEstablishments(rows);
  } catch (err) {
    stats.errors++;
    stats.errorLog.push(`Upsert batch error (${rows.length} rows): ${err}`);
  }
}

/**
 * Run the full daily pipeline.
 *
 * 1. Start a pipeline run record
 * 2. Paginate through all 0-2 rated establishments from FSA API
 * 3. For each batch: detect rating changes, then upsert
 * 4. Complete the pipeline run with stats
 */
export async function runDailyPipeline(
  maxRating: number = 2,
  dryRun: boolean = false
): Promise<PipelineStats> {
  const stats: PipelineStats = {
    totalFetched: 0,
    newEstablishments: 0,
    ratingChanges: 0,
    errors: 0,
    errorLog: [],
  };

  // Start tracking this run
  let runId: string | null = null;
  if (!dryRun) {
    try {
      const run = await startPipelineRun('daily');
      runId = run.id;
    } catch (err) {
      stats.errors++;
      stats.errorLog.push(`Failed to start pipeline run: ${err}`);
    }
  }

  console.log(`[Pipeline] Starting daily pull (maxRating=${maxRating}, dryRun=${dryRun})`);

  try {
    // First page — get total count
    const firstPage = await fetchLowRatedPage(1, maxRating);
    const totalPages = Math.min(firstPage.totalPages, MAX_PAGES);
    const totalCount = firstPage.totalCount;

    console.log(`[Pipeline] Found ${totalCount} establishments across ${totalPages} pages`);

    // Process first page
    const firstRows = firstPage.establishments.map(toEstablishmentRow);
    stats.totalFetched += firstRows.length;

    if (!dryRun && firstRows.length > 0) {
      // Detect changes BEFORE upserting (so we compare against old data)
      const changes = await detectRatingChanges(firstRows, stats);
      stats.ratingChanges += changes;

      // Upsert in batches
      for (let i = 0; i < firstRows.length; i += UPSERT_BATCH_SIZE) {
        const batch = firstRows.slice(i, i + UPSERT_BATCH_SIZE);
        await upsertBatch(batch, stats);
      }
    }

    // Process remaining pages
    for (let page = 2; page <= totalPages; page++) {
      await sleep(API_DELAY_MS);

      try {
        const pageData = await fetchLowRatedPage(page, maxRating);
        const rows = pageData.establishments.map(toEstablishmentRow);
        stats.totalFetched += rows.length;

        if (!dryRun && rows.length > 0) {
          const changes = await detectRatingChanges(rows, stats);
          stats.ratingChanges += changes;

          for (let i = 0; i < rows.length; i += UPSERT_BATCH_SIZE) {
            const batch = rows.slice(i, i + UPSERT_BATCH_SIZE);
            await upsertBatch(batch, stats);
          }
        }

        if (page % 10 === 0) {
          console.log(`[Pipeline] Progress: page ${page}/${totalPages} — ${stats.totalFetched} fetched`);
        }
      } catch (err) {
        stats.errors++;
        stats.errorLog.push(`Page ${page} fetch error: ${err}`);
        // Continue to next page on error
      }
    }
  } catch (err) {
    stats.errors++;
    stats.errorLog.push(`Pipeline fatal error: ${err}`);
  }

  // Complete the run record
  if (!dryRun && runId) {
    try {
      await completePipelineRun(runId, {
        total_fetched: stats.totalFetched,
        new_establishments: stats.newEstablishments,
        rating_changes_detected: stats.ratingChanges,
        errors: stats.errors,
        error_log: stats.errorLog.length > 0 ? stats.errorLog.join('\n') : undefined,
      });
    } catch (err) {
      console.error('[Pipeline] Failed to complete run record:', err);
    }
  }

  console.log(`[Pipeline] Complete: ${stats.totalFetched} fetched, ${stats.newEstablishments} new, ${stats.ratingChanges} changes, ${stats.errors} errors`);

  return stats;
}
