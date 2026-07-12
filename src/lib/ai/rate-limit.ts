/**
 * In-memory sliding-window rate limiter.
 *
 * A pure function that tracks request timestamps in a simple array.
 * Each call computes how many requests fall within the rolling window.
 * Because this module uses module-level state for tracking, it is NOT
 * technically a pure function — but it is intentionally stateful for
 * the rate-limiting use case.
 *
 * For a fully pure approach in production, use Redis or an external store.
 * This implementation is sufficient for single-instance Node.js deployments
 * (e.g., the Vercel free-tier serverless functions).
 */

interface RateLimitEntry {
  timestamp: number;
}

const store = new Map<string, RateLimitEntry[]>();


/**
 * Check whether a request from the given key (e.g., IP address, user ID)
 * is allowed under the sliding-window rate limit.
 *
 * @param key        - Unique identifier for the caller (e.g., IP)
 * @param windowMs   - Sliding window duration in milliseconds (default 60 000 = 1 minute)
 * @param maxRequests - Maximum requests allowed within the window (default 15)
 * @returns `{ allowed, remaining }` where `allowed` is whether the request may proceed.
 */
export function checkRateLimit(
  key: string = 'default',
  windowMs: number = 60_000,
  maxRequests: number = 15,
): { allowed: boolean; remaining: number } {
  if (!store.has(key)) {
    store.set(key, []);
  }

  const entries = store.get(key)!;
  const cutoff = Date.now() - windowMs;

  // Evict expired entries
  const active = entries.filter((e) => e.timestamp > cutoff);
  store.set(key, active);

  if (active.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // Record this request
  active.push({ timestamp: Date.now() });
  store.set(key, active);

  return { allowed: true, remaining: maxRequests - active.length };
}

/** Expose store for testing only — do not call in production */
export function _resetStore(): void {
  store.clear();
}

/** Expose store size for testing — count of tracked keys */
export function _storeSize(): number {
  return store.size;
}