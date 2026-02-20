'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('hf_cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem('hf_cookie_consent', 'accepted');
    setVisible(false);
    // Future: initialise GA4/GTM here
  }

  function reject() {
    localStorage.setItem('hf_cookie_consent', 'rejected');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9998] p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto bg-brand-dark border border-white/10 rounded-2xl p-5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        <p className="text-sm text-white/60 leading-relaxed mb-4">
          We use cookies to analyse site usage and improve our service. No advertising cookies are used.
          See our{' '}
          <Link href="/privacy" className="text-brand-sky hover:underline">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={accept}
            className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue/80 text-white text-sm font-semibold transition-colors"
          >
            Accept
          </button>
          <button
            onClick={reject}
            className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-sm font-medium transition-colors"
          >
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
