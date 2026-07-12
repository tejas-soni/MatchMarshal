import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, _resetStore, _storeSize } from './rate-limit';

beforeEach(() => {
  _resetStore();
});

describe('checkRateLimit', () => {
  it('allows requests up to the limit', () => {
    for (let i = 0; i < 15; i++) {
      const result = checkRateLimit('test-ip', 60_000, 15);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(15 - i - 1);
    }
  });

  it('blocks requests after the limit is reached', () => {
    // Fill the bucket
    for (let i = 0; i < 15; i++) {
      checkRateLimit('test-ip', 60_000, 15);
    }
    const result = checkRateLimit('test-ip', 60_000, 15);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('each key has its own independent bucket', () => {
    // Fill key A
    for (let i = 0; i < 15; i++) checkRateLimit('key-a', 60_000, 15);
    // key B should still be allowed
    const result = checkRateLimit('key-b', 60_000, 15);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(14);
  });

  it('custom maxRequests is respected', () => {
    for (let i = 0; i < 3; i++) checkRateLimit('test-ip', 60_000, 3);
    const result = checkRateLimit('test-ip', 60_000, 3);
    expect(result.allowed).toBe(false);
  });

  it('remaining counts down correctly', () => {
    const results = [];
    for (let i = 0; i < 5; i++) results.push(checkRateLimit('test-ip', 60_000, 5));
    expect(results.map((r) => r.remaining)).toEqual([4, 3, 2, 1, 0]);
  });

  it('defaults to "default" key when no key provided', () => {
    checkRateLimit(); // no key → uses 'default'
    checkRateLimit(); // second call
    const result = checkRateLimit(); // third call hits limit of 15
    expect(result.allowed).toBe(true); // still within 15
    expect(result.remaining).toBe(12);
  });

  it('allowed is false when exactly at limit', () => {
    for (let i = 0; i < 15; i++) checkRateLimit('exact', 60_000, 15);
    const result = checkRateLimit('exact', 60_000, 15);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('multiple keys produce multiple store entries', () => {
    checkRateLimit('a');
    checkRateLimit('b');
    checkRateLimit('c');
    expect(_storeSize()).toBe(3);
  });

  it('zero maxRequests always blocks', () => {
    const result = checkRateLimit('zero-test', 60_000, 0);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('_resetStore clears all entries', () => {
    for (let i = 0; i < 15; i++) checkRateLimit('ip-reset-test', 60_000, 15);
    expect(checkRateLimit('ip-reset-test', 60_000, 15).allowed).toBe(false);
    _resetStore();
    expect(_storeSize()).toBe(0);
    expect(checkRateLimit('ip-reset-test', 60_000, 15).allowed).toBe(true);
  });
});