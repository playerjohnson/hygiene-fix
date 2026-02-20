'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

interface EmailCaptureProps {
  fhrsid?: string;
  context?: string;
}

export default function EmailCapture({ fhrsid, context = 'Get your free improvement checklist' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fhrsid }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-green/10 border border-brand-green/20">
        <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />
        <p className="text-sm text-white/80">
          Check your inbox — we&apos;ll send your personalised improvement tips shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-white/70">{context}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="your@email.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:border-brand-sky/50 focus:bg-white/[0.07] transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue/80 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Send
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-brand-red">{errorMsg}</p>
      )}
      <p className="text-xs text-white/25">No spam. Unsubscribe anytime. We respect your privacy.</p>
    </form>
  );
}
