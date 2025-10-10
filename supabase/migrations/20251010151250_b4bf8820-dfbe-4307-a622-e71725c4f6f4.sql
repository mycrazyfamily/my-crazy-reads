-- Add JSONB details to store complete relative profile
ALTER TABLE public.family_members
ADD COLUMN IF NOT EXISTS details jsonb;

-- Store custom pet traits per link (e.g., values for 'other' and 'other2')
ALTER TABLE public.child_pets
ADD COLUMN IF NOT EXISTS traits_custom jsonb;