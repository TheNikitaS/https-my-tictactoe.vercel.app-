-- Дом Неон Platform bootstrap for Supabase
-- Run this once in Supabase SQL Editor before opening /platform/

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.app_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  display_name text,
  role text not null default 'user'
    check (role in ('owner', 'admin', 'manager', 'partner', 'staff', 'viewer', 'user')),
  allowed_modules jsonb not null default
    '["dashboard","sales","my_calculator","partner_calculator","messenger"]'::jsonb,
  partner_slug text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists app_profiles_set_updated_at on public.app_profiles;
create trigger app_profiles_set_updated_at
before update on public.app_profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.app_profiles p
    where p.id = user_id
      and p.role in ('owner', 'admin')
      and p.is_active = true
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.app_profiles p where p.role in ('owner', 'admin') and p.is_active = true
  ) then
    insert into public.app_profiles (
      id,
      email,
      full_name,
      display_name,
      role,
      allowed_modules
    )
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
      coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
      'owner',
      '["dashboard","sales","my_calculator","partner_calculator","light2","messenger","admin","crm","warehouse","tasks","ai"]'::jsonb
    )
    on conflict (id) do update
      set email = excluded.email,
          full_name = coalesce(public.app_profiles.full_name, excluded.full_name),
          display_name = coalesce(public.app_profiles.display_name, excluded.display_name),
          role = 'owner',
          allowed_modules = '["dashboard","sales","my_calculator","partner_calculator","light2","messenger","admin","crm","warehouse","tasks","ai"]'::jsonb;

    return new;
  end;

  insert into public.app_profiles (
    id,
    email,
    full_name,
    display_name
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email)
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.app_profiles.full_name, excluded.full_name),
        display_name = coalesce(public.app_profiles.display_name, excluded.display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_platform on auth.users;
create trigger on_auth_user_created_platform
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create table if not exists public.partner_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  email text,
  owner_user_id uuid references auth.users(id) on delete set null,
  calculator_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists partner_profiles_set_updated_at on public.partner_profiles;
create trigger partner_profiles_set_updated_at
before update on public.partner_profiles
for each row execute function public.set_updated_at();

create table if not exists public.app_threads (
  id uuid primary key default gen_random_uuid(),
  thread_type text not null check (thread_type in ('direct', 'group')),
  title text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_thread_members (
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'member'
    check (member_role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.app_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.app_profiles enable row level security;
alter table public.partner_profiles enable row level security;
alter table public.app_threads enable row level security;
alter table public.app_thread_members enable row level security;
alter table public.app_messages enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.app_profiles;
create policy "profiles_select_own_or_admin"
on public.app_profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_insert_own_or_admin" on public.app_profiles;
create policy "profiles_insert_own_or_admin"
on public.app_profiles
for insert
to authenticated
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.app_profiles;
create policy "profiles_update_own_or_admin"
on public.app_profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "partner_profiles_select_authenticated" on public.partner_profiles;
create policy "partner_profiles_select_authenticated"
on public.partner_profiles
for select
to authenticated
using (true);

drop policy if exists "partner_profiles_admin_insert" on public.partner_profiles;
create policy "partner_profiles_admin_insert"
on public.partner_profiles
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "partner_profiles_admin_update" on public.partner_profiles;
create policy "partner_profiles_admin_update"
on public.partner_profiles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "partner_profiles_admin_delete" on public.partner_profiles;
create policy "partner_profiles_admin_delete"
on public.partner_profiles
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "threads_select_member" on public.app_threads;
create policy "threads_select_member"
on public.app_threads
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.app_thread_members m
    where m.thread_id = id and m.user_id = auth.uid()
  )
);

drop policy if exists "threads_insert_authenticated" on public.app_threads;
create policy "threads_insert_authenticated"
on public.app_threads
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "thread_members_select_member" on public.app_thread_members;
create policy "thread_members_select_member"
on public.app_thread_members
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or user_id = auth.uid()
  or exists (
    select 1
    from public.app_thread_members m
    where m.thread_id = thread_id and m.user_id = auth.uid()
  )
);

drop policy if exists "thread_members_insert_creator" on public.app_thread_members;
create policy "thread_members_insert_creator"
on public.app_thread_members
for insert
to authenticated
with check (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.app_threads t
    where t.id = thread_id and t.created_by = auth.uid()
  )
);

drop policy if exists "messages_select_member" on public.app_messages;
create policy "messages_select_member"
on public.app_messages
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.app_thread_members m
    where m.thread_id = thread_id and m.user_id = auth.uid()
  )
);

drop policy if exists "messages_insert_member" on public.app_messages;
create policy "messages_insert_member"
on public.app_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.app_thread_members m
    where m.thread_id = thread_id and m.user_id = auth.uid()
  )
);

create table if not exists public.light2_partner_settlements (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null references public.partner_profiles(slug) on delete cascade,
  period_label text not null,
  salary_amount numeric(12,2) not null default 0,
  purchase_amount numeric(12,2) not null default 0,
  status text not null default 'Ожидает сверки'
    check (status in ('Ожидает сверки', 'К выплате', 'Взаиморасчет произведен', 'Спор', 'Архив')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists light2_partner_settlements_partner_period_idx
  on public.light2_partner_settlements(partner_slug, period_label, created_at desc);

drop trigger if exists light2_partner_settlements_set_updated_at on public.light2_partner_settlements;
create trigger light2_partner_settlements_set_updated_at
before update on public.light2_partner_settlements
for each row execute function public.set_updated_at();

alter table public.light2_partner_settlements enable row level security;

drop policy if exists "light2_settlements_select_scope" on public.light2_partner_settlements;
create policy "light2_settlements_select_scope"
on public.light2_partner_settlements
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.app_profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.partner_slug = light2_partner_settlements.partner_slug
  )
  or exists (
    select 1
    from public.partner_profiles pp
    where pp.slug = light2_partner_settlements.partner_slug
      and pp.owner_user_id = auth.uid()
  )
);

drop policy if exists "light2_settlements_admin_insert" on public.light2_partner_settlements;
create policy "light2_settlements_admin_insert"
on public.light2_partner_settlements
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_settlements_admin_update" on public.light2_partner_settlements;
create policy "light2_settlements_admin_update"
on public.light2_partner_settlements
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_settlements_admin_delete" on public.light2_partner_settlements;
create policy "light2_settlements_admin_delete"
on public.light2_partner_settlements
for delete
to authenticated
using (public.is_admin(auth.uid()));

insert into public.app_profiles (id, email, full_name, display_name, role, allowed_modules, is_active)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'display_name', u.email),
  coalesce(u.raw_user_meta_data ->> 'display_name', u.email),
  case when row_number() over (order by u.created_at asc) = 1 then 'owner' else 'user' end,
  case
    when row_number() over (order by u.created_at asc) = 1
      then '["dashboard","sales","my_calculator","partner_calculator","light2","messenger","admin","crm","warehouse","tasks","ai"]'::jsonb
    else '["dashboard","sales","my_calculator","partner_calculator","messenger"]'::jsonb
  end,
  true
from auth.users u
on conflict (id) do nothing;
