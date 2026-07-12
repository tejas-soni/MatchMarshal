/**
 * Security and input sanitization utilities.
 *
 * These functions are pure (no side effects) and form the first line of
 * defense against:
 *
 * 1. Prompt injection attacks — volunteer input is stripped of HTML/script
 *    and guarded against known manipulation phrases before being sent to
 *    any LLM API.
 * 2. Resource exhaustion — large inputs are clamped to a safe maximum
 *    before processing.
 *
 * All functions are purely functional: same input always yields same output.
 */

/**
 * Known prompt injection keywords and patterns.
 * Matched case-insensitively against the full input string.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions?)?/i,
  /ignore\s+previous/i,
  /\bignore\s+(the\s+)?(rules|instructions|system|safety|previous)\b/i,
  /\bdisregard\s+(all\s+)?(your|my)\b/i,
  /^system\s*:/im,
  /^\s*instruction\s*:/im,
  /\bYou\s+are\s+a\s+.*?\s+assistant\s+now/i,
  /\bpretend\s+(you|to)\s+be\b/i,
  /\bforget\s+(everything|all|your)\b/i,
  /\boverride\s+(system|safety|instructions)/i,
  /\bsudo\s+/i,
  /\brm\s+-rf\b/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /\[\s*SYSTEM\s*\]/i,
  /<\s*script/i,
];

/**
 * Tags and attributes that should never appear in volunteer input.
 */
const DANGEROUS_HTML: RegExp[] = [
  /<script/i,
  /<iframe/i,
  /on\w+\s*=/i,
  /javascript\s*:/i,
  /data\s*:/i,
  /vbscript\s*:/i,
  /expression\s*\(/i,
];

/**
 * Sanitize input by stripping HTML tags and dangerous attributes.
 *
 * - Removes all substrings matching dangerous tag patterns.
 * - Strips leading/trailing whitespace.
 * - Collapses internal multiple spaces into a single space.
 *
 * @param text - Raw user input (e.g., volunteer incident description).
 * @returns Sanitized string safe for display or LLM input.
 */
export function sanitizeInput(text: string): string {
  if (typeof text !== 'string') return '';
  const result = text
    // Remove <script>, <iframe>, on* handlers, javascript: etc.
    .replace(/<[^>]*>/g, ' ')
    // Strip HTML entities (basic)
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    // Strip javascript: protocol but preserve function name if any
    .replace(/javascript\s*:\s*([a-z0-9_]+)(\([^)]*\))?/gi, '$1')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
  return result;
}

/**
 * Detect prompt injection attempts in user input.
 *
 * Checks against a list of known manipulation patterns and returns true
 * if any are detected. Used as a guard before sending input to any LLM.
 *
 * @param text - User input to check.
 * @returns `true` if an injection pattern was detected, `false` otherwise.
 */
export function detectPromptInjection(text: string): boolean {
  if (typeof text !== 'string') return false;
  const sanitized = sanitizeInput(text);
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text) || pattern.test(sanitized)) return true;
  }
  // Secondary check for any remaining HTML-like dangerous constructs
  for (const html of DANGEROUS_HTML) {
    if (html.test(text) || html.test(sanitized)) return true;
  }
  return false;
}

/**
 * Clamp text length to a maximum, preserving whole words when possible.
 *
 * If the text is already within the limit, it is returned unchanged.
 * If it exceeds the limit, the string is truncated to `max` characters,
 * then trimmed back to the last complete word boundary.
 *
 * @param text - Input string to clamp.
 * @param max  - Maximum allowed length in characters (default: 500).
 * @returns The clamped string, guaranteed to have length ≤ max.
 */
export function clampLength(text: string, max: number = 500): string {
  if (typeof text !== 'string') return '';
  if (text.length <= max) return text;
  
  // If the character immediately following the cutoff is whitespace,
  // or if the cutoff itself is whitespace, we don't cut a word.
  if (/\s/.test(text[max]) || /\s/.test(text[max - 1])) {
    return text.slice(0, max).trim();
  }

  const truncated = text.slice(0, max);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace).trim();
  }
  return truncated.trim();
}

/** Word count approximation (splits on whitespace). */
export function wordCount(text: string): number {
  if (typeof text !== 'string' || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
}

/** Check whether the input contains a newline or line break. */
export function hasNewline(text: string): boolean {
  return typeof text === 'string' && /\n/.test(text);
}