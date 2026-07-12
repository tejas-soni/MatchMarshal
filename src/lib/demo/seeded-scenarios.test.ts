import { describe, it, expect } from 'vitest';
import { seededScenarioFeed } from './seeded-scenarios';

describe('seededScenarioFeed', () => {
  it('returns a function that returns DemoScenario objects', () => {
    const feed = seededScenarioFeed(42);
    const scenario = feed();
    expect(scenario).toHaveProperty('id');
    expect(scenario).toHaveProperty('title');
    expect(scenario).toHaveProperty('description');
    expect(scenario).toHaveProperty('expectedCategory');
    expect(scenario).toHaveProperty('expectedSeverity');
  });

  it('is deterministic — same seed produces same infinite sequence', () => {
    const feedA = seededScenarioFeed(999);
    const feedB = seededScenarioFeed(999);
    for (let i = 0; i < 50; i++) {
      expect(feedA()).toEqual(feedB());
    }
  });

  it('different seeds produce different sequences', () => {
    const feed1 = seededScenarioFeed(111);
    const feed2 = seededScenarioFeed(222);
    // Collect 5 scenarios from each
    const seq1 = [feed1(), feed1(), feed1(), feed1(), feed1()];
    const seq2 = [feed2(), feed2(), feed2(), feed2(), feed2()];
    // At least one element should differ (statistically overwhelmingly likely with random seeds)
    const allSame = seq1.every((s, i) => s.id === seq2[i]?.id);
    expect(allSame).toBe(false);
  });

  it('seeds 0 and negative integers are valid', () => {
    const feed0 = seededScenarioFeed(0);
    const feedNeg = seededScenarioFeed(-42);
    expect(() => feed0()).not.toThrow();
    expect(() => feedNeg()).not.toThrow();
  });

  it('cycles through pool — after N calls (N = pool size) we see start of repeat', () => {
    const POOL_SIZE = 15;
    const feed = seededScenarioFeed(12345);
    const firstPass = Array.from({ length: POOL_SIZE }, () => feed());
    const secondPass = Array.from({ length: POOL_SIZE }, () => feed());
    // Exactly the same order (cyles)
    expect(firstPass.map((s) => s.id)).toEqual(secondPass.map((s) => s.id));
  });

  it('all scenario IDs in pool are unique', () => {
    const feed = seededScenarioFeed(555);
    const ids = new Set<string>();
    for (let i = 0; i < 30; i++) {
      ids.add(feed().id);
    }
    // Only 15 unique IDs — cycling
    expect(ids.size).toBe(15);
  });

  it('every returned scenario has a non-empty title, description, id, category, severity', () => {
    const feed = seededScenarioFeed(7);
    for (let i = 0; i < 15; i++) {
      const s = feed();
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
      expect(s.id.length).toBeGreaterThan(0);
      expect(['lost-child', 'medical', 'crowd-buildup', 'accessibility', 'aggressive-fan', 'navigation', 'lost-item', 'weather', 'general']).toContain(s.expectedCategory);
      expect(['low', 'medium', 'high', 'critical']).toContain(s.expectedSeverity);
    }
  });

  it('seededScenarioFeed called twice returns independent feeds', () => {
    const feedA = seededScenarioFeed(1);
    const feedB = seededScenarioFeed(1);
    const a1 = feedA();
    const b1 = feedB();
    expect(a1).toEqual(b1);
    const a2 = feedA();
    // feedB has not moved — still at b1 equivalent position
    expect(a2.id).not.toBe(b1.id); // sequences are offset by one
  });

  it('large seed values are handled without overflow', () => {
    const feed = seededScenarioFeed(2_147_483_647);
    expect(() => feed()).not.toThrow();
    expect(() => feed()).not.toThrow();
  });

  it('is pure — the feed itself has no observable side effects', () => {
    const feed1 = seededScenarioFeed(32);
    const feed2 = seededScenarioFeed(32);
    // Compare first 5 outputs
    for (let i = 0; i < 5; i++) {
      expect(feed1()).toEqual(feed2());
    }
  });
});