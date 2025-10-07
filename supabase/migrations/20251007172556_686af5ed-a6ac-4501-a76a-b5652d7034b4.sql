-- Fix RLS policies that still reference 'drafts' for family members and child-family links
-- This migration removes legacy 'drafts'-based policies and replaces them with
-- family-based policies using user_profiles and child_profiles.

-- =============================
-- family_members policies
-- =============================

-- Drop legacy policies that reference drafts
DROP POLICY IF EXISTS "Users can insert family members for their children" ON public.family_members;
DROP POLICY IF EXISTS "Users can update family members they created" ON public.family_members;
DROP POLICY IF EXISTS "Users can delete family members they created" ON public.family_members;

-- Keep existing SELECT policy (already family-based) and add correct insert/update/delete

-- Allow inserting family members for the user's family
CREATE POLICY "Users can insert family members for their family"
ON public.family_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.family_id = family_members.family_id
  )
);

-- Allow updating family members that belong to the user's family
CREATE POLICY "Users can update family members of their family"
ON public.family_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.family_id = family_members.family_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.family_id = family_members.family_id
  )
);

-- Allow deleting family members that belong to the user's family
CREATE POLICY "Users can delete family members of their family"
ON public.family_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.family_id = family_members.family_id
  )
);

-- =============================
-- child_family_members policies
-- =============================

-- Drop legacy policies that reference drafts
DROP POLICY IF EXISTS "Users can insert child_family_members for their children" ON public.child_family_members;
DROP POLICY IF EXISTS "Users can delete child_family_members for their children" ON public.child_family_members;
DROP POLICY IF EXISTS "Users can view child_family_members for their children" ON public.child_family_members;

-- Allow selecting child-family links when the child belongs to the user's family (or is owned by the user)
CREATE POLICY "Users can view child_family_members for their family"
ON public.child_family_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_family_members.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

-- Allow inserting child-family links for children in the user's family (or owned by the user)
CREATE POLICY "Users can insert child_family_members for their family"
ON public.child_family_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_family_members.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

-- Allow updating child-family links for children in the user's family (or owned by the user)
CREATE POLICY "Users can update child_family_members for their family"
ON public.child_family_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_family_members.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_family_members.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

-- Allow deleting child-family links for children in the user's family (or owned by the user)
CREATE POLICY "Users can delete child_family_members for their family"
ON public.child_family_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.child_profiles cp
    JOIN public.user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_family_members.child_id
      AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);
