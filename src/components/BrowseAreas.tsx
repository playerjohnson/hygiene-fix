'use client';

import { useState, useMemo } from 'react';
import { Search, X, MapPin, ChevronDown } from 'lucide-react';

interface Authority {
  name: string;
  slug: string;
}

interface Props {
  authorities: Authority[];
}

export default function BrowseAreas({ authorities }: Props) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return authorities;
    const q = query.toLowerCase().trim();
    return authorities.filter((a) => a.name.toLowerCase().includes(q));
  }, [query, authorities]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map: Record<string, Authority[]> = {};
    for (const a of filtered) {
      const letter = a.name[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(a);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // Show all when searching, otherwise respect expanded state
  const isSearching = query.trim().length > 0;
  const showAll = isSearching || expanded;

  // Popular areas shown when collapsed
  const popular = useMemo(() => [
    'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol',
    'Sheffield', 'Newcastle Upon Tyne', 'Nottingham City', 'Leicester City',
    'Coventry', 'Bradford', 'Brighton and Hove', 'Cardiff', 'Glasgow City',
    'Edinburgh (City of)', 'Southampton', 'Plymouth City', 'Reading', 'York',
    'Cambridge City', 'Oxford City', 'Exeter City', 'Bath and North East Somerset',
  ].map((name) => authorities.find((a) => a.name === name)).filter(Boolean) as Authority[], [authorities]);

  return (
    <div>
      {/* Filter — always visible */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search areas…"
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30 focus:border-brand-sky/40 focus:outline-none transition-colors"
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
          <p className="text-xs text-white/30 mt-2 text-center">
            {filtered.length} of {authorities.length} areas
          </p>
        )}
      </div>

      {showAll ? (
        <>
          {/* Full A-Z grouped list */}
          {grouped.length > 0 ? (
            <div className="space-y-6">
              {grouped.map(([letter, areas]) => (
                <div key={letter}>
                  <h3 className="text-xs font-bold text-brand-sky/60 uppercase tracking-widest mb-2 pl-1">{letter}</h3>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((area) => (
                      <a
                        key={area.slug}
                        href={`/ratings/${area.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-white/[0.02] text-xs text-white/55 hover:text-white hover:border-brand-sky/30 hover:bg-brand-sky/5 transition-all"
                      >
                        <MapPin className="w-3 h-3 opacity-40" />
                        {area.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 text-center py-6">
              No areas match &ldquo;{query}&rdquo;
            </p>
          )}

          {/* Collapse button (only when not searching) */}
          {!isSearching && (
            <button
              onClick={() => setExpanded(false)}
              className="mx-auto mt-8 flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/60 transition-colors"
            >
              Show less
              <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </>
      ) : (
        <>
          {/* Collapsed — popular areas only */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {popular.map((area) => (
              <a
                key={area.slug}
                href={`/ratings/${area.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/8 bg-white/[0.02] text-sm text-white/55 hover:text-white hover:border-brand-sky/30 hover:bg-brand-sky/5 transition-all"
              >
                {area.name.replace(' City', '').replace(' Upon Tyne', '').replace(' (City of)', '').replace(' and Hove', '').replace(' and North East Somerset', '')}
              </a>
            ))}
          </div>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(true)}
            className="mx-auto mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-sky/70 hover:text-brand-sky transition-colors"
          >
            Show all {authorities.length} areas
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
