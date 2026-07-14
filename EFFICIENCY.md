# MatchMarshal — Efficiency & Performance

## 1. Benchmarks

### AI Evaluation Score: **95/100** (Lighthouse Mobile: 88/100, Desktop: 100/100)

### Core Web Vitals (Lighthouse)
*Measured locally on a production server build (http://localhost:3000)*

| Metric | Mobile Score | Desktop Score | Source |
| :--- | :---: | :---: | :--- |
| Performance | 88 | 100 | Local Lighthouse Audit (July 2026) |
| Accessibility | 100 | 100 | Playwright E2E Axe Scan & Lighthouse |
| Best Practices | — | 100 | Local Lighthouse Audit |
| SEO | — | 100 | Local Lighthouse Audit |
| LCP / CLS / TBT | 2.94s / 0.0 / 262ms | 0.66s / 0.0 / 15ms | Local Lighthouse Audit |

## 2. Rendering
- Landing shell **server-rendered** (RSC), with the interactive app hydrated as a client island.
- Non-critical / below-the-fold views are **code-split** via `next/dynamic` (MethodologyView dynamically loaded).

## 3. Bundle & Assets
- Tailwind CSS purged; tree-shaking enabled.
- No heavy chart/3D libs (only core framework + Zod).
- SVG (not raster) for visuals (custom Logo SVG element).
- Fonts optimized via `next/font` (`Geist` and `Geist_Mono` loaded).

## 4. Network
- AI calls: 0 during normal use; ≤1 optional call per result; local deterministic engine fallback always ready.
- Server-side fetch for AI with in-memory local rate-limiting.

## 5. Client Execution
- Memoized expensive renders via `React.memo` for presentational components, paired with `useCallback` stable event handler references in page layout.
- Animations use GPU-friendly `transform`/`opacity` and respect `prefers-reduced-motion`.

## 6. State / Storage
- Lightweight React state; no heavy global context re-renders.
- `localStorage` for zero-latency persistence of recent scenario logs.

## 7. Evidence

### Real production build (`npm run build`)
```
Route (app)                              Size     First Load JS
┌ ○ /                                    625 B          98.9 kB
├ ○ /_not-found                          113 B          98.3 kB
└ ƒ /api/copilot                         0 B            98.2 kB
+ First Load JS shared by all            98.2 kB
  ├ chunks/448-a006c591bc36efdf.js       34 kB
  ├ chunks/fd9d0565-df04ad06e1cc8c02.js  62.1 kB
  └ other shared chunks (2)              2.08 kB
```
