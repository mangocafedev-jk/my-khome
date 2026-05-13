ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS description  text,
  ADD COLUMN IF NOT EXISTS landmarks    text,
  ADD COLUMN IF NOT EXISTS parking      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS furnished    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pets_allowed boolean NOT NULL DEFAULT false;
