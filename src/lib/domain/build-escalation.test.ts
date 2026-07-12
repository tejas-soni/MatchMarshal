import { describe, it, expect } from 'vitest';
import { buildEscalation } from './build-escalation';
import type { IncidentCategory, SeverityScore } from '../types';

const low: SeverityScore = { score: 10, level: 'low' };
const medium: SeverityScore = { score: 50, level: 'medium' };
const high: SeverityScore = { score: 75, level: 'high' };
const critical: SeverityScore = { score: 95, level: 'critical' };

describe('buildEscalation', () => {
  it('returns a complete escalation plan for every category', () => {
    const categories: IncidentCategory[] = [
      'lost-child', 'medical', 'crowd-buildup', 'accessibility',
      'aggressive-fan', 'navigation', 'lost-item', 'weather', 'general',
    ];
    for (const cat of categories) {
      const plan = buildEscalation(cat, medium);
      expect(plan.contactRole.length).toBeGreaterThan(0);
      expect(plan.contactTitle.length).toBeGreaterThan(0);
      expect(plan.radioChannel.length).toBeGreaterThan(0);
      expect(plan.urgency.length).toBeGreaterThan(0);
    }
  });

  it('medical → Medical Response Team on Ch 3', () => {
    const plan = buildEscalation('medical', medium);
    expect(plan.contactRole).toBe('medical');
    expect(plan.radioChannel).toMatch(/ch 3/i);
  });

  it('lost-child → security contact', () => {
    const plan = buildEscalation('lost-child', high);
    expect(plan.contactRole).toBe('security');
    expect(plan.radioChannel).toMatch(/ch 1/i);
  });

  it('aggressive-fan → security on Ch 1', () => {
    const plan = buildEscalation('aggressive-fan', high);
    expect(plan.contactRole).toBe('security');
    expect(plan.radioChannel).toMatch(/ch 1/i);
  });

  it('crowd-buildup → operations on Ch 2', () => {
    const plan = buildEscalation('crowd-buildup', medium);
    expect(plan.contactRole).toBe('operations');
    expect(plan.radioChannel).toMatch(/ch 2/i);
  });

  it('accessibility → accessibility desk on Ch 4', () => {
    const plan = buildEscalation('accessibility', low);
    expect(plan.contactRole).toBe('accessibility');
    expect(plan.radioChannel).toMatch(/ch 4/i);
  });

  it('critical severity adds supervisor regardless of category', () => {
    const plan = buildEscalation('navigation', critical);
    expect(plan.contactTitle).toMatch(/supervisor/i);
  });

  it('critical medical mentions supervisor too', () => {
    const plan = buildEscalation('medical', critical);
    expect(plan.contactTitle).toMatch(/supervisor/i);
  });

  it('non-critical navigation does NOT mention supervisor in title', () => {
    const plan = buildEscalation('navigation', medium);
    expect(plan.contactTitle).not.toMatch(/supervisor/i);
  });

  it('urgency levels: low → Routine', () => {
    const plan = buildEscalation('general', low);
    expect(plan.urgency).toMatch(/routine/i);
  });

  it('urgency levels: medium → Elevated', () => {
    const plan = buildEscalation('general', medium);
    expect(plan.urgency).toMatch(/elevated/i);
  });

  it('urgency levels: high → High — escalate immediately', () => {
    const plan = buildEscalation('general', high);
    expect(plan.urgency).toMatch(/high/i);
  });

  it('urgency levels: critical → CRITICAL', () => {
    const plan = buildEscalation('general', critical);
    expect(plan.urgency).toMatch(/critical/i);
  });

  it('is deterministic', () => {
    const a = buildEscalation('lost-item', high);
    const b = buildEscalation('lost-item', high);
    expect(a).toEqual(b);
  });
});
