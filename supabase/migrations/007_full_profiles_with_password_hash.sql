-- Full idempotent migration: create/repair `profiles`, RLS/policies, signup trigger,
-- username maintenance, and password hashing workflow that stores only bcrypt hashes.
-- Run as a DB admin in Supabase SQL editor or with psql.

begin;

-- 0) Ensure pgcrypto available for bcrypt
create extension if not exists pgcrypto;

-- 1) Create `profiles` table (idempotent)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text not null,
  role text not null check (role in ('user', 'admin')) default 'user',
  password_hash text,
  plain_password text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Defensive: ensure username column exists
alter table public.profiles add column if not exists username text;

-- 3) Enable RLS and (re)create policies idempotently
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Allow insert profile with role user only" on public.profiles;
create policy "Allow insert profile with role user only"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'user');

-- 4) Signup trigger function: creates profile row when a new auth.user is created
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_username text;
  v_email text;
begin
  v_email := coalesce(new.email, '');
  v_username := coalesce(new.raw_user_meta_data ->> 'username', split_part(v_email, '@', 1));
  if v_username is null or v_username = '' then
    v_username := concat('user_', substring(new.id::text from 1 for 8));
  end if;

  insert into public.profiles (id, username, email, role, created_at, updated_at)
  values (new.id, v_username, v_email, 'user', now(), now())
  on conflict (id) do update
    set updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- 5) Recreate trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Password-hashing trigger: hash `plain_password` into `password_hash` and null plaintext
create or replace function public.hash_profile_plain_password()
returns trigger as $$
begin
  -- If plain_password provided, hash it and clear the plaintext
  if NEW.plain_password is not null and NEW.plain_password <> '' then
    NEW.password_hash := crypt(NEW.plain_password, gen_salt('bf'));
    NEW.plain_password := null;
  end if;

  -- If password_hash is present but doesn't appear to be bcrypt, hash it
  if NEW.password_hash is not null and NEW.password_hash !~ '^\\$2[aby]\\$' then
    NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists hash_plain_password_on_profiles on public.profiles;
create trigger hash_plain_password_on_profiles
  before insert or update on public.profiles
  for each row execute function public.hash_profile_plain_password();

-- 7) Backfill legacy plaintext `password` column if it exists, then drop it
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'password'
  ) then
    update public.profiles
    set password_hash = crypt(password, gen_salt('bf'))
    where password is not null and (password_hash is null or password_hash = '');

    alter table public.profiles drop column if exists password;
  end if;
end$$;

-- 8) Backfill missing usernames and deduplicate (case-insensitive)
update public.profiles
set username = concat(split_part(email, '@', 1), '_', substring(id::text from 1 for 8))
where username is null or username = '';

with numbered as (
  select id, username, lower(username) as uname_l, row_number() over (partition by lower(username) order by id) rn
  from public.profiles
  where username is not null and username <> ''
)
update public.profiles p
set username = concat(p.username, '_', substring(p.id::text from 1 for 8))
from numbered n
where p.id = n.id and n.rn > 1;

-- 9) Create case-insensitive unique index on lower(username)
drop index if exists idx_profiles_username_unique;
create unique index if not exists idx_profiles_username_lower_unique
  on public.profiles ((lower(username)))
  where username is not null and username <> '';

-- 10) Protect `plain_password` from casual SELECT by revoking public select; admins can still access
revoke select (plain_password) on public.profiles from public;

commit;

-- Diagnostics (run separately if needed):
-- - Check duplicates: select lower(username), count(*) from public.profiles group by lower(username) having count(*) > 1;
-- - Verify profiles: select * from public.profiles order by created_at desc limit 10;
-- - Verify hashing: select password_hash from public.profiles where email='user@example.com';
