-- Profiles table: stores role (user | admin). Only users can self-register; admins are created manually.
-- Run this in Supabase Dashboard → SQL Editor.

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  email text not null,
  role text not null check (role in ('user', 'admin')) default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (e.g. display name) but NOT role
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Only allow INSERT when role is 'user' (self-registration is always user)
-- Admins must be created manually via SQL or Dashboard.
create policy "Allow insert profile with role user only"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and role = 'user'
  );

-- Trigger: create profile on signup (with role = user)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Try to pick a username from the auth user's metadata, if provided during sign-up
  insert into public.profiles (id, username, email, role)
  values (new.id, (new.raw_user_meta_data ->> 'username'), new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Run this only if you haven't already enabled auth trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: create an admin user manually (replace with real uuid from auth.users after creating user in Dashboard)
-- insert into public.profiles (id, email, role) values ('uuid-from-auth-users', 'admin@yourdomain.com', 'admin');
-- Or update existing user to admin:
-- update public.profiles set role = 'admin' where email = 'admin@yourdomain.com';
