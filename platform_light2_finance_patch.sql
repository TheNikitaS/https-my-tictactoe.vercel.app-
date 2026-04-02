-- Дом Неона finance patch
-- Run this once in Supabase SQL Editor if platform_first_run.sql
-- was executed before the Balance and Payment Calendar blocks were added.

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

create table if not exists public.light2_balance_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  account_type text not null
    check (account_type in ('cash_card', 'ooo_account', 'ip_account')),
  income_amount numeric(12,2) not null default 0,
  expense_amount numeric(12,2) not null default 0,
  note text,
  source_sheet text,
  source_row integer,
  source_slot text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists light2_balance_entries_date_idx
  on public.light2_balance_entries(entry_date desc, account_type);

create unique index if not exists light2_balance_entries_source_idx
  on public.light2_balance_entries(source_sheet, source_row, source_slot)
  where source_sheet is not null and source_row is not null and source_slot is not null;

drop trigger if exists light2_balance_entries_set_updated_at on public.light2_balance_entries;
create trigger light2_balance_entries_set_updated_at
before update on public.light2_balance_entries
for each row execute function public.set_updated_at();

create table if not exists public.light2_payment_calendar_entries (
  id uuid primary key default gen_random_uuid(),
  payment_date date not null,
  counterparty text not null,
  amount numeric(12,2) not null default 0,
  operation_type text not null
    check (operation_type in ('Приход', 'Расход')),
  category text,
  account_name text not null
    check (account_name in ('Наличные / карта', 'Счёт ООО', 'Счёт ИП', 'Не распределено')),
  status text not null default 'Платеж',
  note text,
  source_sheet text,
  source_row integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists light2_payment_calendar_entries_date_idx
  on public.light2_payment_calendar_entries(payment_date asc, account_name, operation_type);

create unique index if not exists light2_payment_calendar_entries_source_idx
  on public.light2_payment_calendar_entries(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

drop trigger if exists light2_payment_calendar_entries_set_updated_at on public.light2_payment_calendar_entries;
create trigger light2_payment_calendar_entries_set_updated_at
before update on public.light2_payment_calendar_entries
for each row execute function public.set_updated_at();

alter table public.light2_balance_entries enable row level security;
alter table public.light2_payment_calendar_entries enable row level security;

drop policy if exists "light2_balance_admin_select" on public.light2_balance_entries;
create policy "light2_balance_admin_select"
on public.light2_balance_entries
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_balance_admin_insert" on public.light2_balance_entries;
create policy "light2_balance_admin_insert"
on public.light2_balance_entries
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_balance_admin_update" on public.light2_balance_entries;
create policy "light2_balance_admin_update"
on public.light2_balance_entries
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_balance_admin_delete" on public.light2_balance_entries;
create policy "light2_balance_admin_delete"
on public.light2_balance_entries
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_calendar_admin_select" on public.light2_payment_calendar_entries;
create policy "light2_calendar_admin_select"
on public.light2_payment_calendar_entries
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_calendar_admin_insert" on public.light2_payment_calendar_entries;
create policy "light2_calendar_admin_insert"
on public.light2_payment_calendar_entries
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_calendar_admin_update" on public.light2_payment_calendar_entries;
create policy "light2_calendar_admin_update"
on public.light2_payment_calendar_entries
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_calendar_admin_delete" on public.light2_payment_calendar_entries;
create policy "light2_calendar_admin_delete"
on public.light2_payment_calendar_entries
for delete
to authenticated
using (public.is_admin(auth.uid()));
