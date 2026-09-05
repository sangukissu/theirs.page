-- Bounded public memorial feeds. Safe to re-run.
create index if not exists idx_memories_public_browse
  on public.memories(memorial_id, contribution_type, status, created_at desc, id desc);

create index if not exists idx_media_items_public_browse
  on public.media_items(memorial_id, media_type, album, is_pinned desc, order_index asc, created_at asc, id asc);
