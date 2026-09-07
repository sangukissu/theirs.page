-- =============================================================================
-- THEIRS - migration 25: memorial cover settings (clean, pattern, their_world)
-- =============================================================================

-- 1. Add cover_settings jsonb column defaulting to clean
alter table public.memorials
  add column if not exists cover_settings jsonb default '{"type": "clean"}'::jsonb;
