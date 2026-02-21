# HygieneFix — Project Status

## Last Updated: 2026-02-21 (Session 5 — Env Vars Confirmed)

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
- **Privacy policy** — Comprehensive GDPR-compliant (~1,000 words, updated with pipeline data processing disclosure)
- **Terms of service** — Full consumer protection compliance (~900 words, updated with AI-generated content section)
- **Sitemap & robots.txt** — Next.js native generation
- **Design system** — DM Serif Display headings, Nunito Sans body, navy dark theme, rating colour system, grain overlay
- **Deployed to Vercel** — https://hygiene-fix.vercel.app (production)
- **Supabase database** — 5 tables (subscribers, establishments, rating_changes, purchases, pipeline_runs) with RLS, indexes, and TypeScript client library
- **Daily FSA pipeline** — Fetches all 0-2 rated establishments, batch change detection, upserts to Supabase, run tracking with stats
- **Vercel Cron** — Pipeline runs daily at 04:00 UTC, secured with CRON_SECRET

### 🔜 SPRINT 1 REMAINING (deferred until custom domain)
- [ ] Google Search Console setup
- [ ] GA4 + GTM integration (cookie consent banner is now in place)
- [ ] Verify pipeline works when FSA API recovers

## Sprint 2 Progress

### ✅ COMPLETED
- **Claude API checklist generator** — Score-based personalised action plan with SFBB references, priority rankings, business-type tailoring, allergen management (Natasha's Law), reinspection process details
- **PDF generator** — Branded A4 PDF with jsPDF: cover, score breakdown, checklist sections with checkboxes, re-inspection advice, timeline
- **Stripe checkout** — `/api/checkout` creates Stripe Checkout sessions with £49 pricing, FHRSID metadata
- **Stripe webhook** — `/api/webhook` handles checkout.session.completed: generates checklist → PDF → sends email → records purchase (signature verification via constructEvent)
- **Email delivery** — Resend integration with branded HTML email + PDF attachment
- **Checkout button component** — Client-side with loading state, error handling, consumer cancellation rights checkbox, Stripe redirect
- **Success page** — `/success` with payment confirmation, generation progress steps, next actions
- **Purchase tracking** — Supabase hf_purchases table with create/complete lifecycle

### 🔜 SPRINT 2 REMAINING
- [x] Set Stripe env vars in Vercel (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) ✅
- [x] Set Anthropic env var in Vercel (ANTHROPIC_API_KEY) ✅
- [x] Set Resend env var in Vercel (RESEND_API_KEY, FROM_EMAIL) ✅
- [x] Set NEXT_PUBLIC_BASE_URL in Vercel for correct redirect URLs ✅
- [x] Configure Stripe webhook endpoint — signature verification confirmed working ✅
- [ ] End-to-end test purchase: search → check → checkout → webhook → Claude → PDF → email delivery (use test card 4242...)

## White-Collar Audit Fixes (Phase 1) ✅ 2026-02-20

### Legal/Compliance
- ✅ Consumer cancellation rights checkbox (Consumer Contracts Regs 2013) — button disabled until confirmed
- ✅ AI-generated content disclaimer in Terms of Service (new section 5)
- ✅ Privacy policy updated: pipeline data processing for sole traders, Supabase + Anthropic as processors
- ✅ Cookie consent banner (localStorage-based, blocks analytics until accepted)
- ✅ Pre-purchase AI disclaimer on /check/ CTA section

### Security
- ✅ Security headers: X-Frame-Options DENY, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### Product/UX
- ✅ Delivery platform urgency warning on /check/ pages (Deliveroo/Just Eat/Uber Eats removal risk)
- ✅ Brand assets: favicon (32x32, 16x16), apple-touch-icon (180x180), OG image (1200x630)
- ✅ Removed default Next.js placeholder SVGs

### AI Quality
- ✅ Allergen management (Natasha's Law) added to Claude checklist prompt
- ✅ Management documentation weighting strengthened
- ✅ Reinspection process details added to prompt

### Audit Fixes Still TODO (Phase 2+)
- [ ] Register hygienefix.co.uk custom domain
- [x] Set 6 Vercel env vars to activate revenue ✅ All 10 env vars confirmed set
- [ ] End-to-end test purchase with test card
- [ ] Create sample action plan PDF for preview ("See what you get")
- [ ] GA4 + GTM with conversion funnel events
- [ ] UptimeRobot monitoring
- [ ] Pipeline health alert (email if no successful run in 25h)
- [ ] Sprint 4 council pages (363 programmatic pages)
- [ ] Blog content (5 articles, 1,500+ words each)
- [ ] EH Consultant referral programme
- [ ] Resend broadcast sequence for subscriber list
- [ ] Scotland/Wales jurisdiction detection and messaging
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
- **Payments:** Stripe Checkout (£49 action plans)
- **Email:** Resend (branded HTML + PDF attachments)
- **AI:** Claude Sonnet 4 via Anthropic SDK (checklist generation)
- **PDF:** jsPDF (server-side A4 generation)

## Supabase Tables (hf_ prefix)
- `hf_subscribers` — Email capture with dedup, FHRSID linking, source tracking
- `hf_establishments` — Tracked low-rated businesses with enrichment + outreach fields
- `hf_rating_changes` — Audit log of detected rating changes
- `hf_purchases` — Stripe payment tracking for £49 action plans
- `hf_pipeline_runs` — Daily data pull tracking with stats

## Environment Variables (Vercel) — ALL SET ✅
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (RLS-restricted) ✅
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server-side only) ✅
- `CRON_SECRET` — Pipeline auth token ✅
- `STRIPE_SECRET_KEY` — Stripe secret key ✅
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret ✅
- `ANTHROPIC_API_KEY` — Claude API key ✅
- `RESEND_API_KEY` — Resend email API key ✅
- `FROM_EMAIL` — Sender email address ✅
- `NEXT_PUBLIC_BASE_URL` — Production URL for Stripe redirects ✅

## URLs
- Production: https://hygiene-fix.vercel.app
- Pipeline: POST/GET https://hygiene-fix.vercel.app/api/pipeline/run (Bearer auth)
- Checkout: POST https://hygiene-fix.vercel.app/api/checkout
- Webhook: POST https://hygiene-fix.vercel.app/api/webhook (Stripe signature)
- Success: https://hygiene-fix.vercel.app/success?session_id=...&fhrsid=...
- Check page example: https://hygiene-fix.vercel.app/check/667428

## Sprint 2 Architecture
```
User clicks "Get Action Plan — £49" on /check/[fhrsid]
    ↓
POST /api/checkout → creates Stripe Checkout Session → redirect to Stripe
    ↓
User completes payment on Stripe
    ↓
Stripe sends webhook to POST /api/webhook
    ↓
Webhook handler:
  1. Records purchase in hf_purchases (Supabase)
  2. Fetches establishment from FSA API
  3. Calls Claude Sonnet 4 to generate personalised checklist
  4. Generates branded A4 PDF via jsPDF
  5. Sends email via Resend (HTML + PDF attachment)
  6. Marks purchase as completed
    ↓
User sees /success page → checks email for PDF
```
