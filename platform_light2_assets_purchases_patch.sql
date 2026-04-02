-- Дом Неона assets and purchases patch
-- Run this once in Supabase SQL Editor if platform_first_run.sql
-- was executed before the Assets and Purchases blocks were added.

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

create table if not exists public.light2_assets (
  id uuid primary key default gen_random_uuid(),
  asset_name text not null,
  asset_value numeric(14,2) not null default 0,
  note text,
  source_sheet text,
  source_row integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists light2_assets_name_idx
  on public.light2_assets(asset_name);

create unique index if not exists light2_assets_source_idx
  on public.light2_assets(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

drop trigger if exists light2_assets_set_updated_at on public.light2_assets;
create trigger light2_assets_set_updated_at
before update on public.light2_assets
for each row execute function public.set_updated_at();

create table if not exists public.light2_asset_payments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.light2_assets(id) on delete cascade,
  payment_date date not null,
  payment_amount numeric(12,2) not null default 0,
  note text,
  source_sheet text,
  source_row integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists light2_asset_payments_asset_date_idx
  on public.light2_asset_payments(asset_id, payment_date desc);

create unique index if not exists light2_asset_payments_source_idx
  on public.light2_asset_payments(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

drop trigger if exists light2_asset_payments_set_updated_at on public.light2_asset_payments;
create trigger light2_asset_payments_set_updated_at
before update on public.light2_asset_payments
for each row execute function public.set_updated_at();

create table if not exists public.light2_purchase_catalog (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  supplier_inn text,
  supplier_url text,
  city text,
  category text,
  article text,
  item_name text,
  unit_name text,
  price numeric(12,2) not null default 0,
  note text,
  source_sheet text,
  source_row integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists light2_purchase_catalog_supplier_idx
  on public.light2_purchase_catalog(supplier_name, category, article);

create unique index if not exists light2_purchase_catalog_source_idx
  on public.light2_purchase_catalog(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

drop trigger if exists light2_purchase_catalog_set_updated_at on public.light2_purchase_catalog;
create trigger light2_purchase_catalog_set_updated_at
before update on public.light2_purchase_catalog
for each row execute function public.set_updated_at();

alter table public.light2_assets enable row level security;
alter table public.light2_asset_payments enable row level security;
alter table public.light2_purchase_catalog enable row level security;

drop policy if exists "light2_assets_admin_select" on public.light2_assets;
create policy "light2_assets_admin_select"
on public.light2_assets
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_assets_admin_insert" on public.light2_assets;
create policy "light2_assets_admin_insert"
on public.light2_assets
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_assets_admin_update" on public.light2_assets;
create policy "light2_assets_admin_update"
on public.light2_assets
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_assets_admin_delete" on public.light2_assets;
create policy "light2_assets_admin_delete"
on public.light2_assets
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_asset_payments_admin_select" on public.light2_asset_payments;
create policy "light2_asset_payments_admin_select"
on public.light2_asset_payments
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_asset_payments_admin_insert" on public.light2_asset_payments;
create policy "light2_asset_payments_admin_insert"
on public.light2_asset_payments
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_asset_payments_admin_update" on public.light2_asset_payments;
create policy "light2_asset_payments_admin_update"
on public.light2_asset_payments
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_asset_payments_admin_delete" on public.light2_asset_payments;
create policy "light2_asset_payments_admin_delete"
on public.light2_asset_payments
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_purchase_catalog_admin_select" on public.light2_purchase_catalog;
create policy "light2_purchase_catalog_admin_select"
on public.light2_purchase_catalog
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "light2_purchase_catalog_admin_insert" on public.light2_purchase_catalog;
create policy "light2_purchase_catalog_admin_insert"
on public.light2_purchase_catalog
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_purchase_catalog_admin_update" on public.light2_purchase_catalog;
create policy "light2_purchase_catalog_admin_update"
on public.light2_purchase_catalog
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "light2_purchase_catalog_admin_delete" on public.light2_purchase_catalog;
create policy "light2_purchase_catalog_admin_delete"
on public.light2_purchase_catalog
for delete
to authenticated
using (public.is_admin(auth.uid()));
