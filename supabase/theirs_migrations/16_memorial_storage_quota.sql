-- =============================================================================
-- THEIRS — migration 16: atomic 10 GB original-upload entitlement per memorial
-- =============================================================================

create table if not exists public.memorial_storage_ledger (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  reservation_key text not null unique,
  object_key text,
  original_bytes bigint not null check (original_bytes > 0),
  status text not null default 'reserved' check (status in ('reserved', 'active')),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now(),
  finalized_at timestamptz
);

create index if not exists idx_memorial_storage_ledger_quota
  on public.memorial_storage_ledger(memorial_id, status, expires_at);
create unique index if not exists idx_memorial_storage_ledger_object_key
  on public.memorial_storage_ledger(object_key) where object_key is not null;

alter table public.memorial_storage_ledger enable row level security;
revoke all on public.memorial_storage_ledger from anon, authenticated;
grant select, insert, update, delete on public.memorial_storage_ledger to service_role;

create or replace function public.reserve_memorial_storage(
  p_memorial_id uuid,
  p_reservation_key text,
  p_original_bytes bigint
) returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_used bigint;
  v_limit constant bigint := 10737418240; -- 10 GiB
begin
  if p_original_bytes < 1 then
    raise exception 'Invalid storage reservation.' using errcode = '22023';
  end if;

  perform 1 from public.memorials where id = p_memorial_id for update;
  if not found then
    raise exception 'Memorial not found.' using errcode = 'P0002';
  end if;

  delete from public.memorial_storage_ledger
   where memorial_id = p_memorial_id
     and status = 'reserved'
     and expires_at <= now();

  select coalesce(sum(original_bytes), 0) into v_used
    from public.memorial_storage_ledger
   where memorial_id = p_memorial_id
     and (status = 'active' or expires_at > now());

  if v_used + p_original_bytes > v_limit then
    raise exception 'This memorial has reached its 10 GB original-media limit.' using errcode = 'P0001';
  end if;

  insert into public.memorial_storage_ledger(memorial_id, reservation_key, original_bytes)
  values (p_memorial_id, p_reservation_key, p_original_bytes)
  on conflict (reservation_key) do nothing;

  return v_used + p_original_bytes;
end;
$$;

create or replace function public.finalize_memorial_storage(
  p_memorial_id uuid,
  p_reservation_key text,
  p_object_key text
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.memorial_storage_ledger
     set status = 'active', object_key = p_object_key, finalized_at = now(), expires_at = 'infinity'
   where memorial_id = p_memorial_id
     and (reservation_key = p_reservation_key or object_key = p_reservation_key);
  if not found then
    raise exception 'Storage reservation not found.' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.release_memorial_storage(
  p_memorial_id uuid,
  p_storage_key text
) returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.memorial_storage_ledger
   where memorial_id = p_memorial_id
     and (reservation_key = p_storage_key or object_key = p_storage_key);
$$;

revoke all on function public.reserve_memorial_storage(uuid, text, bigint) from public, anon, authenticated;
revoke all on function public.finalize_memorial_storage(uuid, text, text) from public, anon, authenticated;
revoke all on function public.release_memorial_storage(uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_memorial_storage(uuid, text, bigint) to service_role;
grant execute on function public.finalize_memorial_storage(uuid, text, text) to service_role;
grant execute on function public.release_memorial_storage(uuid, text) to service_role;
