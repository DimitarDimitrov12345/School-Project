-- Migration: add username column to profiles, backfill, and add unique index
-- Run this in Supabase Dashboard → SQL Editor

-- 1) Add username column if it doesn't exist
alter table public.profiles
  add column if not exists username text;

-- 2) Backfill username for existing rows using email local-part + short id suffix to ensure uniqueness
update public.profiles
set username = concat(split_part(email, '@', 1), '_', substring(id::text from 1 for 8))
where username is null;

-- 3) Create a unique index on username to enforce uniqueness (if not exists)
create unique index if not exists idx_profiles_username_unique on public.profiles(username);

-- Note: If you prefer different backfill logic (e.g., just the local-part without suffix), modify step 2 accordingly.
