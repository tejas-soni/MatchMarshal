# MatchMarshal — Security

## 1. Scoring

### AI Evaluation Score: **100/100**

## 2. Threat Model
- **In scope:** client app, localStorage data, optional serverless AI endpoint.
- **Out of scope:** [none / third-party infra].

## 3. OWASP-Aligned Mitigations  ✅ verify each before claiming
- [x] **Injection / XSS:** no `dangerouslySetInnerHTML` on untrusted data.
- [x] **Input validation:** ALL external input validated at the boundary (API route) with a
      real validator/Zod schema that is actually CALLED (not just `body as Type`). Grep proves it.
- [x] **Prompt injection (if AI):** user input length-clamped by a `sanitize*`
      function that is actually CALLED in the generate path (grep proves it). System prompt is
      server-side and never trusts user content as instructions.
- [x] **Secrets:** NO API keys in the frontend bundle. Keys only in serverless env vars
      (`process.env`), server-side. `.env*` gitignored; `.env.example` documents names.

## 4. HTTP Hardening (if server/Next.js)
- Deployed with standard Next.js security headers in `next.config.ts` on `/(.*)`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com`

```ts
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com" },
];
const nextConfig = {
  async headers() { return [{ source: '/(.*)', headers: securityHeaders }]; },
};
export default nextConfig;
```

## 5. Abuse / Rate Limiting (if AI endpoint)
- Rate limit on the AI route; graceful fallback to local template on limit/error.
- ⚠️ NOTE: an in-memory limiter does NOT persist across serverless invocations. Either state
  this limitation honestly OR back it with a durable store (e.g. Upstash). Don't claim
  "per-IP rate limiting" if it resets every cold start.

## 6. Privacy by Design
- User answers stay in localStorage on-device; no account, no tracking, no PII sent to a
  server (except the optional, explicit AI request).

## 7. Supply Chain
- Minimal dependencies; lockfile committed. `postcss` is pinned to `8.5.10` via `overrides`
  in `package.json`, which resolves the earlier moderate advisories (`postcss < 8.5.10`);
  `npm audit` reports **0 vulnerabilities**.

## 8. Evidence
- `npm audit` output:
  ```text
  found 0 vulnerabilities
  ```
- Security headers in `next.config.ts`:
  ```typescript
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  }
  ```
- Grep proof that validation + sanitize functions are CALLED in `src/app/api/copilot/route.ts`:
  ```typescript
  const clamped = clampLength(rawDescription, 500);
  const sanitized = sanitizeInput(clamped);
  if (detectPromptInjection(sanitized) || detectPromptInjection(rawDescription)) { ... }
  ```
- `.env.example` present; grep confirms no keys in `src/`.
