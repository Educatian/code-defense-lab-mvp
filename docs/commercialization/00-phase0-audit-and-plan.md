# Code Defense Lab — Commercialization Plan (Phase 0)

Drafted 2026-04-26. Owner: Dr. Jewoong Moon.

## Product positioning (decided)

- **Buyer**: individual instructors (B2C, Stripe per-seat). Not LMS-first, not institution-first.
- **Agent timing**: post-assessment only. Student finishes 6 checkpoints → submission goes to async queue → agents grade and synthesize → result delivered within minutes.
- **Languages**: Python 3.11 and R 4.3, both required.
- **Sandbox**: WebR + Pyodide (client-side WASM). Zero per-student execution cost; code never leaves the browser.
- **Research pipeline**: opt-in only, anonymized, separate Postgres database from commercial PII. IRB consent flow gates ingestion.

## Audit summary

| Area | Current state | Commercial verdict |
|---|---|---|
| Stack | Vite + Vanilla JS, multi-page HTML, Tailwind CDN | Rewrite into Next.js + TS + Tailwind. Reuse visual design + flow + content. |
| State | Single localStorage blob, 185KB workspace-state.js with global side effects | Replace with Postgres + Supabase Auth + RLS |
| DB | Supabase `workspace_states` (single jsonb row, open RLS) | Replace with relational schema (commercial) + separate research DB |
| Sandbox | None — code is never executed | Add WebR + Pyodide in browser |
| Auth | None | Supabase Auth (email + Google + GitHub for instructor, anonymous-link or email for student) |
| Grading | Computed on the fly from text-length heuristics + seeded pseudo-random | Replace with agent-based grading; persist results immutably |
| Synthetic data | `createSyntheticResponses`, fake student pool, seeded scores | Delete. Demo mode only via instructor preview button. |
| Tests | None | Add Vitest + Playwright for critical flows (submit → agent → result) |

## Reusable assets

- **Visual design**: Material tone, Space Grotesk + Inter + JetBrains Mono, Tailwind tokens defined in `pages/student-submission.html` lines 14–37
- **Information architecture**: 6-step flow + page meta in `src/shell.js` lines 54–145
- **Page copy & rubric language**: keep tone of "evidence of understanding, not anti-AI policing"
- **Seed assignment content**: 4 Python/R exercises (source + mutation + repair triplets) embedded in `src/workspace-state.js` lines 61–385

## Stack decisions

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | Multi-page IA maps cleanly to file-based routing; RSC for instructor dashboards; SSG for marketing |
| Styling | Tailwind v4 + shadcn/ui (selective) | Continuity with current Tailwind palette; component primitives without lock-in |
| Auth | Supabase Auth | Already in repo; magic link + OAuth; integrates with RLS |
| DB (commercial) | Supabase Postgres | Native RLS for tenant isolation; pg_audit for FERPA logs |
| DB (research) | Separate Supabase project | Hard isolation between PII and research store; different IRB scope |
| Code execution | WebR + Pyodide (browser) | $0 marginal cost, R required, code never leaves device |
| Agent runtime | Anthropic Batch API via Supabase Edge Functions | 50% discount, post-assessment SLA tolerates 24h ceiling, easy worker fan-out |
| Models | Haiku 4.5 (Provenance), Sonnet 4.6 (Hotspot/Trace/Mutation/Repair), Opus 4.7 (Rubric synthesis) | Tiered cost; structured outputs everywhere |
| Billing | Stripe (per-instructor seat, monthly) | Standard B2C SaaS, low friction |
| Observability | Supabase logs + a per-agent cost/latency table | No new infra; instructor-visible cost gates |

## Commercial schema sketch

All tables under `commercial` schema. RLS keyed on `instructor_id`.

```sql
-- identity
instructors          (id uuid pk, email, stripe_customer_id, created_at, plan)
students             (id uuid pk, instructor_id fk, display_name, email_optional, consent_research bool, created_at)

-- content
courses              (id uuid pk, instructor_id fk, title, term, archived_at)
assignments          (id uuid pk, course_id fk, language enum('python','r'), title, prompt, due_at,
                      hotspot_focus, trace_scenario, mutation_prompt, repair_prompt,
                      starter_code, reference_code, mutation_code, repair_code, hidden_tests,
                      modules jsonb,  -- { hotspot, trace, mutation, repair: bool }
                      published_at)

-- attempts (one per student-assignment pair; immutable history via attempts_events)
attempts             (id uuid pk, assignment_id fk, student_id fk, started_at, submitted_at, status)
attempt_responses    (attempt_id fk, group enum, field text, value text, updated_at)
                     -- group: provenance | verification | dataReasoning | hotspot | trace | mutation | repair
attempt_executions   (id uuid pk, attempt_id fk, kind enum('trace','mutation','repair'),
                      student_input text, runtime_output text, expected_output text, passed bool, executed_at)

-- agent results (immutable, one row per agent run)
agent_runs           (id uuid pk, attempt_id fk, agent enum, model text, input_tokens, output_tokens,
                      cost_usd numeric, latency_ms, batch_id text, created_at, completed_at, status)
agent_findings       (agent_run_id fk, kind text, payload jsonb)  -- structured output per agent

-- final rubric (one per attempt; produced by Rubric Agent)
results              (attempt_id pk fk, correctness, hotspot, trace, mutation, repair,
                      consistency, level enum('HIGH','MEDIUM','LOW'),
                      rubric_narrative text, produced_by_agent_run_id fk, finalized_at)

-- instructor review
review_records       (attempt_id pk fk, viva_notes jsonb, instructor_summary text, status enum, updated_at)

-- audit (FERPA)
audit_log            (id bigserial pk, actor_id, actor_kind enum, action, target_table, target_id, payload jsonb, at)
```

RLS: instructors see only their own rows. Students see only their own attempts (when authenticated). Append-only on `audit_log`, `agent_runs`, `agent_findings`.

## Research schema sketch

Separate Supabase project. No PII. Ingestion gated on `students.consent_research = true` via nightly anonymization job.

```sql
research.cohorts                 (id, label, opened_at, closed_at, irb_protocol_id)
research.anonymous_learners      (id uuid pk, cohort_id fk, hashed_origin text, language enum, created_at)
                                 -- hashed_origin = HMAC(instructor_id || student_id, salt); not reversible
research.assignment_archetypes   (id, language, title_blurred, prompt_blurred)
research.trajectories            (id, learner_id fk, archetype_id fk, started_at, finished_at)
research.checkpoint_events       (trajectory_id fk, checkpoint enum, response_length, response_embedding vector,
                                  hint_level int, time_on_step_ms, agent_score numeric)
research.results_anonymized      (trajectory_id pk fk, correctness, hotspot, trace, mutation, repair, consistency, level)
```

Raw response text is **not** copied. Embeddings + structural features only. Code is never stored research-side.

## Agent design (post-assessment)

```
Submission complete
      │
      ▼
[Provenance Agent]  Haiku 4.5
  Input: code + provenance form
  Output: { ai_likelihood: 0..1, signals: [...], suggested_followup_depth: int }
      │
      ▼
[Hotspot Agent]    Sonnet 4.6
  Input: code + assignment hotspot_focus + student hotspot responses
  Output: { per_question: { rubric_match, missing_concepts[], evidence_quality } }
      │
      ▼
[Trace Agent]      Sonnet 4.6 + WebR/Pyodide tool calls
  Input: code + trace scenarios + student trace answers
  Output: { per_scenario: { actual_output, student_predicted, match, reasoning_quality } }
      │
      ▼
[Mutation Agent]   Sonnet 4.6 + WebR/Pyodide tool calls
  Input: mutation_code + hidden_tests + student plan
  Output: { mutation_caught: bool, plan_quality, fix_correctness }
      │
      ▼
[Repair Agent]     Sonnet 4.6 + WebR/Pyodide tool calls
  Input: repair_code + student fix + hidden_tests
  Output: { tests_pass: bool, root_cause_identified, fix_quality }
      │
      ▼
[Rubric Agent]     Opus 4.7
  Input: ALL findings above
  Output: { metrics, consistency, level, narrative, oral_defense_questions[] }
```

WebR/Pyodide execution happens **in-browser before queueing** (cheap, deterministic). The agents receive captured runtime outputs as data, not as tool calls in the agent loop. This keeps agent runtime fast and avoids server-side sandbox cost.

## Phase 1 — first PR scope (proposed)

Branch: `phase1/scaffold`

1. Bootstrap Next.js 15 + TS + Tailwind in a fresh `app/` folder alongside existing prototype (do not delete prototype yet — keep as reference)
2. Migrate Tailwind tokens from current pages into `app/styles/tokens.css`
3. Set up Supabase project (commercial), generate schema migration `0001_init.sql` from sketch above (additive only)
4. Implement Supabase Auth + magic link flow for instructors
5. Implement `/login`, `/dashboard` (instructor), `/course/[id]`, `/assignment/[id]` (read-only stubs)
6. Wire WebR + Pyodide as a shared `<CodeRunner>` component, get a "hello world" Python and R execution rendering in a sandbox page
7. Vitest config + first tests for `<CodeRunner>` + auth gate

Out of scope for Phase 1: agents, billing, student flow, research DB.

## Open questions for instructor (Dr. Moon)

- Stripe price point: $19/mo, $29/mo, $49/mo per instructor? (Need to set before billing in Phase 3)
- Demo/free tier: limit by attempts/month or by active students?
- Domain: `codedefenselab.com`? `codedefense.app`?
- Brand split: keep "Code Defense Lab" as commercial brand, or differentiate from research project name?
- IRB protocol number for research pipeline (Phase 2 prerequisite)
