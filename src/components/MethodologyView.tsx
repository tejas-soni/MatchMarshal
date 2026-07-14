import React, { memo } from 'react';

function MethodologyView() {
  return (
    <section className="space-y-8 animate-fade-in">
      {/* Architecture Overview */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-3xl font-black tracking-tight">Deterministic Engine & AI Fallback Architecture</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          MatchMarshal operates on a <strong>&ldquo;deterministic engine + optional AI enhancement&rdquo;</strong> hybrid architecture. Unlike simple wrapper chatbots, the core logic (incident classification, severity scoring, escalation routes, action templates) runs locally inside highly optimized pure functions. 
        </p>

        {/* ASCII/HTML diagram */}
        <div className="p-6 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 shadow-inner focus:ring-2 focus:ring-emerald-500 focus:outline-none" tabIndex={0} aria-label="Architecture flow diagram">
          <pre>{`
  [ Volunteer Free Text Input ]
               │
               ▼
   [ Sanitization / Injection Guard ] ──(Injection detected)──► [ Reject Input ]
               │
               ▼
   [ Server-Side Gemini API Request ]
               │
      ┌────────┴────────┐
  (API Success)    (Key Missing/Timeout/Rate Limit)
      │                 │
      ▼                 ▼
  [ Parse Gemini ]  [ Local Heuristics Fallback ]
      │                 │
      └────────┬────────┘
               │
               ▼
  [ Zod Strict Schema Check ] ──(Validation error)──► [ Fallback Safe Engine ]
               │
               ▼
  [ Render Response (AI / Fallback Badge) ]
                `}</pre>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-2xl font-black">Comparison of Operational Layers</h3>
        <div className="overflow-x-auto focus:ring-2 focus:ring-emerald-500 focus:outline-none" tabIndex={0} aria-label="Operational layers comparison table">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Features</th>
                <th className="pb-3 font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Deterministic Local Engine</th>
                <th className="pb-3 font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Gemini Server Enhancer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr>
                <td className="py-4 font-black">Availability</td>
                <td className="py-4 text-emerald-800 dark:text-emerald-400 font-semibold">100% Offline / Reliable</td>
                <td className="py-4 text-slate-500">Requires Network & Valid API Key</td>
              </tr>
              <tr>
                <td className="py-4 font-black">Incident Triage</td>
                <td className="py-4">Keyword heuristics classification</td>
                <td className="py-4">Semantic natural language interpretation</td>
              </tr>
              <tr>
                <td className="py-4 font-black">Escalation Plans</td>
                <td className="py-4">Fixed stadium policies (Channel 1-5)</td>
                <td className="py-4 text-slate-600 dark:text-slate-400">Strictly bounded by policy instructions</td>
              </tr>
              <tr>
                <td className="py-4 font-black">Multilingual Phrases</td>
                <td className="py-4">Verified canned phrases (6 languages)</td>
                <td className="py-4">Tailored context-aware translations</td>
              </tr>
              <tr>
                <td className="py-4 font-black">Response Speed</td>
                <td className="py-4 text-emerald-800 dark:text-emerald-400 font-semibold">&lt; 2 milliseconds</td>
                <td className="py-4">~ 1-2 seconds (dependent on API latency)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default memo(MethodologyView);
