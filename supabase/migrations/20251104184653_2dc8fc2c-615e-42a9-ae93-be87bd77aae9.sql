-- Convert pets.physical_details from text to jsonb
-- First, convert existing text data to jsonb array format
UPDATE public.pets 
SET physical_details = 
  CASE 
    WHEN physical_details IS NULL THEN '[]'::jsonb
    WHEN physical_details = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(physical_details)
  END::text
WHERE physical_details IS NOT NULL AND physical_details != '';

-- Now alter the column type to jsonb
ALTER TABLE public.pets 
ALTER COLUMN physical_details TYPE jsonb USING 
  CASE 
    WHEN physical_details IS NULL OR physical_details = '' THEN '[]'::jsonb
    ELSE physical_details::jsonb
  END;

-- Set default value
ALTER TABLE public.pets 
ALTER COLUMN physical_details SET DEFAULT '[]'::jsonb;