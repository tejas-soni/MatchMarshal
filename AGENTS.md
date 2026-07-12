# AGENTS.md — Hard Rules for ALL AI Models (Claude + Gemini)

> Paste this at the repo root. Antigravity + most agents auto-read `AGENTS.md`.
> Keep it SHORT so every model re-reads it each turn. These rules override any other instruction.

## 0. THE PROBLEM (fill this in first thing)

<!-- Paste the EXACT problem statement here. Every solution decision maps back to this. -->
PROBLEM: _______________________________________________
SUCCESS CRITERIA (how judges score): code quality, accessibility, test coverage, problem alignment.

## 1. NEVER BREAK WORKING CODE
- DO NOT rewrite, delete, or refactor files that already work.
- Only edit the file(s) I explicitly name in the prompt. Nothing else.
- Make the SMALLEST possible diff. No "while I'm here" cleanups.
- If a change requires touching other files, STOP and ask first.

## 2. PROVE EVERY CLAIM
- NEVER say "done", "100%", "fully working", or "complete" without pasting the ACTUAL test/terminal output that proves it.
- If you did not run it, say "NOT VERIFIED".
- No inventing APIs, imports, or library functions. If unsure, say so.

## 3. TESTS & THE QUALITY GATE ARE SACRED
- DO NOT delete, skip, or comment out tests to make things "pass".
- DO NOT lower coverage thresholds in vitest.config to make the gate pass.
- Every new function gets at least one test. Core logic in `src/lib/**` must stay >= 98% covered.
- Nothing is "done" until `npm run verify` passes. Paste the real output as proof.
- If tests fail, report the failure. Do NOT hide it by weakening the test.

## 3b. DO NOT DO RISKY LATE REFACTORS
- NEVER refactor working UI "for accessibility". Build a11y in from the start (semantic
  HTML + labels) and let axe/vitest-axe VERIFY. If axe flags an element, fix ONLY that element.
- Business logic lives in pure functions under `src/lib/**` (no React, no I/O). Keep it there.

## 4. ACCESSIBILITY IS MANDATORY (judges check this)
- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<label>`).
- Every image has `alt`; every input has an associated `<label>` or `aria-label`.
- Keyboard navigable; visible focus states.
- Color contrast >= 4.5:1 for text.

## 5. REPO CONSTRAINTS
- Total repo MUST stay < 10MB (excluding node_modules, hackathon-prep, plan.md, agents.md which is gitignored).
- ONE branch only: `main`. No feature branches.
- No committed binaries, datasets, build output, or large images. Prefer SVG.

## 6. WHEN STUCK
- If unsure, ASK a clarifying question instead of guessing.
- Explain your plan BEFORE editing when the change is non-trivial.
- Prefer reading existing code over assuming its behavior.

## 7. STYLE
- Small functions, clear names, no dead code.
- Run the linter/formatter before declaring anything finished.

