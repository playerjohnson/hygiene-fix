import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — HygieneFix',
  description: 'HygieneFix terms of service for our food hygiene rating check and action plan service.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/60 leading-relaxed">
          <p className="text-white/40 text-sm">Last updated: February 2026</p>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">1. Service Description</h2>
            <p>HygieneFix provides a food hygiene rating check service and personalised improvement action plans for UK food businesses. Our free service displays publicly available Food Standards Agency (FSA) data with score interpretation. Our paid service (£49) generates a personalised action plan based on your establishment&apos;s specific score breakdown.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">2. Not Professional Advice</h2>
            <p>HygieneFix is an informational tool only. Our action plans and score interpretations do not constitute professional food safety advice, consultancy, or formal assessment. The information provided should not be relied upon as a substitute for professional food safety advice from a qualified Environmental Health Practitioner or food safety consultant. We are not affiliated with the Food Standards Agency or any local authority.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">3. Data Accuracy</h2>
            <p>Food hygiene ratings displayed on this site are sourced from the Food Standards Agency&apos;s public API. While we endeavour to display accurate and up-to-date information, there may be delays between an inspection and the data appearing on the FSA register. We cannot guarantee the accuracy, completeness, or timeliness of the displayed data. Always verify your current rating directly with your local authority if in doubt.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">4. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, HygieneFix shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. This includes, but is not limited to: any loss of business, revenue, or profits resulting from actions taken based on our action plans or score interpretations; any failure to achieve a higher food hygiene rating following our recommendations; any costs incurred for re-inspections, remedial works, or professional consultancy.</p>
            <p>Our total liability for any claim arising from the use of the service shall not exceed the amount you paid for the service (£49 for an action plan, or £0 for the free rating check).</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">5. Paid Action Plans</h2>
            <p>Action plans are delivered as digital content. Payment is processed securely by Stripe. By purchasing an action plan, you consent to immediate delivery of the digital content and acknowledge that you lose your right to cancel under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 once the action plan has been generated.</p>
            <p>We offer a 30-day money-back guarantee. If you are unsatisfied with your action plan for any reason, contact us within 30 days of purchase for a full refund.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">6. Acceptable Use</h2>
            <p>You agree not to: use the service for any unlawful purpose; attempt to access data for businesses you do not own or manage for purposes of harassment or defamation; scrape, harvest, or bulk-download data from the service; attempt to circumvent any rate limiting or security measures; misrepresent your identity or affiliation with a business.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">7. Intellectual Property</h2>
            <p>The HygieneFix name, logo, website design, and action plan format are the intellectual property of HygieneFix. Food hygiene rating data is Crown copyright, used under the Open Government Licence v3.0. You may use your purchased action plan for internal business purposes. You may not resell, redistribute, or commercially exploit action plans.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">8. Governing Law</h2>
            <p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">9. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance. Material changes will be communicated via email to registered users.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-white/80 mb-3">10. Contact</h2>
            <p>For questions about these terms, contact us at hello@hygienefix.co.uk.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
