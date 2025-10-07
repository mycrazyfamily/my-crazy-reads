-- Add RLS policies for child_profiles table

-- Policy pour permettre aux utilisateurs de voir leurs propres profils d'enfants
CREATE POLICY "Users can view their own child profiles"
ON child_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.family_id = child_profiles.family_id
  )
);

-- Policy pour permettre aux utilisateurs de créer des profils d'enfants
CREATE POLICY "Users can insert their own child profiles"
ON child_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux utilisateurs de modifier leurs propres profils d'enfants
CREATE POLICY "Users can update their own child profiles"
ON child_profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.family_id = child_profiles.family_id
  )
)
WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux utilisateurs de supprimer leurs propres profils d'enfants
CREATE POLICY "Users can delete their own child profiles"
ON child_profiles
FOR DELETE
USING (auth.uid() = user_id);