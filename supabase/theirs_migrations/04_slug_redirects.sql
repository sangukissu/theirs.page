-- ==============================================================================
-- 04_SLUG_REDIRECTS.SQL — Idempotent migration for memorial URL change protection
-- ==============================================================================

-- 1. Add slug_change_count to memorials table if not exists
alter table public.memorials
  add column if not exists slug_change_count integer not null default 0;

-- 2. Create memorial_slug_redirects table
create table if not exists public.memorial_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  old_slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Indexes for fast lookup on old_slug and memorial_id
create index if not exists idx_memorial_slug_redirects_old_slug on public.memorial_slug_redirects(old_slug);
create index if not exists idx_memorial_slug_redirects_memorial_id on public.memorial_slug_redirects(memorial_id);

-- 4. Enable Row Level Security
alter table public.memorial_slug_redirects enable row level security;

-- Public can read redirects so anonymous visitors / QR scanners can be redirected
drop policy if exists "Public can read slug redirects" on public.memorial_slug_redirects;
create policy "Public can read slug redirects"
  on public.memorial_slug_redirects
  for select
  using (true);

-- Only service role / server APIs can insert, update, or delete redirects
drop policy if exists "Service role manages slug redirects" on public.memorial_slug_redirects;
create policy "Service role manages slug redirects"
  on public.memorial_slug_redirects
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
