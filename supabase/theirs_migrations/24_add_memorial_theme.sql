-- =============================================================================
-- THEIRS — migration 24: appearance atmosphere theme for memorials
-- =============================================================================

-- 1. Add theme column (defaulting to 'quiet' so existing memorials seamlessly use Quiet atmosphere)
alter table public.memorials
  add column if not exists theme text default 'quiet';

-- 2. Enforce constraint for the 6 valid atmospheres
alter table public.memorials drop constraint if exists memorials_theme_valid;
alter table public.memorials add constraint memorials_theme_valid
  check (theme is null or theme in ('quiet', 'warm', 'garden', 'classic', 'dusk', 'light'));
