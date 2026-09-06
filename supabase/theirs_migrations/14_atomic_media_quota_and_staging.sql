-- ==============================================================================
-- Migration 14: Atomic Media Quota Enforcement & Staging Support
-- ==============================================================================

-- Enforce the 5-photo limit on the Free tier atomically at the database level.
-- Uses row-level locking on the parent memorial to eliminate race conditions
-- across concurrent uploads and moderation approvals.

CREATE OR REPLACE FUNCTION public.enforce_media_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_paid boolean;
  v_current_count integer;
BEGIN
  -- 1. Lock the memorial row for update to serialize concurrent inserts for this memorial
  SELECT is_paid INTO v_is_paid
  FROM public.memorials
  WHERE id = NEW.memorial_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Memorial % not found.', NEW.memorial_id USING ERRCODE = 'P0002';
  END IF;

  -- 2. Complete plan item-count rules are unrestricted here. Migration 16
  -- separately enforces the 10 GiB original-upload entitlement per memorial.
  IF v_is_paid IS TRUE THEN
    RETURN NEW;
  END IF;

  -- 3. Free plan restrictions:
  -- Disallow audio and video
  IF NEW.media_type IN ('audio', 'video') THEN
    RAISE EXCEPTION 'Audio and video require the Complete plan.' USING ERRCODE = 'P0001';
  END IF;

  -- Count existing image media items
  SELECT count(*) INTO v_current_count
  FROM public.media_items
  WHERE memorial_id = NEW.memorial_id
    AND media_type = 'image';

  IF v_current_count >= 5 THEN
    RAISE EXCEPTION 'This memorial has reached the 5-photo limit on the free plan.' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_media_quota ON public.media_items;
CREATE TRIGGER trg_enforce_media_quota
BEFORE INSERT ON public.media_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_media_quota();
