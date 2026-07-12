/**
 * Local fallback functions for when the Gemini API is unavailable,
 * rate-limited, or timed out.
 *
 * All functions are pure: same input → same output, no side effects.
 * The primary engine lives in `src/lib/domain/build-fallback-response.ts`.
 * This module re-exports it and adds any AI-route-specific helpers.
 */

import { buildFallbackResponse as buildDomainFallback } from '../domain/build-fallback-response';
import { clampLength } from './safety';
import type { IncidentInput, CopilotResponse } from '../types';

/** Maximum input length accepted from the API route (characters). */
export const API_MAX_INPUT_LENGTH = 500;

/**
 * Pre-process volunteer input before passing to the fallback engine.
 *
 * Steps:
 * 1. Clamp length to `API_MAX_INPUT_LENGTH`.
 * 2. Trim whitespace.
 *
 * If the clamped input is empty, return null so the caller can return
 * an appropriate 400 response.
 *
 * @param rawInput - Raw string from the volunteer (may include newlines, etc.).
 * @param language - Preferred language.
 * @returns Pre-processed `IncidentInput` or `null` if input is empty after sanitization.
 */
export function preprocessApiInput(
  rawInput: string,
  language: IncidentInput['language'] = 'en',
): IncidentInput | null {
  const clamped = clampLength(rawInput ?? '', API_MAX_INPUT_LENGTH).trim();
  if (clamped.length === 0) return null;
  return { description: clamped, language };
}

/**
 * Build a fallback copilot response for the API route.
 * Acts as the route handler's primary pure function — same input always
 * produces the same structured `CopilotResponse`.
 *
 * @param input - Pre-processed incident input.
 * @returns A full `CopilotResponse` with `isFallback: true`.
 */
export function buildApiFallback(input: IncidentInput): CopilotResponse {
  return buildDomainFallback(input);
}

/**
 * Re-export the domain fallback for callers that prefer a flat import path.
 */
export { buildFallbackResponse as buildFallbackResponse } from '../domain/build-fallback-response';