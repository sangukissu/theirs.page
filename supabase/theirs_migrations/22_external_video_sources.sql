-- =============================================================================
-- THEIRS — migration 22: explicit external-video references
-- =============================================================================

alter table public.media_items
  add column if not exists source_type text not null default 'uploaded';
alter table public.media_items
  add column if not exists external_provider text;
alter table public.media_items
  add column if not exists external_id text;
alter table public.media_items
  add column if not exists external_url text;

alter table public.media_items drop constraint if exists media_items_source_type_check;
alter table public.media_items add constraint media_items_source_type_check
  check (source_type in ('uploaded', 'youtube'));
alter table public.media_items drop constraint if exists media_items_external_source_check;
alter table public.media_items add constraint media_items_external_source_check check (
  (source_type = 'uploaded' and external_provider is null and external_id is null and external_url is null)
  or
  (source_type = 'youtube' and media_type = 'video' and external_provider = 'youtube'
    and external_id ~ '^[A-Za-z0-9_-]{11}$' and external_url is not null and url = external_url)
);

alter table public.memories
  add column if not exists media_source_type text not null default 'none';
alter table public.memories
  add column if not exists external_provider text;
alter table public.memories
  add column if not exists external_id text;
alter table public.memories
  add column if not exists external_url text;

alter table public.memories drop constraint if exists memories_media_source_type_check;
alter table public.memories add constraint memories_media_source_type_check
  check (media_source_type in ('none', 'uploaded', 'youtube'));
alter table public.memories drop constraint if exists memories_external_source_check;
alter table public.memories add constraint memories_external_source_check check (
  (media_source_type <> 'youtube' and external_provider is null and external_id is null and external_url is null)
  or
  (media_source_type = 'youtube' and external_provider = 'youtube'
    and external_id ~ '^[A-Za-z0-9_-]{11}$' and external_url is not null)
);

create index if not exists idx_media_items_external_source
  on public.media_items(external_provider, external_id)
  where source_type = 'youtube';
create unique index if not exists idx_media_items_one_youtube_per_memory
  on public.media_items(source_memory_id)
  where source_type = 'youtube' and source_memory_id is not null;
create index if not exists idx_memories_external_source
  on public.memories(external_provider, external_id)
  where media_source_type = 'youtube';

update public.memories
   set media_source_type = 'uploaded'
 where media_source_type = 'none'
   and (
     photo_url is not null or
     (jsonb_typeof(photo_urls) = 'array' and jsonb_array_length(photo_urls) > 0)
   );

create or replace function public.set_memory_media_source_type()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.external_provider = 'youtube' then
    new.media_source_type := 'youtube';
  elsif new.photo_url is not null or
        (jsonb_typeof(new.photo_urls) = 'array' and jsonb_array_length(new.photo_urls) > 0) then
    new.media_source_type := 'uploaded';
  else
    new.media_source_type := 'none';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_memory_media_source_type on public.memories;
create trigger trg_set_memory_media_source_type
before insert or update of photo_url, photo_urls, external_provider, external_id, external_url
on public.memories
for each row execute function public.set_memory_media_source_type();

-- External YouTube references use no archived storage and remain available on
-- Free memorials. Native audio/video continues to use the existing plan gate.
create or replace function public.enforce_media_quota()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_is_paid boolean;
  v_image_count integer;
begin
  select is_paid into v_is_paid
    from public.memorials
   where id = new.memorial_id
   for update;
  if not found then
    raise exception 'Memorial % not found.', new.memorial_id using errcode = 'P0002';
  end if;

  if new.source_type = 'youtube' or v_is_paid is true then
    return new;
  end if;
  if new.media_type in ('audio', 'video') then
    raise exception 'Audio and video require the Complete plan.' using errcode = 'P0001';
  end if;

  if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and (OLD.media_type <> 'image' or OLD.memorial_id <> NEW.memorial_id)) then
    select count(*) into v_image_count
      from public.media_items
     where memorial_id = new.memorial_id
       and media_type = 'image';
    if v_image_count >= 5 then
      raise exception 'This memorial has reached the 5-photo limit on the free plan.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
