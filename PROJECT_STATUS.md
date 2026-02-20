# HygieneFix — Project Status

## Last Updated: 2026-02-20

## Sprint 1 Progress

### ✅ COMPLETED
- **Next.js project scaffold** — TypeScript, Tailwind CSS, App Router
- **FSA API integration** — Search by postcode/name, fetch by FHRSID, rating counts
- **Score interpretation engine** — Hygiene (0-25), Structural (0-25), Management (0-30) with severity mapping
- **Homepage** — Hero with search, stats bar, "why it matters" section, how it works, pricing teaser, FAQ, email capture
- **Search component** — Live search with postcode/name toggle, debounced API calls, dropdown results with rating badges
- **Check page** (`/check/[fhrsid]`) — Dynamic SSR page with score breakdown, priority action, CTA for action plan, local authority info
- **Score breakdown component** — Animated bar chart with colour-coded severity
- **Email capture component** — Subscribe endpoint (MVP: in-memory, production: Supabase)
- **Privacy policy** — Comprehensive GDPR-compliant (~900 words)
- **Terms of service** — Full consumer protection compliance (~700 words)
- **Sitemap & robots.txt** — Next.js native generation
- **Design system** — DM Serif Display headings, Nunito Sans body, navy dark theme, rating colour system, grain overlay
- **Deployed to Vercel** — https://hygiene-fix.vercel.app (production)

### 🔜 SPRINT 1 REMAINING
- [ ] GitHub repo creation and push
- [ ] Google Search Console setup
- [ ] GA4 + GTM integration with cookie consent
- [ ] Supabase database setup (replace in-memory email storage)
- [ ] Daily data pipeline script (pull 0-2 rated businesses)
- [ ] Change detection (identify NEW low ratings daily)

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
- **Payments:** Stripe (not yet integrated)
- **Email:** Resend (not yet integrated)
- **Database:** Supabase (not yet set up)
- **AI:** Claude API (Sprint 2)

## URLs
- Production: https://hygiene-fix.vercel.app
- API test: https://hygiene-fix.vercel.app/api/search?q=SW1A+1AA&type=postcode
- Check page example: https://hygiene-fix.vercel.app/check/667428
