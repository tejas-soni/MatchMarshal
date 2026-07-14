import React, { memo } from 'react';

export interface SeverityBadgeProps {
  level: string;
  score: number;
}

const getSeverityBadgeClass = (level: string) => {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-900';
    case 'medium':
      return 'bg-yellow-100 text-yellow-950 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-200 dark:border-yellow-900';
    default:
      return 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900';
  }
};

function SeverityBadge({ level, score }: SeverityBadgeProps) {
  return (
    <span className={`px-3 py-1 text-xs font-black tracking-wide uppercase border rounded-full ${getSeverityBadgeClass(level)}`}>
      {level} ({score})
    </span>
  );
}

export default memo(SeverityBadge);
