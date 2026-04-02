-- Дом Неона workbook sync patch
-- Run this after:
-- 1) platform_first_run.sql or platform_setup.sql
-- 2) platform_light2_patch.sql
-- 3) platform_light2_finance_patch.sql
-- 4) platform_light2_assets_purchases_patch.sql
--
-- The patch:
-- - aligns the schema with the filled workbook
-- - adds source tracking columns for idempotent imports
-- - enables the third balance account "Счёт ИП"
-- - allows payout schedule rows without a linked asset

alter table public.light2_balance_entries
  add column if not exists source_sheet text,
  add column if not exists source_row integer,
  add column if not exists source_slot text;

alter table public.light2_balance_entries
  drop constraint if exists light2_balance_entries_account_type_check;

alter table public.light2_balance_entries
  add constraint light2_balance_entries_account_type_check
  check (account_type in ('cash_card', 'ooo_account', 'ip_account'));

create unique index if not exists light2_balance_entries_source_idx
  on public.light2_balance_entries(source_sheet, source_row, source_slot)
  where source_sheet is not null and source_row is not null and source_slot is not null;

alter table public.light2_payment_calendar_entries
  add column if not exists source_sheet text,
  add column if not exists source_row integer;

create unique index if not exists light2_payment_calendar_entries_source_idx
  on public.light2_payment_calendar_entries(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

alter table public.light2_assets
  add column if not exists source_sheet text,
  add column if not exists source_row integer;

create unique index if not exists light2_assets_source_idx
  on public.light2_assets(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

alter table public.light2_asset_payments
  alter column asset_id drop not null;

alter table public.light2_asset_payments
  add column if not exists source_sheet text,
  add column if not exists source_row integer;

create unique index if not exists light2_asset_payments_source_idx
  on public.light2_asset_payments(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

alter table public.light2_purchase_catalog
  add column if not exists source_sheet text,
  add column if not exists source_row integer;

create unique index if not exists light2_purchase_catalog_source_idx
  on public.light2_purchase_catalog(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;

alter table public.light2_partner_settlements
  add column if not exists source_sheet text,
  add column if not exists source_row integer;

create unique index if not exists light2_partner_settlements_source_idx
  on public.light2_partner_settlements(source_sheet, source_row)
  where source_sheet is not null and source_row is not null;
