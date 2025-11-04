-- Add physical_details column to child_profiles
ALTER TABLE public.child_profiles
ADD COLUMN physical_details jsonb DEFAULT '[]'::jsonb;

-- Add physical_details column to family_members
ALTER TABLE public.family_members
ADD COLUMN physical_details jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.child_profiles.physical_details IS 'Array of physical details: birthmarks, scars, etc.';
COMMENT ON COLUMN public.family_members.physical_details IS 'Array of physical details: birthmarks, scars, etc.';