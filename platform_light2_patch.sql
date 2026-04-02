-- Apply this after platform_setup.sql for the LIGHT 2 module.
-- 1) Creates the partner settlements table
-- 2) Adds RLS so partners only see their own rows
-- 3) Grants the LIGHT 2 module to owner/admin and linked partners

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

update public.app_profiles
set
  allowed_modules = case
    when coalesce(allowed_modules, '[]'::jsonb) @> '["light2"]'::jsonb
      then coalesce(allowed_modules, '[]'::jsonb)
    else coalesce(allowed_modules, '[]'::jsonb) || '["light2"]'::jsonb
  end,
  updated_at = now()
where email = 'n.suhotin@yandex.ru'
   or role in ('owner', 'admin')
   or partner_slug is not null;
