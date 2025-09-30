-- Enable RLS on drafts (safe if already enabled)
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own drafts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'Can insert own drafts'
  ) THEN
    CREATE POLICY "Can insert own drafts"
    ON public.drafts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);
  END IF;
END$$;

-- Allow users to update their own drafts (optional, useful for future edits)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'Can update own drafts'
  ) THEN
    CREATE POLICY "Can update own drafts"
    ON public.drafts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);
  END IF;
END$$;