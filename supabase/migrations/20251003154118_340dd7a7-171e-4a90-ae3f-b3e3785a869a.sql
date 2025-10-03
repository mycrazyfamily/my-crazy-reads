-- Modifier les policies sur family_members pour permettre la lecture par family_id
DROP POLICY IF EXISTS "Users can view family members they created" ON public.family_members;

CREATE POLICY "Users can view family members of their family"
ON public.family_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.family_id = family_members.family_id
  )
);