import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ai/rate-limit';
import { buildIncidentPrompt, parseIncidentResponse } from '@/lib/ai/prompt';
import { buildFallbackResponse } from '@/lib/domain/build-fallback-response';
import { clampLength, detectPromptInjection, sanitizeInput } from '@/lib/ai/safety';
import { recommendActions } from '@/lib/domain/recommend-actions';
import { buildEscalation } from '@/lib/domain/build-escalation';
import type { IncidentCategory, SeverityLevel } from '@/lib/types';

const requestSchema = z.object({
  description: z.string(),
  language: z.enum(['en', 'es', 'fr', 'ar', 'pt', 'hi']),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Parse body and validate structure
    const body = await req.json();
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const { description: rawDescription, language } = result.data;

    // 2. Clamp input length and sanitize
    const clamped = clampLength(rawDescription, 500);
    const sanitized = sanitizeInput(clamped);

    // 3. Safety Guard: Detect Prompt Injection
    if (detectPromptInjection(sanitized) || detectPromptInjection(rawDescription)) {
      return NextResponse.json(
        { error: 'System guard: Potential prompt injection detected. Request rejected.' },
        { status: 400 }
      );
    }

    // 4. Rate Limiting (Server-side, max 15 requests per minute per IP)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 60_000, 15);
    if (!rateLimit.allowed) {
      const fallbackRes = buildFallbackResponse({ description: sanitized, language });
      return NextResponse.json(fallbackRes, { status: 429 });
    }

    // 5. Check API key presence
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fall back immediately if key is not configured
      const fallbackRes = buildFallbackResponse({ description: sanitized, language });
      return NextResponse.json(fallbackRes);
    }

    // 6. Call Gemini 3.1 Flash-Lite API
    const prompt = buildIncidentPrompt(sanitized, language);
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      // Fall back if external API fails
      const fallbackRes = buildFallbackResponse({ description: sanitized, language });
      return NextResponse.json(fallbackRes);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof generatedText === 'string') {
      const parsedRes = parseIncidentResponse(generatedText);
      if (parsedRes) {
        // Return successful Gemini response mapped to CopilotResponse structure
        const category = parsedRes.category as IncidentCategory;
        const severity = {
          score: parsedRes.severity.score,
          level: parsedRes.severity.level as SeverityLevel,
        };
        const phrase = parsedRes.phrases[language] || parsedRes.phrases['en'] || '';

        const fullResponse = {
          category,
          severity,
          actions: recommendActions(category, severity),
          escalation: buildEscalation(category, severity),
          multilingualPhrase: phrase,
          isFallback: false,
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(fullResponse);
      }
    }

    // Fallback if model output is not matching expected schema
    const fallbackRes = buildFallbackResponse({ description: sanitized, language });
    return NextResponse.json(fallbackRes);
  } catch (err) {
    console.error('API route error:', err);
    // Catch-all fallback for network failures, parsing issues, etc.
    const fallbackRes = buildFallbackResponse({ description: 'error', language: 'en' });
    return NextResponse.json(fallbackRes);
  }
}
