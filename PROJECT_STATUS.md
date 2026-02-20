# HygieneFix — Project Status

## Last Updated: 2026-02-20 (Session 2)

## Sprint 1 Progress

### ✅ COMPLETED
- **Next.js project scaffold** — TypeScript, Tailwind CSS, App Router
- **FSA API integration** — Search by postcode/name, fetch by FHRSID, rating counts
- **Score interpretation engine** — Hygiene (0-25), Structural (0-25), Management (0-30) with severity mapping
- **Homepage** — Hero with search, stats bar, "why it matters" section, how it works, pricing teaser, FAQ, email capture
- **Search component** — Live search with postcode/name toggle, debounced API calls, dropdown results with rating badges
- **Check page** (`/check/[fhrsid]`) — Dynamic SSR page with score breakdown, priority action, CTA for action plan, local authority info
- **Score breakdown component** — Animated bar chart with colour-coded severity
- **Email capture component** — Subscribe endpoint with Supabase backend
- **Privacy policy** — Comprehensive GDPR-compliant (~900 words)
- **Terms of service** — Full consumer protection compliance (~700 words)
- **Sitemap & robots.txt** — Next.js native generation
- **Design system** — DM Serif Display headings, Nunito Sans body, navy dark theme, rating colour system, grain overlay
- **Deployed to Vercel** — https://hygiene-fix.vercel.app (production)
- **Supabase database** — 5 tables (subscribers, establishments, rating_changes, purchases, pipeline_runs) with RLS, indexes, and TypeScript client library
- **Daily FSA pipeline** — Fetches all 0-2 rated establishments, batch change detection, upserts to Supabase, run tracking with stats
- **Vercel Cron** — Pipeline runs daily at 04:00 UTC, secured with CRON_SECRET
- **Pipeline API** — `/api/pipeline/run` with Bearer auth, dry run mode, configurable rating filter

### 🔜 SPRINT 1 REMAINING
- [ ] Google Search Console setup
- [ ] GA4 + GTM integration with cookie consent
- [ ] Verify pipeline works when FSA API recovers (currently returning 500s — external outage)

### 📋 SPRINT 2 (Week 2)
- [ ] Claude API integration for personalized checklist generation
- [ ] Checklist template with score-based personalization
- [ ] Business-type-specific modules
- [ ] PDF generation (action plan)
- [ ] Stripe payment integration (£49)
- [ ] Email delivery via Resend

### 📋 SPRINT 3 (Week 3)
- [ ] Google Places enrichment (email/phone/website for businesses)
- [ ] Personalized outreach email templates
- [ ] YAMM/Resend integration for outreach
- [ ] Personalized landing pages (/check/[FHRSID])
- [ ] Outreach tracking and cadence automation

### 📋 SPRINT 4 (Week 4)
- [ ] Programmatic pages (/ratings/[council] × 363)
- [ ] Blog content (5 articles, 1,500+ words each)
- [ ] Consultant directory (/consultants/[region])
- [ ] Consultant signup and referral tracking

## Technical Stack
- **Frontend:** Next.js 16 (React 19, TypeScript, Tailwind CSS v4)
- **Hosting:** Vercel (production: hygiene-fix.vercel.app)
- **Data:** FSA Food Hygiene Rating API (free, no auth required)
- **Database:** Supabase (project: knwzgnymhefuinoiggav)
- **Payments:** Stripe (not yet integrated)
- **Email:** Resend (not yet integrated)
- **AI:** Claude API (Sprint 2)

## Supabase Tables (hf_ prefix)
- `hf_subscribers` — Email capture with dedup, FHRSID linking, source tracking
- `hf_establishments` — Tracked low-rated businesses with enrichment + outreach fields
- `hf_rating_changes` — Audit log of detected rating changes
- `hf_purchases` — Stripe payment tracking for £49 action plans
- `hf_pipeline_runs` — Daily data pull tracking with stats

## Environment Variables (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (RLS-restricted)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server-side only)
- `CRON_SECRET` — Pipeline auth token

## URLs
- Production: https://hygiene-fix.vercel.app
- Pipeline: POST/GET https://hygiene-fix.vercel.app/api/pipeline/run (Bearer auth)
- Check page example: https://hygiene-fix.vercel.app/check/667428
