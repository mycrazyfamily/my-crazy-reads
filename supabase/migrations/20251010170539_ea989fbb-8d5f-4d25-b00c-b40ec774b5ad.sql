-- Enable RLS and public read on challenges table (needed for mapping by label)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'challenges' AND policyname = 'Anyone can read challenges'
  ) THEN
    CREATE POLICY "Anyone can read challenges" ON public.challenges FOR SELECT USING (true);
  END IF;
END $$;

-- Add family-level SELECT for child_universes and child_discoveries (consistency with other child_* tables)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_universes' AND policyname = 'Users can view child_universes for their family'
  ) THEN
    CREATE POLICY "Users can view child_universes for their family"
    ON public.child_universes
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_universes.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_discoveries' AND policyname = 'Users can view child_discoveries for their family'
  ) THEN
    CREATE POLICY "Users can view child_discoveries for their family"
    ON public.child_discoveries
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_discoveries.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;
