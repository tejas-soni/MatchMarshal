// pre-submit-audit.mjs — CLAIMS-MATCH-CODE + REPO HYGIENE gate (zero deps, cross-platform).
// Run: node pre-submit-audit.mjs   (works identically on Windows / macOS / Linux)
//
// WHY THIS EXISTS: In a past event we scored 96.67 vs a winner's 98.20. The gap was NOT
// missing features — it was (1) rubric docs CLAIMING things the code didn't do (Zod, security
// headers, "input sanitized") and (2) security code that was built + tested but NEVER WIRED IN,
// plus junk files and a dead cron. This script blocks all of those, mechanically, before you
// submit. HARD findings fail the build (exit 1). SOFT findings are warnings to review.
//
// Golden rule it enforces: NEVER CLAIM WHAT YOU CAN'T GREP. Under-claim, over-deliver.

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, basename, sep } from 'node:path';

const ROOT = process.cwd();
const hard = [];
const soft = [];
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'hackathon-prep', '.vercel', 'playwright-report', 'test-results']);

const rel = (f) => relative(ROOT, f).split(sep).join('/');
const read = (f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } };

function walk(dir, out = []) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    let s; try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const allFiles = walk(ROOT);
const codeFiles = allFiles.filter((f) => /\.(ts|tsx)$/.test(f) && /(^|\/)src\//.test(rel(f)));
const nonTest = codeFiles.filter((f) => !/\.test\.|\.spec\./.test(rel(f)));
const nonTestBlob = nonTest.map(read).join('\n');

const nextCfg = ['next.config.ts', 'next.config.js', 'next.config.mjs'].map((x) => join(ROOT, x)).find(existsSync);
const hasMiddleware = existsSync(join(ROOT, 'middleware.ts')) || existsSync(join(ROOT, 'src', 'middleware.ts'));
const hasSecurityHeaders = (nextCfg && /headers\s*\(/.test(read(nextCfg))) || hasMiddleware;

let pkg = {};
try { pkg = JSON.parse(read(join(ROOT, 'package.json')) || '{}'); } catch { /* ignore */ }
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

// ── 1. Junk / stray files at repo root (the `next` + `varunasutra@0.1.0` mistake) ──────────
for (const name of (() => { try { return readdirSync(ROOT); } catch { return []; } })()) {
  if (name.startsWith('.')) continue;
  const p = join(ROOT, name);
  let s; try { s = statSync(p); } catch { continue; }
  if (!s.isFile()) continue;
  if (s.size === 0) hard.push(`Empty 0-byte file committed at root: "${name}" (delete it — likely a shell redirect artifact).`);
  if (/@\d+\.\d+\.\d+$/.test(name)) hard.push(`Junk file "${name}" looks like an accidental "pkg@version" redirect artifact — delete it.`);
  if (name === 'next') hard.push(`Stray file named "next" at root — almost always an accidental redirect. Delete it.`);
}

// ── 2. Ad-hoc scratch scripts / hardcoded localhost ────────────────────────────────────────
if (existsSync(join(ROOT, 'test.mjs'))) soft.push(`Root "test.mjs" looks like an ad-hoc scratch test — convert to a real *.test.ts or delete it.`);
for (const f of nonTest) {
  if (/https?:\/\/localhost/i.test(read(f))) soft.push(`Hardcoded localhost URL in ${rel(f)} — use a relative path or env var.`);
}

// ── 3. Leftover shortcut comments (the "in real world we'd..." tell) ───────────────────────
const bannedComment = /\b(TODO|FIXME|HACK|XXX)\b|in real world|will be upgraded|for now\b|assume body matches/i;
for (const f of nonTest) {
  const m = read(f).match(bannedComment);
  if (m) hard.push(`Shortcut/TODO comment in ${rel(f)} ("${m[0]}") — judges read this as acknowledged debt. Resolve it or remove the comment.`);
}

// ── 4. `any` types in non-test source ──────────────────────────────────────────────────────
for (const f of nonTest) {
  if (/:\s*any\b|\bas any\b|<any>/.test(read(f))) soft.push(`"any" type in ${rel(f)} — replace with a real type ("implicit any banned" is a common doc claim).`);
}

// ── 5. DEAD SECURITY CODE: validate*/sanitize* built + tested but never wired into app ──────
const defs = new Map();
for (const f of nonTest) {
  const re = /export\s+(?:async\s+)?function\s+((?:validate|sanitize)\w*)/g;
  let m; while ((m = re.exec(read(f)))) defs.set(m[1], f);
}
for (const [name, defFile] of defs) {
  const usedInApp = nonTest.some((f) => f !== defFile && new RegExp(`\\b${name}\\b`).test(read(f)));
  if (!usedInApp) hard.push(`Dead security code: "${name}" (in ${rel(defFile)}) is exported + (likely) tested but NEVER called in app code. Wire it into the request path (e.g. the API route) or delete it. A defense you don't call is a false claim.`);
}

// ── 6. Security headers must exist for a Next.js app ───────────────────────────────────────
if (nextCfg && !hasSecurityHeaders) {
  hard.push(`No security headers found. Add an async headers() block to ${basename(nextCfg)} (or a middleware.ts): Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, Permissions-Policy. Cheapest security points on the board.`);
}

// ── 7. vercel.json cron targets must map to a real API route (the dead-cron mistake) ───────
const vj = join(ROOT, 'vercel.json');
if (existsSync(vj)) {
  try {
    const j = JSON.parse(read(vj));
    for (const cron of j.crons || []) {
      const p = String(cron.path || '').replace(/^\//, '');
      const candidates = [
        join(ROOT, 'src', 'app', p, 'route.ts'), join(ROOT, 'src', 'app', p, 'route.tsx'),
        join(ROOT, 'app', p, 'route.ts'), join(ROOT, 'app', p, 'route.tsx'),
      ];
      if (!candidates.some(existsSync)) hard.push(`vercel.json cron points to "${cron.path}" but no matching API route exists — it will 404 daily. Create the route or remove the cron.`);
    }
  } catch { soft.push(`vercel.json is not valid JSON.`); }
}

// ── 8. CLAIMS-MATCH-CODE: rubric docs must not claim what the code doesn't do ───────────────
const docNames = ['SECURITY.md', 'CODE_QUALITY.md', 'TESTING.md', 'EFFICIENCY.md', 'ACCESSIBILITY.md', 'README.md'];
for (const dn of docNames) {
  const dp = join(ROOT, dn);
  if (!existsSync(dp)) continue;
  const t = read(dp);
  if (/\bzod\b/i.test(t) && !deps.zod) hard.push(`${dn} claims "Zod" but "zod" is NOT in package.json. Install it or stop claiming it.`);
  if (/middleware/i.test(t) && !hasMiddleware) soft.push(`${dn} mentions "middleware" but no middleware.ts exists — verify the claim.`);
  if (/security header/i.test(t) && !hasSecurityHeaders) hard.push(`${dn} claims "security headers" but none are configured in code.`);
  if (/sanitiz/i.test(t) && !/sanitiz/i.test(nonTestBlob)) hard.push(`${dn} claims input is "sanitized" but no sanitize code is used in app source.`);
  if (/rate.?limit/i.test(t) && !/rate.?limit/i.test(nonTestBlob)) hard.push(`${dn} claims "rate limiting" but no rate-limit code found in app source.`);
  if (/npm audit.*(clean|0 vuln)|(clean|0 vuln).*npm audit/i.test(t)) soft.push(`${dn} claims "npm audit clean" — RUN "npm audit" now and confirm 0 vulnerabilities before submitting.`);
  if (/error bound/i.test(t) && !/ErrorBoundary|error-boundary/i.test(nonTestBlob)) soft.push(`${dn} claims "Error Boundaries" but none found — add one or remove the claim.`);
}

// ── Report ─────────────────────────────────────────────────────────────────────────────────
const line = '─'.repeat(72);
console.log(`\n${line}\n PRE-SUBMIT AUDIT — claims-match-code + repo hygiene\n${line}`);
if (!hard.length && !soft.length) {
  console.log(' ✅ CLEAN — no hygiene or claim-mismatch issues found.');
} else {
  if (hard.length) { console.log(`\n ❌ HARD (${hard.length}) — MUST fix before submitting:`); hard.forEach((h, i) => console.log(`   ${i + 1}. ${h}`)); }
  if (soft.length) { console.log(`\n ⚠️  SOFT (${soft.length}) — review each:`); soft.forEach((s, i) => console.log(`   ${i + 1}. ${s}`)); }
}
console.log(line + '\n');

if (hard.length) {
  console.log(`FAILED: ${hard.length} hard issue(s). Fix them (or paste this output to the AI and say "fix ONLY these, minimal diff, then re-run node pre-submit-audit.mjs").\n`);
  process.exit(1);
}

