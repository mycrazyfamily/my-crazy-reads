-- Add RLS policies to book_themes table (junction table linking books to themes)

-- Users can view themes for their books
CREATE POLICY "Users can view themes for their books"
ON public.book_themes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.books
    WHERE books.id = book_themes.book_id
    AND books.created_by = auth.uid()
  )
);

-- Users can add themes to their books
CREATE POLICY "Users can add themes to their books"
ON public.book_themes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.books
    WHERE books.id = book_themes.book_id
    AND books.created_by = auth.uid()
  )
);

-- Users can remove themes from their books
CREATE POLICY "Users can remove themes from their books"
ON public.book_themes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.books
    WHERE books.id = book_themes.book_id
    AND books.created_by = auth.uid()
  )
);

-- Block anonymous access
REVOKE ALL ON public.book_themes FROM anon;