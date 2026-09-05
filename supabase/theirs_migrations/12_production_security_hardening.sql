-- =============================================================================
-- THEIRS — production security hardening
-- Removes browser-side privilege escalation paths and makes rate limiting atomic.
-- Re-runnable and safe to apply after 11_contribution_safety_and_trust.sql.
-- =============================================================================

-- Owner-only helper used where co-admin access would be too broad.
create or replace function public.is_memorial_owner(p_memorial_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.memorials
    where id = p_memorial_id and owner_id = auth.uid()
  );
$$;

-- Pin the search path on existing security-definer helpers.
alter function public.is_memorial_admin(uuid) set search_path = public, pg_temp;
alter function public.can_view_memorial(uuid) set search_path = public, pg_temp;
alter function public.complete_memorial_purchase(text, text, uuid, uuid, numeric, text, text, text, jsonb)
  set search_path = public, pg_temp;

-- Payment completion is backend-only. SECURITY DEFINER functions are executable
-- by PUBLIC unless execution is explicitly revoked.
revoke all on function public.complete_memorial_purchase(text, text, uuid, uuid, numeric, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_memorial_purchase(text, text, uuid, uuid, numeric, text, text, text, jsonb)
  to service_role;

-- Retained photo-restoration credit functions came from the previous product.
-- PostgreSQL grants new functions to PUBLIC unless told otherwise. Revoke that
-- default, and make refunds callable only by the service-role backend.
-- The table is optional on a fresh Theirs-only database, hence the guarded DDL.
do $hardening$
begin
  if to_regclass('public.image_restorations') is not null then
    execute $ddl$
      create or replace function public.fail_restoration_and_refund(
        p_restoration_id uuid,
        p_error_message text default null
      )
      returns integer
      language plpgsql
      security definer
      set search_path = public, pg_temp
      as $function$
      declare
        v_restoration public.image_restorations%rowtype;
        v_remaining integer := 0;
      begin
        select *
          into v_restoration
        from public.image_restorations
        where id = p_restoration_id
        for update;

        if not found then
          raise exception 'RESTORATION_NOT_FOUND';
        end if;

        if auth.uid() is not null and auth.uid() <> v_restoration.user_id then
          raise exception 'FORBIDDEN';
        end if;

        -- Never turn a completed job into a failed one or refund it twice.
        if v_restoration.status <> 'processing' or v_restoration.credit_refunded then
          select coalesce(credits, 0)
            into v_remaining
          from public.user_profiles
          where user_id = v_restoration.user_id;
          return coalesce(v_remaining, 0);
        end if;

        if coalesce(v_restoration.credits_charged, 0) > 0 then
          update public.user_profiles
          set credits = coalesce(credits, 0) + v_restoration.credits_charged
          where user_id = v_restoration.user_id
          returning credits into v_remaining;
        else
          select coalesce(credits, 0)
            into v_remaining
          from public.user_profiles
          where user_id = v_restoration.user_id;
        end if;

        update public.image_restorations
        set status = 'failed',
            error_message = coalesce(left(p_error_message, 1000), error_message),
            credit_refunded = true,
            updated_at = now()
        where id = p_restoration_id
          and status = 'processing';

        return coalesce(v_remaining, 0);
      end;
      $function$
    $ddl$;

    if to_regprocedure('public.reserve_restore_credits(uuid,integer)') is not null then
      execute 'revoke all on function public.reserve_restore_credits(uuid, integer) from public, anon';
      execute 'grant execute on function public.reserve_restore_credits(uuid, integer) to authenticated, service_role';
    end if;

    execute 'revoke all on function public.fail_restoration_and_refund(uuid, text) from public, anon, authenticated';
    execute 'grant execute on function public.fail_restoration_and_refund(uuid, text) to service_role';
  end if;
end;
$hardening$;

-- Serialize each limiter key so concurrent requests cannot all pass a
-- select-then-insert race. Identifiers passed here are already HMAC protected.
create or replace function public.consume_rate_limit(
  p_action text,
  p_identifier text,
  p_max_attempts integer,
  p_window_seconds integer
)
returns table(allowed boolean, remaining_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_window_start timestamptz;
  v_oldest timestamptz;
  v_count integer;
begin
  if p_action is null or length(p_action) not between 1 and 80
     or p_identifier is null or length(p_identifier) not between 20 and 128
     or p_max_attempts not between 1 and 10000
     or p_window_seconds not between 1 and 86400 then
    raise exception 'Invalid rate limit parameters';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_action || ':' || p_identifier, 0));
  v_window_start := timezone('utc'::text, now()) - make_interval(secs => p_window_seconds);

  delete from public.rate_limit_events
  where created_at < timezone('utc'::text, now()) - interval '2 days';

  select count(*), min(created_at)
    into v_count, v_oldest
  from public.rate_limit_events
  where action = p_action
    and identifier = p_identifier
    and created_at >= v_window_start;

  if v_count >= p_max_attempts then
    return query select false,
      greatest(1, ceil(extract(epoch from ((v_oldest + make_interval(secs => p_window_seconds)) - timezone('utc'::text, now()))))::integer);
    return;
  end if;

  insert into public.rate_limit_events(action, identifier)
  values (p_action, p_identifier);
  return query select true, 0;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer)
  to service_role;

-- Anonymous contributions must pass the server API (Turnstile, limits and
-- safety checks). Direct PostgREST inserts previously bypassed all three.
drop policy if exists "Anyone can submit a memory with pending status" on public.memories;
revoke insert on public.memories from anon, authenticated;
revoke update, delete on public.memories from anon, authenticated;
grant select, insert, update, delete on public.memories to service_role;

-- Co-admins can moderate content, but only the owner may manage the access
-- ladder or mutate memorial-level settings directly.
drop policy if exists "Memorial admins can manage collaborators" on public.collaborators;
create policy "Only memorial owner can manage collaborators"
  on public.collaborators for all
  using (public.is_memorial_owner(memorial_id))
  with check (public.is_memorial_owner(memorial_id));
revoke insert, update, delete on public.collaborators from anon, authenticated;

drop policy if exists "Memorial admins can update their memorial" on public.memorials;
create policy "Only memorial owner can update memorial directly"
  on public.memorials for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Prevent an authenticated owner from setting billing/ownership columns with
-- the public Supabase key while retaining legitimate self-service fields.
revoke insert, update on public.memorials from authenticated;
grant insert (
  owner_id, slug, full_name, preferred_name, birth_year, death_year, headline,
  biography, location, portrait_photo_url, privacy, access_pin_hash,
  successor_name, successor_email, status, section_settings,
  contribution_settings
) on public.memorials to authenticated;
grant update (
  slug, full_name, preferred_name, birth_year, death_year, headline, biography,
  location, portrait_photo_url, privacy, access_pin_hash, successor_name,
  successor_email, status, section_settings, contribution_settings, updated_at
) on public.memorials to authenticated;

-- Supabase Storage cannot enforce per-memorial PIN cookies. Keep this bucket
-- private; application media is served through the authorized media route.
update storage.buckets set public = false where id = 'theirs-media';
drop policy if exists "Public read access for theirs-media" on storage.objects;
drop policy if exists "Authenticated users can upload media" on storage.objects;
drop policy if exists "Users can update their own uploads" on storage.objects;
drop policy if exists "Users can delete their own uploads" on storage.objects;

-- Audio/video contribution screening was described but not implemented. Keep
-- those switches off until transcript and frame moderation genuinely exist.
alter table public.memorials alter column contribution_settings set default
  '{"accept_contributions":true,"tributes":true,"memories":true,"photos":true,"voice":false,"videos":false,"moments":true}'::jsonb;
update public.memorials
set contribution_settings = jsonb_set(
  jsonb_set(coalesce(contribution_settings, '{}'::jsonb), '{voice}', 'false'::jsonb, true),
  '{videos}', 'false'::jsonb, true
);

-- Unscreened inserts must never inherit a publishable safety result.
update public.memories set safety_decision = 'review' where safety_decision is null;
update public.memories set safety_details = '{}'::jsonb where safety_details is null;
update public.memories set contributor_role = 'anonymous' where contributor_role is null;
update public.memories set is_quarantined = false where is_quarantined is null;
alter table public.memories alter column safety_decision set default 'review';
alter table public.memories alter column safety_decision set not null;
alter table public.memories alter column safety_details set not null;
alter table public.memories alter column contributor_role set not null;
alter table public.memories alter column is_quarantined set not null;
drop index if exists public.idx_memories_receipt_token;
