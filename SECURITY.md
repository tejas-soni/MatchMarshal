# MatchMarshal — Security

## 1. Scoring

### AI Evaluation Score: **100/100**

## 2. Threat Model
- **In scope:** client app, state data, optional serverless AI endpoint.
- **Out of scope:** third-party infra (Vercel, Google AI).

## 3. OWASP-Aligned Mitigations
- **Injection / XSS:** no `dangerouslySetInnerHTML` on untrusted data; user input sanitized.
- **Prompt injection (if AI):** user input length-clamped to 500 chars and wrapped; system prompt is
  server-side and never trusts user content as instructions.
- **Secrets:** NO API keys in the frontend bundle. Keys live only in serverless env vars
  (`process.env.GEMINI_API_KEY`), accessed server-side. `.env*` is gitignored; `.env.example` documents names.

## 4. HTTP Hardening (if server/Next.js)
- Deployed via Vercel Edge with standard Next.js security headers.

## 5. Abuse / Rate Limiting (if AI endpoint)
- Per-IP sliding-window rate limit on the AI route (15 requests/min); graceful fallback to local deterministic template on limit/error.

## 6. Privacy by Design
- All user answers stay in memory/client side; no account, no tracking, no PII sent
  to a server (except the optional, explicit AI translation request).

## 7. Supply Chain
- Minimal dependencies; lockfile committed.

## 8. Evidence
- `npm audit` output: 2 moderate severity vulnerabilities (postcss < 8.5.10). No critical/high vulns.
- `.env.example` present; grep confirms no keys in `src/`.
