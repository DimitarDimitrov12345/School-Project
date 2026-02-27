-- Migration: hash plaintext `password` on insert/update and never store plaintext
-- Idempotent: backfills legacy `password` column (if present), drops it, and ensures
-- triggers hash any incoming `password` into `password_hash` BEFORE commit.

begin;

-- Ensure pgcrypto is available
create extension if not exists pgcrypto;

-- Ensure profiles table and `password_hash` exist
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text not null,
  role text not null check (role in ('user', 'admin')) default 'user',
  password_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists password_hash text;

-- Backfill legacy plaintext `password` column if it exists, then drop it
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

-- Trigger function: hash any provided plaintext `password` into `password_hash` before write
create or replace function public.hash_password_before_write()
returns trigger as $$
begin
  if NEW.password is not null and NEW.password <> '' then
    NEW.password_hash := crypt(NEW.password, gen_salt('bf'));
    NEW.password := null;
  end if;

  -- If password_hash present but not bcrypt, re-hash it
  if NEW.password_hash is not null and NEW.password_hash !~ '^\\$2[aby]\\$' then
    NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists hash_password_on_profiles on public.profiles;
create trigger hash_password_on_profiles
  before insert or update on public.profiles
  for each row execute function public.hash_password_before_write();

-- Recreate simple signup trigger to ensure profiles exist for auth users
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
  on conflict (id) do update set updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill missing usernames and add case-insensitive unique index
update public.profiles
set username = concat(split_part(email, '@', 1), '_', substring(id::text from 1 for 8))
where username is null or username = '';

drop index if exists idx_profiles_username_unique;
create unique index if not exists idx_profiles_username_lower_unique
  on public.profiles ((lower(username)))
  where username is not null and username <> '';

commit;

-- Usage notes:
-- - When inserting/updating directly into `public.profiles`, write a plaintext `password` column value;
--   the trigger will hash it into `password_hash` and clear `password` before commit.
-- - Prefer using Supabase Auth for user passwords; this is for custom cases only.
