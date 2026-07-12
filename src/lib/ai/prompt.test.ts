import { describe, it, expect } from 'vitest';
import {
  buildIncidentPrompt,
  getSystemPreamble,
  getGuardSuffix,
  isValidJsonResponse,
  parseIncidentResponse,
  scoreToLevel,
} from './prompt';

describe('prompt utils', () => {
  describe('buildIncidentPrompt', () => {
    it('builds a prompt combining preamble, language, text, and guard', () => {
      const prompt = buildIncidentPrompt('Drunk fan at Gate 3', 'es');
      expect(prompt).toContain(getSystemPreamble());
      expect(prompt).toContain('Volunteer preferred language: es');
      expect(prompt).toContain('Volunteer text: Drunk fan at Gate 3');
      expect(prompt).toContain(getGuardSuffix());
    });

    it('defaults language to en', () => {
      const prompt = buildIncidentPrompt('Drunk fan');
      expect(prompt).toContain('Volunteer preferred language: en');
    });
  });

  describe('isValidJsonResponse', () => {
    it('returns true for valid json objects', () => {
      expect(isValidJsonResponse('{"a": 1}')).toBe(true);
      expect(isValidJsonResponse('{}')).toBe(true);
    });

    it('returns false for arrays, primitives, null, or malformed json', () => {
      expect(isValidJsonResponse('[]')).toBe(false);
      expect(isValidJsonResponse('null')).toBe(false);
      expect(isValidJsonResponse('123')).toBe(false);
      expect(isValidJsonResponse('"string"')).toBe(false);
      expect(isValidJsonResponse('{malformed}')).toBe(false);
    });
  });

  describe('parseIncidentResponse', () => {
    it('returns parsed object for valid structured response', () => {
      const validJson = JSON.stringify({
        category: 'medical',
        severity: { score: 70, level: 'high' },
        phrases: { en: 'Calm down' },
      });
      const parsed = parseIncidentResponse(validJson);
      expect(parsed).not.toBeNull();
      expect(parsed!.category).toBe('medical');
      expect(parsed!.severity.score).toBe(70);
      expect(parsed!.phrases.en).toBe('Calm down');
    });

    it('returns null for structurally invalid responses', () => {
      expect(parseIncidentResponse('{"category": "medical"}')).toBeNull();
      expect(parseIncidentResponse('null')).toBeNull();
      expect(parseIncidentResponse('[]')).toBeNull();
      expect(parseIncidentResponse('{"category": 123, "severity": {}, "phrases": {}}')).toBeNull();
      expect(parseIncidentResponse('{"category": "medical", "severity": 123, "phrases": {}}')).toBeNull();
      expect(parseIncidentResponse('{"category": "medical", "severity": {}, "phrases": 123}')).toBeNull();
      expect(parseIncidentResponse('{malformed}')).toBeNull();
    });
  });

  describe('scoreToLevel', () => {
    it('returns correct levels based on score boundaries', () => {
      expect(scoreToLevel(95)).toBe('critical');
      expect(scoreToLevel(90)).toBe('critical');
      expect(scoreToLevel(89)).toBe('high');
      expect(scoreToLevel(65)).toBe('high');
      expect(scoreToLevel(64)).toBe('medium');
      expect(scoreToLevel(30)).toBe('medium');
      expect(scoreToLevel(29)).toBe('low');
      expect(scoreToLevel(0)).toBe('low');
    });
  });
});
