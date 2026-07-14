import React, { memo } from 'react';

export interface RecentScenario {
  description: string;
  timestamp: string;
}

interface RecentFeedProps {
  recentScenarios: RecentScenario[];
  onSelectScenario: (description: string) => void;
}

function RecentFeed({ recentScenarios, onSelectScenario }: RecentFeedProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Recent Incident Feed</h3>
      {recentScenarios.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400 italic">No recent incidents logged.</p>
      ) : (
        <div className="space-y-3">
          {recentScenarios.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectScenario(item.description)}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-all border border-slate-100 dark:border-slate-800/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{item.timestamp}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate">{item.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(RecentFeed);
