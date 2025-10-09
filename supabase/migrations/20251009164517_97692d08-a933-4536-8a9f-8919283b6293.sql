-- Mettre à jour les politiques RLS pour permettre la lecture des tables de référence

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can read their own traits" ON public.traits;
DROP POLICY IF EXISTS "Users can read their own passions" ON public.passions;
DROP POLICY IF EXISTS "Read own discoveries" ON public.discoveries;
DROP POLICY IF EXISTS "Select own discoveries only" ON public.discoveries;

-- Créer des politiques de lecture publique pour les tables de référence
CREATE POLICY "Anyone can read traits"
  ON public.traits
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read passions"
  ON public.passions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read discoveries"
  ON public.discoveries
  FOR SELECT
  USING (true);

-- Vérifier que les challenges et universes ont déjà des politiques publiques
-- (challenges n'a pas de RLS et universes a déjà "Select all universes")