-- ==============================================================================
-- THEIRS (theirs.page) — STORAGE BUCKET & POLICIES
-- Migration: 03_storage_setup.sql
-- Description: Sets up a private storage bucket. Application routes enforce
--              memorial privacy; raw object URLs must not bypass those checks.
-- Re-runnable: Safe to execute repeatedly without "already exists" errors.
-- ==============================================================================

-- 1. CREATE OR UPDATE STORAGE BUCKET
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'theirs-media',
  'theirs-media',
  false,
  52428800, -- 50MB max file size per item
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800;


-- 2. STORAGE POLICIES (Idempotent: drop if exists before create)
drop policy if exists "Public read access for theirs-media" on storage.objects;
drop policy if exists "Authenticated users can upload media" on storage.objects;
drop policy if exists "Users can update their own uploads" on storage.objects;
drop policy if exists "Users can delete their own uploads" on storage.objects;

-- No direct browser policies are created. The server-side R2/media pipeline is
-- the single authorization boundary for current Theirs media.
