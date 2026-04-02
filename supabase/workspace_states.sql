create table if not exists public.workspace_states (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.workspace_states enable row level security;

drop policy if exists "Public can read workspace states" on public.workspace_states;
create policy "Public can read workspace states"
on public.workspace_states
for select
using (true);

drop policy if exists "Public can insert workspace states" on public.workspace_states;
create policy "Public can insert workspace states"
on public.workspace_states
for insert
with check (true);

drop policy if exists "Public can update workspace states" on public.workspace_states;
create policy "Public can update workspace states"
on public.workspace_states
for update
using (true)
with check (true);
