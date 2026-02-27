-- Migration: profiles table with UUID primary key, no foreign key, relaxed constraints
-- Allows inserts without checking external tables or strict values

begin;

-- Ensure pgcrypto is available
create extension if not exists pgcrypto;

-- Drop old table if exists (for full reset; comment out if you want to preserve data)
-- drop table if exists public.profiles;

-- Create/repair profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text,
  email text not null,
  role text default 'user',
  password_hash text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Remove any old password/plain_password columns
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'password'
  ) then
    alter table public.profiles drop column if exists password;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'plain_password'
  ) then
    alter table public.profiles drop column if exists plain_password;
  end if;
end$$;

-- Trigger function: hash any provided password into password_hash, never store plaintext
create or replace function public.hash_password_before_write()
returns trigger as $$
begin
  if NEW.password is not null and NEW.password <> '' then
    NEW.password_hash := crypt(NEW.password, gen_salt('bf'));
    NEW.password := null;
  end if;
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

commit;