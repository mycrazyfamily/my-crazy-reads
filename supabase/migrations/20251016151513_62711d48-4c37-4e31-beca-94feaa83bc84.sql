-- Add breed column to pets table
ALTER TABLE public.pets 
ADD COLUMN breed TEXT;

COMMENT ON COLUMN public.pets.breed IS 'Race de l''animal (facultatif)';