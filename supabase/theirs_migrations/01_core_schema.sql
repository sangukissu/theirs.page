-- ==============================================================================
-- THEIRS (theirs.page) — CORE DATABASE SCHEMA
-- Migration: 01_core_schema.sql
-- Description: Sets up core tables, relations, indexes, and triggers for theirs.page
-- Compatible with PostgreSQL 15+ and modern Supabase Auth
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. USER PROFILES (Linked to Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text,
  full_name text default '',
  avatar_url text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User auto-creation trigger from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (user_id) do update set
    email = excluded.email,
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. MEMORIALS (The Life Archive)
create table if not exists public.memorials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null,
  full_name text not null,
  preferred_name text,
  birth_year integer,
  death_year integer,
  headline text,
  biography text,
  location text,
  portrait_photo_url text,
  privacy text not null default 'public' check (privacy in ('public', 'unlisted', 'private')),
  access_pin_hash text,
  successor_name text,
  successor_email text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_paid boolean not null default false,
  paid_at timestamp with time zone,
  section_settings jsonb default '{"story": true, "tributes": true, "timeline": true, "gallery": true, "stories": true}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Idempotent column additions if table was created previously
alter table public.memorials add column if not exists section_settings jsonb default '{"story": true, "tributes": true, "timeline": true, "gallery": true, "stories": true}'::jsonb;
alter table public.memorials add column if not exists location text;
alter table public.memorials drop column if exists birth_date;
alter table public.memorials drop column if exists death_date;
alter table public.memorials drop column if exists cover_photo_url;

create index if not exists idx_memorials_slug on public.memorials(slug);
create index if not exists idx_memorials_owner on public.memorials(owner_id);
create index if not exists idx_memorials_status on public.memorials(status, privacy);


-- 4. COLLABORATORS (Co-admins and Family Stewards)
create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'contributor' check (role in ('co_admin', 'contributor')),
  invitation_accepted boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(memorial_id, email)
);

create index if not exists idx_collaborators_memorial on public.collaborators(memorial_id);
create index if not exists idx_collaborators_user on public.collaborators(user_id);


-- 5. MEMORIES (The Heart of Theirs: Stories & Condolence Tributes)
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  author_name text not null,
  author_email text,
  author_relationship text,
  story text not null,
  approx_year integer,
  location text,
  photo_url text,
  photo_urls jsonb default '[]'::jsonb,
  tribute_type text check (tribute_type in ('flower', 'note', 'photo', 'candle')),
  contribution_type text default 'tribute' check (contribution_type in ('tribute', 'story')),
  status text not null default 'pending_approval' check (status in ('pending_approval', 'approved', 'rejected')),
  visibility text not null default 'everyone' check (visibility in ('everyone', 'family_only')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone
);

-- Idempotent column additions if table was created previously
alter table public.memories add column if not exists photo_urls jsonb default '[]'::jsonb;
alter table public.memories add column if not exists tribute_type text check (tribute_type in ('flower', 'note', 'photo', 'candle'));
alter table public.memories add column if not exists contribution_type text default 'tribute' check (contribution_type in ('tribute', 'story'));
alter table public.memories drop column if exists people_involved;

create index if not exists idx_memories_memorial_status on public.memories(memorial_id, status);
create index if not exists idx_memories_created_at on public.memories(created_at desc);


-- 6. MEDIA ITEMS (Photos, Audio Voicemails, Clips with Album categorization)
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  media_type text not null default 'image' check (media_type in ('image', 'audio', 'video')),
  url text not null,
  caption text,
  approx_year integer,
  location text,
  album text,
  is_pinned boolean default false,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Idempotent column additions & legacy cleanup
alter table public.media_items add column if not exists album text;
alter table public.media_items add column if not exists is_pinned boolean default false;
alter table public.media_items drop column if exists album_id;
alter table public.media_items drop column if exists tagged_people;
alter table public.media_items drop column if exists uploaded_by;

drop index if exists public.idx_media_items_album;
drop table if exists public.albums cascade;

create index if not exists idx_media_items_memorial on public.media_items(memorial_id);
create index if not exists idx_media_items_order on public.media_items(memorial_id, is_pinned desc, order_index asc);
create index if not exists idx_media_items_browse on public.media_items(memorial_id, media_type, album, is_pinned desc, order_index asc, created_at asc, id asc);


-- 7. LIFE TIMELINE (Structured milestone moments)
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  year integer not null,
  title text not null,
  description text,
  location text,
  photo_url text,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Idempotent column additions & legacy cleanup
alter table public.timeline_events add column if not exists location text;
alter table public.timeline_events drop column if exists month;
alter table public.timeline_events drop column if exists day;

create index if not exists idx_timeline_events_memorial on public.timeline_events(memorial_id, year, order_index);


-- 8. CLEANUP LEGACY TABLES
drop table if exists public.people_in_life cascade;
drop index if exists public.idx_people_in_life_memorial;


-- 9. PRIVATE CARETAKER MESSAGES
create table if not exists public.caretaker_messages (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  sender_name text not null check (char_length(sender_name) between 1 and 100),
  sender_email text not null check (char_length(sender_email) between 3 and 254),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  read_at timestamp with time zone
);

create index if not exists idx_caretaker_messages_inbox on public.caretaker_messages(memorial_id, status, created_at desc);


-- 10. PAYMENTS (Dodo Payments Integration)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  memorial_id uuid references public.memorials(id) on delete set null,
  payment_id text unique not null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'completed',
  customer_email text,
  payment_method text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_memorial on public.payments(memorial_id);
