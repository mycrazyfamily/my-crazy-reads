-- Migration pour supprimer toutes les données de l'utilisateur 88d925f0-a1af-475c-8987-8bac0130ba68

DO $$
DECLARE
  target_user_id uuid := '88d925f0-a1af-475c-8987-8bac0130ba68';
  user_family_id uuid;
BEGIN
  -- Récupérer le family_id de l'utilisateur s'il existe
  SELECT family_id INTO user_family_id 
  FROM public.user_profiles 
  WHERE id = target_user_id;

  -- Supprimer les notifications
  DELETE FROM public.notifications WHERE user_id = target_user_id;

  -- Supprimer les gift_orders
  DELETE FROM public.gift_orders WHERE created_by = target_user_id OR activated_by = target_user_id;

  -- Supprimer les events
  DELETE FROM public.events WHERE created_by = target_user_id;

  -- Supprimer les drafts
  DELETE FROM public.drafts WHERE created_by = target_user_id;

  -- Supprimer les subscriptions
  DELETE FROM public.subscriptions WHERE created_by = target_user_id;

  -- Supprimer les book_requests
  DELETE FROM public.book_requests WHERE created_by = target_user_id;

  -- Supprimer les books
  DELETE FROM public.books WHERE created_by = target_user_id;

  -- Supprimer les données liées aux child_profiles
  -- D'abord les tables de liaison
  DELETE FROM public.child_superpowers 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_likes 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_challenges 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_universes 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_discoveries 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_family_members 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_pets 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_comforters 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_traits 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  DELETE FROM public.child_passions 
  WHERE child_id IN (SELECT id FROM public.child_profiles WHERE user_id = target_user_id);

  -- Supprimer les child_profiles
  DELETE FROM public.child_profiles WHERE user_id = target_user_id;

  -- Supprimer les family_members de la famille si elle existe
  IF user_family_id IS NOT NULL THEN
    DELETE FROM public.family_members WHERE family_id = user_family_id;
    
    -- Supprimer les pets de la famille
    DELETE FROM public.pets WHERE family_id = user_family_id;
    
    -- Supprimer la famille
    DELETE FROM public.families WHERE id = user_family_id;
  END IF;

  -- Supprimer les comforters créés
  DELETE FROM public.comforters WHERE created_by = target_user_id;

  -- Supprimer le profil utilisateur
  DELETE FROM public.user_profiles WHERE id = target_user_id;

  RAISE NOTICE 'Toutes les données de l''utilisateur % ont été supprimées', target_user_id;
END $$;