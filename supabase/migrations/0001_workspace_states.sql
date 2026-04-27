-- 0001_workspace_states.sql
-- SNAPSHOT of the legacy workspace_states table currently deployed to the demo Supabase project.
-- This file is here for migration-history traceability ONLY. It mirrors supabase/workspace_states.sql.
-- DO NOT re-run on the deployed demo DB; the table already exists.
--
-- Replaced/superseded by 0002_workspace_states_per_owner_rls.sql for any production tenant.

create table if not exists public.workspace_states (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.workspace_states enable row level security;
