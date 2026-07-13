import { describe, it, expect } from 'vitest';
import {
  incidentCategorySchema,
  supportedLanguageSchema,
  severityLevelSchema,
  incidentInputSchema,
  severityScoreSchema,
  actionStepSchema,
  escalationPlanSchema,
  copilotResponseSchema,
} from './schemas';

describe('Zod Schemas', () => {
  it('incidentCategorySchema validates categories', () => {
    expect(incidentCategorySchema.parse('medical')).toBe('medical');
    expect(() => incidentCategorySchema.parse('invalid')).toThrow();
  });

  it('supportedLanguageSchema validates languages', () => {
    expect(supportedLanguageSchema.parse('en')).toBe('en');
    expect(() => supportedLanguageSchema.parse('de')).toThrow();
  });

  it('severityLevelSchema validates levels', () => {
    expect(severityLevelSchema.parse('high')).toBe('high');
    expect(() => severityLevelSchema.parse('extreme')).toThrow();
  });

  it('incidentInputSchema validates descriptions and language', () => {
    expect(incidentInputSchema.parse({ description: 'test' })).toEqual({
      description: 'test',
      language: 'en', // default
    });
    expect(incidentInputSchema.parse({ description: 'test', language: 'es' })).toEqual({
      description: 'test',
      language: 'es',
    });
    expect(() => incidentInputSchema.parse({ description: '' })).toThrow();
    expect(() => incidentInputSchema.parse({ description: 'a'.repeat(501) })).toThrow();
  });

  it('severityScoreSchema validates score and level', () => {
    expect(severityScoreSchema.parse({ score: 50, level: 'medium' })).toEqual({ score: 50, level: 'medium' });
    expect(() => severityScoreSchema.parse({ score: -1, level: 'medium' })).toThrow();
    expect(() => severityScoreSchema.parse({ score: 101, level: 'medium' })).toThrow();
  });

  it('actionStepSchema validates action steps', () => {
    expect(actionStepSchema.parse({ order: 1, action: 'Run', detail: 'Fast' })).toEqual({ order: 1, action: 'Run', detail: 'Fast' });
    expect(() => actionStepSchema.parse({ order: 0, action: 'Run', detail: 'Fast' })).toThrow();
  });

  it('escalationPlanSchema validates escalation plans', () => {
    expect(escalationPlanSchema.parse({ contactRole: 'Police', contactTitle: 'Officer', radioChannel: '1', urgency: 'High' })).toBeTruthy();
    expect(() => escalationPlanSchema.parse({ contactRole: '' })).toThrow();
  });

  it('copilotResponseSchema validates responses', () => {
    const valid = {
      category: 'medical',
      severity: { score: 80, level: 'high' },
      actions: [{ order: 1, action: 'Assess', detail: 'Check breathing' }],
      escalation: { contactRole: 'Medic', contactTitle: 'Doctor', radioChannel: '2', urgency: 'Immediate' },
      multilingualPhrase: 'Need a doctor',
      isFallback: false,
      timestamp: '2026-07-13T12:00:00Z',
    };
    expect(copilotResponseSchema.parse(valid)).toEqual(valid);
    // Missing required field 'category'
    const invalid = {
      severity: { score: 80, level: 'high' },
      actions: [{ order: 1, action: 'Assess', detail: 'Check breathing' }],
      escalation: { contactRole: 'Medic', contactTitle: 'Doctor', radioChannel: '2', urgency: 'Immediate' },
      multilingualPhrase: 'Need a doctor',
      isFallback: false,
      timestamp: '2026-07-13T12:00:00Z',
    };
    expect(() => copilotResponseSchema.parse(invalid)).toThrow();
  });
});
