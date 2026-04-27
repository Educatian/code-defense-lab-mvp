# `commercial/` — Code Defense Lab SaaS scaffold

> **Status: deprioritized scaffold.** The product focus is the root MVP at `../`. This Next.js app exists as future-ready foundation for the eventual B2C per-instructor SaaS once the MVP has pilot data justifying the lift.

This directory was started during the 2026-04-26 commercialization decision. It contains the agent fleet, two-DB schema, and Next.js shell — but **no UI is wired yet**.

If you want to see the working product, go to [`../README.md`](../README.md).

## What's in here

```
commercial/
├── src/
│   ├── app/                      # Next.js app router (page.tsx is a stub)
│   │   ├── (dev)/                # internal sandbox routes
│   │   ├── professor/            # placeholder
│   │   └── student/              # placeholder
│   ├── components/
│   │   ├── code-runner/          # WebR-based runner (mirrors root MVP)
│   │   ├── landing/              # hero blocks
│   │   └── shell/                # app shell pieces
│   ├── db/
│   │   └── schema.ts             # Drizzle SQLite schema (mirror of supabase/migrations/0003_commercial_schema.sql)
│   └── lib/
│       └── agents/               # ★ Anthropic agent fleet (the substantive scaffold)
│           ├── client.ts         # SDK factory; refuses to run in the browser
│           ├── models.ts         # MODELS map + per-million pricing + cost estimator
│           ├── runAgent.ts       # Single-shot runner with prompt caching on the assignment prefix
│           ├── batch.ts          # Anthropic Batch API integration (50% discount, post-assessment grading)
│           ├── orchestrator.ts   # Provenance/Hotspot/Trace/Mutation/Repair → Rubric synthesis
│           ├── provenance.ts     # Haiku tier
│           ├── hotspot.ts        # Sonnet tier
│           ├── trace.ts          # Sonnet tier
│           ├── mutation.ts       # Sonnet tier
│           ├── repair.ts         # Sonnet tier
│           ├── rubric.ts         # Opus tier (final synthesis)
│           ├── instructorReview.ts  # Sonnet tier (instructor-facing assist)
│           ├── types.ts          # AgentInput / AgentOutput / per-agent finding shapes
│           └── index.ts          # barrel
├── drizzle.config.ts             # SQLite for local dev
├── next.config.ts                # minimal — no security headers wired yet
├── tsconfig.json
└── package.json
```

## What works

- `tsc --noEmit` (typecheck)
- `next build` (build)
- The agent stubs are real Anthropic SDK calls with prompt caching + batch transport; they just aren't called from any UI yet.

## What does NOT work yet

- **No UI** beyond the stub pages — the actual student / instructor flows live in the root MVP HTML pages.
- **No auth** (Supabase Auth integration is a Phase-1 prerequisite).
- **No Stripe** (per-seat billing is queued for after auth lands).
- **No Postgres** — `drizzle.config.ts` points to local SQLite for dev. Production needs the Supabase Postgres migrations under `../supabase/migrations/` to be applied (NEEDS APPROVAL — see the supabase README).
- **No agent invocations** — the orchestrator is wired but nothing calls it.

## Why this exists

The decision matrix is in [`../docs/commercialization/00-phase0-audit-and-plan.md`](../docs/commercialization/00-phase0-audit-and-plan.md) and the per-item status in [`../docs/commercialization/01-punch-list.md`](../docs/commercialization/01-punch-list.md).

Short version: the agent + two-DB scaffolding is non-trivial, so it was written *while the architectural decisions were fresh*. Activating it requires: (a) auth, (b) Postgres migrations applied, (c) wiring the orchestrator to a Next.js route handler, (d) a Stripe checkout. Each of those is its own conversation.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000 — currently shows the stub page
npm run build        # next build
npx tsc --noEmit     # typecheck
```

Required env (when agents are activated):

- `ANTHROPIC_API_KEY` — server-side only. Never expose to the browser. `getAnthropicClient()` in `src/lib/agents/client.ts` enforces this with a runtime check.

## When to revisit this directory

- Pilot users on the root MVP have generated enough trajectory data to validate the construct (target: end of Spring 2026 pilot).
- Instructor demand for billed access becomes concrete (Stripe wired).
- Supabase migrations 0002 + 0003 have been applied to a real project.
