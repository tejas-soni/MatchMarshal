import { describe, it, expect } from 'vitest';
import { recommendActions } from './recommend-actions';
import type { IncidentCategory, SeverityScore } from '../types';

const low: SeverityScore = { score: 10, level: 'low' };
const medium: SeverityScore = { score: 50, level: 'medium' };
const high: SeverityScore = { score: 75, level: 'high' };
const critical: SeverityScore = { score: 95, level: 'critical' };

describe('recommendActions', () => {
  it('returns a non-empty array for every category', () => {
    const categories: IncidentCategory[] = [
      'lost-child', 'medical', 'crowd-buildup', 'accessibility',
      'aggressive-fan', 'navigation', 'lost-item', 'weather', 'general',
    ];
    for (const cat of categories) {
      const steps = recommendActions(cat, medium);
      expect(steps.length).toBeGreaterThan(0);
    }
  });

  it('steps are sorted in ascending order', () => {
    const steps = recommendActions('medical', high);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].order).toBeGreaterThanOrEqual(steps[i - 1].order);
    }
  });

  it('every step has a non-empty action and detail', () => {
    const steps = recommendActions('crowd-buildup', medium);
    for (const step of steps) {
      expect(step.action.length).toBeGreaterThan(0);
      expect(step.detail.length).toBeGreaterThan(0);
    }
  });

  it('critical severity prepends supervisor-call step with order 0', () => {
    const steps = recommendActions('medical', critical);
    expect(steps[0].order).toBe(0);
    expect(steps[0].action).toMatch(/URGENT/i);
  });

  it('non-critical does NOT prepend supervisor-call step', () => {
    const steps = recommendActions('medical', high);
    expect(steps[0].order).toBeGreaterThan(0);
    expect(steps[0].action).not.toMatch(/URGENT/i);
  });

  it('low severity has no supervisor prepend', () => {
    const steps = recommendActions('navigation', low);
    expect(steps.every((s) => !s.action.includes('URGENT'))).toBe(true);
  });

  it('medical steps reference Medical Team radio channel', () => {
    const steps = recommendActions('medical', low);
    const first = steps[0];
    expect(first.detail.toLowerCase()).toMatch(/channel|radio|medical/i);
  });

  it('lost-child steps mention security', () => {
    const steps = recommendActions('lost-child', high);
    const combined = steps.map((s) => s.detail).join(' ').toLowerCase();
    expect(combined).toMatch(/security|radio|supervisor/i);
  });

  it('aggressive-fan steps mention not engaging physically', () => {
    const steps = recommendActions('aggressive-fan', medium);
    const combined = steps.map((s) => s.action + ' ' + s.detail).join(' ').toLowerCase();
    expect(combined).toMatch(/not engage|safe distance|physical/i);
  });

  it('general category returns safe fallback steps', () => {
    const steps = recommendActions('general', low);
    expect(steps.length).toBeGreaterThanOrEqual(2);
  });

  it('critical + lost-child: supervisor step is first', () => {
    const steps = recommendActions('lost-child', critical);
    expect(steps[0].order).toBe(0);
    expect(steps[1].order).toBeGreaterThan(0);
  });

  it('is deterministic — same inputs → same output', () => {
    const a = recommendActions('weather', medium);
    const b = recommendActions('weather', medium);
    expect(a).toEqual(b);
  });

  it('step order values are positive integers (except critical prepend)', () => {
    const steps = recommendActions('navigation', medium);
    for (const s of steps) {
      expect(Number.isInteger(s.order)).toBe(true);
      expect(s.order).toBeGreaterThanOrEqual(1);
    }
  });
  it('falls back to general actions for unknown category', () => {
    const steps = recommendActions('unknown' as IncidentCategory, medium);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].action).toMatch(/gather more information/i);
  });
});
