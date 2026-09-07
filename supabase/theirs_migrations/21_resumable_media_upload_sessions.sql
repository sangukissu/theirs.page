-- =============================================================================
-- THEIRS — migration 21: durable authenticated media upload sessions
-- =============================================================================

create table if not exists public.media_upload_sessions (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('studio_gallery', 'member_contribution')),
  media_type text not null check (media_type in ('image', 'audio', 'video')),
  original_filename text not null check (char_length(original_filename) between 1 and 240),
  mime_type text not null check (char_length(mime_type) between 3 and 120),
  file_size bigint not null check (file_size > 0),
  client_upload_id text not null check (char_length(client_upload_id) between 8 and 200),
  file_fingerprint text check (file_fingerprint is null or char_length(file_fingerprint) between 8 and 500),
  r2_key text not null unique,
  multipart_upload_id text,
  upload_mode text not null check (upload_mode in ('single', 'multipart')),
  target_album text check (target_album is null or char_length(target_album) <= 120),
  status text not null default 'created' check (
    status in ('created', 'uploading', 'uploaded', 'verifying', 'finalizing', 'complete', 'failed', 'aborted', 'expired')
  ),
  reserved_bytes bigint not null check (reserved_bytes > 0),
  result_media_item_id uuid references public.media_items(id) on delete set null,
  result_memory_id uuid references public.memories(id) on delete set null,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '6 hours'),
  completed_at timestamptz,
  unique (user_id, memorial_id, client_upload_id)
);

alter table public.media_upload_sessions
  add column if not exists target_album text;
alter table public.media_upload_sessions drop constraint if exists media_upload_sessions_target_album_check;
alter table public.media_upload_sessions add constraint media_upload_sessions_target_album_check
  check (target_album is null or char_length(target_album) <= 120);

create index if not exists idx_media_upload_sessions_user_status
  on public.media_upload_sessions(user_id, status, updated_at desc);
create index if not exists idx_media_upload_sessions_memorial_status
  on public.media_upload_sessions(memorial_id, status, updated_at desc);
create index if not exists idx_media_upload_sessions_expires
  on public.media_upload_sessions(expires_at)
  where status in ('created', 'uploading', 'uploaded', 'verifying', 'finalizing', 'failed');
create index if not exists idx_media_upload_sessions_r2_key
  on public.media_upload_sessions(r2_key);
create index if not exists idx_media_upload_sessions_client_upload_id
  on public.media_upload_sessions(client_upload_id);
create index if not exists idx_media_items_exact_url
  on public.media_items(url);

alter table public.media_upload_sessions enable row level security;
revoke all on public.media_upload_sessions from anon, authenticated;
grant select, insert, update, delete on public.media_upload_sessions to service_role;

create or replace function public.touch_media_upload_session()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_media_upload_session on public.media_upload_sessions;
create trigger trg_touch_media_upload_session
before update on public.media_upload_sessions
for each row execute function public.touch_media_upload_session();

-- The route verifies R2 bytes before invoking this function. The row lock makes
-- retries return the original media item and commits storage exactly once.
create or replace function public.finalize_studio_upload_session(
  p_session_id uuid,
  p_user_id uuid,
  p_media_url text,
  p_original_key text,
  p_caption text default null,
  p_approx_year integer default null,
  p_location text default null,
  p_album text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session public.media_upload_sessions%rowtype;
  v_media public.media_items%rowtype;
begin
  select * into v_session
    from public.media_upload_sessions
   where id = p_session_id
   for update;

  if not found then
    raise exception 'Upload session not found.' using errcode = 'P0002';
  end if;
  if v_session.user_id <> p_user_id or v_session.purpose <> 'studio_gallery' then
    raise exception 'Upload session access denied.' using errcode = '42501';
  end if;
  if v_session.status = 'complete' and v_session.result_media_item_id is not null then
    select * into v_media from public.media_items where id = v_session.result_media_item_id;
    return jsonb_build_object('media_item', to_jsonb(v_media), 'already_complete', true);
  end if;
  if v_session.status not in ('uploaded', 'finalizing') then
    raise exception 'Upload session is not ready to finalize.' using errcode = '55000';
  end if;

  update public.media_upload_sessions set status = 'finalizing' where id = p_session_id;

  insert into public.media_items (
    memorial_id, media_type, url, caption, approx_year, location, album
  ) values (
    v_session.memorial_id,
    v_session.media_type,
    p_media_url,
    nullif(trim(p_caption), ''),
    p_approx_year,
    nullif(trim(p_location), ''),
    nullif(trim(p_album), '')
  ) returning * into v_media;

  update public.memorial_storage_ledger
     set status = 'active',
         object_key = p_original_key,
         finalized_at = now(),
         expires_at = 'infinity'
   where memorial_id = v_session.memorial_id
     and reservation_key = 'upload-session:' || p_session_id::text;
  if not found then
    raise exception 'Storage reservation not found.' using errcode = 'P0002';
  end if;

  update public.media_upload_sessions
     set status = 'complete',
         result_media_item_id = v_media.id,
         completed_at = now(),
         expires_at = 'infinity',
         error_code = null
   where id = p_session_id;

  return jsonb_build_object('media_item', to_jsonb(v_media), 'already_complete', false);
end;
$$;

-- Member finalization inserts the contribution, commits every reservation and
-- links every session in one transaction. R2 preparation uses deterministic
-- keys, so a lost HTTP response is safe to retry.
create or replace function public.finalize_member_upload_sessions(
  p_session_ids uuid[],
  p_user_id uuid,
  p_author_name text,
  p_author_relationship text,
  p_story text,
  p_approx_year integer,
  p_location text,
  p_contributor_role text,
  p_status text,
  p_safety_decision text,
  p_safety_details jsonb,
  p_media_records jsonb,
  p_receipt_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_memorial_id uuid;
  v_expected integer;
  v_found integer;
  v_existing_memory_id uuid;
  v_memory public.memories%rowtype;
  v_session public.media_upload_sessions%rowtype;
  v_record jsonb;
  v_media_id uuid;
  v_first_media_id uuid;
  v_display_keys jsonb := '[]'::jsonb;
begin
  v_expected := coalesce(array_length(p_session_ids, 1), 0);
  if v_expected < 1 or v_expected > 3 then
    raise exception 'One to three upload sessions are required.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_media_records) <> 'array' or jsonb_array_length(p_media_records) <> v_expected then
    raise exception 'Media records do not match upload sessions.' using errcode = '22023';
  end if;
  if p_status not in ('pending_approval', 'approved', 'blocked') then
    raise exception 'Invalid contribution status.' using errcode = '22023';
  end if;

  perform 1
    from public.media_upload_sessions
   where id = any(p_session_ids)
   order by id
   for update;

  select count(*)
    into v_found
    from public.media_upload_sessions
   where id = any(p_session_ids)
     and user_id = p_user_id
     and purpose = 'member_contribution';

  select memorial_id into v_memorial_id
    from public.media_upload_sessions
   where id = any(p_session_ids)
   limit 1;

  select result_memory_id into v_existing_memory_id
    from public.media_upload_sessions
   where id = any(p_session_ids)
     and result_memory_id is not null
   limit 1;

  if v_found <> v_expected then
    raise exception 'Upload session access denied.' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.media_upload_sessions
     where id = any(p_session_ids) and memorial_id <> v_memorial_id
  ) then
    raise exception 'Upload sessions belong to different memorials.' using errcode = '22023';
  end if;

  if v_existing_memory_id is not null and not exists (
    select 1 from public.media_upload_sessions
     where id = any(p_session_ids)
       and (status <> 'complete' or result_memory_id <> v_existing_memory_id)
  ) then
    select * into v_memory from public.memories where id = v_existing_memory_id;
    return jsonb_build_object('memory', to_jsonb(v_memory), 'already_complete', true);
  end if;

  if exists (
    select 1 from public.media_upload_sessions
     where id = any(p_session_ids) and status not in ('uploaded', 'finalizing')
  ) then
    raise exception 'An upload session is not ready to finalize.' using errcode = '55000';
  end if;

  for v_record in select value from jsonb_array_elements(p_media_records)
  loop
    if not ((v_record->>'session_id')::uuid = any(p_session_ids)) then
      raise exception 'Media record session mismatch.' using errcode = '22023';
    end if;
    select * into v_session
      from public.media_upload_sessions
     where id = (v_record->>'session_id')::uuid;
    if v_session.r2_key <> v_record->>'source_key' or
       v_session.media_type <> v_record->>'media_type' then
      raise exception 'Media record does not match its upload session.' using errcode = '22023';
    end if;
    v_display_keys := v_display_keys || jsonb_build_array(v_record->>'display_key');
  end loop;

  update public.media_upload_sessions set status = 'finalizing' where id = any(p_session_ids);

  insert into public.memories (
    memorial_id, author_name, author_relationship, story, approx_year, location,
    photo_url, photo_urls, tribute_type, contribution_type, status,
    safety_decision, safety_details, contributor_role, receipt_token,
    is_quarantined, visibility, approved_at
  ) values (
    v_memorial_id,
    p_author_name,
    nullif(trim(p_author_relationship), ''),
    p_story,
    p_approx_year,
    nullif(trim(p_location), ''),
    p_media_records->0->>'display_key',
    v_display_keys,
    'photo',
    'story',
    p_status,
    p_safety_decision,
    p_safety_details,
    p_contributor_role,
    p_receipt_hash,
    p_status <> 'approved',
    'everyone',
    case when p_status = 'approved' then now() else null end
  ) returning * into v_memory;

  for v_record in select value from jsonb_array_elements(p_media_records)
  loop
    update public.memorial_storage_ledger
       set status = 'active',
           object_key = v_record->>'original_key',
           finalized_at = now(),
           expires_at = 'infinity'
     where memorial_id = v_memorial_id
       and reservation_key = 'upload-session:' || (v_record->>'session_id');
    if not found then
      raise exception 'Storage reservation not found.' using errcode = 'P0002';
    end if;

    v_media_id := null;
    if p_status = 'approved' then
      insert into public.media_items (
        memorial_id, media_type, url, caption, approx_year, location, album, source_memory_id
      ) values (
        v_memorial_id,
        v_record->>'media_type',
        v_record->>'display_key',
        'Shared by ' || p_author_name,
        p_approx_year,
        nullif(trim(p_location), ''),
        'Community Memories',
        v_memory.id
      ) returning id into v_media_id;
      v_first_media_id := coalesce(v_first_media_id, v_media_id);
    end if;

    update public.media_upload_sessions
       set status = 'complete',
           result_memory_id = v_memory.id,
           result_media_item_id = v_media_id,
           completed_at = now(),
           expires_at = 'infinity',
           error_code = null
     where id = (v_record->>'session_id')::uuid;
  end loop;

  return jsonb_build_object(
    'memory', to_jsonb(v_memory),
    'first_media_item_id', v_first_media_id,
    'already_complete', false
  );
end;
$$;

revoke all on function public.finalize_studio_upload_session(uuid, uuid, text, text, text, integer, text, text) from public, anon, authenticated;
grant execute on function public.finalize_studio_upload_session(uuid, uuid, text, text, text, integer, text, text) to service_role;
revoke all on function public.finalize_member_upload_sessions(uuid[], uuid, text, text, text, integer, text, text, text, text, jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.finalize_member_upload_sessions(uuid[], uuid, text, text, text, integer, text, text, text, text, jsonb, jsonb, text) to service_role;
