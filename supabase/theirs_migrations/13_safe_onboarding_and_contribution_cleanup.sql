-- New pages must never become visible as a side effect of creation.
alter table public.memorials alter column status set default 'draft';
alter table public.memorials alter column privacy set default 'unlisted';

-- "Suggest a life moment" wrote ordinary memories instead of timeline events.
-- Remove the retired switch without deleting any existing family content.
alter table public.memorials alter column contribution_settings set default
  '{"accept_contributions":true,"tributes":true,"memories":true,"photos":true,"voice":false,"videos":false}'::jsonb;

update public.memorials
set contribution_settings = coalesce(contribution_settings, '{}'::jsonb) - 'moments'
where coalesce(contribution_settings, '{}'::jsonb) ? 'moments';
