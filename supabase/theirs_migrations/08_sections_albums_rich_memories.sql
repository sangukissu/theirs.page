-- Migration: 08_sections_albums_rich_memories.sql
alter table public.memorials
add column if not exists section_settings jsonb default '{"story": true, "tributes": true, "timeline": true, "gallery": true, "stories": true}'::jsonb;

alter table public.media_items
add column if not exists album text,
add column if not exists is_pinned boolean default false;

create index if not exists idx_media_items_order on public.media_items(memorial_id, is_pinned desc, order_index asc);

alter table public.memories
add column if not exists photo_urls jsonb default '[]'::jsonb;
