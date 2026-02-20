-- HygieneFix Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- 1. SUBSCRIBERS (email capture from site)
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  fhrsid TEXT,                          -- linked establishment (if they searched one)
  business_name TEXT,                   -- denormalised for quick reference
  source TEXT DEFAULT 'website',        -- website, outreach, referral
  status TEXT DEFAULT 'active'          -- active, unsubscribed, bounced
    CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb    -- flexible extra data
);

-- Prevent duplicate emails
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);

-- Fast lookup by FHRSID
CREATE INDEX IF NOT EXISTS idx_subscribers_fhrsid ON subscribers (fhrsid) WHERE fhrsid IS NOT NULL;

-- ============================================
-- 2. ESTABLISHMENTS (tracked low-rated businesses)
-- ============================================
CREATE TABLE IF NOT EXISTS establishments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fhrsid INTEGER NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
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
  -- Enrichment fields (Google Places, etc.)
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  google_place_id TEXT,
  enriched_at TIMESTAMPTZ,
  -- Pipeline tracking
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  rating_changed_at TIMESTAMPTZ,        -- when we detected a rating change
  previous_rating TEXT,                  -- what it was before
  -- Outreach tracking
  outreach_status TEXT DEFAULT 'new'
    CHECK (outreach_status IN ('new', 'queued', 'sent', 'opened', 'clicked', 'converted', 'unsubscribed', 'skipped')),
  outreach_sent_at TIMESTAMPTZ,
  outreach_opened_at TIMESTAMPTZ,
  outreach_clicked_at TIMESTAMPTZ
);

-- Fast lookups
CREATE INDEX IF NOT EXISTS idx_establishments_rating ON establishments (rating_value);
CREATE INDEX IF NOT EXISTS idx_establishments_postcode ON establishments (postcode);
CREATE INDEX IF NOT EXISTS idx_establishments_la ON establishments (local_authority_code);
CREATE INDEX IF NOT EXISTS idx_establishments_outreach ON establishments (outreach_status);
CREATE INDEX IF NOT EXISTS idx_establishments_updated ON establishments (last_updated_at);

-- ============================================
-- 3. RATING CHANGES (audit log of detected changes)
-- ============================================
CREATE TABLE IF NOT EXISTS rating_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fhrsid INTEGER NOT NULL REFERENCES establishments(fhrsid),
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

CREATE INDEX IF NOT EXISTS idx_rating_changes_fhrsid ON rating_changes (fhrsid);
CREATE INDEX IF NOT EXISTS idx_rating_changes_detected ON rating_changes (detected_at);

-- ============================================
-- 4. PURCHASES (action plan sales)
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fhrsid INTEGER,
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount_pence INTEGER NOT NULL DEFAULT 4900,  -- £49.00
  currency TEXT DEFAULT 'gbp',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  checklist_generated BOOLEAN DEFAULT FALSE,
  checklist_url TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases (email);
CREATE INDEX IF NOT EXISTS idx_purchases_fhrsid ON purchases (fhrsid);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON purchases (stripe_session_id);

-- ============================================
-- 5. PIPELINE RUNS (track daily data pulls)
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_runs (
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
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role full access" ON subscribers FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON establishments FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON rating_changes FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON purchases FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON pipeline_runs FOR ALL
  USING (auth.role() = 'service_role');

-- Anon role can insert subscribers (for email capture from frontend)
CREATE POLICY "Anon can subscribe" ON subscribers FOR INSERT
  WITH CHECK (auth.role() = 'anon');

-- Anon role can read establishments (for public check pages)  
CREATE POLICY "Anon can read establishments" ON establishments FOR SELECT
  USING (auth.role() = 'anon');
