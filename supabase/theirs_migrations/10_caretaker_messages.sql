-- Replace the unused public guestbook with a private caretaker inbox.
drop table if exists public.guestbook_entries cascade;

create table if not exists public.caretaker_messages (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  sender_name text not null check (char_length(sender_name) between 1 and 100),
  sender_email text not null check (char_length(sender_email) between 3 and 254),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  read_at timestamp with time zone
);

create index if not exists idx_caretaker_messages_inbox
  on public.caretaker_messages(memorial_id, status, created_at desc);

alter table public.caretaker_messages enable row level security;

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
