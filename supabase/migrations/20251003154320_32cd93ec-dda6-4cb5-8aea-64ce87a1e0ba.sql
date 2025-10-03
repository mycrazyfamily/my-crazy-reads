-- Ajouter les policies manquantes sur families
CREATE POLICY "Users can insert their own family"
ON public.families
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own family"
ON public.families
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Ajouter les policies manquantes sur user_profiles pour permettre la mise à jour du family_id
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);