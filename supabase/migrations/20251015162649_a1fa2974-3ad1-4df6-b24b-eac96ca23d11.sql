-- Allow owner to update comforters and keep updated_at in sync

-- 1) RLS policy for UPDATE on comforters (owner-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'comforters' 
      AND policyname = 'Users can update their own comforters'
  ) THEN
    CREATE POLICY "Users can update their own comforters"
    ON public.comforters
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

-- 2) Ensure updated_at is auto-updated on changes
DROP TRIGGER IF EXISTS update_comforters_updated_at ON public.comforters;
CREATE TRIGGER update_comforters_updated_at
BEFORE UPDATE ON public.comforters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();