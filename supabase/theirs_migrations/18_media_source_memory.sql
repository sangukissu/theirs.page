-- Link gallery projections to their source contribution without duplicating R2.
alter table public.media_items
  add column if not exists source_memory_id uuid;

alter table public.media_items
  drop constraint if exists media_items_source_memory_id_fkey;
alter table public.media_items
  add constraint media_items_source_memory_id_fkey
  foreign key (source_memory_id) references public.memories(id) on delete cascade;

create index if not exists idx_media_items_source_memory
  on public.media_items(source_memory_id)
  where source_memory_id is not null;
