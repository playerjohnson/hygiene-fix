import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UnsubscribeForm from './UnsubscribeForm';

export const metadata: Metadata = {
  title: 'Unsubscribe | HygieneFix',
  robots: 'noindex',
};

export default function UnsubscribePage() {
  return (
    <>
      <Header />
      <main className="relative z-10 max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-white mb-3">Unsubscribe</h1>
        <p className="text-sm text-white/50 mb-8">
          We&apos;re sorry to see you go. Click below to stop receiving emails from HygieneFix.
        </p>
        <UnsubscribeForm />
      </main>
      <Footer />
    </>
  );
}
