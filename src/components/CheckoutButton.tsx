'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  fhrsid: string;
  businessName: string;
}

export default function CheckoutButton({ fhrsid, businessName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);

  async function handleCheckout() {
    if (!consented) {
      setError('Please confirm you consent to immediate delivery before proceeding.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fhrsid, businessName }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Consumer Contracts Regulations 2013 — cancellation rights waiver */}
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => { setConsented(e.target.checked); setError(null); }}
          className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-blue focus:ring-brand-blue/40 accent-brand-blue shrink-0"
        />
        <span className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/50 transition-colors">
          I consent to immediate delivery of my action plan and acknowledge that I waive my 14-day right
          to cancel once the PDF has been generated, in accordance with the Consumer Contracts Regulations 2013.
        </span>
      </label>

      <button
        onClick={handleCheckout}
        disabled={loading || !consented}
        className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue/80 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all shrink-0 text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to checkout…
          </>
        ) : (
          <>
            Get Action Plan — £49 <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-brand-red">{error}</p>
      )}
    </div>
  );
}
