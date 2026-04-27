-- 0003_commercial_schema.sql
-- Status: NEEDS APPROVAL — not yet applied. Additive only (CREATE … IF NOT EXISTS throughout).
--
-- Purpose: Postgres-on-Supabase mirror of commercial/src/db/schema.ts (which is SQLite for
-- local dev). Adds Row-Level Security so that each instructor only sees their own data, and
-- students enrolled in their courses can only see their own attempts/responses.
--
-- Two-DB rule: this schema is ONLY for the commercial Supabase project. The research
-- project lives in supabase/migrations/research/0001_research_schema.sql with NO PII.

-- ---------------------------------------------------------------------------
-- Identity tables
-- ---------------------------------------------------------------------------

create table if not exists public.instructors (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  display_name text not null,
  email text,
  -- Opt-in research consent. False by default — never log to research store unless true.
  consent_research boolean not null default false,
  -- Stable HMAC of student id + per-instructor salt; used as the join key in the research DB.
  research_pseudonym text unique,
  created_at timestamptz not null default now()
);
create index if not exists students_instructor_idx on public.students(instructor_id);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  code text not null,
  title text not null,
  term text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists courses_instructor_idx on public.courses(instructor_id);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

-- ---------------------------------------------------------------------------
-- Assignment + attempt tables
-- ---------------------------------------------------------------------------

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  language text not null check (language in ('python', 'r')),
  title text not null,
  prompt text not null,
  due_at timestamptz,
  hotspot_focus jsonb not null default '[]'::jsonb,
  trace_scenario text not null,
  mutation_prompt text not null,
  repair_prompt text not null,
  starter_code text not null,
  reference_code text not null,
  mutation_code text not null,
  repair_code text not null,
  hidden_tests jsonb not null default '[]'::jsonb,
  modules jsonb not null,
  exemplar_responses jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists assignments_course_idx on public.assignments(course_id);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'grading', 'graded')),
  current_step text not null default 'submit'
    check (current_step in ('submit', 'hotspot', 'trace', 'mutate', 'repair', 'result')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (assignment_id, student_id)
);
create index if not exists attempts_student_idx on public.attempts(student_id);
create index if not exists attempts_assignment_idx on public.attempts(assignment_id);

create table if not exists public.attempt_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  "group" text not null check ("group" in (
    'provenance','verification','data_reasoning','hotspot','trace','mutation','repair'
  )),
  field text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  unique (attempt_id, "group", field)
);

create table if not exists public.attempt_executions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  kind text not null check (kind in ('trace','mutation','repair','submit')),
  student_input text not null,
  runtime_output text not null,
  passed_count integer not null default 0,
  total_count integer not null default 0,
  executed_at timestamptz not null default now()
);
create index if not exists attempt_executions_attempt_idx on public.attempt_executions(attempt_id);

-- ---------------------------------------------------------------------------
-- Agent + grading tables
-- ---------------------------------------------------------------------------

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  agent text not null check (agent in (
    'provenance','hotspot','trace','mutation','repair','rubric','orchestrator','instructor_review'
  )),
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_creation_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  cost_usd numeric(10,6) not null default 0,
  latency_ms integer not null default 0,
  status text not null default 'queued' check (status in ('queued','running','ok','error')),
  batch_id text,           -- Anthropic Batch API id when applicable
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists agent_runs_attempt_idx on public.agent_runs(attempt_id);
create index if not exists agent_runs_batch_idx on public.agent_runs(batch_id);

create table if not exists public.agent_findings (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  kind text not null,
  payload jsonb not null
);

create table if not exists public.results (
  attempt_id uuid primary key references public.attempts(id) on delete cascade,
  correctness numeric(5,4) not null,
  hotspot numeric(5,4) not null,
  trace numeric(5,4) not null,
  mutation numeric(5,4) not null,
  repair numeric(5,4) not null,
  consistency numeric(5,4) not null,
  level text not null check (level in ('HIGH','MEDIUM','LOW')),
  rubric_narrative text not null,
  next_step text not null,
  produced_by_agent_run_id uuid references public.agent_runs(id),
  finalized_at timestamptz not null default now()
);

create table if not exists public.review_records (
  attempt_id uuid primary key references public.attempts(id) on delete cascade,
  viva_notes jsonb not null default '[]'::jsonb,
  instructor_summary text,
  status text not null default 'unreviewed'
    check (status in ('unreviewed','noted','viva_recommended','closed')),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid not null,
  actor_kind text not null check (actor_kind in ('instructor','student','system')),
  action text not null,
  target_table text not null,
  target_id text not null,
  payload jsonb,
  at timestamptz not null default now()
);
create index if not exists audit_log_actor_idx on public.audit_log(actor_id, at desc);
create index if not exists audit_log_target_idx on public.audit_log(target_table, target_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.instructors          enable row level security;
alter table public.students             enable row level security;
alter table public.courses              enable row level security;
alter table public.enrollments          enable row level security;
alter table public.assignments          enable row level security;
alter table public.attempts             enable row level security;
alter table public.attempt_responses    enable row level security;
alter table public.attempt_executions   enable row level security;
alter table public.agent_runs           enable row level security;
alter table public.agent_findings       enable row level security;
alter table public.results              enable row level security;
alter table public.review_records       enable row level security;
alter table public.audit_log            enable row level security;

-- Helper: is the current authenticated user the instructor that owns this resource?
-- All tables ultimately roll up to instructors.id = auth.uid().

create policy "instructor reads own row" on public.instructors
  for select to authenticated using (id = auth.uid());
create policy "instructor updates own row" on public.instructors
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "instructor manages own students" on public.students
  for all to authenticated
  using (instructor_id = auth.uid())
  with check (instructor_id = auth.uid());

create policy "instructor manages own courses" on public.courses
  for all to authenticated
  using (instructor_id = auth.uid())
  with check (instructor_id = auth.uid());

create policy "instructor manages own enrollments" on public.enrollments
  for all to authenticated
  using (
    course_id in (select id from public.courses where instructor_id = auth.uid())
  )
  with check (
    course_id in (select id from public.courses where instructor_id = auth.uid())
  );

create policy "instructor manages own assignments" on public.assignments
  for all to authenticated
  using (
    course_id in (select id from public.courses where instructor_id = auth.uid())
  )
  with check (
    course_id in (select id from public.courses where instructor_id = auth.uid())
  );

create policy "instructor reads own attempts" on public.attempts
  for select to authenticated
  using (
    assignment_id in (
      select a.id from public.assignments a
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  );

create policy "instructor reads own attempt responses" on public.attempt_responses
  for select to authenticated
  using (
    attempt_id in (
      select at.id from public.attempts at
      join public.assignments a on a.id = at.assignment_id
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  );

create policy "instructor reads own attempt executions" on public.attempt_executions
  for select to authenticated
  using (
    attempt_id in (
      select at.id from public.attempts at
      join public.assignments a on a.id = at.assignment_id
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  );

create policy "instructor reads own agent runs" on public.agent_runs
  for select to authenticated
  using (
    attempt_id in (
      select at.id from public.attempts at
      join public.assignments a on a.id = at.assignment_id
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  );

create policy "instructor reads own agent findings" on public.agent_findings
  for select to authenticated
  using (
    agent_run_id in (
      select ar.id from public.agent_runs ar
      join public.attempts at on at.id = ar.attempt_id
      join public.assignments a on a.id = at.assignment_id
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  );

create policy "instructor reads own results" on public.results
  for select to authenticated
  using (
    attempt_id in (
      select at.id from public.attempts at
      join public.assignments a on a.id = at.assignment_id
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  );

create policy "instructor manages own review records" on public.review_records
  for all to authenticated
  using (
    attempt_id in (
      select at.id from public.attempts at
      join public.assignments a on a.id = at.assignment_id
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  )
  with check (
    attempt_id in (
      select at.id from public.attempts at
      join public.assignments a on a.id = at.assignment_id
      join public.courses c on c.id = a.course_id
      where c.instructor_id = auth.uid()
    )
  );

create policy "instructor reads own audit log" on public.audit_log
  for select to authenticated using (actor_id = auth.uid());

-- NOTE on student access: students authenticate through Supabase too, but their writes
-- (attempt_responses, attempt_executions) go through the API layer with service-role key
-- after server-side authorization. Direct anon/authenticated student write policies are
-- intentionally omitted here so the API stays the single chokepoint for student writes
-- — this also ensures we can enforce the consent gate before any research-pipeline log.
