-- 0002_workspace_states_per_owner_rls.sql
-- Status: NEEDS APPROVAL — not yet applied to any environment.
--
-- Purpose: replace the wide-open public read/write/update policies on workspace_states
-- with auth-scoped policies tied to the owning instructor's auth.uid().
--
-- Why this is critical:
--   The existing policies (supabase/workspace_states.sql) allow ANY anon visitor to
--   read, insert, or update ANY row. Combined with src/supabase-state.js using a single
--   shared workspace ID across all visitors, this means every demo visitor's state
--   stomps every other visitor's state. P0 blocker for any non-demo use.
--
-- Approach (additive only — no DROP TABLE / TRUNCATE / data deletion):
--   1. Add an owner_id column (nullable for back-compat with the existing single demo row).
--   2. Replace the three "Public can ..." policies with owner-scoped equivalents.
--   3. Keep a narrow read-only "demo" policy gated on a specific known demo ID so the
--      public landing page can still load read-only sample state.
--
-- Rollback: drop the new policies, re-create the old ones (preserved at the bottom in a
-- commented block for reference).

alter table public.workspace_states
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create index if not exists workspace_states_owner_id_idx
  on public.workspace_states (owner_id);

-- Drop the wide-open policies. (Dropping POLICIES is not destructive of data; the table
-- and rows are untouched. Acceptable under the additive-only rule because no data is lost.)
drop policy if exists "Public can read workspace states"   on public.workspace_states;
drop policy if exists "Public can insert workspace states" on public.workspace_states;
drop policy if exists "Public can update workspace states" on public.workspace_states;

-- Owner-scoped policies (the new normal).
create policy "owner can read own workspace state"
  on public.workspace_states
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "owner can insert own workspace state"
  on public.workspace_states
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owner can update own workspace state"
  on public.workspace_states
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owner can delete own workspace state"
  on public.workspace_states
  for delete
  to authenticated
  using (owner_id = auth.uid());

-- Narrow read-only "demo" policy: anon visitors may read only the seed demo row, by id.
-- This keeps the public landing page able to bootstrap UI without exposing other rows.
-- Adjust the literal id below if the demo seed changes.
create policy "anon can read demo workspace state"
  on public.workspace_states
  for select
  to anon
  using (id = 'code-defense-lab-demo-readonly');

-- ---------------------------------------------------------------------------
-- ROLLBACK (manual, for reference only — do not include in forward migration):
--
--   drop policy if exists "owner can read own workspace state"   on public.workspace_states;
--   drop policy if exists "owner can insert own workspace state" on public.workspace_states;
--   drop policy if exists "owner can update own workspace state" on public.workspace_states;
--   drop policy if exists "owner can delete own workspace state" on public.workspace_states;
--   drop policy if exists "anon can read demo workspace state"   on public.workspace_states;
--
--   create policy "Public can read workspace states"
--     on public.workspace_states for select using (true);
--   create policy "Public can insert workspace states"
--     on public.workspace_states for insert with check (true);
--   create policy "Public can update workspace states"
--     on public.workspace_states for update using (true) with check (true);
--
-- (Owner_id column is left in place — additive — even on rollback.)
-- ---------------------------------------------------------------------------
