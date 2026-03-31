create table if not exists public.shared_app_states (
  app_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_shared_app_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_shared_app_states_updated_at on public.shared_app_states;

create trigger trg_shared_app_states_updated_at
before update on public.shared_app_states
for each row
execute function public.set_shared_app_states_updated_at();

alter table public.shared_app_states enable row level security;

grant select, insert, update on public.shared_app_states to anon;
grant select, insert, update on public.shared_app_states to authenticated;

drop policy if exists "Public can read shared app states" on public.shared_app_states;
create policy "Public can read shared app states"
on public.shared_app_states
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert shared app states" on public.shared_app_states;
create policy "Public can insert shared app states"
on public.shared_app_states
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can update shared app states" on public.shared_app_states;
create policy "Public can update shared app states"
on public.shared_app_states
for update
to anon, authenticated
using (true)
with check (true);

alter publication supabase_realtime add table public.shared_app_states;
