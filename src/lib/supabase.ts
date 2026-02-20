import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Client for browser / public operations (respects RLS)
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null;

function requireAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return supabaseAdmin;
}

// ============================================
// Subscribers
// ============================================

export async function addSubscriber(
  email: string,
  fhrsid?: string,
  businessName?: string,
  source: string = 'website'
) {
  const { data, error } = await requireAdmin()
    .from('subscribers')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        fhrsid: fhrsid || null,
        business_name: businessName || null,
        source,
        status: 'active',
        subscribed_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSubscriberCount(): Promise<number> {
  const { count, error } = await requireAdmin()
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (error) throw error;
  return count || 0;
}

// ============================================
// Establishments
// ============================================

export interface EstablishmentRow {
  fhrsid: number;
  business_name: string;
  business_type?: string;
  business_type_id?: number;
  rating_value: string;
  rating_date?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  postcode?: string;
  local_authority_name?: string;
  local_authority_code?: string;
  local_authority_email?: string;
  hygiene_score?: number;
  structural_score?: number;
  management_score?: number;
  latitude?: number;
  longitude?: number;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  outreach_status?: string;
}

export async function upsertEstablishment(est: EstablishmentRow) {
  const { data, error } = await requireAdmin()
    .from('establishments')
    .upsert(
      {
        ...est,
        last_updated_at: new Date().toISOString(),
      },
      { onConflict: 'fhrsid' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertEstablishments(establishments: EstablishmentRow[]) {
  const rows = establishments.map((est) => ({
    ...est,
    last_updated_at: new Date().toISOString(),
  }));

  const { data, error } = await requireAdmin()
    .from('establishments')
    .upsert(rows, { onConflict: 'fhrsid' })
    .select();

  if (error) throw error;
  return data;
}

export async function getEstablishmentByFhrsid(fhrsid: number) {
  const { data, error } = await requireAdmin()
    .from('establishments')
    .select('*')
    .eq('fhrsid', fhrsid)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function getEstablishmentsByRating(maxRating: number, limit: number = 50) {
  const { data, error } = await requireAdmin()
    .from('establishments')
    .select('*')
    .lte('rating_value', String(maxRating))
    .order('rating_value', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getNewEstablishments(since: string, limit: number = 100) {
  const { data, error } = await requireAdmin()
    .from('establishments')
    .select('*')
    .gte('first_seen_at', since)
    .eq('outreach_status', 'new')
    .order('first_seen_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ============================================
// Rating Changes
// ============================================

export async function recordRatingChange(change: {
  fhrsid: number;
  old_rating: string;
  new_rating: string;
  old_hygiene?: number;
  new_hygiene?: number;
  old_structural?: number;
  new_structural?: number;
  old_management?: number;
  new_management?: number;
}) {
  const { data, error } = await requireAdmin()
    .from('rating_changes')
    .insert(change)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Pipeline Runs
// ============================================

export async function startPipelineRun(runType: 'daily' | 'full' | 'manual' = 'daily') {
  const { data, error } = await requireAdmin()
    .from('pipeline_runs')
    .insert({ run_type: runType })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completePipelineRun(
  runId: string,
  stats: {
    total_fetched: number;
    new_establishments: number;
    rating_changes_detected: number;
    errors: number;
    error_log?: string;
  }
) {
  const { error } = await requireAdmin()
    .from('pipeline_runs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...stats,
    })
    .eq('id', runId);

  if (error) throw error;
}

// ============================================
// Purchases
// ============================================

export async function createPurchase(purchase: {
  fhrsid?: number;
  email: string;
  stripe_session_id: string;
  amount_pence?: number;
}) {
  const { data, error } = await requireAdmin()
    .from('purchases')
    .insert({
      ...purchase,
      amount_pence: purchase.amount_pence || 4900,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completePurchase(stripeSessionId: string, paymentIntent: string) {
  const { data, error } = await requireAdmin()
    .from('purchases')
    .update({
      status: 'completed',
      stripe_payment_intent: paymentIntent,
    })
    .eq('stripe_session_id', stripeSessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
