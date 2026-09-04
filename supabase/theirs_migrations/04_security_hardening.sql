-- ==============================================================================
-- THEIRS (theirs.page) — SECURITY HARDENING & TRANSACTIONAL PAYMENTS
-- Migration: 04_security_hardening.sql
-- Description:
--   1. Patches user_profiles RLS so emails are only readable by their owner.
--   2. Creates public.webhook_events table for Dodo Payments tracking.
--   3. Creates public.rate_limit_events table for durable edge rate limiting.
--   4. Creates atomic complete_memorial_purchase() RPC function.
-- Re-runnable: 100% idempotent.
-- ==============================================================================

-- 1. USER PROFILES: Zero public email exposure
drop policy if exists "User profiles viewable by self and public" on public.user_profiles;
drop policy if exists "User profiles viewable only by self" on public.user_profiles;

create policy "User profiles viewable only by self"
  on public.user_profiles for select
  using (auth.uid() = user_id);


-- 2. WEBHOOK EVENTS TABLE (Dodo Payments Idempotency)
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,
  event_type text not null,
  payment_id text,
  processed boolean not null default true,
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_webhook_events_event_id on public.webhook_events(event_id);
create index if not exists idx_webhook_events_created_at on public.webhook_events(created_at);

alter table public.webhook_events enable row level security;

-- Only service role / admin functions can read or write webhook events
drop policy if exists "Webhook events viewable by admin only" on public.webhook_events;
create policy "Webhook events viewable by admin only"
  on public.webhook_events for all
  using (false);


-- 3. DURABLE RATE LIMIT EVENTS (Edge / Worker Distributed Throttling)
create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  action text not null, -- 'pin_attempt', 'contribution', 'upload_intent'
  identifier text not null, -- client IP or ip:memorial_id
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_rate_limit_events_lookup 
  on public.rate_limit_events(action, identifier, created_at desc);

alter table public.rate_limit_events enable row level security;

-- Service role / backend functions manage rate limit events
drop policy if exists "Rate limit events service only" on public.rate_limit_events;
create policy "Rate limit events service only"
  on public.rate_limit_events for all
  using (false);


-- 4. ATOMIC COMPLETE PURCHASE FUNCTION
-- Executes: idempotency check -> payment recording -> memorial activation -> webhook logging
-- inside a single Postgres transaction.
create or replace function public.complete_memorial_purchase(
  p_event_id text,
  p_payment_id text,
  p_memorial_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_currency text,
  p_customer_email text,
  p_payment_method text,
  p_metadata jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_memorial_exists boolean;
begin
  -- Step 1: Idempotency verification
  if exists (select 1 from public.webhook_events where event_id = p_event_id) then
    return jsonb_build_object(
      'success', true,
      'duplicate', true,
      'message', 'Webhook event already processed'
    );
  end if;

  -- Step 2: Validate memorial exists
  select exists (
    select 1 from public.memorials where id = p_memorial_id
  ) into v_memorial_exists;

  if not v_memorial_exists then
    raise exception 'Memorial with id % does not exist', p_memorial_id;
  end if;

  -- Step 3: Insert or update payment record
  insert into public.payments (
    payment_id,
    memorial_id,
    user_id,
    amount,
    currency,
    status,
    customer_email,
    payment_method,
    metadata
  ) values (
    p_payment_id,
    p_memorial_id,
    p_user_id,
    p_amount,
    coalesce(p_currency, 'USD'),
    'completed',
    p_customer_email,
    p_payment_method,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (payment_id) do update set
    status = 'completed',
    memorial_id = coalesce(public.payments.memorial_id, excluded.memorial_id),
    user_id = coalesce(public.payments.user_id, excluded.user_id),
    metadata = excluded.metadata;

  -- Step 4: Activate Theirs Complete on the memorial
  update public.memorials
  set
    is_paid = true,
    paid_at = coalesce(paid_at, timezone('utc'::text, now())),
    updated_at = timezone('utc'::text, now())
  where id = p_memorial_id;

  -- Step 5: Log the webhook event
  insert into public.webhook_events (
    event_id,
    event_type,
    payment_id,
    processed,
    payload
  ) values (
    p_event_id,
    'theirs_complete_payment_succeeded',
    p_payment_id,
    true,
    coalesce(p_metadata, '{}'::jsonb)
  );

  return jsonb_build_object(
    'success', true,
    'memorial_id', p_memorial_id,
    'payment_id', p_payment_id
  );
end;
$$;
