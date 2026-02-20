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
  '3': 'Satisfactory',
  '4': 'Good',
  '5': 'Very Good',
};

// Ring outer + inner sizes
const SIZE_CONFIG = {
  sm:  { outer: 'w-10 h-10',  inner: 'w-7 h-7',   text: 'text-base',  label: 'text-[9px]' },
  md:  { outer: 'w-16 h-16',  inner: 'w-11 h-11',  text: 'text-2xl',   label: 'text-[10px]' },
  lg:  { outer: 'w-22 h-22',  inner: 'w-16 h-16',  text: 'text-4xl',   label: 'text-xs' },
  xl:  { outer: 'w-28 h-28',  inner: 'w-20 h-20',  text: 'text-5xl',   label: 'text-sm' },
};

const GLOW_SHADOWS: Record<string, string> = {
  '0': '0 0 24px rgba(220,38,38,0.45)',
  '1': '0 0 24px rgba(234,88,12,0.40)',
  '2': '0 0 22px rgba(245,158,11,0.38)',
  '3': '0 0 18px rgba(132,204,22,0.30)',
  '4': '0 0 18px rgba(22,163,74,0.30)',
  '5': '0 0 18px rgba(5,150,105,0.30)',
};

export default function RatingBadge({ rating, size = 'md', showLabel = false }: RatingBadgeProps) {
  const r = String(rating);
  const color = getRatingColor(r);
  const label = LABELS[r] ?? r;
  const cfg = SIZE_CONFIG[size];

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Outer ring */}
      <div
        className={`${cfg.outer} rounded-full flex items-center justify-center relative`}
        style={{ border: `2px solid ${color}`, opacity: 1 }}
        aria-label={`Food hygiene rating: ${r} — ${label}`}
      >
        {/* Subtle ring glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 1px ${color}22, inset 0 0 8px ${color}11` }}
        />
        {/* Inner filled circle */}
        <div
          className={`${cfg.inner} rounded-full flex items-center justify-center font-display font-bold text-white`}
          style={{
            backgroundColor: color,
            boxShadow: GLOW_SHADOWS[r] ?? `0 0 16px ${color}44`,
          }}
        >
          <span className={cfg.text}>{r}</span>
        </div>
      </div>

      {showLabel && (
        <span
          className={`${cfg.label} font-bold uppercase tracking-wider`}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
