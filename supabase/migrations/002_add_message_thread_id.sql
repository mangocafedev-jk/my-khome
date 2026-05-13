-- Migration 002: Add thread_id to messages
-- Same listing_id + sender_contact → same conversation thread
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Add thread_id column
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS thread_id uuid;

-- 2. Backfill: use earliest message id as thread_id per (listing_id, sender_contact) group
WITH first_msgs AS (
  SELECT DISTINCT ON (listing_id, sender_contact)
    id,
    listing_id,
    sender_contact
  FROM public.messages
  ORDER BY listing_id, sender_contact, created_at ASC
)
UPDATE public.messages m
SET thread_id = f.id
FROM first_msgs f
WHERE m.listing_id = f.listing_id
  AND m.sender_contact = f.sender_contact;

-- 3. Trigger: auto-assign thread_id on every INSERT
CREATE OR REPLACE FUNCTION public.assign_message_thread_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Reuse existing thread for same listing + contact
  SELECT thread_id INTO NEW.thread_id
  FROM public.messages
  WHERE listing_id    = NEW.listing_id
    AND sender_contact = NEW.sender_contact
    AND thread_id IS NOT NULL
  LIMIT 1;

  -- No existing thread → this message starts a new one
  IF NEW.thread_id IS NULL THEN
    NEW.thread_id := NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS assign_message_thread_id ON public.messages;
CREATE TRIGGER assign_message_thread_id
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.assign_message_thread_id();

-- 4. Indexes for fast thread queries
CREATE INDEX IF NOT EXISTS idx_messages_thread_id
  ON public.messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_messages_listing_contact
  ON public.messages(listing_id, sender_contact);
