'use client';

import { useEffect, useState } from 'react';
import { ScoreInterpretation } from '@/lib/types';
import { getScoreSeverityColor } from '@/lib/scores';
import { Utensils, Building2, ClipboardCheck } from 'lucide-react';

interface ScoreBreakdownProps {
  scores: ScoreInterpretation[];
  animate?: boolean;
}

const AREA_ICONS: Record<string, React.ReactNode> = {
  Hygiene: <Utensils className="w-5 h-5" />,
  Structural: <Building2 className="w-5 h-5" />,
  ConfidenceInManagement: <ClipboardCheck className="w-5 h-5" />,
};

const AREA_LABELS: Record<string, string> = {
  Hygiene: 'Food Hygiene',
  Structural: 'Structural / Cleanliness',
  ConfidenceInManagement: 'Management & Documentation',
};

export default function ScoreBreakdown({ scores, animate = true }: ScoreBreakdownProps) {
  const [mounted, setMounted] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setMounted(true), 200);
      return () => clearTimeout(t);
    }
  }, [animate]);

  return (
    <div className="space-y-5">
      {scores.map((score, i) => {
        const color = getScoreSeverityColor(score.severity);
        const pct = score.maxScore > 0 ? ((score.maxScore - score.score) / score.maxScore) * 100 : 0;

        return (
          <div
            key={score.area}
            className="animate-slide-up"
            style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span style={{ color }}>{AREA_ICONS[score.area]}</span>
                <span className="text-sm font-semibold text-white/90">
                  {AREA_LABELS[score.area] || score.area}
                </span>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: color + '22', color }}
              >
                {score.label}
              </span>
            </div>

            {/* Score bar */}
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: mounted ? `${pct}%` : '0%',
                  backgroundColor: color,
                  transitionDelay: `${i * 150}ms`,
                }}
              />
            </div>

            <p className="mt-1.5 text-xs text-white/40 leading-relaxed">{score.shortAdvice}</p>
          </div>
        );
      })}
    </div>
  );
}
