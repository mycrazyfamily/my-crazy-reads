-- Add physical_details column to pets table
ALTER TABLE public.pets 
ADD COLUMN physical_details TEXT;