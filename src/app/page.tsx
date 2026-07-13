'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { buildFallbackResponse } from '@/lib/domain/build-fallback-response';
import { seededScenarioFeed } from '@/lib/demo/seeded-scenarios';
import { sanitizeInput, detectPromptInjection } from '@/lib/ai/safety';
import { checkRateLimit } from '@/lib/ai/rate-limit';
import AppHeader, { Tab } from '@/components/AppHeader';
import LandingView from '@/components/LandingView';
import MethodologyView from '@/components/MethodologyView';
import IncidentForm from '@/components/IncidentForm';
import RecentFeed from '@/components/RecentFeed';
import ResultCard from '@/components/ResultCard';
import type { CopilotResponse, SupportedLanguage, DemoScenario } from '@/lib/types';



// Preset chips to populate input
const PRESET_CHIPS = [
  { label: 'Lost Child', text: 'Lost boy crying alone near the Gate 4 food kiosk.' },
  { label: 'Medical Faint', text: 'A fan fainted in section C row 12, appears breathing but unresponsive.' },
  { label: 'Gate Bottleneck', text: 'Crowd buildup blocking the exit aisle in the west stand.' },
  { label: 'Accessibility Help', text: 'Wheelchair user needs an escort to the accessible elevator.' },
  { label: 'Fan Confrontation', text: 'Two aggressive fans yelling and pushing each other at gate 7.' },
  { label: 'Lost Phone', text: 'Fan left their iPhone on the seat in section B-3.' },
];


export default function MatchMarshalApp() {
  const [activeTab, setActiveTab] = useState<Tab>('landing');
  const [isPending, startTransition] = useTransition();

  // Input states
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [useAI, setUseAI] = useState(false);

  // Result state
  const [result, setResult] = useState<CopilotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Seeded feed generator reference
  const nextScenarioRef = useRef<(() => DemoScenario) | null>(null);
  if (nextScenarioRef.current == null) {
    nextScenarioRef.current = seededScenarioFeed(2026);
  }

  // Recent scenarios from localStorage
  const [recentScenarios, setRecentScenarios] = useState<Array<{ description: string; timestamp: string }>>([]);

  // Initialize load recent scenarios
  useEffect(() => {
    const saved = localStorage.getItem('matchmarshal_recents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Client-side hydration of localStorage state on mount
        setRecentScenarios(parsed);
      } catch {
        // Safe fallback
      }
    }
  }, []);

  // Save recent scenarios
  const saveRecent = (desc: string) => {
    const updated = [
      { description: desc, timestamp: new Date().toLocaleTimeString() },
      ...recentScenarios.slice(0, 4),
    ];
    setRecentScenarios(updated);
    localStorage.setItem('matchmarshal_recents', JSON.stringify(updated));
  };


  // Tab changer helper supporting transitions
  const changeTab = (tab: Tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  // Seeded scenario loader
  const handleLoadScenario = () => {
    if (nextScenarioRef.current) {
      const scenario = nextScenarioRef.current();
      setDescription(scenario.description);
      setError(null);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = description.trim();
    if (!trimmed) {
      setError('Please enter a description of the incident.');
      return;
    }

    // Safety checks
    if (detectPromptInjection(trimmed)) {
      setError('System guard: Potential prompt injection detected. Request rejected.');
      return;
    }

    const sanitized = sanitizeInput(trimmed);

    // Call AI or local engine
    if (useAI) {
      // In-memory client rate limit check for demonstration
      const rateLimitResult = checkRateLimit('client-ip', 60000, 15);
      if (!rateLimitResult.allowed) {
        setError('Rate limit exceeded (Max 15 requests/min). Using local engine fallback.');
        const fallbackRes = buildFallbackResponse({ description: sanitized, language });
        setResult(fallbackRes);
        saveRecent(sanitized);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: sanitized, language }),
        });

        if (response.status === 429) {
          setError('API Rate limit hit. Loaded local deterministic fallback response.');
          const fallbackRes = buildFallbackResponse({ description: sanitized, language });
          setResult(fallbackRes);
        } else if (!response.ok) {
          // Fall back gracefully
          setError('Could not connect to Gemini API. Loaded local deterministic fallback response.');
          const fallbackRes = buildFallbackResponse({ description: sanitized, language });
          setResult(fallbackRes);
        } else {
          const data = await response.json();
          setResult(data);
        }
      } catch {
        setError('Network error. Loaded local deterministic fallback response.');
        const fallbackRes = buildFallbackResponse({ description: sanitized, language });
        setResult(fallbackRes);
      } finally {
        setLoading(false);
        saveRecent(sanitized);
      }
    } else {
      // Direct local engine execution
      const fallbackRes = buildFallbackResponse({ description: sanitized, language });
      setResult(fallbackRes);
      saveRecent(sanitized);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation Header */}
      <AppHeader activeTab={activeTab} onChangeTab={changeTab} />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 focus:outline-none" id="main-content">
        {isPending && (
          <div className="flex justify-center items-center py-12" aria-live="polite">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="sr-only">Loading page...</span>
          </div>
        )}

        {!isPending && activeTab === 'landing' && (
          <LandingView presetChips={PRESET_CHIPS} onChangeTab={changeTab} />
        )}

        {!isPending && activeTab === 'console' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Input Form Column */}
            <div className="lg:col-span-5 space-y-6">
              <IncidentForm
                description={description}
                setDescription={setDescription}
                language={language}
                setLanguage={setLanguage}
                useAI={useAI}
                setUseAI={setUseAI}
                loading={loading}
                onSubmit={handleSubmit}
                onLoadScenario={handleLoadScenario}
                presets={PRESET_CHIPS}
                onPresetClick={(text) => {
                  setDescription(text);
                  setError(null);
                }}
              />

              {/* Recent Scenarios Panel */}
              <RecentFeed 
                recentScenarios={recentScenarios} 
                onSelectScenario={(desc) => {
                  setDescription(desc);
                  setError(null);
                }} 
              />
            </div>

            {/* Results Display Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Screen reader notification region */}
              <div className="sr-only" aria-live="polite">
                {loading && 'Analyzing incident...'}
                {error && `Error: ${error}`}
                {result && `Incident triaged as ${result.category}. Urgency: ${result.severity.level}.`}
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900/50 text-sm font-semibold flex gap-2">
                  <span aria-hidden="true">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Triaged Output Display */}
              {!result && !loading && !error && (
                <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-slate-100/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 min-h-[300px]">
                  <span className="text-4xl mb-3" aria-hidden="true">📋</span>
                  <h3 className="font-extrabold text-slate-600 dark:text-slate-400 text-lg">Awaiting Incident Input</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mt-1">Describe a scenario or select a quick chip preset on the left to generate volunteer actions.</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col justify-center items-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[300px] shadow-sm animate-pulse">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="font-extrabold text-slate-500 mt-4">Running MatchMarshal Decision Triage...</h3>
                </div>
              )}

              {result && (
                <ResultCard result={result} language={language} />
              )}
            </div>
          </section>
        )}

        {!isPending && activeTab === 'methodology' && (
          <MethodologyView />
        )}
      </main>
    </div>
  );
}
