-- =============================================================================
-- THEIRS — migration 17: durable text-length boundaries
-- Application validation remains the friendly first line; these constraints
-- close alternate-write and future-regression loopholes at the database layer.
-- =============================================================================

alter table public.memorials drop constraint if exists memorials_full_name_length;
alter table public.memorials add constraint memorials_full_name_length
  check (char_length(full_name) between 1 and 120);
alter table public.memorials drop constraint if exists memorials_preferred_name_length;
alter table public.memorials add constraint memorials_preferred_name_length
  check (preferred_name is null or char_length(preferred_name) <= 60);
alter table public.memorials drop constraint if exists memorials_location_length;
alter table public.memorials add constraint memorials_location_length
  check (location is null or char_length(location) <= 120);
alter table public.memorials drop constraint if exists memorials_headline_length;
alter table public.memorials add constraint memorials_headline_length
  check (headline is null or char_length(headline) <= 240);
alter table public.memorials drop constraint if exists memorials_biography_html_length;
alter table public.memorials add constraint memorials_biography_html_length
  check (biography is null or octet_length(biography) <= 98304);
alter table public.memorials drop constraint if exists memorials_successor_name_length;
alter table public.memorials add constraint memorials_successor_name_length
  check (successor_name is null or char_length(successor_name) <= 100);
alter table public.memorials drop constraint if exists memorials_successor_email_length;
alter table public.memorials add constraint memorials_successor_email_length
  check (successor_email is null or char_length(successor_email) <= 254);

alter table public.memories drop constraint if exists memories_author_name_length;
alter table public.memories add constraint memories_author_name_length
  check (char_length(author_name) between 1 and 100);
alter table public.memories drop constraint if exists memories_relationship_length;
alter table public.memories add constraint memories_relationship_length
  check (author_relationship is null or char_length(author_relationship) <= 80);
alter table public.memories drop constraint if exists memories_location_length;
alter table public.memories add constraint memories_location_length
  check (location is null or char_length(location) <= 120);
alter table public.memories drop constraint if exists memories_story_length;
alter table public.memories add constraint memories_story_length
  check (
    (contribution_type = 'tribute' and char_length(story) <= 3000)
    or (contribution_type = 'story' and octet_length(story) <= 98304)
  );

alter table public.timeline_events drop constraint if exists timeline_events_title_length;
alter table public.timeline_events add constraint timeline_events_title_length
  check (char_length(title) between 1 and 140);
alter table public.timeline_events drop constraint if exists timeline_events_description_length;
alter table public.timeline_events add constraint timeline_events_description_length
  check (description is null or char_length(description) <= 3000);
alter table public.timeline_events drop constraint if exists timeline_events_location_length;
alter table public.timeline_events add constraint timeline_events_location_length
  check (location is null or char_length(location) <= 120);

alter table public.media_items drop constraint if exists media_items_caption_length;
alter table public.media_items add constraint media_items_caption_length
  check (caption is null or char_length(caption) <= 1000);
alter table public.media_items drop constraint if exists media_items_album_length;
alter table public.media_items add constraint media_items_album_length
  check (album is null or char_length(album) <= 80);
alter table public.media_items drop constraint if exists media_items_location_length;
alter table public.media_items add constraint media_items_location_length
  check (location is null or char_length(location) <= 120);

alter table public.collaborators drop constraint if exists collaborators_email_length;
alter table public.collaborators add constraint collaborators_email_length
  check (char_length(email) <= 254);
alter table public.user_profiles drop constraint if exists user_profiles_email_length;
alter table public.user_profiles add constraint user_profiles_email_length
  check (email is null or char_length(email) <= 254);
