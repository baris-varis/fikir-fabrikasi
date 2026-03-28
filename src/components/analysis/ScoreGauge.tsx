'use client';

import { Karar } from '@/types';

interface Props {
  score: number;
  karar: Karar | '';
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreGauge({ score, karar, size = 'md' }: Props) {
  const dims = { sm: 80, md: 120, lg: 160 };
  const d = dims[size];
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = (d - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? '#22c55e'
      : score >= 50
        ? '#f59e0b'
        : score > 0
          ? '#ef4444'
          : '#334155';

  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const kararBadge =
    karar === 'GO'
      ? 'fab-badge-go'
      : karar === 'CONDITIONAL GO'
        ? 'fab-badge-conditional'
        : karar === 'NO-GO'
          ? 'fab-badge-nogo'
          : '';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: d, height: d }}>
        <svg width={d} height={d} className="-rotate-90">
          <circle
            cx={d / 2}
            cy={d / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={d / 2}
            cy={d / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display font-bold ${textSizes[size]}`} style={{ color }}>
            {score || '—'}
          </span>
          {size !== 'sm' && <span className="text-fab-muted text-xs">/100</span>}
        </div>
      </div>
      {karar && <span className={kararBadge}>{karar}</span>}
    </div>
  );
}
