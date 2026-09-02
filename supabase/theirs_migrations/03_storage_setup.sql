-- ==============================================================================
-- THEIRS (theirs.page) — STORAGE BUCKET & POLICIES
-- Migration: 03_storage_setup.sql
-- Description: Sets up the public storage bucket for portraits, album images,
--              audio recordings, and memory attachments.
-- Re-runnable: Safe to execute repeatedly without "already exists" errors.
-- ==============================================================================

-- 1. CREATE OR UPDATE STORAGE BUCKET
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'theirs-media',
  'theirs-media',
  true,
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
  public = true,
  file_size_limit = 52428800;


-- 2. STORAGE POLICIES (Idempotent: drop if exists before create)
drop policy if exists "Public read access for theirs-media" on storage.objects;
create policy "Public read access for theirs-media"
  on storage.objects for select
  using (bucket_id = 'theirs-media');

drop policy if exists "Authenticated users can upload media" on storage.objects;
create policy "Authenticated users can upload media"
  on storage.objects for insert
  with check (
    bucket_id = 'theirs-media'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update their own uploads" on storage.objects;
create policy "Users can update their own uploads"
  on storage.objects for update
  using (
    bucket_id = 'theirs-media'
    and auth.uid() = owner
  );

drop policy if exists "Users can delete their own uploads" on storage.objects;
create policy "Users can delete their own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'theirs-media'
    and auth.uid() = owner
  );
