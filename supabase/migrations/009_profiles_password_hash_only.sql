-- Migration: profiles table stores only password_hash, hashes any incoming password, never stores plaintext
-- Run in Supabase SQL editor or with psql

begin;

-- Ensure pgcrypto is available
create extension if not exists pgcrypto;

-- Create/repair profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text not null,
  role text not null check (role in ('user', 'admin')) default 'user',
  password_hash text,
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