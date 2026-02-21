import type { Metadata } from 'next';
import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export const metadata: Metadata = {
  title: 'Payment Successful — HygieneFix',
  description: 'Your personalised food hygiene action plan is ready to download.',
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
