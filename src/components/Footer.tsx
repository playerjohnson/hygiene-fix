import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-brand-blue flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">
                Hygiene<span className="text-brand-sky">Fix</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Helping UK food businesses understand and improve their food hygiene ratings. Data sourced from the Food Standards Agency.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Resources</h4>
            <div className="flex flex-col gap-2 text-sm text-white/40">
              <Link href="/#how-it-works" className="hover:text-white/70 transition-colors">How It Works</Link>
              <Link href="/faq" className="hover:text-white/70 transition-colors">FAQ</Link>
              <Link href="/blog" className="hover:text-white/70 transition-colors">Blog</Link>
              <Link href="/#browse-areas" className="hover:text-white/70 transition-colors">Browse by Area</Link>
              <Link href="/partners" className="hover:text-white/70 transition-colors">Partner Programme</Link>
              <a href="https://www.food.gov.uk/safety-hygiene/food-hygiene-rating-scheme" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">FSA FHRS Scheme ↗</a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white/70 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} HygieneFix. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Ratings data: Food Standards Agency — Open Government Licence v3.0
          </p>
        </div>
      </div>
    </footer>
  );
}
