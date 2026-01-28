-- Add RLS policies for mcf_book_pages table
-- Users can view book pages for productions linked to their child profiles

-- Policy 1: Users can view pages of books they own (via child_profiles)
CREATE POLICY "Users can view pages of their books"
ON public.mcf_book_pages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mcf_book_productions mbp
    JOIN public.child_profiles cp ON cp.id = mbp.child_id
    WHERE mbp.id = mcf_book_pages.production_id
    AND cp.user_id = auth.uid()
  )
);

-- Policy 2: Users can view pages via family membership (if book belongs to their family)
CREATE POLICY "Family members can view book pages"
ON public.mcf_book_pages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mcf_book_productions mbp
    JOIN public.user_profiles up ON up.family_id = mbp.family_id
    WHERE mbp.id = mcf_book_pages.production_id
    AND up.id = auth.uid()
  )
);

-- Ensure anon role has no access
REVOKE ALL ON public.mcf_book_pages FROM anon;