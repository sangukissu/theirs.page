-- ==============================================================================
-- 27_feedback_support_trustpilot.sql
-- Migration: Feedback, Support Requests, and Trustpilot Review Tracking
-- Fully idempotent & resilient (safe to rerun on any project)
-- ==============================================================================

-- 1. USER FEEDBACK TABLE (Theirs Product Feedback)
create table if not exists public.user_feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  memorial_id uuid,
  rating integer check (rating >= 1 and rating <= 5),
  feedback_text text,
  working_well text,
  could_be_better text,
  page_path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all required columns exist in case user_feedback was partially created previously
alter table public.user_feedback add column if not exists memorial_id uuid;
alter table public.user_feedback add column if not exists rating integer check (rating >= 1 and rating <= 5);
alter table public.user_feedback add column if not exists feedback_text text;
alter table public.user_feedback add column if not exists working_well text;
alter table public.user_feedback add column if not exists could_be_better text;
alter table public.user_feedback add column if not exists page_path text;
alter table public.user_feedback add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- Drop NOT NULL constraint on rating if it was set by legacy schemas
alter table public.user_feedback alter column rating drop not null;

-- Safely add memorial foreign key if public.memorials exists in this database
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'memorials') then
    if not exists (
      select 1 from information_schema.table_constraints
      where constraint_name = 'user_feedback_memorial_id_fkey'
    ) then
      alter table public.user_feedback
        add constraint user_feedback_memorial_id_fkey
        foreign key (memorial_id) references public.memorials(id) on delete set null;
    end if;
  end if;
end $$;

-- Indexes for user feedback
create index if not exists idx_user_feedback_user_id on public.user_feedback(user_id);
create index if not exists idx_user_feedback_memorial_id on public.user_feedback(memorial_id);
create index if not exists idx_user_feedback_created_at on public.user_feedback(created_at desc);

-- RLS on user_feedback
alter table public.user_feedback enable row level security;

drop policy if exists "Users can insert their own feedback" on public.user_feedback;
create policy "Users can insert their own feedback"
  on public.user_feedback
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own feedback" on public.user_feedback;
create policy "Users can view their own feedback"
  on public.user_feedback
  for select
  using (auth.uid() = user_id);


-- 2. SUPPORT REQUESTS TABLE
create table if not exists public.support_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  memorial_id uuid,
  category text not null check (category in ('General', 'Billing', 'Memorial', 'Technical')),
  subject text not null,
  message text not null,
  page_path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all required columns exist in case support_requests was partially created previously
alter table public.support_requests add column if not exists memorial_id uuid;
alter table public.support_requests add column if not exists category text not null check (category in ('General', 'Billing', 'Memorial', 'Technical'));
alter table public.support_requests add column if not exists subject text not null;
alter table public.support_requests add column if not exists message text not null;
alter table public.support_requests add column if not exists page_path text;
alter table public.support_requests add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- Safely add memorial foreign key if public.memorials exists in this database
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'memorials') then
    if not exists (
      select 1 from information_schema.table_constraints
      where constraint_name = 'support_requests_memorial_id_fkey'
    ) then
      alter table public.support_requests
        add constraint support_requests_memorial_id_fkey
        foreign key (memorial_id) references public.memorials(id) on delete set null;
    end if;
  end if;
end $$;

-- Indexes for support requests
create index if not exists idx_support_requests_user_id on public.support_requests(user_id);
create index if not exists idx_support_requests_created_at on public.support_requests(created_at desc);

-- RLS on support_requests
alter table public.support_requests enable row level security;

drop policy if exists "Users can insert their own support requests" on public.support_requests;
create policy "Users can insert their own support requests"
  on public.support_requests
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own support requests" on public.support_requests;
create policy "Users can view their own support requests"
  on public.support_requests
  for select
  using (auth.uid() = user_id);


-- 3. MEMORIALS TABLE EXTENSIONS FOR REVIEWS & LIFECYCLE (Guarded by table existence)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'memorials') then
    alter table public.memorials add column if not exists published_at timestamp with time zone;
    alter table public.memorials add column if not exists review_eligible_at timestamp with time zone;
    alter table public.memorials add column if not exists review_invite_sent_at timestamp with time zone;
    alter table public.memorials add column if not exists review_invite_clicked_at timestamp with time zone;
    alter table public.memorials add column if not exists review_reminder_sent_at timestamp with time zone;

    -- Backfill published_at for existing published memorials
    update public.memorials
    set published_at = updated_at
    where status = 'published'
      and published_at is null;

    -- Partial indexes for fast cron scanning of review invitations
    create index if not exists idx_memorials_review_invites
      on public.memorials(is_paid, status, published_at)
      where is_paid = true and status = 'published' and review_invite_sent_at is null;

    create index if not exists idx_memorials_review_reminders
      on public.memorials(is_paid, status, review_invite_sent_at)
      where is_paid = true and status = 'published' and review_invite_clicked_at is null and review_reminder_sent_at is null;
  else
    raise notice 'Table public.memorials does not exist in this database. Skipping memorial table modifications.';
  end if;
end $$;
