'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { buildFallbackResponse } from '@/lib/domain/build-fallback-response';
import { seededScenarioFeed } from '@/lib/demo/seeded-scenarios';
import { sanitizeInput, detectPromptInjection } from '@/lib/ai/safety';
import { checkRateLimit } from '@/lib/ai/rate-limit';
import type { CopilotResponse, SupportedLanguage, DemoScenario } from '@/lib/types';

// Tab type definition
type Tab = 'landing' | 'console' | 'methodology';

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
        setTimeout(() => {
          setRecentScenarios(parsed);
        }, 0);
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

  // Preset chips to populate input
  const PRESET_CHIPS = [
    { label: 'Lost Child', text: 'Lost boy crying alone near the Gate 4 food kiosk.' },
    { label: 'Medical Faint', text: 'A fan fainted in section C row 12, appears breathing but unresponsive.' },
    { label: 'Gate Bottleneck', text: 'Crowd buildup blocking the exit aisle in the west stand.' },
    { label: 'Accessibility Help', text: 'Wheelchair user needs an escort to the accessible elevator.' },
    { label: 'Fan Confrontation', text: 'Two aggressive fans yelling and pushing each other at gate 7.' },
    { label: 'Lost Phone', text: 'Fan left their iPhone on the seat in section B-3.' },
  ];

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

  // Severity badge style resolver
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Stadium/Whistle SVG Icon */}
            <span className="p-2 bg-emerald-800 rounded-lg text-white font-black tracking-widest text-lg select-none shadow-md shadow-emerald-500/20">
              MM
            </span>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                MatchMarshal
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">FIFA 2026 Volunteer Copilot</p>
            </div>
          </div>
          <nav className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner" aria-label="Main Navigation">
            <button
              onClick={() => changeTab('landing')}
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
              onClick={() => changeTab('console')}
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
              onClick={() => changeTab('methodology')}
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

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 focus:outline-none" id="main-content">
        {isPending && (
          <div className="flex justify-center items-center py-12" aria-live="polite">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="sr-only">Loading page...</span>
          </div>
        )}

        {!isPending && activeTab === 'landing' && (
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
                  onClick={() => changeTab('console')}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  Start Demo Console
                </button>
                <button
                  onClick={() => changeTab('methodology')}
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </span>
                <h2 className="text-xl font-bold">Policy-Bounded Guards</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Deterministic triage and escalation contacts are coded locally. Gemini enhances translation and clarity, but cannot bypass venue security rules.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <span className="p-3 bg-teal-100 dark:bg-teal-950/60 rounded-xl inline-block text-teal-600 dark:text-teal-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 7.31 16.5 3 19"></path></svg>
                </span>
                <h2 className="text-xl font-bold">Multilingual Phrases</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Support for English, Spanish, French, Arabic, Portuguese, and Hindi. Instantly display emergency phrases with phonetic guides to assist international fans.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <span className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-xl inline-block text-blue-600 dark:text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
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
                {PRESET_CHIPS.map((chip, i) => (
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
        )}

        {!isPending && activeTab === 'console' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Input Form Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Incident Report</h2>
                  <button
                    onClick={handleLoadScenario}
                    className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    🎲 Load Seeded Scenario
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all active:scale-98 shadow-md focus:ring-2 focus:ring-emerald-500 focus:outline-none flex justify-center items-center gap-2"
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
                    {PRESET_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDescription(chip.text);
                          setError(null);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all border border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Scenarios Panel */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Recent Incident Feed</h3>
                {recentScenarios.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">No recent incidents logged.</p>
                ) : (
                  <div className="space-y-3">
                    {recentScenarios.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDescription(item.description);
                          setError(null);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-all border border-slate-100 dark:border-slate-800/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{item.timestamp}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate">{item.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  <span>⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Triaged Output Display */}
              {!result && !loading && !error && (
                <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-slate-100/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 min-h-[300px]">
                  <span className="text-4xl mb-3">📋</span>
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
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100/50 dark:shadow-none overflow-hidden space-y-6">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5 flex items-center justify-between dark:from-slate-900 dark:to-slate-950 border-b dark:border-slate-800">
                    <div className="space-y-1">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">Triaged Category</span>
                      <h3 className="text-2xl font-black tracking-tight capitalize">{result.category.replace('-', ' ')}</h3>
                    </div>
                    <span className={`px-3 py-1 text-xs font-black tracking-wide uppercase border rounded-full ${getSeverityBadgeClass(result.severity.level)}`}>
                      {result.severity.level} ({result.severity.score})
                    </span>
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
              )}
            </div>
          </section>
        )}

        {!isPending && activeTab === 'methodology' && (
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
        )}
      </main>
    </div>
  );
}
