-- Migration: fixtures_cache table for storing fixture JSON data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--
-- This replaces filesystem storage (saved-fixtures/) with a database table
-- so that Vercel serverless functions can persist data.

begin;

-- Create fixtures_cache table
create table if not exists public.fixtures_cache (
  filename text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.fixtures_cache enable row level security;

-- Policy: anyone can read fixtures (public data)
drop policy if exists "Public can read fixtures" on public.fixtures_cache;
create policy "Public can read fixtures"
  on public.fixtures_cache for select
  using (true);

-- Policy: anyone can insert fixtures (needed for API functions with anon key)
drop policy if exists "Anyone can insert fixtures" on public.fixtures_cache;
create policy "Anyone can insert fixtures"
  on public.fixtures_cache for insert
  with check (true);

-- Policy: anyone can update fixtures
drop policy if exists "Anyone can update fixtures" on public.fixtures_cache;
create policy "Anyone can update fixtures"
  on public.fixtures_cache for update
  using (true);

-- Policy: anyone can delete fixtures
drop policy if exists "Anyone can delete fixtures" on public.fixtures_cache;
create policy "Anyone can delete fixtures"
  on public.fixtures_cache for delete
  using (true);

-- Index for faster date-based lookups
create index if not exists idx_fixtures_cache_filename on public.fixtures_cache(filename);

commit;
