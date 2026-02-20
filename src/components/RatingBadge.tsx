'use client';

import { getRatingColor } from '@/lib/scores';

interface RatingBadgeProps {
  rating: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

const LABELS: Record<string, string> = {
  '0': 'Urgent',
  '1': 'Major',
  '2': 'Improve',
  '3': 'OK',
  '4': 'Good',
  '5': 'Very Good',
};

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
  xl: 'w-28 h-28 text-6xl',
};

export default function RatingBadge({ rating, size = 'md', showLabel = false }: RatingBadgeProps) {
  const r = String(rating);
  const color = getRatingColor(r);
  const label = LABELS[r] || r;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${SIZE_CLASSES[size]} rounded-xl flex items-center justify-center font-display font-bold text-white rating-glow-${r}`}
        style={{ backgroundColor: color }}
        aria-label={`Food hygiene rating: ${r} - ${label}`}
      >
        {r}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
