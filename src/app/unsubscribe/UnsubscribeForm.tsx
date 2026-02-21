'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function UnsubscribeFormInner() {
  const searchParams = useSearchParams();
  const fhrsid = searchParams.get('fhrsid') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    if (!fhrsid) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fhrsid: Number(fhrsid) }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="p-6 rounded-2xl border border-brand-green/20 bg-brand-green/5">
        <p className="text-sm text-brand-green font-semibold">You have been unsubscribed.</p>
        <p className="text-xs text-white/40 mt-2">You will no longer receive emails from HygieneFix.</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleUnsubscribe}
        disabled={status === 'loading' || !fhrsid}
        className="px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Processing…' : 'Confirm Unsubscribe'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-3">Something went wrong. Please try again or contact support.</p>
      )}
      {!fhrsid && (
        <p className="text-xs text-white/30 mt-3">Missing reference — please use the link from your email.</p>
      )}
    </div>
  );
}

export default function UnsubscribeForm() {
  return (
    <Suspense fallback={<div className="text-sm text-white/30">Loading…</div>}>
      <UnsubscribeFormInner />
    </Suspense>
  );
}
