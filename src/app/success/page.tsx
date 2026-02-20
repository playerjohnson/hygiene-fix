import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CheckCircle,
  Mail,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful — HygieneFix',
  description: 'Your personalised food hygiene action plan is being generated and will be emailed to you shortly.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string; fhrsid?: string }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const { fhrsid } = await searchParams;

  return (
    <>
      <Header />
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-brand-green" />
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
          Payment Successful
        </h1>
        <p className="text-lg text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
          Your personalised action plan is being generated and will arrive in your inbox shortly.
        </p>

        {/* Steps */}
        <div className="grid gap-4 text-left mb-12">
          <div className="flex items-start gap-4 p-5 rounded-xl border border-brand-green/20 bg-brand-green/5">
            <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">Payment confirmed</p>
              <p className="text-sm text-white/40">Your payment has been processed securely via Stripe.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-brand-blue/20 bg-brand-blue/5">
            <FileText className="w-5 h-5 text-brand-sky shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-semibold text-white text-sm">Generating your action plan</p>
              <p className="text-sm text-white/40">
                Our AI is analysing your scores and creating a personalised improvement checklist with SFBB references,
                priority rankings, and realistic timelines.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02]">
            <Mail className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">Email delivery</p>
              <p className="text-sm text-white/40">
                Your branded PDF action plan will be emailed to you within a few minutes.
                Check your spam folder if you don&apos;t see it.
              </p>
            </div>
          </div>
        </div>

        {/* Timing note */}
        <div className="flex items-center justify-center gap-2 text-sm text-white/30 mb-10">
          <Clock className="w-4 h-4" />
          <span>Usually arrives within 2–3 minutes</span>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {fhrsid && (
            <Link
              href={`/check/${fhrsid}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors text-sm"
            >
              ← Back to score breakdown
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold transition-colors text-sm"
          >
            Check another business <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
