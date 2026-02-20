import { NextRequest, NextResponse } from 'next/server';
import { runDailyPipeline } from '@/lib/pipeline';

/**
 * POST /api/pipeline/run
 *
 * Triggers the daily FSA data pipeline.
 * Secured via PIPELINE_SECRET or Vercel Cron authorization.
 *
 * Query params:
 *   ?dryRun=true  — fetch only, don't write to DB
 *   ?maxRating=1  — override max rating filter (default 2)
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  // Manual triggers use: Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse options
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === 'true';
  const maxRating = parseInt(url.searchParams.get('maxRating') || '2', 10);

  console.log(`[Pipeline API] Triggered: dryRun=${dryRun}, maxRating=${maxRating}`);

  try {
    const stats = await runDailyPipeline(maxRating, dryRun);

    return NextResponse.json({
      success: true,
      dryRun,
      stats: {
        totalFetched: stats.totalFetched,
        newEstablishments: stats.newEstablishments,
        ratingChanges: stats.ratingChanges,
        errors: stats.errors,
        errorLog: stats.errorLog.length > 0 ? stats.errorLog.slice(0, 20) : undefined,
      },
    });
  } catch (error) {
    console.error('[Pipeline API] Fatal error:', error);
    return NextResponse.json(
      { error: 'Pipeline failed', message: String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron (cron jobs send GET requests)
export async function GET(request: NextRequest) {
  return POST(request);
}
