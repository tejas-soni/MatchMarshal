import { describe, it, expect } from 'vitest';
import { computeSeverity, scoreToLevel } from './compute-severity';

describe('scoreToLevel', () => {
  it('returns low for score 0', () => expect(scoreToLevel(0)).toBe('low'));
  it('returns low for score 30', () => expect(scoreToLevel(30)).toBe('low'));
  it('returns medium for score 31', () => expect(scoreToLevel(31)).toBe('medium'));
  it('returns medium for score 60', () => expect(scoreToLevel(60)).toBe('medium'));
  it('returns high for score 61', () => expect(scoreToLevel(61)).toBe('high'));
  it('returns high for score 85', () => expect(scoreToLevel(85)).toBe('high'));
  it('returns critical for score 86', () => expect(scoreToLevel(86)).toBe('critical'));
  it('returns critical for score 100', () => expect(scoreToLevel(100)).toBe('critical'));
  it('clamps negative scores to low', () => expect(scoreToLevel(-10)).toBe('low'));
  it('clamps scores above 100 to critical', () => expect(scoreToLevel(150)).toBe('critical'));
});

describe('computeSeverity', () => {
  it('returns a score and level', () => {
    const result = computeSeverity({ description: 'Someone fainted' });
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('level');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('is deterministic — same input → same output', () => {
    const input = { description: 'Fan with a bleeding injury near gate 5' };
    const a = computeSeverity(input);
    const b = computeSeverity(input);
    expect(a).toEqual(b);
  });

  it('critical: unconscious person (life-threat keyword)', () => {
    const result = computeSeverity({ description: 'Person is unconscious at the north stand' });
    expect(result.level).toBe('critical');
    expect(result.score).toBe(100);
  });

  it('critical: cardiac event + medical base', () => {
    const result = computeSeverity({ description: 'Fan having cardiac arrest in section B' });
    expect(result.level).toBe('critical');
  });

  it('high: aggressive fighting fans', () => {
    const result = computeSeverity({ description: 'Two fans fighting and being violent' });
    expect(result.level).toBe('high');
  });

  it('high: medical with bleeding', () => {
    const result = computeSeverity({ description: 'Bleeding injury at gate 3' });
    expect(result.level).toBe('high');
  });

  it('medium: crowd congestion (no extreme keyword)', () => {
    const result = computeSeverity({ description: 'Crowd congestion at the east entrance' });
    expect(result.level).toBe('medium');
  });

  it('low: navigation question', () => {
    const result = computeSeverity({ description: 'Fan asking where to find the exit' });
    expect(result.level).toBe('low');
  });

  it('low: empty description (falls to general + minimal score)', () => {
    const result = computeSeverity({ description: '' });
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it('score is always clamped between 0 and 100', () => {
    const extreme = computeSeverity({ description: 'unconscious cardiac arrest bleeding seizure stampede fire explosion weapon' });
    expect(extreme.score).toBe(100);
  });

  it('lost-child scenario is high/critical', () => {
    const result = computeSeverity({ description: 'Lost child crying alone near gate 7' });
    expect(['high', 'critical']).toContain(result.level);
  });

  it('heatstroke is high/critical', () => {
    const result = computeSeverity({ description: 'Fan showing signs of heatstroke in the sun' });
    expect(['high', 'critical']).toContain(result.level);
  });

  it('respects language field without affecting score', () => {
    const en = computeSeverity({ description: 'Someone is injured', language: 'en' });
    const es = computeSeverity({ description: 'Someone is injured', language: 'es' });
    expect(en).toEqual(es);
  });
});
