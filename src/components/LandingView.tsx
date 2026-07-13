import React from 'react';

export interface LandingViewProps {
  presetChips: Array<{ label: string; text: string }>;
  onChangeTab: (tab: 'landing' | 'console' | 'methodology') => void;
}

export default function LandingView({ presetChips, onChangeTab }: LandingViewProps) {
  return (
    <section className="space-y-12 animate-fade-in motion-safe:transition-all">
      {/* Hero pitch */}
      <div className="text-center max-w-3xl mx-auto space-y-6 py-8">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
          Empowering World Cup Volunteers with{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Real-Time Decision Intelligence
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium">
          Volunteers are the first line of defense in complex stadium scenarios. MatchMarshal turns unstructured incident descriptions into bounded action steps, escalation paths, and multilingual phrases.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => onChangeTab('console')}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            Start Demo Console
          </button>
          <button
            onClick={() => onChangeTab('methodology')}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            View Methodology
          </button>
        </div>
      </div>

      {/* How it solves it */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <span className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl inline-block text-emerald-800 dark:text-emerald-400">
            <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </span>
          <h2 className="text-xl font-bold">Policy-Bounded Guards</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Deterministic triage and escalation contacts are coded locally. Gemini enhances translation and clarity, but cannot bypass venue security rules.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <span className="p-3 bg-teal-100 dark:bg-teal-950/60 rounded-xl inline-block text-teal-600 dark:text-teal-400">
            <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 7.31 16.5 3 19"></path></svg>
          </span>
          <h2 className="text-xl font-bold">Multilingual Phrases</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Support for English, Spanish, French, Arabic, Portuguese, and Hindi. Instantly display emergency phrases with phonetic guides to assist international fans.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <span className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-xl inline-block text-blue-600 dark:text-blue-400">
            <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </span>
          <h2 className="text-xl font-bold">Local Fallback Path</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            In case of network failures, rate-limiting, or missing API keys, the local rules engine takes over to guarantee instant structured triage without latency.
          </p>
        </div>
      </div>

      {/* Quick Pitch list */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-2xl font-black">How MatchMarshal Handles Ground Incidents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {presetChips.map((chip, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="px-2 py-1 text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                {chip.label}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">&ldquo;{chip.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
