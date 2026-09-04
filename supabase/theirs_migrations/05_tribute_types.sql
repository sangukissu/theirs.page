-- ==============================================================================
-- 05_tribute_types.sql: Support ritual tribute tokens (flower, note, photo)
-- ==============================================================================

alter table public.memories 
  add column if not exists tribute_type text default 'flower' 
  check (tribute_type in ('flower', 'note', 'photo', 'candle'));
