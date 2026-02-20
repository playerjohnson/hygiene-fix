-- HygieneFix Tables (hf_ prefix)
-- Shared Supabase project: knwzgnymhefuinoiggav
-- Run in: Supabase Dashboard > SQL Editor > New Query

-- ============================================
-- 1. hf_subscribers (email capture from site)
-- ============================================
CREATE TABLE IF NOT EXISTS hf_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  fhrsid TEXT,
  business_name TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hf_subscribers_email ON hf_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_hf_subscribers_fhrsid ON hf_subscribers (fhrsid) WHERE fhrsid IS NOT NULL;

-- ============================================
-- 2. hf_establishments (tracked low-rated businesses)
-- ============================================
CREATE TABLE IF NOT EXISTS hf_establishments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fhrsid INTEGER NOT NULL UNIQUE,
  business_name TEXT,
  business_type TEXT,
  business_type_id INTEGER,
  rating_value TEXT NOT NULL,
  rating_date DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  address_line3 TEXT,
  postcode TEXT,
  local_authority_name TEXT,
  local_authority_code TEXT,
  local_authority_email TEXT,
  hygiene_score INTEGER,
  structural_score INTEGER,
  management_score INTEGER,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  google_place_id TEXT,
  enriched_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  rating_changed_at TIMESTAMPTZ,
  previous_rating TEXT,
  outreach_status TEXT DEFAULT 'new'
    CHECK (outreach_status IN ('new', 'queued', 'sent', 'opened', 'clicked', 'converted', 'unsubscribed', 'skipped')),
  outreach_sent_at TIMESTAMPTZ,
  outreach_opened_at TIMESTAMPTZ,
  outreach_clicked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hf_est_rating ON hf_establishments (rating_value);
CREATE INDEX IF NOT EXISTS idx_hf_est_postcode ON hf_establishments (postcode);
CREATE INDEX IF NOT EXISTS idx_hf_est_la ON hf_establishments (local_authority_code);
CREATE INDEX IF NOT EXISTS idx_hf_est_outreach ON hf_establishments (outreach_status);
CREATE INDEX IF NOT EXISTS idx_hf_est_updated ON hf_establishments (last_updated_at);

-- ============================================
-- 3. hf_rating_changes (audit log)
-- ============================================
CREATE TABLE IF NOT EXISTS hf_rating_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fhrsid INTEGER NOT NULL REFERENCES hf_establishments(fhrsid),
  old_rating TEXT NOT NULL,
  new_rating TEXT NOT NULL,
  old_hygiene INTEGER,
  new_hygiene INTEGER,
  old_structural INTEGER,
  new_structural INTEGER,
  old_management INTEGER,
  new_management INTEGER,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hf_rc_fhrsid ON hf_rating_changes (fhrsid);
CREATE INDEX IF NOT EXISTS idx_hf_rc_detected ON hf_rating_changes (detected_at);

-- ============================================
-- 4. hf_purchases (action plan sales)
-- ============================================
CREATE TABLE IF NOT EXISTS hf_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fhrsid INTEGER,
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount_pence INTEGER NOT NULL DEFAULT 4900,
  currency TEXT DEFAULT 'gbp',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  checklist_generated BOOLEAN DEFAULT FALSE,
  checklist_url TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_hf_purch_email ON hf_purchases (email);
CREATE INDEX IF NOT EXISTS idx_hf_purch_fhrsid ON hf_purchases (fhrsid);
CREATE INDEX IF NOT EXISTS idx_hf_purch_stripe ON hf_purchases (stripe_session_id);

-- ============================================
-- 5. hf_pipeline_runs (daily data pull tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS hf_pipeline_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type TEXT NOT NULL DEFAULT 'daily'
    CHECK (run_type IN ('daily', 'full', 'manual')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed')),
  total_fetched INTEGER DEFAULT 0,
  new_establishments INTEGER DEFAULT 0,
  rating_changes_detected INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  error_log TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE hf_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf_establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf_rating_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hf_pipeline_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hf_service_subscribers" ON hf_subscribers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "hf_service_establishments" ON hf_establishments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "hf_service_rating_changes" ON hf_rating_changes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "hf_service_purchases" ON hf_purchases FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "hf_service_pipeline_runs" ON hf_pipeline_runs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "hf_anon_subscribe" ON hf_subscribers FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "hf_anon_read_est" ON hf_establishments FOR SELECT USING (auth.role() = 'anon');
