-- Add UPDATE and DELETE policies for child_comforters table
CREATE POLICY "Users can update comforters for their children" 
ON public.child_comforters 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    WHERE cp.id = child_comforters.child_id 
    AND cp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    WHERE cp.id = child_comforters.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update comforters for their family" 
ON public.child_comforters 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    JOIN user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_comforters.child_id 
    AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    JOIN user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_comforters.child_id 
    AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

CREATE POLICY "Users can delete comforters for their children" 
ON public.child_comforters 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    WHERE cp.id = child_comforters.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete comforters for their family" 
ON public.child_comforters 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    JOIN user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_comforters.child_id 
    AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);