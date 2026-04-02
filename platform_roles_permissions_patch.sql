-- Дом Неона platform roles and permissions patch
-- Run this once in Supabase SQL Editor for existing projects.

alter table public.app_profiles
  add column if not exists module_permissions jsonb not null default '{}'::jsonb;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.app_profiles p
    where p.id = user_id
      and p.is_active = true
      and (
        p.role in ('owner', 'admin')
        or coalesce((p.module_permissions -> 'admin' ->> 'manage')::boolean, false)
      )
  );
$$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'app_profiles_role_check'
      and conrelid = 'public.app_profiles'::regclass
  ) then
    alter table public.app_profiles drop constraint app_profiles_role_check;
  end if;
end;
$$;

create table if not exists public.app_role_templates (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  display_name text not null,
  description text,
  module_permissions jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists app_role_templates_set_updated_at on public.app_role_templates;
create trigger app_role_templates_set_updated_at
before update on public.app_role_templates
for each row execute function public.set_updated_at();

alter table public.app_role_templates enable row level security;

drop policy if exists "role_templates_select_authenticated" on public.app_role_templates;
create policy "role_templates_select_authenticated"
on public.app_role_templates
for select
to authenticated
using (true);

drop policy if exists "role_templates_admin_insert" on public.app_role_templates;
create policy "role_templates_admin_insert"
on public.app_role_templates
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "role_templates_admin_update" on public.app_role_templates;
create policy "role_templates_admin_update"
on public.app_role_templates
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "role_templates_admin_delete" on public.app_role_templates;
create policy "role_templates_admin_delete"
on public.app_role_templates
for delete
to authenticated
using (public.is_admin(auth.uid()));

insert into public.app_role_templates (role_key, display_name, description, module_permissions, is_system)
values
  (
    'owner',
    'Владелец',
    'Полный доступ ко всей платформе.',
    '{
      "dashboard":{"view":true,"edit":true,"manage":true},
      "sales":{"view":true,"edit":true,"manage":true},
      "my_calculator":{"view":true,"edit":true,"manage":true},
      "partner_calculator":{"view":true,"edit":true,"manage":true},
      "light2":{"view":true,"edit":true,"manage":true},
      "messenger":{"view":true,"edit":true,"manage":true},
      "admin":{"view":true,"edit":true,"manage":true},
      "crm":{"view":true,"edit":true,"manage":true},
      "warehouse":{"view":true,"edit":true,"manage":true},
      "tasks":{"view":true,"edit":true,"manage":true},
      "ai":{"view":true,"edit":true,"manage":true}
    }'::jsonb,
    true
  ),
  (
    'admin',
    'Администратор',
    'Управляет пользователями, ролями и модулями.',
    '{
      "dashboard":{"view":true,"edit":true,"manage":true},
      "sales":{"view":true,"edit":true,"manage":true},
      "my_calculator":{"view":true,"edit":true,"manage":true},
      "partner_calculator":{"view":true,"edit":true,"manage":true},
      "light2":{"view":true,"edit":true,"manage":true},
      "messenger":{"view":true,"edit":true,"manage":true},
      "admin":{"view":true,"edit":true,"manage":true},
      "crm":{"view":true,"edit":true,"manage":true},
      "warehouse":{"view":true,"edit":true,"manage":true},
      "tasks":{"view":true,"edit":true,"manage":true},
      "ai":{"view":true,"edit":true,"manage":true}
    }'::jsonb,
    true
  ),
  (
    'manager',
    'Менеджер',
    'Работает с продажами и ключевыми рабочими инструментами.',
    '{
      "dashboard":{"view":true,"edit":true,"manage":false},
      "sales":{"view":true,"edit":true,"manage":false},
      "my_calculator":{"view":true,"edit":true,"manage":false},
      "partner_calculator":{"view":true,"edit":true,"manage":false},
      "light2":{"view":true,"edit":true,"manage":false},
      "messenger":{"view":true,"edit":true,"manage":false}
    }'::jsonb,
    true
  ),
  (
    'partner',
    'Партнер',
    'Видит только свой контур и партнерский калькулятор.',
    '{
      "dashboard":{"view":true,"edit":false,"manage":false},
      "partner_calculator":{"view":true,"edit":true,"manage":false},
      "light2":{"view":true,"edit":false,"manage":false},
      "messenger":{"view":true,"edit":true,"manage":false}
    }'::jsonb,
    true
  ),
  (
    'staff',
    'Сотрудник',
    'Работает внутри назначенных ему модулей.',
    '{
      "dashboard":{"view":true,"edit":false,"manage":false},
      "messenger":{"view":true,"edit":true,"manage":false}
    }'::jsonb,
    true
  ),
  (
    'viewer',
    'Наблюдатель',
    'Только просмотр без редактирования.',
    '{
      "dashboard":{"view":true,"edit":false,"manage":false}
    }'::jsonb,
    true
  ),
  (
    'user',
    'Пользователь',
    'Базовый вход в систему.',
    '{
      "dashboard":{"view":true,"edit":false,"manage":false}
    }'::jsonb,
    true
  )
on conflict (role_key) do nothing;

update public.app_profiles
set module_permissions = (
  select coalesce(
    jsonb_object_agg(
      key,
      jsonb_build_object('view', true, 'edit', true, 'manage', false)
    ),
    '{}'::jsonb
  )
  from jsonb_array_elements_text(coalesce(public.app_profiles.allowed_modules, '[]'::jsonb)) as modules(key)
)
where coalesce(module_permissions, '{}'::jsonb) = '{}'::jsonb
  and role not in ('owner', 'admin');

update public.app_profiles
set module_permissions = '{
  "dashboard":{"view":true,"edit":true,"manage":true},
  "sales":{"view":true,"edit":true,"manage":true},
  "my_calculator":{"view":true,"edit":true,"manage":true},
  "partner_calculator":{"view":true,"edit":true,"manage":true},
  "light2":{"view":true,"edit":true,"manage":true},
  "messenger":{"view":true,"edit":true,"manage":true},
  "admin":{"view":true,"edit":true,"manage":true},
  "crm":{"view":true,"edit":true,"manage":true},
  "warehouse":{"view":true,"edit":true,"manage":true},
  "tasks":{"view":true,"edit":true,"manage":true},
  "ai":{"view":true,"edit":true,"manage":true}
}'::jsonb
where coalesce(module_permissions, '{}'::jsonb) = '{}'::jsonb
  and role in ('owner', 'admin');
