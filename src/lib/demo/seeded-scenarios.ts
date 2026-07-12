import type { DemoScenario } from '../types';

/**
 * A curated, fixed pool of demo scenarios representing common stadium incidents.
 * Each entry has a known expected classification for testing the engine end-to-end.
 */
const SCENARIO_POOL: DemoScenario[] = [
  {
    id: 's1',
    title: 'Collapsed Spectator',
    description: 'A spectator near Section C suddenly collapses and is unresponsive.',
    expectedCategory: 'medical',
    expectedSeverity: 'critical',
  },
  {
    id: 's2',
    title: 'Lost Child at Entrance',
    description: 'A young boy is crying alone near Gate 2, holding an ice cream and looking confused.',
    expectedCategory: 'lost-child',
    expectedSeverity: 'high',
  },
  {
    id: 's3',
    title: 'Crowd Build-up at Narrow Aisle',
    description: 'A large group of fans is pushing through the narrow aisle between sections A and B.',
    expectedCategory: 'crowd-buildup',
    expectedSeverity: 'medium',
  },
  {
    id: 's4',
    title: 'Wheelchair User Cannot Reach Elevator',
    description: 'A fan in a wheelchair says the elevator is broken and they cannot reach their seat.',
    expectedCategory: 'accessibility',
    expectedSeverity: 'medium',
  },
  {
    id: 's5',
    title: 'Aggressive Confrontation',
    description: 'A heated argument is escalating near the merchandise stand; one fan is gesturing aggressively.',
    expectedCategory: 'aggressive-fan',
    expectedSeverity: 'high',
  },
  {
    id: 's6',
    title: 'Cannot Find Seat',
    description: 'A family with two children is standing by the main concourse unsure which section to go to.',
    expectedCategory: 'navigation',
    expectedSeverity: 'low',
  },
  {
    id: 's7',
    title: 'Lost Wallet',
    description: 'An elderly fan is looking distressed and says they think they dropped their wallet somewhere.',
    expectedCategory: 'lost-item',
    expectedSeverity: 'low',
  },
  {
    id: 's8',
    title: 'Lightning Alert',
    description: 'Thunder is audible and dark clouds are directly overhead. Security is activating the weather protocol.',
    expectedCategory: 'weather',
    expectedSeverity: 'critical',
  },
  {
    id: 's9',
    title: 'Spilled Drink, Slip Hazard',
    description: 'A cup of beer has spilled on the concourse floor creating a slip hazard near the snack bar.',
    expectedCategory: 'general',
    expectedSeverity: 'low',
  },
  {
    id: 's10',
    title: 'Visitor Asking About First Aid',
    description: 'A visitor approaches and asks where the nearest first aid station is located.',
    expectedCategory: 'medical',
    expectedSeverity: 'low',
  },
  {
    id: 's11',
    title: 'Child Separated from School Group',
    description: 'A primary school child is alone and says their teacher walked ahead and left them behind.',
    expectedCategory: 'lost-child',
    expectedSeverity: 'high',
  },
  {
    id: 's12',
    title: 'Reserved Seating Dispute',
    description: 'Two groups of fans are arguing over seat numbers and showing tickets to each other loudly.',
    expectedCategory: 'aggressive-fan',
    expectedSeverity: 'medium',
  },
  {
    id: 's13',
    title: 'Visitor Asking for Lactose-Free Snack Option',
    description: 'A visitor with a dietary restriction is asking a nearby staff member about food options.',
    expectedCategory: 'general',
    expectedSeverity: 'low',
  },
  {
    id: 's14',
    title: 'Evacuation Route Blocked by Equipment',
    description: 'Maintenance carts are partially blocking an emergency exit in the lower tier.',
    expectedCategory: 'crowd-buildup',
    expectedSeverity: 'high',
  },
  {
    id: 's15',
    title: 'Deaf Visitor Cannot Hear P.A. Announcement',
    description: 'A deaf fan is waving to get attention — seems confused about a delayed kickoff announcement.',
    expectedCategory: 'accessibility',
    expectedSeverity: 'medium',
  },
];

/**
 * Linear congruential generator (LCG) — a simple, deterministic PRNG.
 * Using the same formula as many industry PRNGs (e.g., glibc, MiniMR).
 * Produces integers in [0, 2^31-1].
 */
function lcg(seed: number): () => number {
  // Parameters: a = 1103515245, c = 12345, m = 2^31
  let state = seed;
  return () => {
    state = (1103515245 * state + 12345) & 0x7fffffff;
    return state;
  };
}

/**
 * Return a deterministic scenario feed that cycles through the pool.
 *
 * `seededScenarioFeed(seed)(...)` always returns the same infinite sequence for the
 * same seed (pure, reproducible), but different seeds produce different orderings.
 *
 * The returned function is call-by-call: each invocation returns the next scenario
 * in the pre-computed cycle. Calling reset by creating a new seed generator re-starts.
 *
 * @param seed - Arbitrary integer seed. Same seed → same sequence.
 * @returns A thunk that returns the next DemoScenario on each call.
 */
export function seededScenarioFeed(
  seed: number,
): () => DemoScenario {
  // Build cycle once per seed — deterministic
  const cycleLength = SCENARIO_POOL.length;
  const rng = lcg(seed);
  // Map each index to a "swap" destination using Fisher-Yates on a fixed-size buffer
  const swaps: Array<{ i: number; j: number }> = [];
  for (let i = cycleLength - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    swaps.push({ i, j });
  }

  // Apply swaps on top of a copy of the pool
  const shuffled = [...SCENARIO_POOL];
  for (const { i, j } of swaps) {
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }

  let index = 0;
  return (): DemoScenario => {
    const scenario = shuffled[index % cycleLength];
    index++;
    return scenario;
  };
}