-- Migration 06: Drop people_in_life table and associated policies
-- Relationships now appear naturally in memories, timeline chapters, and captions.

-- 1. Drop RLS policies
drop policy if exists "People in life viewable by anyone who can view memorial" on public.people_in_life;
drop policy if exists "Admins can manage people in life" on public.people_in_life;

-- 2. Drop table cascade (drops indexes, constraints, foreign keys)
drop table if exists public.people_in_life cascade;
