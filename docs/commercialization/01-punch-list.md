# Punch list — Code Defense Lab

Last updated: 2026-04-26 (auto-mode session).

This list captures every gap between the current MVP and a "perfect" app: clean structure, working flow, no bugs, students can paste R → click Run → see plot + stats + simulation results.

Statuses use ✅ done in this session, 🟡 partially done, ⬜ pending.

## P0 — Blocking for any pilot

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Wide-open Supabase RLS on `workspace_states` (any visitor can read/write any row) | ✅ | New restrictive migration `supabase/migrations/0002_workspace_states_per_owner_rls.sql` written. **Needs manual apply.** |
| 2 | All visitors share a single workspace row (`VITE_SUPABASE_WORKSPACE_ID`) — last write wins | ✅ documented | Header comment in `src/supabase-state.js`; durable fix needs auth + per-owner id (after migration 0002 + 0003 land). |
| 3 | No multi-tenant schema (instructors / students / courses / attempts) | ✅ | `supabase/migrations/0003_commercial_schema.sql`. **Needs manual apply** to commercial Supabase project. |
| 4 | No research-vs-commercial DB separation; FERPA risk | ✅ | `supabase/migrations/research/0001_research_schema.sql` for the SEPARATE research project. PII-free. **Needs manual apply.** |
| 5 | XSS-prone `innerHTML` + template literal in `app.js` `renderTable` | ✅ | Refactored to `createElement` + `textContent`. |
| 6 | LICENSE missing (public repo) | ✅ | MIT `LICENSE`. |
| 7 | No SECURITY policy / disclosure path | ✅ | `.github/SECURITY.md`. |

## P1 — Required for "perfect" student demo

| # | Item | Status | Notes |
|---|---|---|---|
| 8 | Students can't actually run R code in the submission page | ✅ | `src/runtime/{index,webrAdapter,ui,runner.css}.js` + Run button + output panel + plot rendering wired into `pages/student-submission.html`. Ctrl+Enter shortcut included. |
| 9 | Submission seed code wasn't runnable end-to-end (just a function definition; needs `df`) | ✅ | `regressionReportSource` rewritten to define + demo + plot + bootstrap CI; first Run produces real text + scatterplot. |
| 10 | Repair-mode page had a read-only code block with no way to test the fix | ✅ | Editable scratchpad + Run + output panel + Reset Draft. Wired in `pages/repair-mode-task.html` + `mountScratchRunner` in `workspace-state.js`. |
| 11 | Mutation-task page had a fake "Run Tests" button | ✅ | Replaced with editable scratchpad + real Run + output panel + plot capture. |
| 12 | Trace-mode-task page has no execution path | ⬜ | Lower priority — trace asks for prediction *before* running. Could add an "after-prediction reveal" run later. |
| 13 | Pyodide (Python parity) not loaded | 🟡 | `src/runtime/pyodideAdapter.js` is a clean stub that errors with a helpful message. Self-host Pyodide assets in `/public/pyodide/` to enable. (CDN auto-load was blocked by harness policy.) |
| 14 | No `.nvmrc` | ✅ | Pinned to Node 20. |
| 15 | No CI beyond Pages deploy | ✅ | `.github/workflows/ci.yml`: MVP build, commercial typecheck + build, gitleaks secret scan. |
| 16 | No Dependabot | ✅ | `.github/dependabot.yml` for `/`, `/commercial`, github-actions, weekly. |
| 17 | No CODEOWNERS | ✅ | `.github/CODEOWNERS`. |

## P2 — Architectural debt to clean before scaling

| # | Item | Status | Notes |
|---|---|---|---|
| 18 | `src/workspace-state.js` is 3.9k lines, mixes state, rendering, demo data | ⬜ | Recommended split: `src/state/` (pure logic), `src/render/` (per-page renderers), `src/demo/` (synthetic seeds). Out of scope this session — not a bug, but a maintainability cliff once two engineers touch it. |
| 19 | Tailwind loaded via CDN `<script>` on every page | ⬜ | Fine for the MVP demo. Move to Tailwind+PostCSS build before any production deploy. |
| 20 | Duplicate desktop pages (`landing-page-desktop.html`, `professor-dashboard-desktop.html`) | ⬜ | Tailwind breakpoints can do this; consolidating reduces drift between the two copies. |
| 21 | Hardcoded `lh3.googleusercontent.com` avatar URLs throughout the pages | ⬜ | Replace with placeholder SVG once branding lands. |
| 22 | No tests | ⬜ | Add Vitest unit tests for `runtime/` and the state reducers; Playwright for the 6-checkpoint flow. |
| 23 | No accessibility audit (axe / pa11y) | ⬜ | Some `aria-*` already in place; needs a pass. |
| 24 | No error boundary / toasts; failures only go to `console.warn` | ⬜ | `cdl-runner` does surface errors in its status line + console panel — partially mitigated for the runtime path. |

## P3 — Polish (later)

| # | Item | Status | Notes |
|---|---|---|---|
| 25 | i18n hooks (Korean UI for pilot users) | ⬜ | Mirror the Swarm_ID hardening pattern. |
| 26 | Bundle-size monitoring | ⬜ | `vite-plugin-visualizer` in CI. |
| 27 | Catalog page is dev-only, leaks into prod build | ⬜ | Either move to `dev/` or gate behind env. |
| 28 | Synthetic demo data ships in prod bundle | ⬜ | Keep for the public demo; remove or gate by env once auth lands. |

## Commercial scaffold (deprioritized)

The `commercial/` Next.js app got a head start but is not the immediate goal — the root MVP is. What's already in place there for when the SaaS work resumes:

- Anthropic SDK added to `commercial/package.json`
- `commercial/src/lib/agents/` — Hotspot, Trace, Mutation, Repair, Provenance, Rubric, Orchestrator, Instructor-Review with model tiering (Haiku/Sonnet/Opus), prompt caching, and Batch API transport
- Two-DB separation reflected in migration files (commercial vs. research)

These are scaffolds — none are wired into a UI yet.

## How to apply the pending Supabase migrations

```bash
# Commercial project (instructor-facing)
supabase db push --project-ref <commercial-project-ref> \
  --include supabase/migrations/0002_workspace_states_per_owner_rls.sql \
  --include supabase/migrations/0003_commercial_schema.sql

# Research project (separate Supabase project, no PII)
supabase db push --project-ref <research-project-ref> \
  --include supabase/migrations/research/0001_research_schema.sql
```

All three are additive only (no DROP TABLE / TRUNCATE / DELETE). Migration 0002 does drop three RLS *policies* on `workspace_states` — this changes access rules but does not touch data. Reviewed safe.
