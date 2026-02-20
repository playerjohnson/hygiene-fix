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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Recalculate fixed dropdown position on open or resize
  useEffect(() => {
    function calcPos() {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        backgroundColor: '#0B1B2B',
        boxShadow: '0 24px 48px rgba(0,0,0,0.9)',
      });
    }
    calcPos();
    window.addEventListener('resize', calcPos);
    window.addEventListener('scroll', calcPos, { passive: true });
    return () => {
      window.removeEventListener('resize', calcPos);
      window.removeEventListener('scroll', calcPos);
    };
  }, [showResults]);

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

  const handleTypeChange = (type: 'postcode' | 'name') => {
    setSearchType(type);
    if (query.length >= 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(query), 150);
    }
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
  const dropdownOpen = showResults && (results.length > 0 || error || (!loading && query.length >= 2));

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search widget */}
      <div
        className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all focus-within:border-brand-sky/40 focus-within:bg-white/[0.07] ${
          dropdownOpen ? 'rounded-b-none border-b-transparent' : ''
        }`}
      >
        {/* Type toggle */}
        <div className="flex border-b border-white/5 px-1 pt-1 gap-0.5">
          <button
            type="button"
            onClick={() => handleTypeChange('postcode')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchType === 'postcode'
                ? 'bg-brand-blue/20 text-brand-sky'
                : 'text-white/35 hover:text-white/60'
            }`}
          >
            <MapPin className="w-3 h-3" /> Postcode
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('name')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchType === 'name'
                ? 'bg-brand-blue/20 text-brand-sky'
                : 'text-white/35 hover:text-white/60'
            }`}
          >
            <Store className="w-3 h-3" /> Business Name
          </button>
        </div>

        {/* Input */}
        <div className="relative flex items-center">
          <Search className={`absolute left-4 text-white/30 ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={searchType === 'postcode' ? 'Enter postcode (e.g. SW1A 1AA)' : 'Enter business name'}
            className={`w-full bg-transparent border-none text-white placeholder:text-white/25 outline-none transition-all ${
              isHero ? 'pl-12 pr-12 py-4 text-lg' : 'pl-10 pr-10 py-3 text-sm'
            }`}
          />
          {loading && (
            <Loader2 className={`absolute right-4 text-brand-sky animate-spin ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} />
          )}
          {!loading && query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setShowResults(false); setError(null); }}
              className="absolute right-4 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Clear search"
            >
              <X className={isHero ? 'w-5 h-5' : 'w-4 h-4'} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown — position: fixed so it can't be painted over by any sibling */}
      {dropdownOpen && (
        <div
          style={dropdownStyle}
          className="rounded-b-2xl border border-white/10 border-t-0 overflow-hidden max-h-[400px] overflow-y-auto"
        >
          {results.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/35 font-mono">{totalCount} result{totalCount !== 1 ? 's' : ''} found</span>
                <span className="text-[10px] text-white/20">Click to view score breakdown</span>
              </div>
              {results.map((est) => (
                <button
                  key={est.FHRSID}
                  onClick={() => handleSelect(est)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <RatingBadge rating={est.RatingValue} size="sm" showLabel />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{est.BusinessName}</p>
                    <p className="text-xs text-white/40 truncate">
                      {[est.AddressLine1, est.AddressLine2, est.PostCode].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-[10px] text-white/20 mt-0.5">{est.BusinessType}</p>
                  </div>
                </button>
              ))}
            </>
          )}

          {error && (
            <div className="p-6 text-center">
              <p className="text-sm text-amber-400/90 mb-2">⚠️ {error}</p>
              <button onClick={() => doSearch(query)} className="text-xs text-brand-sky hover:text-white transition-colors underline">
                Try again
              </button>
            </div>
          )}

          {!error && results.length === 0 && !loading && query.length >= 2 && (
            <div className="p-6 text-center">
              <p className="text-sm text-white/50">No businesses found. Try a different {searchType === 'postcode' ? 'postcode' : 'name'}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
