-- Set default JSON object for family_members.details to ensure it's always initialized
ALTER TABLE public.family_members
ALTER COLUMN details SET DEFAULT '{}'::jsonb;