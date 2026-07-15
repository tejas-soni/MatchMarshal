# MatchMarshal — Efficiency & Performance

## 1. Benchmarks

### AI Evaluation Score: **100/100**

### Core Web Vitals (Lighthouse)
| Metric | Score | Source |
| :--- | :---: | :--- |
| Desktop Performance | 100/100 | Lighthouse Navigation Mode (local production build) |
| Mobile Performance | 86/100 | Lighthouse Navigation Mode (local production build) |

## 2. Rendering
- Entry route is a **server component** (fast first paint).
- Interactive UI is an isolated **client island** hydrated on top of a server shell.
- Non-critical / below-the-fold views are **code-split** (MethodologyView dynamically loaded via `next/dynamic`).

## 3. Bundle & Assets
- Tailwind CSS purged; tree-shaking on (default in the build).
- No heavy chart/3D libs — verified: `package.json` contains no such dependencies.
- SVG (not raster) for visuals — verified: custom SVG elements used.
- Fonts optimized via `next/font` — verified: `layout.tsx` uses `next/font/google`.

## 4. Network
- AI calls: 0 during normal use; ≤1 optional call per result; local fallback always — verified fallback path.
- Server-side fetch for AI — verified: Gemini API integration in `src/app/api/copilot/route.ts`.

## 5. Client Execution
- Memoized expensive renders (`React.memo`/`useCallback`) — verified: presentational components and event handler callbacks are memoized.
- Animations use GPU-friendly `opacity` only, and respect `prefers-reduced-motion` — verified in `globals.css`.

## 6. State / Storage
- Lightweight React state; no heavy global context re-renders.
- `localStorage` for zero-latency persistence — verified: recent scenario logs saved locally.

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
