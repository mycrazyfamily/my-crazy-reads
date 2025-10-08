-- Ajouter les politiques RLS manquantes pour les tables de liaison enfant

-- child_traits
ALTER TABLE public.child_traits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert traits for their children"
ON public.child_traits
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_traits.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view traits for their children"
ON public.child_traits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_traits.child_id 
    AND cp.user_id = auth.uid()
  )
);

-- child_passions
ALTER TABLE public.child_passions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert passions for their children"
ON public.child_passions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_passions.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view passions for their children"
ON public.child_passions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_passions.child_id 
    AND cp.user_id = auth.uid()
  )
);

-- child_challenges
ALTER TABLE public.child_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert challenges for their children"
ON public.child_challenges
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_challenges.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view challenges for their children"
ON public.child_challenges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_challenges.child_id 
    AND cp.user_id = auth.uid()
  )
);

-- child_universes
ALTER TABLE public.child_universes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert universes for their children"
ON public.child_universes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_universes.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view universes for their children"
ON public.child_universes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_universes.child_id 
    AND cp.user_id = auth.uid()
  )
);

-- child_discoveries
ALTER TABLE public.child_discoveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert discoveries for their children"
ON public.child_discoveries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_discoveries.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view discoveries for their children"
ON public.child_discoveries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_discoveries.child_id 
    AND cp.user_id = auth.uid()
  )
);

-- child_comforters
ALTER TABLE public.child_comforters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert comforters for their children"
ON public.child_comforters
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_comforters.child_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view comforters for their children"
ON public.child_comforters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_comforters.child_id 
    AND cp.user_id = auth.uid()
  )
);

-- comforters - autoriser l'insertion
CREATE POLICY "Users can insert their own comforters"
ON public.comforters
FOR INSERT
WITH CHECK (auth.uid() = created_by);