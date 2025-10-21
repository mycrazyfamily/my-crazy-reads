-- Nettoyage complémentaire: supprimer tous les enregistrements créés par l'utilisateur dans d'autres tables
DO $$
DECLARE
  target_user_id uuid := '88d925f0-a1af-475c-8987-8bac0130ba68';
BEGIN
  -- Familles éventuellement créées par l'utilisateur (au-delà de user_family_id)
  DELETE FROM public.family_members WHERE family_id IN (
    SELECT id FROM public.families WHERE created_by = target_user_id
  );
  DELETE FROM public.pets WHERE family_id IN (
    SELECT id FROM public.families WHERE created_by = target_user_id
  );
  DELETE FROM public.families WHERE created_by = target_user_id;

  -- Tables de référentiels personnalisables potentiellement créées par l'utilisateur
  DELETE FROM public.universes WHERE created_by = target_user_id;
  DELETE FROM public.passions WHERE created_by = target_user_id;
  DELETE FROM public.discoveries WHERE created_by = target_user_id;
  DELETE FROM public.comforters WHERE created_by = target_user_id; -- déjà fait précédemment mais idempotent

  RAISE NOTICE 'Nettoyage complémentaire terminé pour %', target_user_id;
END $$;