-- Migration: ensure username exists, backfill, deduplicate, and add case-insensitive unique index
-- Run this in Supabase Dashboard → SQL Editor or via your migration tooling

begin;

-- 1) Ensure column exists (idempotent)
alter table public.profiles
  add column if not exists username text;

-- 2) Backfill username for NULLs using email local-part + id suffix to help uniqueness
update public.profiles
set username = concat(split_part(email, '@', 1), '_', substring(id::text from 1 for 8))
where username is null;

-- 3) Resolve case-insensitive duplicates by appending id suffix to later rows
with numbered as (
  select id, username, lower(username) as uname_l, row_number() over (partition by lower(username) order by id) rn
  from public.profiles
  where username is not null
)
update public.profiles p
set username = concat(p.username, '_', substring(p.id::text from 1 for 8))
from numbered n
where p.id = n.id and n.rn > 1;

-- 4) Drop any existing case-sensitive unique index that may block creating a case-insensitive one
drop index if exists idx_profiles_username_unique;

-- 5) Create a case-insensitive unique index on lower(username) (only for non-null usernames)
create unique index if not exists idx_profiles_username_lower_unique
  on public.profiles ((lower(username)))
  where username is not null;

commit;

-- NOTE: If the index creation fails due to remaining duplicates, inspect duplicates with:
-- select lower(username), count(*) from public.profiles group by lower(username) having count(*) > 1;
