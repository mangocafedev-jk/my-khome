-- Run this in Supabase SQL editor to add coordinate columns to listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS address       text           DEFAULT '';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS lat           numeric(10,7);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS lng           numeric(10,7);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS station_lat   numeric(10,7);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS station_lng   numeric(10,7);
