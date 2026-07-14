import React, { memo } from 'react';
import Logo from './Logo';

export type Tab = 'landing' | 'console' | 'methodology';

export interface AppHeaderProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

function AppHeader({ activeTab, onChangeTab }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* MatchMarshal SVG Logo */}
          <Logo className="w-10 h-10 drop-shadow-sm" />
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              MatchMarshal
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">FIFA 2026 Volunteer Copilot</p>
          </div>
        </div>
        <nav className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner" aria-label="Main Navigation">
          <button
            onClick={() => onChangeTab('landing')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
              activeTab === 'landing'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-current={activeTab === 'landing' ? 'page' : undefined}
          >
            Landing
          </button>
          <button
            onClick={() => onChangeTab('console')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
              activeTab === 'console'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-current={activeTab === 'console' ? 'page' : undefined}
          >
            Console
          </button>
          <button
            onClick={() => onChangeTab('methodology')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
              activeTab === 'methodology'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-current={activeTab === 'methodology' ? 'page' : undefined}
          >
            Methodology
          </button>
        </nav>
      </div>
    </header>
  );
}

export default memo(AppHeader);
