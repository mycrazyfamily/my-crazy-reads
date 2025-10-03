-- Add RLS policies for family_members table
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view family members they created"
ON public.family_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = family_members.child_id
    AND drafts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert family members for their children"
ON public.family_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = family_members.child_id
    AND drafts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update family members they created"
ON public.family_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = family_members.child_id
    AND drafts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete family members they created"
ON public.family_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = family_members.child_id
    AND drafts.created_by = auth.uid()
  )
);

-- Add RLS policies for pets table
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pets they created"
ON public.pets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.families
    WHERE families.id = pets.family_id
    AND families.created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert pets for their families"
ON public.pets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.families
    WHERE families.id = pets.family_id
    AND families.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update pets they created"
ON public.pets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.families
    WHERE families.id = pets.family_id
    AND families.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete pets they created"
ON public.pets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.families
    WHERE families.id = pets.family_id
    AND families.created_by = auth.uid()
  )
);

-- Add RLS policies for child_family_members pivot table
ALTER TABLE public.child_family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view child_family_members for their children"
ON public.child_family_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = child_family_members.child_id
    AND drafts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert child_family_members for their children"
ON public.child_family_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = child_family_members.child_id
    AND drafts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete child_family_members for their children"
ON public.child_family_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = child_family_members.child_id
    AND drafts.created_by = auth.uid()
  )
);

-- Add RLS policies for child_pets pivot table
ALTER TABLE public.child_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view child_pets for their children"
ON public.child_pets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = child_pets.child_id
    AND drafts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can insert child_pets for their children"
ON public.child_pets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = child_pets.child_id
    AND drafts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete child_pets for their children"
ON public.child_pets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.drafts
    WHERE drafts.id = child_pets.child_id
    AND drafts.created_by = auth.uid()
  )
);