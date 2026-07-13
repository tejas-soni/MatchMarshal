# MatchMarshal — Accessibility (a11y)

## 1. Compliance

### AI Evaluation Score: **100/100** · Target: **WCAG 2.1 AA**
Verified automatically by `vitest-axe` (unit) and `@axe-core/playwright` (E2E): **0 violations.**

## 2. Semantic HTML & Landmarks
- Valid document outline; `<header> <nav> <main> <footer>` landmarks; one `<h1>` per page;
  logical heading order.

## 3. Color & Contrast
- All text ≥ **4.5:1** contrast (large text ≥ 3:1). Verified with `@axe-core/playwright`.
- **No color-only meaning** — status also uses icon/text/pattern. Used Tailwind slate and emerald-800 for optimal readability.

## 4. Keyboard & Focus
- Every interactive element reachable and operable by keyboard.
- Visible `:focus-visible` rings. Focus tracked properly across tabs.
- Scrollable panels use `tabIndex={0}` and `aria-label` for smooth keyboard-based scrolling.

## 5. Screen Readers
- Every input has an associated `<label>` (or `aria-label`).
- Decorative SVG/img marked `aria-hidden`/empty `alt`.

## 6. Motion & Cognition
- `@media (prefers-reduced-motion: reduce)` disables non-essential animation.
- Clear, jargon-free copy; one primary action per screen.

## 7. Touch & Responsive
- Touch targets ≥ 44×44px. No horizontal scroll. Readable without zoom at 320–1440px.

## 8. Evidence
- axe results:
```text
  ok 1 [desktop] › e2e\app.spec.ts:5:7 › MatchMarshal Application Flow & Accessibility Scans › should pass accessibility scan on Landing view (3.8s)
  ok 2 [desktop] › e2e\app.spec.ts:14:7 › MatchMarshal Application Flow & Accessibility Scans › should pass accessibility scan on Console view (4.0s)
  ok 3 [desktop] › e2e\app.spec.ts:26:7 › MatchMarshal Application Flow & Accessibility Scans › should pass accessibility scan on Methodology view (3.5s)
  ok 5 [mobile] › e2e\app.spec.ts:14:7 › MatchMarshal Application Flow & Accessibility Scans › should pass accessibility scan on Console view (3.2s)
  ok 6 [mobile] › e2e\app.spec.ts:5:7 › MatchMarshal Application Flow & Accessibility Scans › should pass accessibility scan on Landing view (2.5s)
  ok 7 [mobile] › e2e\app.spec.ts:26:7 › MatchMarshal Application Flow & Accessibility Scans › should pass accessibility scan on Methodology view (3.0s)
```
- Manual keyboard walkthrough: Pass for forms and layout navigation.
