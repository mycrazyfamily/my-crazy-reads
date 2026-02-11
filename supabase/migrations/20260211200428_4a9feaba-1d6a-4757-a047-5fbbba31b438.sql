
-- Add avatar_url column to child_profiles
ALTER TABLE public.child_profiles ADD COLUMN avatar_url text NULL;

-- Add avatar_url column to pets
ALTER TABLE public.pets ADD COLUMN avatar_url text NULL;

-- family_members already has an 'avatar' column (text), adding avatar_url separately
ALTER TABLE public.family_members ADD COLUMN avatar_url text NULL;
