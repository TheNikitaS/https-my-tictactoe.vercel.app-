-- Apply this after platform_setup.sql if the platform tables already exist.
-- 1) Expands role support with owner
-- 2) Updates admin checks to include owner
-- 3) Lets you promote your own account to owner

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

alter table public.app_profiles
  drop constraint if exists app_profiles_role_check;

alter table public.app_profiles
  add constraint app_profiles_role_check
  check (role in ('owner', 'admin', 'manager', 'partner', 'staff', 'viewer', 'user'));

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
      '["dashboard","sales","my_calculator","partner_calculator","messenger","admin","crm","warehouse","tasks","ai"]'::jsonb
    )
    on conflict (id) do update
      set email = excluded.email,
          full_name = coalesce(public.app_profiles.full_name, excluded.full_name),
          display_name = coalesce(public.app_profiles.display_name, excluded.display_name),
          role = 'owner',
          allowed_modules = '["dashboard","sales","my_calculator","partner_calculator","messenger","admin","crm","warehouse","tasks","ai"]'::jsonb;

    return new;
  end if;

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

-- Replace the email below with your actual account email.
update public.app_profiles
set
  role = 'owner',
  is_active = true,
  allowed_modules = '["dashboard","sales","my_calculator","partner_calculator","messenger","admin","crm","warehouse","tasks","ai"]'::jsonb,
  updated_at = now()
where email = 'n.suhotin@yandex.ru';
