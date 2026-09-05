-- ==============================================================================
-- THEIRS (theirs.page) — SECURITY & ROW LEVEL SECURITY (RLS)
-- Migration: 02_security_and_rls.sql
-- Description: Enables RLS across all tables and creates idempotent access policies.
-- Re-runnable: Safe to execute repeatedly without "already exists" errors.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY (Idempotent by default)
alter table if exists public.user_profiles enable row level security;
alter table if exists public.memorials enable row level security;
alter table if exists public.collaborators enable row level security;
alter table if exists public.memories enable row level security;
alter table if exists public.media_items enable row level security;
alter table if exists public.timeline_events enable row level security;
alter table if exists public.caretaker_messages enable row level security;
alter table if exists public.payments enable row level security;


-- 2. HELPER FUNCTIONS (CREATE OR REPLACE is idempotent)
create or replace function public.is_memorial_admin(p_memorial_id uuid)
returns boolean as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  return exists (
    select 1 from public.memorials
    where id = p_memorial_id and owner_id = auth.uid()
  ) or exists (
    select 1 from public.collaborators
    where memorial_id = p_memorial_id
      and user_id = auth.uid()
      and role = 'co_admin'
      and invitation_accepted = true
  );
end;
$$ language plpgsql security definer stable;

create or replace function public.can_view_memorial(p_memorial_id uuid)
returns boolean as $$
begin
  -- Published public or unlisted memorials are accessible to all visitors
  if exists (
    select 1 from public.memorials
    where id = p_memorial_id
      and status = 'published'
      and privacy in ('public', 'unlisted')
  ) then
    return true;
  end if;

  -- If user is logged in, check if they are owner or accepted collaborator
  if auth.uid() is not null then
    return public.is_memorial_admin(p_memorial_id) or exists (
      select 1 from public.collaborators
      where memorial_id = p_memorial_id
        and user_id = auth.uid()
        and invitation_accepted = true
    );
  end if;

  return false;
end;
$$ language plpgsql security definer stable;


-- 3. POLICIES: USER PROFILES
drop policy if exists "User profiles viewable by self and public" on public.user_profiles;
drop policy if exists "User profiles viewable only by self" on public.user_profiles;
create policy "User profiles viewable only by self"
  on public.user_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 4. POLICIES: MEMORIALS
drop policy if exists "Public and unlisted memorials are viewable by everyone" on public.memorials;
create policy "Public and unlisted memorials are viewable by everyone"
  on public.memorials for select
  using (
    (status = 'published' and privacy in ('public', 'unlisted'))
    or public.is_memorial_admin(id)
  );

drop policy if exists "Authenticated users can create memorials" on public.memorials;
create policy "Authenticated users can create memorials"
  on public.memorials for insert
  with check (auth.uid() is not null and owner_id = auth.uid());

drop policy if exists "Memorial admins can update their memorial" on public.memorials;
create policy "Memorial admins can update their memorial"
  on public.memorials for update
  using (public.is_memorial_admin(id))
  with check (public.is_memorial_admin(id));

drop policy if exists "Only memorial owner can delete a memorial" on public.memorials;
create policy "Only memorial owner can delete a memorial"
  on public.memorials for delete
  using (auth.uid() = owner_id);


-- 5. POLICIES: COLLABORATORS
drop policy if exists "Collaborators viewable by memorial admin or self" on public.collaborators;
create policy "Collaborators viewable by memorial admin or self"
  on public.collaborators for select
  using (public.is_memorial_admin(memorial_id) or user_id = auth.uid());

drop policy if exists "Memorial admins can manage collaborators" on public.collaborators;
create policy "Memorial admins can manage collaborators"
  on public.collaborators for all
  using (public.is_memorial_admin(memorial_id))
  with check (public.is_memorial_admin(memorial_id));


-- 6. POLICIES: MEMORIES (Stories & Contributions)
drop policy if exists "View approved memories" on public.memories;
create policy "View approved memories"
  on public.memories for select
  using (
    (status = 'approved' and visibility = 'everyone' and public.can_view_memorial(memorial_id))
    or public.is_memorial_admin(memorial_id)
  );

drop policy if exists "Anyone can submit a memory with pending status" on public.memories;
create policy "Anyone can submit a memory with pending status"
  on public.memories for insert
  with check (
    status = 'pending_approval'
    and public.can_view_memorial(memorial_id)
  );

drop policy if exists "Admins can update memories" on public.memories;
create policy "Admins can update memories"
  on public.memories for update
  using (public.is_memorial_admin(memorial_id))
  with check (public.is_memorial_admin(memorial_id));

drop policy if exists "Admins can delete memories" on public.memories;
create policy "Admins can delete memories"
  on public.memories for delete
  using (public.is_memorial_admin(memorial_id));


-- 7. POLICIES: MEDIA ITEMS
drop policy if exists "Media items viewable by anyone who can view memorial" on public.media_items;
create policy "Media items viewable by anyone who can view memorial"
  on public.media_items for select
  using (public.can_view_memorial(memorial_id));

drop policy if exists "Admins can manage media items" on public.media_items;
create policy "Admins can manage media items"
  on public.media_items for all
  using (public.is_memorial_admin(memorial_id))
  with check (public.is_memorial_admin(memorial_id));


-- 8. POLICIES: TIMELINE EVENTS
drop policy if exists "Timeline events viewable by anyone who can view memorial" on public.timeline_events;
create policy "Timeline events viewable by anyone who can view memorial"
  on public.timeline_events for select
  using (public.can_view_memorial(memorial_id));

drop policy if exists "Admins can manage timeline events" on public.timeline_events;
create policy "Admins can manage timeline events"
  on public.timeline_events for all
  using (public.is_memorial_admin(memorial_id))
  with check (public.is_memorial_admin(memorial_id));


-- 9. POLICIES: PRIVATE CARETAKER MESSAGES
drop policy if exists "Memorial admins can view caretaker messages" on public.caretaker_messages;
create policy "Memorial admins can view caretaker messages"
  on public.caretaker_messages for select
  using (public.is_memorial_admin(memorial_id));

drop policy if exists "Memorial admins can update caretaker messages" on public.caretaker_messages;
create policy "Memorial admins can update caretaker messages"
  on public.caretaker_messages for update
  using (public.is_memorial_admin(memorial_id))
  with check (public.is_memorial_admin(memorial_id));

drop policy if exists "Memorial admins can delete caretaker messages" on public.caretaker_messages;
create policy "Memorial admins can delete caretaker messages"
  on public.caretaker_messages for delete
  using (public.is_memorial_admin(memorial_id));


-- 10. POLICIES: PAYMENTS
drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
  on public.payments for select
  using (
    user_id = auth.uid()
    or (memorial_id is not null and public.is_memorial_admin(memorial_id))
  );
