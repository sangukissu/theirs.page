-- =============================================================================
-- THEIRS — migration 15: Close direct client mutation loopholes
-- Revokes direct browser/PostgREST mutation access on core tables (memorials,
-- media_items, timeline_events).
-- Enforces:
-- 1. Browser reads permitted data through RLS policies.
-- 2. All meaningful memorial, media, and timeline mutations must pass through
--    Theirs server APIs where paywall, quota, and authentication rules are authoritative.
-- 3. Attaches quota enforcement trigger to UPDATE on media_items.
-- =============================================================================

-- 1. Extend enforce_media_quota() trigger to also protect against direct UPDATEs
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
  -- Serialize quota-checked media insertions per memorial
  select is_paid
    into v_is_paid
  from public.memorials
  where id = NEW.memorial_id
  for update;

  if not found then
    raise exception 'Memorial % not found', NEW.memorial_id;
  end if;

  -- Paid memorials have no item-count cap here. Migration 16 separately
  -- enforces the 10 GiB original-upload entitlement per memorial.
  if coalesce(v_is_paid, false) = true then
    return NEW;
  end if;

  -- Free tier restrictions:
  -- 1. No audio or video
  if NEW.media_type in ('audio', 'video') then
    raise exception 'Audio and video media require the Complete plan.'
      using errcode = 'P0001';
  end if;

  -- 2. Maximum of 5 images
  if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and (OLD.media_type <> 'image' or OLD.memorial_id <> NEW.memorial_id)) then
    select count(*)
      into v_image_count
    from public.media_items
    where memorial_id = NEW.memorial_id
      and media_type = 'image';

    if v_image_count >= 5 then
      raise exception 'This memorial has reached the 5-photo limit on the free plan.'
        using errcode = 'P0001';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_enforce_media_quota on public.media_items;
create trigger trg_enforce_media_quota
  before insert on public.media_items
  for each row
  execute function public.enforce_media_quota();

drop trigger if exists trg_enforce_media_quota_update on public.media_items;
create trigger trg_enforce_media_quota_update
  before update on public.media_items
  for each row
  execute function public.enforce_media_quota();

-- 2. Revoke direct mutations on media_items
drop policy if exists "Memorial admins can manage media" on public.media_items;
drop policy if exists "Anyone can read media of accessible memorials" on public.media_items;
drop policy if exists "Public can view media of accessible memorials" on public.media_items;

create policy "Public can view media of accessible memorials"
  on public.media_items for select
  using (public.can_view_memorial(memorial_id));

revoke insert, update, delete on public.media_items from anon, authenticated;
grant select on public.media_items to anon, authenticated;
grant select, insert, update, delete on public.media_items to service_role;

-- 3. Revoke direct mutations on timeline_events
drop policy if exists "Memorial admins can manage timeline" on public.timeline_events;
drop policy if exists "Anyone can read timeline of accessible memorials" on public.timeline_events;
drop policy if exists "Public can view timeline of accessible memorials" on public.timeline_events;

create policy "Public can view timeline of accessible memorials"
  on public.timeline_events for select
  using (public.can_view_memorial(memorial_id));

revoke insert, update, delete on public.timeline_events from anon, authenticated;
grant select on public.timeline_events to anon, authenticated;
grant select, insert, update, delete on public.timeline_events to service_role;

-- 4. Revoke direct mutations on memorials (only server API can update sensitive/paid fields)
drop policy if exists "Only memorial owner can update memorial directly" on public.memorials;
drop policy if exists "Memorial admins can update their memorial" on public.memorials;
drop policy if exists "Only memorial owner can delete a memorial" on public.memorials;
drop policy if exists "Authenticated users can create memorials" on public.memorials;

revoke insert, update, delete on public.memorials from anon, authenticated;
grant select on public.memorials to anon, authenticated;
grant select, insert, update, delete on public.memorials to service_role;
