-- =============================================================================
-- THEIRS — migration 19: creator relationship & progressive exact date precision
-- =============================================================================

-- 1. Creator relationship to the memorial (stored per memorial, not on user_profiles)
alter table public.memorials
  add column if not exists creator_relationship text;

alter table public.memorials drop constraint if exists memorials_creator_relationship_length;
alter table public.memorials add constraint memorials_creator_relationship_length
  check (creator_relationship is null or char_length(creator_relationship) <= 80);

-- 2. Progressive exact date precision (nullable month/day, keeping year as primary default)
alter table public.memorials
  add column if not exists birth_month integer;

alter table public.memorials drop constraint if exists memorials_birth_month_valid;
alter table public.memorials add constraint memorials_birth_month_valid
  check (birth_month is null or (birth_month between 1 and 12));

alter table public.memorials
  add column if not exists birth_day integer;

alter table public.memorials drop constraint if exists memorials_birth_day_valid;
alter table public.memorials add constraint memorials_birth_day_valid
  check (birth_day is null or (birth_day between 1 and 31));

alter table public.memorials
  add column if not exists death_month integer;

alter table public.memorials drop constraint if exists memorials_death_month_valid;
alter table public.memorials add constraint memorials_death_month_valid
  check (death_month is null or (death_month between 1 and 12));

alter table public.memorials
  add column if not exists death_day integer;

alter table public.memorials drop constraint if exists memorials_death_day_valid;
alter table public.memorials add constraint memorials_death_day_valid
  check (death_day is null or (death_day between 1 and 31));

-- 3. Relationship support for collaborators / family stewards
alter table public.collaborators
  add column if not exists relationship text;

alter table public.collaborators drop constraint if exists collaborators_relationship_length;
alter table public.collaborators add constraint collaborators_relationship_length
  check (relationship is null or char_length(relationship) <= 80);
