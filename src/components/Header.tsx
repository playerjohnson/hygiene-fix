'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShieldCheck, Menu, X, MapPin } from 'lucide-react';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-brand-sky flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_16px_rgba(56,189,248,0.25)]">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-white leading-none block">
              Hygiene<span className="text-brand-sky">Fix</span>
            </span>
            <span className="text-[10px] text-white/30 font-mono leading-none block mt-0.5 tracking-wide">
              Official FSA Data
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-white/55">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/#browse-areas"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-sky/10 border border-brand-sky/25 text-brand-sky text-sm font-bold hover:bg-brand-sky/20 transition-colors shrink-0"
        >
          <MapPin className="w-3.5 h-3.5" />
          Browse by Area
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      <div className={`mobile-nav-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/5">
          <Link
            href="/#browse-areas"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-blue/15 border border-brand-sky/20 text-brand-sky text-sm font-bold hover:bg-brand-blue/25 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Browse by Area
          </Link>
        </div>
      </div>
    </header>
  );
}
