-- Accepted collaborators can read the memorial they belong to, including
-- private and draft memorials. The relationship still grants no edit rights.
-- Idempotent and safe to re-run.

drop policy if exists "Public and unlisted memorials are viewable by everyone"
  on public.memorials;
drop policy if exists "Accessible memorials are viewable"
  on public.memorials;

create policy "Accessible memorials are viewable"
  on public.memorials for select
  using (public.can_view_memorial(id));
