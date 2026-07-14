import React, { memo } from 'react';
import SeverityBadge from './SeverityBadge';
import type { CopilotResponse, SupportedLanguage } from '@/lib/types';

interface ResultCardProps {
  result: CopilotResponse;
  language: SupportedLanguage;
}

function ResultCard({ result, language }: ResultCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100/50 dark:shadow-none overflow-hidden space-y-6">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5 flex items-center justify-between dark:from-slate-900 dark:to-slate-950 border-b dark:border-slate-800">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">Triaged Category</span>
          <h3 className="text-2xl font-black tracking-tight capitalize">{result.category.replace('-', ' ')}</h3>
        </div>
        <SeverityBadge level={result.severity.level} score={result.severity.score} />
      </div>

      {/* Actions & Next Steps */}
      <div className="px-6 space-y-4">
        <h4 className="text-sm font-black tracking-wider uppercase text-slate-600 dark:text-slate-400">Immediate Volunteer Actions</h4>
        <div className="space-y-3">
          {result.actions.map((action, i) => (
            <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="w-6 h-6 flex items-center justify-center bg-emerald-800 text-white rounded-full text-xs font-extrabold flex-shrink-0">
                {action.order}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-black">{action.action}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{action.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Route */}
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
          <h4 className="text-xs font-black tracking-wider uppercase text-slate-600 dark:text-slate-400">Primary Escalation Contact</h4>
          <p className="text-sm font-black">{result.escalation.contactTitle}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{result.escalation.radioChannel}</p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
          <h4 className="text-xs font-black tracking-wider uppercase text-slate-600 dark:text-slate-400">Urgency Protocol</h4>
          <p className="text-sm font-black capitalize">{result.severity.level} Urgency</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{result.escalation.urgency}</p>
        </div>
      </div>

      {/* Multilingual Guidance */}
      <div className="px-6 space-y-3">
        <h4 className="text-sm font-black tracking-wider uppercase text-slate-600 dark:text-slate-400">Multilingual Fan Guidance</h4>
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded uppercase border border-emerald-200 dark:border-emerald-900/60">
            Speak Aloud (Lang: {language.toUpperCase()})
          </span>
          <p
            className="text-lg font-extrabold text-emerald-950 dark:text-emerald-200"
            lang={language}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {result.multilingualPhrase}
          </p>
        </div>
      </div>

      {/* Source Metadata */}
      <div className="bg-slate-50 dark:bg-slate-900/60 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <span>Source: {result.isFallback ? '⚠️ Local Policy Fallback' : '✨ Gemini Server AI'}</span>
        <span>Triage Time: {result.timestamp.substring(11, 19)} UTC</span>
      </div>
    </div>
  );
}

export default memo(ResultCard);
