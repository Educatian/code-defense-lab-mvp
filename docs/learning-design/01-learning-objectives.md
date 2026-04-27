# Learning Objectives — Code Defense Lab

This document is **internal**. Students never see this taxonomy in the UI; the UI uses plain verbs (Submit / Explain / Predict / Adapt / Fix / Reflect) — see `src/journey/journey.js`.

The matrix below maps each checkpoint to:

- **Bloom's Revised Taxonomy** (Remember | Understand | Apply | Analyze | Evaluate | Create) — the *highest* level the assessment evidence actually supports, not the level the marketing copy claims.
- **SOLO Taxonomy** (Prestructural | Unistructural | Multistructural | Relational | Extended Abstract).
- **Webb's Depth of Knowledge** (DOK 1 Recall | DOK 2 Skill/Concept | DOK 3 Strategic Thinking | DOK 4 Extended Thinking).
- The **assessment evidence** the checkpoint actually collects.
- The **validity gap** between stated and evidenced LO. Be honest about this — over-claiming is the #1 failure mode in AI-era assessment.

## Per-checkpoint matrix

| # | Checkpoint (UI label) | Stated LO | Bloom (revised) | SOLO | Webb's DOK | Evidence collected | Validity gap |
|---|---|---|---|---|---|---|---|
| 1 | **Submit** (was: Submission / Provenance Check) | Commit the code version the learner will defend; disclose how it was produced. | Apply | Multistructural | DOK 2 | Code paste + Run output (WebR) + provenance radio + 3 free-text reflection notes. | Disclosure ≠ understanding. A learner can disclose AI use *and* understand nothing. The Run button now collects execution evidence — this strengthens the LO from "claim" to "claim + works". |
| 2 | **Explain** (was: Hotspot) | Explain the high-leverage code lines that control the outcome. | Analyze (causal) | Relational | DOK 3 | 3 short-answer responses on intent / boundary / edge case for the highlighted lines. | No worked-example anchors → learners do not know the expected depth. No automated rubric → all judgement is downstream. **Mitigation:** future hint-ladder + sample answer toggles. |
| 3 | **Predict** (was: Trace) | Mentally simulate execution on a small input before running. | Analyze (procedural) | Relational → Extended Abstract | DOK 3–4 | 3 prediction inputs (state delta, structure contents, return value). | The fallback HTML shows orphan Python — but at runtime `renderTraceMode()` swaps it for the assignment's actual `sourceCode`. Visual coherence is preserved via JS, fragile if JS fails. **Mitigation:** SSR fallback should mirror the active language. |
| 4 | **Adapt** (was: Mutation) | Modify the code to handle a changed contract while preserving the original reasoning model. | Analyze + Evaluate | Relational | DOK 3 | Free-text plan + executable scratchpad with Run + plot capture. | Scratchpad seed is a templated mutation, not the learner's *own* code. So we evidence "can fix this template" not "can apply the fix to your own code". **Mitigation:** seed scratchpad with `assignment.draftCode` + the constraint, not the canned mutation. |
| 5 | **Fix** (was: Repair) | Diagnose the bug in a broken variant and apply the smallest correct fix. | Analyze + Evaluate | Relational | DOK 3–4 | Free-text plan + editable scratchpad + Reset Draft + Run with hidden-test framing. | Same templated-code issue as Adapt. Fix is correctly *minimal*-oriented in copy but no automated minimality check. |
| 6 | **Reflect** (was: Result) | Read the consistency report; recognize where claimed understanding diverged from demonstrated understanding. | Evaluate (meta) | Extended Abstract | DOK 4 | Computed consistency score + diagnostic message + per-stage breakdown. | Reactive (shows what happened) but not yet prescriptive (what to do). Recommends oral defense without scheduling affordance. |

## Pipeline meta-objective

**Stated:** "Deep understanding of authored code — assessed across explanation, prediction, adaptation, repair, and reflection."

**Actually measured (today):** Procedural fluency on a *defense scaffold* — coherent prose about isolated code landmarks + ability to adapt and fix templated variants + tolerance for inconsistency feedback. With WebR running, the Submission checkpoint now also evidences "can produce visible output" — a real upgrade.

**Construct-validity verdict:** The pipeline measures *something narrower* than its claim. A high-scoring learner can be (a) a strong explainer who has internalized the code, OR (b) a strong explainer who has not but rehearses well. The validity gap closes as we (1) seed Adapt/Fix scratchpads with the learner's *own* code, (2) add hidden-test execution to Fix, (3) cross-check explanation-prose against runtime behavior, and (4) keep oral defense as the final tiebreaker for borderline LOW results.

## Why plain-language UI labels matter

Students do not need (and must not be slowed by) Bloom / SOLO / DOK terminology. The UI has been simplified to:

| Internal key | Student sees (label) | Helper text |
|---|---|---|
| `submission` | **Submit** | Paste the code you want to defend |
| `hotspot`    | **Explain** | Explain the lines that matter most |
| `trace`      | **Predict** | Predict what the code will do |
| `mutation`   | **Adapt** | Change the code for a new situation |
| `repair`     | **Fix** | Diagnose and repair a broken version |
| `result`     | **Reflect** | See where understanding lined up |

These labels live in **one place** (`src/journey/journey.js`) so re-naming is a single-file change. The `JOURNEY` array is the single source of truth — the journey strip on every page and the meta-doc here both pull from it.

## Re-evaluation checklist (next cycle)

Run this checklist whenever the assignment design or checkpoint copy changes:

1. Does each checkpoint's *evidence* still support the *Bloom level* claimed?
2. Does the journey strip's plain label still describe the cognitive action accurately?
3. Is the gap between stated LO and evidenced LO small enough for the use case (graded assessment vs. formative practice)?
4. Are higher-DOK checkpoints (Predict, Fix) still grounded in the learner's own code, or have they drifted back to templates?
5. Does the Reflect page give a *next action*, not just a score?
