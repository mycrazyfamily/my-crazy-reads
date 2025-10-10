-- Add family-level SELECT policies on junction tables to allow viewing a child's data by family members

-- child_superpowers
CREATE POLICY "Users can view child_superpowers for their family"
ON public.child_superpowers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_superpowers.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

-- child_likes
CREATE POLICY "Users can view child_likes for their family"
ON public.child_likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_likes.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

-- child_challenges
CREATE POLICY "Users can view child_challenges for their family"
ON public.child_challenges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_challenges.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);
