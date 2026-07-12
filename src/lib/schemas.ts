import { z } from 'zod';

/** All valid incident categories */
export const INCIDENT_CATEGORIES = [
  'lost-child',
  'medical',
  'crowd-buildup',
  'accessibility',
  'aggressive-fan',
  'navigation',
  'lost-item',
  'weather',
  'general',
] as const;

/** All supported languages */
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'ar', 'pt', 'hi'] as const;

/** All severity levels */
export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

/** Schema for incident category */
export const incidentCategorySchema = z.enum(INCIDENT_CATEGORIES);

/** Schema for supported language */
export const supportedLanguageSchema = z.enum(SUPPORTED_LANGUAGES);

/** Schema for severity level */
export const severityLevelSchema = z.enum(SEVERITY_LEVELS);

/** Schema for volunteer incident input */
export const incidentInputSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or fewer'),
  language: supportedLanguageSchema.optional().default('en'),
});

/** Schema for severity score */
export const severityScoreSchema = z.object({
  score: z.number().min(0).max(100),
  level: severityLevelSchema,
});

/** Schema for an action step */
export const actionStepSchema = z.object({
  order: z.number().int().min(1),
  action: z.string().min(1),
  detail: z.string().min(1),
});

/** Schema for escalation plan */
export const escalationPlanSchema = z.object({
  contactRole: z.string().min(1),
  contactTitle: z.string().min(1),
  radioChannel: z.string().min(1),
  urgency: z.string().min(1),
});

/** Schema for the full copilot response */
export const copilotResponseSchema = z.object({
  category: incidentCategorySchema,
  severity: severityScoreSchema,
  actions: z.array(actionStepSchema).min(1),
  escalation: escalationPlanSchema,
  multilingualPhrase: z.string().min(1),
  isFallback: z.boolean(),
  timestamp: z.string().min(1),
});
