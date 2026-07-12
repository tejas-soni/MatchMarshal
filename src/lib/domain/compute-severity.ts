import type { IncidentInput, SeverityScore, SeverityLevel, IncidentCategory } from '../types';
import { classifyIncident } from './classify-incident';

/** Severity score thresholds (upper bound inclusive per level) */
const SEVERITY_THRESHOLDS = {
  low: 30,
  medium: 60,
  high: 85,
  // critical = 86..100
} as const;

/**
 * Keyword sets that add severity points.
 * Scores accumulate additively; result is clamped to 0–100.
 */
const SEVERITY_KEYWORDS: Array<{ keywords: string[]; points: number }> = [
  // Immediate life threat (+60)
  { keywords: ['unconscious', 'not breathing', 'cardiac', 'heart attack', 'stampede', 'crush', 'fire', 'explosion', 'active threat', 'heatstroke'], points: 60 },
  // Serious risk (+30)
  { keywords: ['bleeding', 'seizure', 'fainted', 'lost child', 'missing child', 'unaccompanied minor', 'fighting', 'violent', 'weapon', 'lightning'], points: 30 },
  // Elevated risk (+20)
  { keywords: ['injured', 'aggressive', 'threatening', 'allergic'], points: 20 },
  // Moderate risk (+15)
  { keywords: ['hurt', 'pain', 'sick', 'drunk', 'altercation', 'congestion', 'bottleneck', 'overcrowd'], points: 15 },
  // Minor concern (+10)
  { keywords: ['missing', 'wheelchair', 'disabled', 'accessibility', 'rain', 'storm', 'heat', 'cold'], points: 10 },
  // Informational (+5)
  { keywords: ['directions', 'find', 'where', 'lost item', 'lost phone', 'lost bag'], points: 5 },
];

/** Base score per incident category (before keyword modifiers) */
const CATEGORY_BASE_SCORES: Record<IncidentCategory, number> = {
  'medical':       40,
  'lost-child':    40,
  'aggressive-fan':35,
  'crowd-buildup': 30,
  'weather':       20,
  'accessibility': 15,
  'lost-item':     10,
  'navigation':     5,
  'general':        5,
};

/**
 * Map a raw numeric score (0–100) to a severity level using defined thresholds.
 */
export function scoreToLevel(score: number): SeverityLevel {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped <= SEVERITY_THRESHOLDS.low) return 'low';
  if (clamped <= SEVERITY_THRESHOLDS.medium) return 'medium';
  if (clamped <= SEVERITY_THRESHOLDS.high) return 'high';
  return 'critical';
}

/**
 * Compute a severity score for an incident.
 * Deterministic: same input always produces the same output.
 *
 * Algorithm:
 * 1. Get category base score.
 * 2. Add keyword-matched points from the description.
 * 3. Clamp result to [0, 100].
 * 4. Convert to SeverityLevel.
 */
export function computeSeverity(input: IncidentInput): SeverityScore {
  const text = input.description.toLowerCase().trim();
  const category = classifyIncident(input);
  let score = CATEGORY_BASE_SCORES[category];

  for (const { keywords, points } of SEVERITY_KEYWORDS) {
    if (keywords.some((kw) => text.includes(kw))) {
      score += points;
    }
  }

  const clamped = Math.max(0, Math.min(100, score));
  return { score: clamped, level: scoreToLevel(clamped) };
}
