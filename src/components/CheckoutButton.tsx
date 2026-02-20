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

  async function handleCheckout() {
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
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue/80 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors shrink-0 text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to checkout...
          </>
        ) : (
          <>
            Get Action Plan — £49 <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-brand-red mt-2">{error}</p>
      )}
    </div>
  );
}
