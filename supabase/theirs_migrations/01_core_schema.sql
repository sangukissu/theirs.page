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
  preferred_name text, -- Nickname or what family called them ("Bob", "Nana")
  birth_date date,
  death_date date,
  birth_year integer,
  death_year integer,
  headline text, -- Defining quote or essence: "He could fix almost anything..."
  biography text, -- Narrative life story
  portrait_photo_url text, -- Primary portrait
  cover_photo_url text, -- Optional banner or ambient photo
  privacy text not null default 'public' check (privacy in ('public', 'unlisted', 'private')),
  access_pin_hash text, -- Optional hashed PIN for private memorials
  successor_name text, -- Long-term caretaker if owner passes
  successor_email text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_paid boolean not null default false,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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


-- 5. MEMORIES (The Heart of Theirs)
-- Contributed by family and friends; approved by memorial admins
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  author_name text not null,
  author_email text,
  author_relationship text, -- e.g. "Daughter", "Childhood Friend", "Colleague"
  story text not null,
  approx_year integer,
  location text,
  people_involved text,
  photo_url text,
  status text not null default 'pending_approval' check (status in ('pending_approval', 'approved', 'rejected')),
  visibility text not null default 'everyone' check (visibility in ('everyone', 'family_only')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone
);

create index if not exists idx_memories_memorial_status on public.memories(memorial_id, status);
create index if not exists idx_memories_created_at on public.memories(created_at desc);


-- 6. PHOTO ALBUMS
-- Categorized collections ("Childhood", "School", "Wedding", "Our Family", "Work", "Travels")
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_albums_memorial on public.albums(memorial_id, order_index);


-- 7. MEDIA ITEMS (Photos, Audio Voicemails, Clips)
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  album_id uuid references public.albums(id) on delete set null,
  media_type text not null default 'image' check (media_type in ('image', 'audio', 'video')),
  url text not null,
  caption text,
  approx_year integer,
  location text,
  tagged_people text,
  uploaded_by text,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_media_items_memorial on public.media_items(memorial_id);
create index if not exists idx_media_items_album on public.media_items(album_id, order_index);


-- 8. LIFE TIMELINE
-- Structured milestone moments: "1952: Born in Jaipur", "1974: Married Meena"
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  year integer not null,
  month integer,
  day integer,
  title text not null,
  description text,
  photo_url text,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_timeline_events_memorial on public.timeline_events(memorial_id, year, order_index);


-- 9. PEOPLE IN THEIR LIFE
-- Visual relationships: "Meena — Wife", "Rahul — Son", "David — Best Friend"
create table if not exists public.people_in_life (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  name text not null,
  relationship text not null,
  photo_url text,
  note text,
  connected_memorial_id uuid references public.memorials(id) on delete set null, -- future life web
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_people_in_life_memorial on public.people_in_life(memorial_id, order_index);


-- 10. GUESTBOOK
-- Condolences, thoughts, and messages of presence
create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  author_name text not null,
  author_email text,
  message text not null,
  status text not null default 'pending_approval' check (status in ('pending_approval', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_guestbook_memorial on public.guestbook_entries(memorial_id, status);


-- 11. PAYMENTS (Dodo Payments Integration)
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
