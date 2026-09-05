-- Migration 11: Contribution Safety, Trust & Optimistic Receipts
-- Supports the frictionless-but-moderated contribution model specified in docs/security.md.

-- 1. Updates to public.memories
alter table public.memories add column if not exists receipt_token text unique;
alter table public.memories add column if not exists safety_decision text not null default 'review' check (safety_decision in ('safe', 'review', 'blocked'));
alter table public.memories add column if not exists safety_details jsonb not null default '{}'::jsonb;
alter table public.memories add column if not exists contributor_role text not null default 'anonymous' check (contributor_role in ('anonymous', 'invited', 'trusted', 'co_admin', 'owner'));
alter table public.memories add column if not exists is_quarantined boolean not null default false;

-- Update status check constraint to include 'blocked'
alter table public.memories drop constraint if exists memories_status_check;
alter table public.memories add constraint memories_status_check check (status in ('pending_approval', 'approved', 'rejected', 'blocked'));

-- 2. Updates to public.collaborators
alter table public.collaborators add column if not exists is_trusted boolean not null default false;

-- 3. Updates to public.memorials
alter table public.memorials add column if not exists contribution_settings jsonb default '{"accept_contributions":true,"tributes":true,"memories":true,"photos":true,"voice":false,"videos":false,"moments":true}'::jsonb;

-- 4. Fast Query Indexes
create index if not exists idx_memories_moderation_queue on public.memories(memorial_id, status, safety_decision, created_at desc);
