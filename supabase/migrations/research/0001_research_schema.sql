-- research/0001_research_schema.sql
-- Status: NEEDS APPROVAL — not yet applied. Lives in a SEPARATE Supabase project from commercial.
--
-- ABSOLUTE RULES for this schema:
--   1. NO student names, emails, raw IPs, or any direct PII. Ever.
--   2. The only join key is research_pseudonym = HMAC(student_id, instructor_salt).
--      The salt is held in an env var on the commercial side and is NOT stored in this DB.
--   3. consent_research must be true on the commercial side before any row lands here.
--      Enforcement happens in the application layer; this DB has no way to verify it,
--      which is why writes must go through a single audited Edge Function.
--   4. Additive only. No DROP TABLE / TRUNCATE / DELETE without explicit approval.
--
-- This is a research dataset for ADDIE Lab (Dr. Jewoong Moon, UA). IRB-covered. The
-- shape is intentionally narrow: trajectories + scores, no free-text that could re-identify.

create schema if not exists research;

-- ---------------------------------------------------------------------------
-- Pseudonymous learner record. No PII. The pseudonym is the same value used
-- on the commercial side as students.research_pseudonym.
-- ---------------------------------------------------------------------------

create table if not exists research.learners (
  pseudonym text primary key,
  -- Hashed-and-bucketed cohort fields only. Any field added here must be reviewed for
  -- re-identification risk against k-anonymity (k>=10 within a study).
  course_term_bucket text,    -- e.g. 'fall-2026' (not full course code)
  language text not null check (language in ('python','r')),
  first_seen_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Per-attempt trajectory. One row per checkpoint event. No raw code, no raw
-- prose — only structured signals derived on the commercial side.
-- ---------------------------------------------------------------------------

create table if not exists research.checkpoint_events (
  id bigserial primary key,
  pseudonym text not null references research.learners(pseudonym) on delete cascade,
  attempt_seq integer not null,                 -- monotonically increasing per pseudonym
  checkpoint text not null check (checkpoint in (
    'submit','hotspot','trace','mutation','repair','result'
  )),
  step_index integer not null,                  -- order within the attempt
  -- Structured signals only. Examples:
  --   submit: {"provenance":"ai_assisted","time_to_submit_s":420}
  --   hotspot: {"items":[{"line":12,"correct":true,"latency_ms":18000}, ...]}
  --   trace: {"correct":false,"step_count":4,"hint_count":2}
  --   mutation: {"survived":true,"latency_ms":94000}
  --   repair: {"passed":3,"failed":1,"latency_ms":210000}
  -- DO NOT put student-written prose, names, or raw code here.
  signals jsonb not null,
  occurred_at timestamptz not null default now()
);

create index if not exists checkpoint_events_pseudonym_idx
  on research.checkpoint_events (pseudonym, attempt_seq, step_index);

-- ---------------------------------------------------------------------------
-- Final per-attempt result snapshot for analysis convenience. Mirrors the
-- commercial results table but PII-free.
-- ---------------------------------------------------------------------------

create table if not exists research.attempt_results (
  id bigserial primary key,
  pseudonym text not null references research.learners(pseudonym) on delete cascade,
  attempt_seq integer not null,
  language text not null check (language in ('python','r')),
  correctness numeric(5,4) not null,
  hotspot numeric(5,4) not null,
  trace numeric(5,4) not null,
  mutation numeric(5,4) not null,
  repair numeric(5,4) not null,
  consistency numeric(5,4) not null,
  level text not null check (level in ('HIGH','MEDIUM','LOW')),
  finalized_at timestamptz not null default now(),
  unique (pseudonym, attempt_seq)
);

-- ---------------------------------------------------------------------------
-- Cohort metadata for IRB-reportable counts. No row-level PII.
-- ---------------------------------------------------------------------------

create table if not exists research.cohorts (
  id text primary key,                          -- e.g. 'spring-2026-cdl-pilot'
  irb_protocol text not null,                   -- IRB protocol number
  description text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table research.learners            enable row level security;
alter table research.checkpoint_events   enable row level security;
alter table research.attempt_results     enable row level security;
alter table research.cohorts             enable row level security;

-- Researchers (named accounts only) read; nobody else has direct access. Writes are
-- exclusively via service-role (the Edge Function that enforces the consent gate).
create policy "researchers can read learners" on research.learners
  for select to authenticated using (auth.jwt() ->> 'role' = 'researcher');

create policy "researchers can read checkpoint events" on research.checkpoint_events
  for select to authenticated using (auth.jwt() ->> 'role' = 'researcher');

create policy "researchers can read attempt results" on research.attempt_results
  for select to authenticated using (auth.jwt() ->> 'role' = 'researcher');

create policy "researchers can read cohorts" on research.cohorts
  for select to authenticated using (auth.jwt() ->> 'role' = 'researcher');
