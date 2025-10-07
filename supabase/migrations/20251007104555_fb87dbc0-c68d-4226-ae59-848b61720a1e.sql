-- Update RLS policies on child_pets to reference child_profiles instead of drafts
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_pets' AND policyname = 'Users can insert child_pets for their children'
  ) THEN
    DROP POLICY "Users can insert child_pets for their children" ON public.child_pets;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_pets' AND policyname = 'Users can delete child_pets for their children'
  ) THEN
    DROP POLICY "Users can delete child_pets for their children" ON public.child_pets;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_pets' AND policyname = 'Users can view child_pets for their children'
  ) THEN
    DROP POLICY "Users can view child_pets for their children" ON public.child_pets;
  END IF;
END $$;

-- Create new policies using child_profiles + user_profiles to validate family ownership
CREATE POLICY "Users can view child_pets for their family"
ON public.child_pets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_pets.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

CREATE POLICY "Users can insert child_pets for their family"
ON public.child_pets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_pets.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

CREATE POLICY "Users can delete child_pets for their family"
ON public.child_pets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_pets.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

-- Optional: allow update of relation fields if needed in the future
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_pets' AND policyname = 'Users can update child_pets for their family'
  ) THEN
    CREATE POLICY "Users can update child_pets for their family"
    ON public.child_pets
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_pets.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_pets.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;

-- Create trigger to keep user_profiles.family_id synchronized when a child_profile is inserted
CREATE OR REPLACE FUNCTION public.sync_user_profile_family_on_child_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles up
  SET family_id = NEW.family_id
  WHERE up.id = NEW.user_id
    AND (up.family_id IS NULL OR up.family_id <> NEW.family_id);
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_user_profile_family_on_child_insert'
  ) THEN
    CREATE TRIGGER trg_sync_user_profile_family_on_child_insert
    AFTER INSERT ON public.child_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_profile_family_on_child_insert();
  END IF;
END $$;

-- One-time backfill: synchronize existing user_profiles where null
UPDATE public.user_profiles up
SET family_id = cp.family_id
FROM public.child_profiles cp
WHERE up.id = cp.user_id
  AND up.family_id IS NULL;