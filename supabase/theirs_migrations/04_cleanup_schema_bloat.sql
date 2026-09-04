-- ==============================================================================
-- Migration 04: Cleanup Schema Bloat & Align Schema with V1 Product Reality
-- ==============================================================================

-- 1. MEMORIALS: Remove phantom columns (birth_date, death_date, cover_photo_url)
-- Lifespans are celebrated as birth_year and death_year. Archival portrait is portrait_photo_url.
alter table public.memorials 
  drop column if exists birth_date,
  drop column if exists death_date,
  drop column if exists cover_photo_url;

-- 2. TIMELINE_EVENTS: Remove unused month/day, add missing location column
alter table public.timeline_events
  drop column if exists month,
  drop column if exists day,
  add column if not exists location text;

-- 3. MEDIA_ITEMS: Remove foreign key to albums, remove unused tagged_people and uploaded_by
drop index if exists idx_media_items_album;

alter table public.media_items
  drop constraint if exists media_items_album_id_fkey,
  drop column if exists album_id,
  drop column if exists tagged_people,
  drop column if exists uploaded_by;

-- 4. ALBUMS: Remove unused table (Theirs uses a unified media gallery filtered by format)
drop table if exists public.albums cascade;

-- 5. PEOPLE_IN_LIFE: Remove speculative connected_memorial_id
alter table public.people_in_life
  drop constraint if exists people_in_life_connected_memorial_id_fkey,
  drop column if exists connected_memorial_id;

-- 6. MEMORIES: Remove unused people_involved
alter table public.memories
  drop column if exists people_involved;
