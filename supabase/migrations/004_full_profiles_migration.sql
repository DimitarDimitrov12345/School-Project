-- Full idempotent migration: create `profiles` table, policies, trigger, and username maintenance
-- Run this in Supabase Dashboard → SQL Editor (as a DB admin) or via your migration tooling

begin;

-- 1) Create profiles table (idempotent)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text not null,
  role text not null check (role in ('user', 'admin')) default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Ensure `username` column exists (defensive)
alter table public.profiles
  add column if not exists username text;

-- 3) Enable RLS and recreate policies (drop-if-exists then create to be idempotent)
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

-- 4) Replace the trigger function with a robust, non-failing implementation
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

  -- Try to insert; if a profile already exists for this id, update timestamps and keep existing values
  insert into public.profiles (id, username, email, role, created_at, updated_at)
  values (new.id, v_username, v_email, 'user', now(), now())
  on conflict (id) do update
    set updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- 5) Recreate the trigger (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Backfill usernames for existing rows that have NULL or empty username
update public.profiles
set username = concat(split_part(email, '@', 1), '_', substring(id::text from 1 for 8))
where username is null or username = '';

-- 7) Resolve case-insensitive duplicates by appending id suffix to later rows
with numbered as (
  select id, username, lower(username) as uname_l, row_number() over (partition by lower(username) order by id) rn
  from public.profiles
  where username is not null and username <> ''
)
update public.profiles p
set username = concat(p.username, '_', substring(p.id::text from 1 for 8))
from numbered n
where p.id = n.id and n.rn > 1;

-- 8) Remove any old case-sensitive unique index and create case-insensitive unique index
drop index if exists idx_profiles_username_unique;
create unique index if not exists idx_profiles_username_lower_unique
  on public.profiles ((lower(username)))
  where username is not null and username <> '';

commit;

-- Helpful diagnostics (run separately if needed):
-- select count(*) from public.profiles;
-- select lower(username), count(*) from public.profiles group by lower(username) having count(*) > 1;
