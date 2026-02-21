import type { AuthorityStats } from '@/lib/fsa-api';

interface Props {
  stats: AuthorityStats;
  authorityName: string;
  businessTypeBreakdown: { type: string; count: number }[];
}

const RATING_COLORS: Record<number, { bar: string; text: string }> = {
  0: { bar: 'bg-red-500', text: 'text-red-400' },
  1: { bar: 'bg-orange-500', text: 'text-orange-400' },
  2: { bar: 'bg-amber-500', text: 'text-amber-400' },
  3: { bar: 'bg-yellow-400', text: 'text-yellow-400' },
  4: { bar: 'bg-green-400', text: 'text-green-400' },
  5: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
};

const RATING_LABELS: Record<number, string> = {
  0: 'Urgent improvement',
  1: 'Major improvement',
  2: 'Improvement necessary',
  3: 'Generally satisfactory',
  4: 'Good',
  5: 'Very good',
};

export default function AreaStats({ stats, authorityName, businessTypeBreakdown }: Props) {
  const maxCount = Math.max(...stats.distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
          <p className="text-2xl font-display font-bold text-white">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-1">Total businesses</p>
        </div>
        <div className="p-4 rounded-xl border border-brand-amber/20 bg-brand-amber/5 text-center">
          <p className="text-2xl font-display font-bold text-brand-amber">{stats.lowRatedTotal.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-1">Rated 0–2</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-display font-bold text-white">{stats.lowRatedPercent}%</p>
          <p className="text-xs text-white/40 mt-1">Need improvement</p>
        </div>
      </div>

      {/* Rating distribution */}
      <div>
        <h3 className="font-display text-lg font-bold mb-4">Rating Distribution</h3>
        <div className="space-y-2.5">
          {stats.distribution.map(({ rating, count }) => {
            const colors = RATING_COLORS[rating] || { bar: 'bg-white/20', text: 'text-white/60' };
            const width = maxCount > 0 ? Math.max((count / maxCount) * 100, 1) : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="w-6 shrink-0">
                  <span className={`text-sm font-bold ${colors.text}`}>{rating}</span>
                </div>
                <div className="flex-1 h-7 rounded-lg bg-white/[0.03] overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg ${colors.bar} transition-all duration-500`}
                    style={{ width: `${width}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/50 font-mono">
                    {count.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-white/30 hidden sm:block w-36 shrink-0">
                  {RATING_LABELS[rating]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business type breakdown for low-rated */}
      {businessTypeBreakdown.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold mb-4">Low-Rated by Business Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {businessTypeBreakdown.slice(0, 8).map(({ type, count }) => (
              <div
                key={type}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-white/5 bg-white/[0.02]"
              >
                <span className="text-xs text-white/60 truncate mr-2">{type}</span>
                <span className="text-xs font-mono text-brand-amber font-bold shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data source note */}
      <p className="text-xs text-white/20 text-center">
        Data sourced from the Food Standards Agency. Updated daily.
      </p>
    </div>
  );
}
