-- Add clothing_style column to child_profiles
ALTER TABLE public.child_profiles
ADD COLUMN clothing_style jsonb DEFAULT '[]'::jsonb;

-- Add clothing_style column to family_members
ALTER TABLE public.family_members
ADD COLUMN clothing_style jsonb DEFAULT '[]'::jsonb;

-- Add clothing_style column to pets
ALTER TABLE public.pets
ADD COLUMN clothing_style jsonb DEFAULT '[]'::jsonb;