import { describe, it, expect } from 'vitest';
import { buildFallbackResponse } from './build-fallback-response';
import type { IncidentInput } from '../types';

describe('buildFallbackResponse', () => {
  it('returns a valid CopilotResponse for a basic medical input', () => {
    const input: IncidentInput = { description: 'Fan feels chest pain', language: 'en' };
    const resp = buildFallbackResponse(input);

    expect(resp).toBeDefined();
    expect(typeof resp.category).toBe('string');
    expect(typeof resp.severity).toBe('object');
    expect(typeof resp.severity.score).toBe('number');
    expect(typeof resp.severity.level).toBe('string');
    expect(Array.isArray(resp.actions)).toBe(true);
    expect(resp.actions.length).toBeGreaterThan(0);
    expect(typeof resp.escalation).toBe('object');
    expect(typeof resp.escalation.contactRole).toBe('string');
    expect(typeof resp.escalation.radioChannel).toBe('string');
    expect(typeof resp.escalation.urgency).toBe('string');
    expect(typeof resp.multilingualPhrase).toBe('string');
    expect(resp.multilingualPhrase.length).toBeGreaterThan(0);
    expect(resp.isFallback).toBe(true);
    expect(typeof resp.timestamp).toBe('string');
  });

  it('isFallback is always true', () => {
    const inputs: IncidentInput[] = [
      { description: 'Child crying, looks lost' },
      { description: 'Big crowd blocking the aisle near section B' },
      { description: 'Person in wheelchair cannot reach the restroom' },
      { description: 'Fan shouting aggressively at nearby visitors' },
    ];
    for (const input of inputs) {
      expect(buildFallbackResponse(input).isFallback).toBe(true);
    }
  });

  it('returns a timestamp in ISO format', () => {
    const before = new Date().toISOString();
    const resp = buildFallbackResponse({ description: 'Someone fainted' });
    const after = new Date().toISOString();
    expect(resp.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(resp.timestamp >= before).toBe(true);
    expect(resp.timestamp <= after).toBe(true);
  });

  it('rejects empty description (Zod validation)', () => {
    expect(() => buildFallbackResponse({ description: '' })).toThrow();
  });

  it('rejects description > 500 chars (Zod validation)', () => {
    const long = 'a'.repeat(501);
    expect(() => buildFallbackResponse({ description: long })).toThrow();
  });

  it('handles description at exactly max length (500)', () => {
    const max = 'a'.repeat(500);
    const resp = buildFallbackResponse({ description: max });
    expect(resp.isFallback).toBe(true);
  });

  it('handles description at max length minus 1 (499)', () => {
    const near = 'b'.repeat(499);
    const resp = buildFallbackResponse({ description: near });
    expect(resp.isFallback).toBe(true);
  });

  it('returns non-empty actions array for every known incident type', () => {
    const inputs: IncidentInput[] = [
      { description: 'Medical emergency — fan collapsed', language: 'en' },
      { description: 'A child seems lost near the entrance', language: 'es' },
      { description: 'Crowd building up near gate 4', language: 'fr' },
      { description: 'Fan in wheelchair cannot access the restroom', language: 'ar' },
      { description: 'Aggressive fan yelling at others', language: 'pt' },
      { description: 'Someone needs to find their seat', language: 'hi' },
      { description: 'Lost item — dropped wallet maybe', language: 'en' },
      { description: 'Rain starting, no cover above', language: 'en' },
      { description: 'General question about the match', language: 'en' },
    ];
    for (const input of inputs) {
      const resp = buildFallbackResponse(input);
      expect(resp.actions.length).toBeGreaterThan(0);
      expect(resp.actions[0]).toHaveProperty('order');
      expect(resp.actions[0]).toHaveProperty('action');
      expect(resp.actions[0]).toHaveProperty('detail');
    }
  });

  it('returns non-empty multilingual phrase for all supported languages', () => {
    const languages = ['en', 'es', 'fr', 'ar', 'pt', 'hi'] as const;
    for (const lang of languages) {
      const resp = buildFallbackResponse({ description: 'Fan feels unwell', language: lang });
      expect(resp.multilingualPhrase.length).toBeGreaterThan(0);
    }
  });

  it('is deterministic for same input', () => {
    const input: IncidentInput = { description: 'Fan feels chest pain', language: 'en' };
    const a = buildFallbackResponse(input);
    const b = buildFallbackResponse(input);
    expect(a.category).toBe(b.category);
    expect(a.severity.score).toBe(b.severity.score);
    expect(a.severity.level).toBe(b.severity.level);
    expect(a.escalation.contactRole).toBe(b.escalation.contactRole);
    expect(a.isFallback).toBe(true);
    // timestamp may differ by ms — compare all other fields
    const withoutTsA: Omit<typeof a, 'timestamp'> & { timestamp?: string } = { ...a };
    const withoutTsB: Omit<typeof b, 'timestamp'> & { timestamp?: string } = { ...b };
    delete withoutTsA.timestamp;
    delete withoutTsB.timestamp;
    expect(withoutTsA).toEqual(withoutTsB);
  });

  it('defaults language to "en" when omitted', () => {
    const resp = buildFallbackResponse({ description: 'Fan fainted' });
    expect(resp.multilingualPhrase.length).toBeGreaterThan(0);
  });
});