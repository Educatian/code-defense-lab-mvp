# LXD Testing Cycle 01 — Code Defense Lab

Date: 2026-04-26.
Cycle: 1 of N.
Lens: WCAG 2.2 AA + Nielsen's 10 heuristics + Cognitive Load Theory (Sweller) + Learner Journey Mapping.

**Guiding principle (set by Dr. Moon during this session):** *"Don't go so deep that students can't understand the interface or interaction journey."* — Every change in this cycle is judged against that. Where the audit recommended adding more pedagogical scaffolding (e.g., worked examples, hint counters), we deferred items that would *add* surface complexity to a UI that already overwhelms first-time users.

---

## What was found

### Construct-validity issues (deferred — assignment-design conversation)
- **Adapt + Fix scratchpads** seed templated code, not the learner's own code. Tracked in `01-learning-objectives.md`.
- **Result page** is reactive, not prescriptive. No oral-defense scheduling affordance.

### Wayfinding (the user's stated #1 concern)
- The 6-checkpoint sidebar is hidden on mobile.
- Numeric "Step 1 of 5" / "20% Complete" tells you progress but not *what is next* or *what's done*.
- Official names like "Hotspot", "Mutation Task", "Provenance Check" are jargon to a CS-101 learner.

### Cognitive load — extraneous (theater)
- **Mutation page "Technical Log"**: hardcoded `[14:02:11] INIT Sandbox ready / [14:02:15] WARN ... / [14:02:18] FAIL test_null_input`. Static fiction. Read aloud verbatim by screen readers. Adds load with zero learning value.
- **Pulsing red dot** on Repair: motion that adds no information after first read.

### A11y — Critical / Serious (selected)
- No `<main>` landmark, no `aria-label` on sidebars.
- Run output appears silently for screen-reader users (no live region).
- Run button label does not change when disabled.
- Code blocks render line numbers as DOM text (read aloud as content).
- Question prose lives outside `<label>` so AT users hear "Q1. State Delta" without the actual question.
- Missing `prefers-reduced-motion` handling for animate-pulse.

---

## What changed in this cycle

### Wayfinding (P0)

- **`src/journey/journey.js` + `journey.css` — single shared "journey strip"** auto-mounted on all 6 student checkpoint pages via `<div id="cdl-journey-mount">`. Plain verbs only:
  - Submit → Explain → Predict → Adapt → Fix → Reflect
  - Each stop shows a 1-line helper ("Explain the lines that matter most"), a stable number, and visual state (active / done / not started).
  - `aria-current="step"` on the active stop; SR-only "Step X of 6, in progress / done / not started".
  - Compacts on small screens (helper text hides under 720px) — never disappears entirely.
- **Plain-language jargon mapping** lives in one place (`JOURNEY` array). Renaming any stage now touches one file.

### Removed cognitive theater

- **Mutation page Technical Log** deleted. Replaced with a 4-step "How this checkpoint works" card (verb-first instructions: read → edit → Run → note).
- The new card uses real `<kbd>` for `Run` and `Ctrl+Enter` so the keyboard shortcut is *discoverable* (audit P2-19 fix).

### A11y wins

- **Skip-link** ("Skip to main content") on every checkpoint page; visible on focus, hidden otherwise (`cdl-sr-only` utility).
- **Runtime UI (`src/runtime/ui.js`):**
  - Outer wrapper is now a `<section aria-label="Code runner">` instead of a bare div.
  - Console pre is `role="log" aria-live="polite"` so new lines are announced.
  - Status span is `aria-live="polite" aria-atomic="true"` and now narrates plain-language messages: *"Booting runtime — first run can take 10–30 seconds. Later runs are fast."* / *"Done in 1.2s."* / *"Did not finish. <first error line>."*
  - Run button has `aria-label="Run code (shortcut: Ctrl plus Enter)"` and `aria-keyshortcuts="Control+Enter"`. Label flips to *"Code is running, please wait."* while disabled.
  - Empty-code Run is now soft-blocked with a status hint instead of a silent timeout.
  - First-run vs subsequent-run status messages differ ("Booting…" only the first time).
  - `:focus-visible` outline on Run / Clear so keyboard users see the focus ring even where Tailwind reset removed it.
- **Reduced motion**: `prefers-reduced-motion` rules in both `runner.css` and `journey.css` (the latter also forces `.animate-pulse { animation: none }` globally).
- **Mutation aside** got `aria-label="Adaptation task tools"`.

---

## What was deliberately deferred

To honor the *don't make it deeper* constraint, the audit's other recommendations were triaged:

| Audit item | Why deferred |
|---|---|
| Per-checkpoint "Sample Answer" toggles | Adds surface; better as an opt-in tooltip later — current scaffold is already information-dense. |
| Tab/accordion split of Submission into 3 sections | High-impact UX restructure — needs Dr. Moon's design review before re-cutting that page. |
| Wire Adapt/Fix scratchpad to learner's own code | Construct-validity fix; pedagogical decision, not a bug. |
| Result-page rewrite (hide empty sections, add next-action) | Whole-page redesign; outside this cycle's surface-area limit. |
| Replace `text-on-surface-variant` for borderline contrast | Low-priority; would need a brand-color sweep. |
| Replace line-number `<span>` with CSS counters | Real fix but invasive across 5 pages; queue for cycle 2. |
| Convert avatars / decorative dots to `aria-hidden` | Cosmetic; queue for cycle 2 with a single sweep. |

---

## Verification

- `npm run build` — ✅ 334ms, all 14 entry HTMLs emitted.
- All 6 student pages serve 200 with `cdl-journey-mount` div present, `Skip to main content` link present, `journey.css` linked.
- Mutation page no longer contains "Technical Log"; contains "How this checkpoint works".
- Lazy chunks `webrAdapter`, `pyodideAdapter` still split correctly.

---

## Next cycle (when scheduled)

1. **Construct validity:** Wire Adapt + Fix scratchpads to seed from the learner's actual `draftCode` rather than templated `mutationCode` / `repairCode`.
2. **Predict checkpoint:** SSR fallback HTML must mirror the assignment language (the JS swaps it correctly, but the no-JS view shows orphan Python).
3. **Result page:** Hide empty sections; add a single explicit *next action* with a schedule-defense link.
4. **Code blocks:** Replace inline line-number spans with CSS `counter()` so AT users hear code, not numerals.
5. **Form labelling:** Wrap each checkpoint question prose inside its `<label>` (or use `<fieldset><legend>`), so SR users hear the full question with the field.
6. **Brand-color sweep:** Lift `text-on-surface-variant` to `text-on-surface` for status text; aim for ≥ 7:1 contrast across status lines.
7. **Heuristic walk with a real student** (n=1 talk-aloud, 30-min). The instrumentation is in place; cycle 2 should test, not assume.
