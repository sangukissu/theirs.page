-- =============================================================================
-- THEIRS — migration 23: resumable upload recovery and moderation hardening
-- =============================================================================

-- Existing upload-session reservations may still carry the legacy 30-minute
-- ledger expiry. Bring them forward before normal cleanup can discard them.
update public.memorial_storage_ledger as ledger
   set expires_at = greatest(ledger.expires_at, session.expires_at)
  from public.media_upload_sessions as session
 where ledger.reservation_key = 'upload-session:' || session.id::text
   and ledger.memorial_id = session.memorial_id
   and ledger.status = 'reserved'
   and session.status in ('created', 'uploading', 'uploaded', 'verifying', 'finalizing');

-- Reserve upload-session storage with the same explicit expiry as the durable
-- session. The memorial row lock preserves the existing atomic 10 GiB limit,
-- including idempotent retries of the same reservation key.
create or replace function public.reserve_media_upload_session_storage(
  p_memorial_id uuid,
  p_reservation_key text,
  p_original_bytes bigint,
  p_expires_at timestamptz
) returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.memorial_storage_ledger%rowtype;
  v_used bigint;
  v_limit constant bigint := 10737418240; -- 10 GiB
begin
  if p_original_bytes < 1 or
     p_reservation_key !~ '^upload-session:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or
     p_expires_at <= now() or
     p_expires_at > now() + interval '24 hours' then
    raise exception 'Invalid upload storage reservation.' using errcode = '22023';
  end if;

  perform 1 from public.memorials where id = p_memorial_id for update;
  if not found then
    raise exception 'Memorial not found.' using errcode = 'P0002';
  end if;

  select * into v_existing
    from public.memorial_storage_ledger
   where reservation_key = p_reservation_key
   for update;

  if found and (
    v_existing.memorial_id <> p_memorial_id or
    v_existing.status <> 'reserved' or
    v_existing.original_bytes <> p_original_bytes
  ) then
    raise exception 'Storage reservation identity mismatch.' using errcode = '22023';
  end if;

  delete from public.memorial_storage_ledger
   where memorial_id = p_memorial_id
     and status = 'reserved'
     and expires_at <= now()
     and reservation_key <> p_reservation_key;

  select coalesce(sum(original_bytes), 0) into v_used
    from public.memorial_storage_ledger
   where memorial_id = p_memorial_id
     and reservation_key <> p_reservation_key
     and (status = 'active' or expires_at > now());

  if v_used + p_original_bytes > v_limit then
    raise exception 'This memorial has reached its 10 GB original-media limit.' using errcode = 'P0001';
  end if;

  if v_existing.id is null then
    insert into public.memorial_storage_ledger(
      memorial_id, reservation_key, original_bytes, status, expires_at
    ) values (
      p_memorial_id, p_reservation_key, p_original_bytes, 'reserved', p_expires_at
    );
  else
    update public.memorial_storage_ledger
       set expires_at = p_expires_at
     where id = v_existing.id;
  end if;

  return v_used + p_original_bytes;
end;
$$;

-- Extend the durable session and its quota reservation in one transaction.
-- An already-lost legacy reservation is restored only after rechecking quota.
create or replace function public.extend_media_upload_session(
  p_session_id uuid,
  p_expires_at timestamptz
) returns timestamptz
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session public.media_upload_sessions%rowtype;
  v_reservation public.memorial_storage_ledger%rowtype;
  v_reservation_key text;
  v_used bigint;
  v_limit constant bigint := 10737418240; -- 10 GiB
begin
  if p_expires_at <= now() or p_expires_at > now() + interval '24 hours' then
    raise exception 'Invalid upload-session expiry.' using errcode = '22023';
  end if;

  select * into v_session
    from public.media_upload_sessions
   where id = p_session_id
   for update;
  if not found then
    raise exception 'Upload session not found.' using errcode = 'P0002';
  end if;
  if v_session.status not in ('created', 'uploading', 'uploaded', 'verifying', 'finalizing') then
    raise exception 'Upload session cannot be extended.' using errcode = '55000';
  end if;

  perform 1 from public.memorials where id = v_session.memorial_id for update;
  if not found then
    raise exception 'Memorial not found.' using errcode = 'P0002';
  end if;

  v_reservation_key := 'upload-session:' || v_session.id::text;
  select * into v_reservation
    from public.memorial_storage_ledger
   where reservation_key = v_reservation_key
   for update;

  if found and (
    v_reservation.memorial_id <> v_session.memorial_id or
    v_reservation.status <> 'reserved' or
    v_reservation.original_bytes <> v_session.reserved_bytes
  ) then
    raise exception 'Upload storage reservation identity mismatch.' using errcode = '22023';
  end if;

  select coalesce(sum(original_bytes), 0) into v_used
    from public.memorial_storage_ledger
   where memorial_id = v_session.memorial_id
     and reservation_key <> v_reservation_key
     and (status = 'active' or expires_at > now());
  if v_used + v_session.reserved_bytes > v_limit then
    raise exception 'This memorial has reached its 10 GB original-media limit.' using errcode = 'P0001';
  end if;

  if v_reservation.id is null then
    insert into public.memorial_storage_ledger(
      memorial_id, reservation_key, original_bytes, status, expires_at
    ) values (
      v_session.memorial_id, v_reservation_key, v_session.reserved_bytes, 'reserved', p_expires_at
    );
  else
    update public.memorial_storage_ledger
       set expires_at = p_expires_at
     where id = v_reservation.id;
  end if;

  update public.media_upload_sessions
     set expires_at = p_expires_at
   where id = p_session_id;

  return p_expires_at;
end;
$$;

revoke all on function public.reserve_media_upload_session_storage(uuid, text, bigint, timestamptz)
  from public, anon, authenticated;
grant execute on function public.reserve_media_upload_session_storage(uuid, text, bigint, timestamptz)
  to service_role;
revoke all on function public.extend_media_upload_session(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.extend_media_upload_session(uuid, timestamptz)
  to service_role;

-- Gallery rows are projections of approved contributions. Removing approval
-- removes the projection transactionally, including YouTube rows with no R2 key.
create or replace function public.remove_unpublished_memory_media_projection()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Enforce the invariant for every transition into a non-public state. This
  -- also repairs a stale projection created by the pre-hardening route.
  if new.status <> 'approved' then
    delete from public.media_items where source_memory_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_remove_unpublished_memory_media_projection on public.memories;
create trigger trg_remove_unpublished_memory_media_projection
after update of status on public.memories
for each row execute function public.remove_unpublished_memory_media_projection();

revoke all on function public.remove_unpublished_memory_media_projection()
  from public, anon, authenticated;
