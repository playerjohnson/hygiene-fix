import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, ArrowRight, Users, PoundSterling, BarChart3, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Partner With HygieneFix | EH Consultant Referral Programme',
  description: 'Earn 20% commission referring food businesses to HygieneFix. Environmental Health consultants, food safety trainers, and pest control companies welcome.',
};

const BENEFITS = [
  {
    icon: PoundSterling,
    title: '20% Commission',
    desc: 'Earn £9.80 for every action plan purchased through your referral link. Paid monthly via bank transfer.',
  },
  {
    icon: Users,
    title: 'Help Your Clients',
    desc: 'Give clients a clear, prioritised improvement plan that complements your professional advice and SFBB implementation.',
  },
  {
    icon: BarChart3,
    title: 'Track Referrals',
    desc: 'Access a partner dashboard showing clicks, conversions, and earnings. Full transparency on performance.',
  },
];

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-8">
          ← Back to home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-semibold mb-4">
            <Users className="w-3.5 h-3.5" />
            Partner Programme
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Earn 20% Referring Food Businesses to HygieneFix
          </h1>
          <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
            If you work with food businesses — as an Environmental Health consultant, food safety trainer,
            pest control provider, or letting agent — you can earn commission by referring clients who need
            to improve their food hygiene rating.
          </p>
        </div>

        {/* Benefits */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-brand-sky" />
                </div>
                <h3 className="font-display text-base font-bold mb-2">{b.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold mb-6">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Apply below', desc: 'Tell us about your business and how you work with food establishments. We approve most applications within 48 hours.' },
              { step: '02', title: 'Get your referral link', desc: 'Receive a unique partner URL that tracks all referrals. Share it in emails, reports, or your website.' },
              { step: '03', title: 'Earn commission', desc: 'When a referred business purchases an action plan (£49), you earn £9.80. We pay monthly via bank transfer with a minimum payout of £50.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="font-mono text-xs text-brand-sky/50 mt-1">{s.step}</span>
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">{s.title}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold mb-6">Who Should Partner With Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Environmental Health consultants',
              'Food safety trainers & Level 2/3 providers',
              'Pest control companies',
              'Commercial kitchen suppliers',
              'Letting agents (food premises)',
              'Local authority referral partnerships',
              'Accountants serving hospitality',
              'Business coaches in food & hospitality',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-10">
          <div className="p-6 sm:p-8 rounded-2xl border border-brand-sky/20 bg-gradient-to-br from-brand-blue/10 to-brand-sky/5 text-center">
            <Mail className="w-8 h-8 text-brand-sky mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold mb-2">Apply to Partner</h3>
            <p className="text-sm text-white/40 mb-6 max-w-md mx-auto">
              Send us a short email with your name, business, and how you work with food businesses.
              We will get back to you within 48 hours with your referral link.
            </p>
            <a
              href="mailto:partners@hygienefix.co.uk?subject=Partner%20Application&body=Hi%20HygieneFix%2C%0A%0AI%27d%20like%20to%20apply%20for%20your%20referral%20programme.%0A%0AName%3A%20%0ABusiness%3A%20%0ARole%3A%20%0AHow%20I%20work%20with%20food%20businesses%3A%20%0AEstimated%20monthly%20referrals%3A%20%0A%0AThanks"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-sky text-brand-navy text-sm font-bold hover:bg-brand-sky/90 transition-colors"
            >
              Email us to apply <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        <div className="text-xs text-white/20 text-center leading-relaxed">
          <p>
            Referral commission is paid on completed purchases only. Cookie attribution window is 30 days.
            HygieneFix reserves the right to modify commission rates with 30 days notice.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
