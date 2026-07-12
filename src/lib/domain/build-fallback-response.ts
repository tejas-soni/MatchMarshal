import { buildMultilingualTemplate } from './multilingual-template';
import { computeSeverity } from './compute-severity';
import { classifyIncident } from './classify-incident';
import { recommendActions } from './recommend-actions';
import { buildEscalation } from './build-escalation';
import { incidentInputSchema } from '../schemas';
import type { IncidentInput, CopilotResponse } from '../types';

/**
 * Build a complete structured fallback response for a volunteer incident.
 *
 * This path ALWAYS succeeds — it uses local rules, templates, and schemas
 * without calling any external AI API. It is intentionally deterministic
 * and free of side effects.
 *
 * The response is marked `isFallback: true` so the UI can indicate to
 * users that no LLM was consulted (optional badge/label).
 *
 * @throws ZodError if the input fails schema validation (caller should pre-validate).
 */
export function buildFallbackResponse(input: IncidentInput): CopilotResponse {
  // Validate input; ZodError propagates on failure
  const validated = incidentInputSchema.parse(input);

  const category = classifyIncident(validated);
  const severity = computeSeverity(validated);
  const actions = recommendActions(category, severity);
  const escalation = buildEscalation(category, severity);
  const multilingualPhrase = buildMultilingualTemplate(category, validated.language ?? 'en');

  return {
    category,
    severity,
    actions,
    escalation,
    multilingualPhrase,
    isFallback: true,
    timestamp: new Date().toISOString(),
  };
}