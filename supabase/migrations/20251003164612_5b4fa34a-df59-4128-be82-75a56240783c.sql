-- Update pets SELECT policy to allow family members (not only family creators) to view pets

-- 1) Drop the restrictive SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view pets they created" ON public.pets;

-- 2) Create a new SELECT policy that allows any user whose user_profiles.family_id matches the pet's family_id to read pets
CREATE POLICY "Users can view pets of their family"
ON public.pets
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.family_id = pets.family_id
  )
);
