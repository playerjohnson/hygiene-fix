'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Store, Loader2, X } from 'lucide-react';
import { FSAEstablishment } from '@/lib/types';
import RatingBadge from './RatingBadge';

interface SearchBarProps {
  onSelect?: (establishment: FSAEstablishment) => void;
  size?: 'default' | 'hero';
}

export default function SearchBar({ onSelect, size = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'postcode' | 'name'>('postcode');
  const [results, setResults] = useState<FSAEstablishment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = async (q: string) => {
    if (q.length < 2) { setResults([]); setShowResults(false); setError(null); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${searchType}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.establishments || []);
        setTotalCount(data.meta?.totalCount || 0);
        setShowResults(true);
      } else {
        setResults([]);
        setError('The food hygiene database is temporarily unavailable. Please try again in a few minutes.');
        setShowResults(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setError('Could not connect to the search service. Please check your connection and try again.');
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSelect = (est: FSAEstablishment) => {
    setShowResults(false);
    if (onSelect) {
      onSelect(est);
    } else {
      window.location.href = `/check/${est.FHRSID}`;
    }
  };

  const isHero = size === 'hero';

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search type toggle */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setSearchType('postcode')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            searchType === 'postcode'
              ? 'bg-brand-blue/20 text-brand-sky border border-brand-blue/30'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <MapPin className="w-3 h-3" /> Postcode
        </button>
        <button
          onClick={() => setSearchType('name')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            searchType === 'name'
              ? 'bg-brand-blue/20 text-brand-sky border border-brand-blue/30'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Store className="w-3 h-3" /> Business Name
        </button>
      </div>

      {/* Input */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-white/30 ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={searchType === 'postcode' ? 'Enter postcode (e.g. SW1A 1AA)' : 'Enter business name'}
          className={`w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-2xl transition-all focus:border-brand-sky/40 focus:bg-white/[0.07] ${
            isHero ? 'pl-12 pr-12 py-4 text-lg' : 'pl-10 pr-10 py-3 text-sm'
          }`}
        />
        {loading && (
          <Loader2 className={`absolute right-4 top-1/2 -translate-y-1/2 text-brand-sky animate-spin ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} />
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setShowResults(false); setError(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            <X className={isHero ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-xs text-white/40">{totalCount} result{totalCount !== 1 ? 's' : ''} found</span>
          </div>
          {results.map((est) => (
            <button
              key={est.FHRSID}
              onClick={() => handleSelect(est)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
            >
              <RatingBadge rating={est.RatingValue} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{est.BusinessName}</p>
                <p className="text-xs text-white/40 truncate">
                  {[est.AddressLine1, est.AddressLine2, est.PostCode].filter(Boolean).join(', ')}
                </p>
                <p className="text-xs text-white/25">{est.BusinessType}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && error && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-dark border border-amber-500/20 rounded-2xl shadow-2xl p-6 z-50 text-center">
          <p className="text-sm text-amber-400/90 mb-2">⚠️ {error}</p>
          <button
            onClick={() => doSearch(query)}
            className="text-xs text-brand-sky hover:text-white transition-colors underline"
          >
            Try again
          </button>
        </div>
      )}

      {showResults && !error && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-dark border border-white/10 rounded-2xl shadow-2xl p-6 z-50 text-center">
          <p className="text-sm text-white/50">No businesses found. Try a different {searchType === 'postcode' ? 'postcode' : 'name'}.</p>
        </div>
      )}
    </div>
  );
}
