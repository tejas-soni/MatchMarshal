import React from 'react';
import type { SupportedLanguage } from '@/lib/types';

export interface PresetChip {
  label: string;
  text: string;
}

interface IncidentFormProps {
  description: string;
  setDescription: (desc: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  useAI: boolean;
  setUseAI: (useAI: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onLoadScenario: () => void;
  presets: PresetChip[];
  onPresetClick: (text: string) => void;
}

export default function IncidentForm({
  description,
  setDescription,
  language,
  setLanguage,
  useAI,
  setUseAI,
  loading,
  onSubmit,
  onLoadScenario,
  presets,
  onPresetClick,
}: IncidentFormProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Incident Report</h2>
        <button
          onClick={onLoadScenario}
          className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          <span aria-hidden="true">🎲</span> Load Seeded Scenario
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="incident-desc" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
            Describe the situation on the ground:
          </label>
          <textarea
            id="incident-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. A fan collapsed near Section C and is unresponsive..."
            maxLength={500}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm transition-all resize-none"
          ></textarea>
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>Max 500 characters</span>
            <span>{description.length}/500</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="fan-lang" className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              Fan Language:
            </label>
            <select
              id="fan-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm transition-all"
            >
              <option value="en">English</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="pt">Português (Portuguese)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-500"
              />
              Use Server-side Gemini AI
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md focus:ring-2 focus:ring-emerald-500 focus:outline-none flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            'Analyze Incident'
          )}
        </button>
      </form>

      {/* Quick Autofill Chips */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase">Quick Incident Presets</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onPresetClick(chip.text)}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all border border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
