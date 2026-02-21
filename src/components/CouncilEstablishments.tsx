'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import RatingBadge from '@/components/RatingBadge';
import { Search, MapPin, Building2, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';

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

const PAGE_SIZE = 20;

export default function CouncilEstablishments({ establishments, totalCount, authorityName }: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <>
      {/* Filter input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Filter by name, postcode, or type…"
            className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30 focus:border-brand-sky/40 focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
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
      {paged.length > 0 ? (
        <div className="space-y-3">
          {paged.map((est) => {
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && <span className="text-xs text-white/20 px-1">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`min-w-[2rem] h-8 rounded-lg text-xs font-semibold transition-colors ${
                        p === page
                          ? 'bg-brand-blue text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!query && totalCount > establishments.length && (
        <p className="text-xs text-white/30 mt-4 text-center">
          Showing {establishments.length} of {totalCount.toLocaleString()} businesses in {authorityName}.
        </p>
      )}
    </>
  );
}
