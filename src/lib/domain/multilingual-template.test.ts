import { describe, it, expect } from 'vitest';
import { buildMultilingualTemplate, SUPPORTED_CATEGORIES, SUPPORTED_LANGUAGES_LIST } from './multilingual-template';
import type { IncidentCategory, SupportedLanguage } from '../types';

describe('buildMultilingualTemplate', () => {
  it('returns a non-empty string for every category × language combination', () => {
    for (const category of SUPPORTED_CATEGORIES) {
      for (const lang of SUPPORTED_LANGUAGES_LIST) {
        const phrase = buildMultilingualTemplate(category as IncidentCategory, lang as SupportedLanguage);
        expect(typeof phrase).toBe('string');
        expect(phrase.length).toBeGreaterThan(0);
      }
    }
  });

  it('English phrase for medical contains calm/help keywords', () => {
    const phrase = buildMultilingualTemplate('medical', 'en');
    expect(phrase.toLowerCase()).toMatch(/calm|medical|help/i);
  });

  it('Spanish phrase for medical is different from English', () => {
    const en = buildMultilingualTemplate('medical', 'en');
    const es = buildMultilingualTemplate('medical', 'es');
    expect(es).not.toBe(en);
  });

  it('French (fr) returns non-English text for lost-child', () => {
    const fr = buildMultilingualTemplate('lost-child', 'fr');
    expect(fr).toMatch(/inqui|enfant|aidons/i);
  });

  it('Arabic (ar) returns non-empty phrase', () => {
    const ar = buildMultilingualTemplate('aggressive-fan', 'ar');
    expect(ar.length).toBeGreaterThan(0);
  });

  it('Portuguese (pt) returns a phrase for weather', () => {
    const pt = buildMultilingualTemplate('weather', 'pt');
    expect(pt.length).toBeGreaterThan(0);
  });

  it('Hindi (hi) returns a phrase for navigation', () => {
    const hi = buildMultilingualTemplate('navigation', 'hi');
    expect(hi.length).toBeGreaterThan(0);
  });

  it('general category returns a helpful phrase in all languages', () => {
    for (const lang of SUPPORTED_LANGUAGES_LIST) {
      const phrase = buildMultilingualTemplate('general', lang);
      expect(phrase.length).toBeGreaterThan(0);
    }
  });

  it('is deterministic — same inputs return same output', () => {
    const a = buildMultilingualTemplate('crowd-buildup', 'es');
    const b = buildMultilingualTemplate('crowd-buildup', 'es');
    expect(a).toBe(b);
  });

  it('lost-item en phrase mentions Lost and Found or gate', () => {
    const phrase = buildMultilingualTemplate('lost-item', 'en');
    expect(phrase.toLowerCase()).toMatch(/lost|found|gate/i);
  });

  it('accessibility en phrase is welcoming', () => {
    const phrase = buildMultilingualTemplate('accessibility', 'en');
    expect(phrase.toLowerCase()).toMatch(/help|assist/i);
  });

  it('all 9 categories × all 6 languages = 54 unique lookups succeed', () => {
    let count = 0;
    for (const category of SUPPORTED_CATEGORIES) {
      for (const lang of SUPPORTED_LANGUAGES_LIST) {
        const phrase = buildMultilingualTemplate(category as IncidentCategory, lang as SupportedLanguage);
        expect(phrase).toBeTruthy();
        count++;
      }
    }
    expect(count).toBe(54);
  });
  it('falls back to general category for unknown category', () => {
    const phrase = buildMultilingualTemplate('unknown' as IncidentCategory, 'es');
    expect(phrase).toBe(buildMultilingualTemplate('general', 'es'));
  });

  it('falls back to English for unknown language', () => {
    const phrase = buildMultilingualTemplate('medical', 'unknown' as SupportedLanguage);
    expect(phrase).toBe(buildMultilingualTemplate('medical', 'en'));
  });
});
