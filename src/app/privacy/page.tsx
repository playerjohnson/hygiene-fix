import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — HygieneFix',
  description: 'HygieneFix privacy policy. How we handle your data when you use our food hygiene rating check service.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/60 leading-relaxed">
          <p className="text-white/40 text-sm">Last updated: February 2026</p>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">1. Who We Are</h2>
            <p>HygieneFix is operated by Anthony Johnson. We provide a food hygiene rating check service using publicly available data from the Food Standards Agency (FSA). For data protection enquiries, contact us at privacy@hygienefix.co.uk.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">2. What Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <p><strong className="text-white/70">Search queries:</strong> When you search for a business by postcode or name, we pass your query to the Food Standards Agency API. We do not store your search queries on our servers.</p>
            <p><strong className="text-white/70">Email addresses:</strong> If you voluntarily sign up for our email list or request an action plan, we collect your email address. This is stored securely and used only for the purposes you consented to.</p>
            <p><strong className="text-white/70">Payment data:</strong> If you purchase an action plan, payment is processed by Stripe. We never see, store, or have access to your full card details. See Stripe&apos;s privacy policy at stripe.com/privacy.</p>
            <p><strong className="text-white/70">Analytics data:</strong> We use Google Analytics 4 (GA4) via Google Tag Manager to understand how visitors use our site. This collects anonymised usage data including pages visited, time on site, and device type. Analytics cookies are only set after you provide consent via our cookie banner.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">3. Lawful Basis for Processing</h2>
            <p>Under the UK General Data Protection Regulation (UK GDPR), we process your data on the following bases:</p>
            <p><strong className="text-white/70">Consent:</strong> For email marketing and analytics cookies. You may withdraw consent at any time.</p>
            <p><strong className="text-white/70">Contractual necessity:</strong> For processing payment and delivering action plans you have purchased.</p>
            <p><strong className="text-white/70">Legitimate interest:</strong> For basic site functionality and security monitoring.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">4. Food Hygiene Rating Data</h2>
            <p>Food hygiene ratings displayed on this site are sourced from the Food Standards Agency&apos;s public API under the Open Government Licence v3.0. This data is publicly available and includes business names, addresses, ratings, and local authority information.</p>
            <p>We maintain a database of food establishments rated 0–2 on the Food Hygiene Rating Scheme to provide our service and detect rating changes. This data is refreshed daily from the FSA register. For sole traders operating food businesses, this publicly available data may be associated with an individual and may therefore constitute personal data under UK GDPR. The lawful basis for this processing is legitimate interest in providing a service that helps food businesses improve their hygiene standards.</p>
            <p>Establishments that have been rated 3 or above for six or more months are removed from our active database. If you are a sole trader and wish to have your data removed from our database, contact privacy@hygienefix.co.uk.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">5. Cookies</h2>
            <p><strong className="text-white/70">Essential cookies:</strong> Required for basic site functionality. No consent needed.</p>
            <p><strong className="text-white/70">Analytics cookies:</strong> Google Analytics (GA4) cookies are set only after you accept analytics cookies via our cookie banner. You can reject these and the site will function normally.</p>
            <p>You can manage cookie preferences at any time through your browser settings or by clearing your cookies to reset the consent banner.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">6. Third-Party Processors</h2>
            <p>We use the following third-party services that may process your data:</p>
            <p><strong className="text-white/70">Google Analytics / Google Tag Manager:</strong> Usage analytics (USA-based, EU-US Data Privacy Framework certified).</p>
            <p><strong className="text-white/70">Stripe:</strong> Payment processing (USA-based, PCI DSS Level 1 certified).</p>
            <p><strong className="text-white/70">Vercel:</strong> Website hosting (USA-based).</p>
            <p><strong className="text-white/70">Resend:</strong> Transactional email delivery (USA-based).</p>
            <p><strong className="text-white/70">Supabase:</strong> Database hosting for service data (USA-based).</p>
            <p><strong className="text-white/70">Anthropic:</strong> AI processing for action plan generation. Establishment data is sent to Claude for checklist generation. No personal customer data is included in AI requests.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">7. Data Retention</h2>
            <p>Email addresses are retained until you unsubscribe. Payment records are retained for 7 years as required by UK tax law. Analytics data is retained for 14 months (Google Analytics default). Search queries are not stored.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">8. Your Rights</h2>
            <p>Under UK GDPR, you have the right to: access your personal data, rectify inaccurate data, erase your data (&quot;right to be forgotten&quot;), restrict processing, data portability, and object to processing. To exercise any of these rights, contact privacy@hygienefix.co.uk. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">9. Complaints</h2>
            <p>If you are unhappy with how we handle your data, you have the right to complain to the Information Commissioner&apos;s Office (ICO) at ico.org.uk or by calling 0303 123 1113.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">10. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. The &quot;last updated&quot; date at the top of this page indicates the latest revision. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
