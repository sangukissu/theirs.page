-- =============================================================================
-- THEIRS — migration 28: memorial gift entitlements & atomic redemption
-- Fully idempotent & safe to re-run on any Supabase project
-- =============================================================================

-- 1. Create memorial_gifts table
create table if not exists public.memorial_gifts (
  id uuid primary key default gen_random_uuid(),
  claim_token_hash text unique not null,
  
  -- Buyer Details
  buyer_name text not null check (char_length(buyer_name) between 1 and 100),
  buyer_email text not null check (char_length(buyer_email) between 3 and 254),
  buyer_user_id uuid references auth.users(id) on delete set null,
  
  -- Recipient Details
  recipient_name text not null check (char_length(recipient_name) between 1 and 100),
  recipient_email text not null check (char_length(recipient_email) between 3 and 254),
  gift_message text check (gift_message is null or char_length(gift_message) <= 1000),
  
  -- Payment linkage (Dodo Payments)
  payment_id text,
  amount numeric(10,2) not null default 179.00,
  currency text not null default 'USD',
  
  -- Lifecycle Status: pending_payment -> available -> redeemed -> refunded
  status text not null default 'pending_payment' check (status in ('pending_payment', 'available', 'redeemed', 'refunded')),
  
  -- Redemption tracking
  redeemed_by_user_id uuid references auth.users(id) on delete set null,
  redeemed_memorial_id uuid references public.memorials(id) on delete set null,
  redeemed_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist idempotently
alter table public.memorial_gifts add column if not exists claim_token_hash text;
alter table public.memorial_gifts add column if not exists buyer_name text;
alter table public.memorial_gifts add column if not exists buyer_email text;
alter table public.memorial_gifts add column if not exists buyer_user_id uuid references auth.users(id) on delete set null;
alter table public.memorial_gifts add column if not exists recipient_name text;
alter table public.memorial_gifts add column if not exists recipient_email text;
alter table public.memorial_gifts add column if not exists gift_message text;
alter table public.memorial_gifts add column if not exists payment_id text;
alter table public.memorial_gifts add column if not exists amount numeric(10,2) default 179.00;
alter table public.memorial_gifts add column if not exists currency text default 'USD';
alter table public.memorial_gifts add column if not exists status text default 'pending_payment';
alter table public.memorial_gifts add column if not exists redeemed_by_user_id uuid references auth.users(id) on delete set null;
alter table public.memorial_gifts add column if not exists redeemed_memorial_id uuid references public.memorials(id) on delete set null;
alter table public.memorial_gifts add column if not exists redeemed_at timestamp with time zone;
alter table public.memorial_gifts add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.memorial_gifts add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Foreign key to payments if public.payments exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'payments') then
    if not exists (
      select 1 from information_schema.table_constraints
      where constraint_name = 'memorial_gifts_payment_id_fkey'
    ) then
      alter table public.memorial_gifts
        add constraint memorial_gifts_payment_id_fkey
        foreign key (payment_id) references public.payments(payment_id) on delete set null;
    end if;
  end if;
end $$;

-- Indexes for efficient lookup
create index if not exists idx_memorial_gifts_token_hash on public.memorial_gifts(claim_token_hash);
create index if not exists idx_memorial_gifts_recipient_email on public.memorial_gifts(recipient_email);
create index if not exists idx_memorial_gifts_buyer_email on public.memorial_gifts(buyer_email);
create index if not exists idx_memorial_gifts_status on public.memorial_gifts(status);
create index if not exists idx_memorial_gifts_buyer_user on public.memorial_gifts(buyer_user_id);
create index if not exists idx_memorial_gifts_redeemed_memorial on public.memorial_gifts(redeemed_memorial_id);

-- Enable RLS
alter table public.memorial_gifts enable row level security;

-- Buyers can read their purchased gifts
drop policy if exists "Buyers can view their purchased gifts" on public.memorial_gifts;
create policy "Buyers can view their purchased gifts"
  on public.memorial_gifts
  for select
  using (
    (buyer_user_id is not null and buyer_user_id = auth.uid())
    or (buyer_email = (select email from auth.users where id = auth.uid()))
  );

-- Recipients who redeemed can view their redeemed gift
drop policy if exists "Redeemers can view their redeemed gifts" on public.memorial_gifts;
create policy "Redeemers can view their redeemed gifts"
  on public.memorial_gifts
  for select
  using (redeemed_by_user_id = auth.uid());

-- 2. Atomic Redemption RPC: redeem_memorial_gift
create or replace function public.redeem_memorial_gift(
  p_claim_token_hash text,
  p_user_id uuid,
  p_target_memorial_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gift public.memorial_gifts%rowtype;
  v_memorial public.memorials%rowtype;
begin
  -- 1. Lock and fetch the gift record
  select * into v_gift
  from public.memorial_gifts
  where claim_token_hash = p_claim_token_hash
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'gift_not_found');
  end if;

  if v_gift.status = 'redeemed' then
    return jsonb_build_object('success', false, 'error', 'already_redeemed', 'redeemed_at', v_gift.redeemed_at);
  end if;

  if v_gift.status = 'refunded' then
    return jsonb_build_object('success', false, 'error', 'gift_refunded');
  end if;

  if v_gift.status != 'available' then
    return jsonb_build_object('success', false, 'error', 'gift_not_ready');
  end if;

  -- 2. Lock and verify the target memorial belongs to or is managed by p_user_id
  select * into v_memorial
  from public.memorials
  where id = p_target_memorial_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'memorial_not_found');
  end if;

  -- Verify ownership: user must be owner or co_admin
  if v_memorial.owner_id != p_user_id then
    if not exists (
      select 1 from public.collaborators
      where memorial_id = p_target_memorial_id
        and user_id = p_user_id
        and role = 'co_admin'
        and invitation_accepted = true
    ) then
      return jsonb_build_object('success', false, 'error', 'unauthorized_memorial');
    end if;
  end if;

  -- 3. Upgrade memorial to Complete
  update public.memorials
  set is_paid = true,
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where id = p_target_memorial_id;

  -- 4. Mark gift as redeemed
  update public.memorial_gifts
  set status = 'redeemed',
      redeemed_by_user_id = p_user_id,
      redeemed_memorial_id = p_target_memorial_id,
      redeemed_at = now(),
      updated_at = now()
  where id = v_gift.id;

  -- 5. Record or update payment record if payment_id is known
  if v_gift.payment_id is not null then
    update public.payments
    set memorial_id = p_target_memorial_id
    where payment_id = v_gift.payment_id
      and memorial_id is null;
  end if;

  return jsonb_build_object(
    'success', true,
    'gift_id', v_gift.id,
    'memorial_id', p_target_memorial_id,
    'buyer_name', v_gift.buyer_name,
    'recipient_name', v_gift.recipient_name
  );
end;
$$;
