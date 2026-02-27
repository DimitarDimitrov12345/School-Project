-- Migration: ensure only bcrypt password hash is stored
-- Behavior:
--  - If `password` column exists, backfill `password_hash` and drop `password`.
--  - Adds `plain_password` write-only helper column that is hashed by trigger into `password_hash` and nulled.
--  - Ensures `password_hash` exists and `pgcrypto` extension is enabled.

begin;

-- 0) Ensure pgcrypto available
create extension if not exists pgcrypto;

-- 1) Ensure password_hash column exists
alter table public.profiles
  add column if not exists password_hash text;

-- 2) If an old `password` column exists, backfill and drop it
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'password'
  ) then
    -- Backfill password_hash from plaintext `password` where password_hash is null
    execute 'update public.profiles set password_hash = crypt(password, gen_salt(''bf'')) where password is not null and (password_hash is null or password_hash = '''')';
    -- Drop the plaintext password column
    execute 'alter table public.profiles drop column if exists password';
  end if;
end$$;

-- 3) Add a transient `plain_password` column that the application can write to; trigger will hash it and null it before commit
alter table public.profiles add column if not exists plain_password text;

-- 4) Revoke select on `plain_password` from public role to reduce accidental exposure (admin can still access)
revoke select (plain_password) on public.profiles from public;

-- 5) Trigger function: hash plain_password into password_hash, avoid double-hashing
create or replace function public.hash_profile_plain_password()
returns trigger as $$
begin
  -- If plain_password provided, hash it into password_hash and remove plaintext
  if NEW.plain_password is not null and NEW.plain_password <> '' then
    NEW.password_hash := crypt(NEW.plain_password, gen_salt('bf'));
    NEW.plain_password := null;
  end if;

  -- If password_hash provided but not a bcrypt hash, hash it
  if NEW.password_hash is not null and NEW.password_hash !~ '^\\$2[aby]\\$' then
    NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- 6) Attach trigger (idempotent)
drop trigger if exists hash_plain_password_on_profiles on public.profiles;
create trigger hash_plain_password_on_profiles
  before insert or update on public.profiles
  for each row execute function public.hash_profile_plain_password();

commit;

-- Usage guidance:
-- - When creating/updating a user row directly, write plaintext into `plain_password` (NOT `password_hash`).
--   The trigger will replace `plain_password` with NULL and store the bcrypt hash in `password_hash`.
-- - Do NOT log plaintext passwords, and prefer Supabase Auth instead of manual password management.
-- - To verify in SQL: select crypt('candidate', password_hash) = password_hash from public.profiles where id = '<uuid>';
