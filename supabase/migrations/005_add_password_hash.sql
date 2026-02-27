-- Migration: add password_hash column and trigger to bcrypt-hash plaintext values
-- WARNING: Prefer using Supabase Auth for password management. Only use this if you must store hashes yourself.

begin;

-- 0) Ensure pgcrypto is available for crypt() and gen_salt()
create extension if not exists pgcrypto;

-- 1) Add password_hash column (idempotent)
alter table public.profiles
  add column if not exists password_hash text;

-- 2) Create trigger function that bcrypt-hashes plaintext values on INSERT/UPDATE
create or replace function public.hash_profile_password()
returns trigger as $$
begin
  -- If password_hash is null, nothing to do
  if NEW.password_hash is null then
    return NEW;
  end if;

  -- If value already looks like a bcrypt hash ($2a$, $2b$, $2y$), don't re-hash
  if NEW.password_hash !~ '^\\$2[aby]\\$' then
    NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- 3) Attach trigger to profiles (idempotent)
drop trigger if exists hash_password_on_profiles on public.profiles;
create trigger hash_password_on_profiles
  before insert or update on public.profiles
  for each row execute function public.hash_profile_password();

commit;

-- Usage notes:
-- - Do NOT store plaintext passwords anywhere else (logs, client-side storage).
-- - Prefer Supabase Auth: it handles hashing and secure auth flows.
-- - To verify a submitted password in SQL you can use: crypt(candidate_password, password_hash) = password_hash
