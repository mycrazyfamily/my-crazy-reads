-- Add family-level INSERT policies for child relationship tables
-- This allows family members to add superpowers, likes, and challenges to any child in their family

-- child_superpowers: family-level INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'child_superpowers' 
    AND policyname = 'Users can insert superpowers for family children'
  ) THEN
    CREATE POLICY "Users can insert superpowers for family children"
    ON public.child_superpowers
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_superpowers.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;

-- child_likes: family-level INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'child_likes' 
    AND policyname = 'Users can insert likes for family children'
  ) THEN
    CREATE POLICY "Users can insert likes for family children"
    ON public.child_likes
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_likes.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;

-- child_challenges: family-level INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'child_challenges' 
    AND policyname = 'Users can insert challenges for family children'
  ) THEN
    CREATE POLICY "Users can insert challenges for family children"
    ON public.child_challenges
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_challenges.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;

-- child_universes: family-level INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'child_universes' 
    AND policyname = 'Users can insert universes for family children'
  ) THEN
    CREATE POLICY "Users can insert universes for family children"
    ON public.child_universes
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_universes.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;

-- child_discoveries: family-level INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'child_discoveries' 
    AND policyname = 'Users can insert discoveries for family children'
  ) THEN
    CREATE POLICY "Users can insert discoveries for family children"
    ON public.child_discoveries
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.child_profiles cp
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE cp.id = child_discoveries.child_id
          AND (cp.family_id = up.family_id OR cp.user_id = up.id)
      )
    );
  END IF;
END $$;