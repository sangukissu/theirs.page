-- ==============================================================================
-- THEIRS (theirs.page) — ADD LOCATION TO MEMORIALS
-- Migration: 05_add_memorial_location.sql
-- Description: Adds location column to public.memorials for home / region.
-- Re-runnable: 100% idempotent.
-- ==============================================================================

alter table public.memorials add column if not exists location text;

-- Signal PostgREST to refresh its schema cache immediately
notify pgrst, 'reload schema';
