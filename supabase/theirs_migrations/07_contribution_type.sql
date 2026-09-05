-- 07_contribution_type.sql: Distinguish between ritual tributes and life stories
alter table public.memories 
  add column if not exists contribution_type text default 'tribute' 
  check (contribution_type in ('tribute', 'story'));

create index if not exists idx_memories_contribution_type on public.memories(memorial_id, contribution_type, status);
