-- =============================================================================
-- THEIRS — migration 26: memorial-scoped photo restoration & gallery linkage
-- =============================================================================

-- 0. Ensure image_restorations table exists
create table if not exists public.image_restorations (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'processing' check (status in ('pending', 'processing', 'completed', 'failed')),
  original_image_url text,
  restored_image_url text,
  error_message text,
  fal_request_id text,
  batch_id uuid,
  batch_index int default 0,
  credits_charged int default 0,
  credit_refunded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable realtime for live processing updates
do $$
begin
  alter publication supabase_realtime add table public.image_restorations;
exception when others then
  null;
end $$;

-- 1. Add memorial_id to image_restorations if not present (in case table was previously created without it)
alter table public.image_restorations
  add column if not exists memorial_id uuid references public.memorials(id) on delete cascade;

create index if not exists idx_image_restorations_memorial_status
  on public.image_restorations(memorial_id, status);

create index if not exists idx_image_restorations_fal_request_id
  on public.image_restorations(fal_request_id);

-- 2. Add source_restoration_id to media_items for zero-duplication gallery linkage
alter table public.media_items
  add column if not exists source_restoration_id uuid references public.image_restorations(id) on delete set null;

create index if not exists idx_media_items_source_restoration
  on public.media_items(source_restoration_id);

-- Ensure a restoration cannot be added twice to the same memorial gallery
create unique index if not exists idx_media_items_memorial_source_restoration
  on public.media_items(memorial_id, source_restoration_id)
  where source_restoration_id is not null;

-- 3. RLS policies on image_restorations for memorial collaborators
alter table public.image_restorations enable row level security;

-- Caretakers and editors can view restorations belonging to their memorial
drop policy if exists "Memorial caretakers can view restorations" on public.image_restorations;
create policy "Memorial caretakers can view restorations"
on public.image_restorations
for select
using (
  (user_id = auth.uid())
  or (
    memorial_id is not null and (
      exists (
        select 1 from public.memorials m
        where m.id = image_restorations.memorial_id
          and m.owner_id = auth.uid()
      )
      or exists (
        select 1 from public.collaborators c
        where c.memorial_id = image_restorations.memorial_id
          and c.user_id = auth.uid()
          and c.role in ('caretaker', 'editor')
      )
    )
  )
);

-- Caretakers and editors can delete restorations for their memorial
drop policy if exists "Memorial caretakers can delete restorations" on public.image_restorations;
create policy "Memorial caretakers can delete restorations"
on public.image_restorations
for delete
using (
  (user_id = auth.uid())
  or (
    memorial_id is not null and (
      exists (
        select 1 from public.memorials m
        where m.id = image_restorations.memorial_id
          and m.owner_id = auth.uid()
      )
      or exists (
        select 1 from public.collaborators c
        where c.memorial_id = image_restorations.memorial_id
          and c.user_id = auth.uid()
          and c.role in ('caretaker', 'editor')
      )
    )
  )
);

-- 4. Atomic reservation function to enforce 5-restoration quota and prevent parallel race conditions
create or replace function public.reserve_memorial_restoration(
  p_memorial_id uuid,
  p_user_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_is_paid boolean;
  v_owner_id uuid;
  v_is_collaborator boolean;
  v_active_count int;
  v_restoration_id uuid;
begin
  -- Serialize concurrency per memorial
  select is_paid, owner_id into v_is_paid, v_owner_id
  from public.memorials
  where id = p_memorial_id
  for update;

  if not found then
    raise exception 'Memorial not found.' using errcode = 'P0002';
  end if;

  if not coalesce(v_is_paid, false) then
    raise exception 'Photo restoration is included with Theirs Complete.' using errcode = 'P0001';
  end if;

  -- Authorization check
  if v_owner_id <> p_user_id then
    select exists (
      select 1 from public.collaborators
      where memorial_id = p_memorial_id
        and user_id = p_user_id
        and role in ('caretaker', 'editor')
    ) into v_is_collaborator;

    if not v_is_collaborator then
      raise exception 'Unauthorized to restore photos for this memorial.' using errcode = '42501';
    end if;
  end if;

  -- Quota check: max 5 successful or in-flight processing jobs
  select count(*) into v_active_count
  from public.image_restorations
  where memorial_id = p_memorial_id
    and status in ('completed', 'processing');

  if v_active_count >= 5 then
    raise exception 'All 5 photo restorations included with Theirs Complete have been used.' using errcode = 'P0003';
  end if;

  -- Insert processing restoration record atomically
  insert into public.image_restorations (
    memorial_id,
    user_id,
    status,
    credits_charged,
    credit_refunded
  ) values (
    p_memorial_id,
    p_user_id,
    'processing',
    0,
    false
  ) returning id into v_restoration_id;

  return v_restoration_id;
end;
$$;

revoke all on function public.reserve_memorial_restoration(uuid, uuid) from public, anon;
grant execute on function public.reserve_memorial_restoration(uuid, uuid) to authenticated, service_role;
