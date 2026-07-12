import { describe, it, expect } from 'vitest';
import { preprocessApiInput, buildApiFallback, buildFallbackResponse } from './fallback';

describe('fallback utils', () => {
  describe('preprocessApiInput', () => {
    it('returns null for empty or whitespace-only inputs', () => {
      expect(preprocessApiInput('')).toBeNull();
      expect(preprocessApiInput('    ')).toBeNull();
      expect(preprocessApiInput(null as unknown as string)).toBeNull();
    });

    it('returns clamped and trimmed IncidentInput for valid input', () => {
      const result = preprocessApiInput('   Some incident description   ', 'es');
      expect(result).toEqual({
        description: 'Some incident description',
        language: 'es',
      });
    });

    it('clamps long descriptions', () => {
      const longText = 'a '.repeat(300); // 600 chars
      const result = preprocessApiInput(longText, 'fr');
      expect(result).not.toBeNull();
      expect(result!.description.length).toBeLessThanOrEqual(500);
      expect(result!.language).toBe('fr');
    });

    it('defaults language to en', () => {
      const result = preprocessApiInput('Fan collapsed');
      expect(result!.language).toBe('en');
    });
  });

  describe('buildApiFallback', () => {
    it('returns a valid fallback CopilotResponse', () => {
      const result = buildApiFallback({ description: 'Someone fainted', language: 'en' });
      expect(result.category).toBe('medical');
      expect(result.isFallback).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
    });
  });

  describe('re-exported buildFallbackResponse', () => {
    it('is defined and behaves identically', () => {
      expect(buildFallbackResponse).toBeDefined();
      const result = buildFallbackResponse({ description: 'Lost child' });
      expect(result.category).toBe('lost-child');
      expect(result.isFallback).toBe(true);
    });
  });
});
