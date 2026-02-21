'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CheckCircle,
  Mail,
  FileText,
  Download,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const fhrsid = searchParams.get('fhrsid');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);

  function triggerDownload(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HygieneFix-Action-Plan.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDownload() {
    if (!sessionId) {
      setError('Missing session information. Please contact support.');
      return;
    }

    // Serve from cache if available (free, instant)
    if (cachedBlob) {
      triggerDownload(cachedBlob);
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate-plan?session_id=${encodeURIComponent(sessionId)}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `Failed to generate plan (${res.status})`);
      }

      const blob = await res.blob();
      setCachedBlob(blob);
      triggerDownload(blob);

      setDownloaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

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
          Your personalised action plan is ready to download.
        </p>

        {/* Download section */}
        <div className="mb-10">
          <div className="p-6 sm:p-8 rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 to-brand-sky/5">
            {downloaded ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-brand-green" />
                </div>
                <p className="text-sm text-white/60">
                  Your PDF has been downloaded. Check your Downloads folder.
                </p>
                <button
                  onClick={handleDownload}
                  className="text-sm text-brand-sky hover:text-brand-sky/80 transition-colors mt-2"
                >
                  Download again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <FileText className="w-10 h-10 text-brand-sky" />
                <div>
                  <p className="font-display font-bold text-white mb-1">Your Action Plan PDF</p>
                  <p className="text-sm text-white/40">
                    Personalised checklist based on your inspection scores, prioritised by impact.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue/80 disabled:opacity-60 disabled:cursor-wait text-white font-semibold transition-all text-sm"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating your plan…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Action Plan (PDF)
                    </>
                  )}
                </button>
                {downloading && (
                  <p className="text-xs text-white/30 animate-pulse">
                    This takes 15–30 seconds — we&apos;re generating a personalised plan using AI.
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 text-left">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status steps */}
        <div className="grid gap-4 text-left mb-12">
          <div className="flex items-start gap-4 p-5 rounded-xl border border-brand-green/20 bg-brand-green/5">
            <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">Payment confirmed</p>
              <p className="text-sm text-white/40">Your payment has been processed securely via Stripe.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02]">
            <Mail className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">Email backup</p>
              <p className="text-sm text-white/40">
                A copy will also be emailed to you. Check your spam folder if you don&apos;t see it within a few minutes.
              </p>
            </div>
          </div>
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
