create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  public_code text not null default (
    'LC-' || upper(substring(md5(random()::text || clock_timestamp()::text || gen_random_uuid()::text) from 1 for 8))
  ),
  avatar_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 16),
  constraint profiles_display_name_trimmed check (display_name = btrim(display_name)),
  constraint profiles_display_name_characters check (display_name ~ '^[A-Za-z0-9 _一-龥-]+$'),
  constraint profiles_public_code_unique unique (public_code),
  constraint profiles_avatar_key_allowed check (
    avatar_key in (
      'mint-unicorn',
      'rose-unicorn',
      'honey-unicorn',
      'ice-unicorn',
      'emerald-unicorn',
      'lavender-unicorn'
    )
  )
);

alter table public.profiles enable row level security;

create or replace function public.normalize_profile_input()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  compact_name text;
begin
  compact_name := btrim(regexp_replace(new.display_name, '[[:space:]]+', ' ', 'g'));

  if lower(compact_name) ~ '(fuck|shit|bitch|cunt|asshole|傻逼|操你|妈的|草泥马|管理员|官方|系统账号|客服)' then
    raise exception using
      errcode = '22023',
      message = 'DISPLAY_NAME_BLOCKED';
  end if;

  new.display_name := compact_name;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists normalize_profile_input_before_write on public.profiles;
create trigger normalize_profile_input_before_write
before insert or update of display_name, avatar_key
on public.profiles
for each row execute function public.normalize_profile_input();

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, display_name, avatar_key) on table public.profiles to authenticated;

create or replace function public.complete_onboarding(
  p_display_name text,
  p_avatar_key text
)
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  created_profile public.profiles;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  select *
  into created_profile
  from public.profiles
  where id = current_user_id;

  if found then
    return created_profile;
  end if;

  insert into public.profiles (id, display_name, avatar_key)
  values (current_user_id, p_display_name, p_avatar_key)
  returning * into created_profile;

  return created_profile;
end;
$$;

revoke all on function public.complete_onboarding(text, text) from public, anon;
grant execute on function public.complete_onboarding(text, text) to authenticated;
