/** Core types for MatchMarshal volunteer copilot */

/** Incident categories that the system can classify */
export type IncidentCategory =
  | 'lost-child'
  | 'medical'
  | 'crowd-buildup'
  | 'accessibility'
  | 'aggressive-fan'
  | 'navigation'
  | 'lost-item'
  | 'weather'
  | 'general';

/** Severity levels for classified incidents */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/** Severity score with numeric value and level */
export interface SeverityScore {
  score: number;
  level: SeverityLevel;
}

/** Supported languages for multilingual output */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar' | 'pt' | 'hi';

/** Volunteer incident input */
export interface IncidentInput {
  description: string;
  language?: SupportedLanguage;
}

/** A single action step in the response */
export interface ActionStep {
  order: number;
  action: string;
  detail: string;
}

/** Escalation plan for an incident */
export interface EscalationPlan {
  contactRole: string;
  contactTitle: string;
  radioChannel: string;
  urgency: string;
}

/** Full copilot response returned to the volunteer */
export interface CopilotResponse {
  category: IncidentCategory;
  severity: SeverityScore;
  actions: ActionStep[];
  escalation: EscalationPlan;
  multilingualPhrase: string;
  isFallback: boolean;
  timestamp: string;
}

/** Demo scenario for seeded simulation */
export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  expectedCategory: IncidentCategory;
  expectedSeverity: SeverityLevel;
}
