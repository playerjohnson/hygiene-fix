'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import RatingBadge from '@/components/RatingBadge';
import { Search, MapPin, Building2, ArrowRight, X } from 'lucide-react';

interface Establishment {
  FHRSID: number;
  BusinessName: string;
  BusinessType: string;
  RatingValue: string;
  AddressLine1?: string;
  PostCode?: string;
}

interface Props {
  establishments: Establishment[];
  totalCount: number;
  authorityName: string;
}

export default function CouncilEstablishments({ establishments, totalCount, authorityName }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return establishments;
    const q = query.toLowerCase().trim();
    return establishments.filter((est) => {
      const name = est.BusinessName?.toLowerCase() || '';
      const postcode = est.PostCode?.toLowerCase() || '';
      const address = est.AddressLine1?.toLowerCase() || '';
      const type = est.BusinessType?.toLowerCase() || '';
      return name.includes(q) || postcode.includes(q) || address.includes(q) || type.includes(q);
    });
  }, [query, establishments]);

  return (
    <>
      {/* Filter input */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter by name, postcode, or type…`}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30 focus:border-brand-sky/40 focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {query && (
          <p className="text-xs text-white/30 mt-2">
            {filtered.length} of {establishments.length} businesses match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((est) => {
            const address = [est.AddressLine1, est.PostCode].filter(Boolean).join(', ');
            return (
              <Link
                key={est.FHRSID}
                href={`/check/${est.FHRSID}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
              >
                <RatingBadge rating={est.RatingValue} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                    {est.BusinessName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/35 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {address}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {est.BusinessType}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-brand-sky transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/40 text-center py-8">
          No businesses match &ldquo;{query}&rdquo; in {authorityName}. Try a different search.
        </p>
      )}

      {!query && totalCount > establishments.length && (
        <p className="text-xs text-white/30 mt-4 text-center">
          Showing {establishments.length} of {totalCount.toLocaleString()} businesses.
        </p>
      )}
    </>
  );
}
