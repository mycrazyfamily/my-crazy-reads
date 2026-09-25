-- ============================================================================
-- securite_cles_declencheurs_v1.sql — 25/09/2026
--
-- OBJET : plus aucune cle ecrite en clair dans le code SQL ou dans un declencheur.
--
-- Constat du 25/09 : la cle service_role (qui ignore toutes les regles RLS et ouvre
-- la base entiere) etait ecrite en dur a trois endroits : notify_enrich_clothing,
-- trigger_enrich_clothing, et le webhook « enrich-place-environment » de la table
-- places cree depuis le dashboard. Deux declencheurs de book_requests etaient par
-- ailleurs obsoletes, dont un qui envoyait chaque nouvelle ligne de livre vers une
-- ancienne instance n8n cloud (mycrazyfamily.app.n8n.cloud) qui n'est plus utilisee.
--
-- CE QUE FAIT LE SCRIPT (en un seul bloc : tout passe, ou rien ne change) :
--   [0] GARDE : le secret Vault « service_role_key » doit exister, etre la cle
--       service_role, et etre IDENTIQUE a celle qui fonctionne aujourd'hui dans
--       notify_enrich_clothing. Sinon le script s'arrete sans rien modifier.
--   [1] notify_enrich_clothing : meme logique, la cle est lue dans Vault au moment
--       de l'appel. search_path fixe (Warning Lovable). Si le secret manque un jour,
--       l'enrichissement est ignore avec un avertissement : la mise a jour de l'avatar,
--       elle, n'est JAMAIS bloquee.
--   [2] places : le webhook du dashboard est remplace par un declencheur equivalent
--       (notify_enrich_place) : memes evenements (INSERT, UPDATE), meme URL, memes
--       donnees envoyees, meme delai de 5 s. La cle est lue dans Vault.
--   [3] Suppression du code mort : trigger_enrich_clothing et ses deux declencheurs.
--       Elle reagissait au changement de la tenue SAISIE, alors qu'enrich-clothing
--       travaille depuis sa v3.0 a partir de l'AVATAR et ignorait ces appels. Aucune
--       insertion du site ne pose d'avatar a la creation (verifie dans le code) : seul
--       cas ou elle aurait servi. L'enrichissement reel continue via [1].
--   [4] Suppression des deux declencheurs obsoletes de book_requests :
--       « mcf-book-requests-insert » (ancienne instance n8n cloud) et
--       « 1_TRIGGER_Commande_Livre_MCF » (adresse de TEST de la Book Factory ; les
--       lancements passent par l'Edge Function trigger-book-factory).
--   [5] CONTROLE FINAL : plus aucun jeton en clair dans les fonctions du schema public
--       ni dans les declencheurs. Sinon, tout est annule.
--
-- PREREQUIS : secret Vault cree AVANT (Dashboard > Project Settings > Vault >
--   « Add new secret », nom exact : service_role_key, valeur : l'ancienne cle
--   service_role, onglet « Legacy API keys » des reglages API).
--
-- A FAIRE LE JOUR OU LES CLES CHANGENT : mettre a jour la valeur du secret Vault.
-- ============================================================================

BEGIN;

-- [0] Garde -------------------------------------------------------------------
DO $$
DECLARE
  v_secret   text;
  v_actuelle text;
  v_payload  text;
  v_role     text;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;

  IF v_secret IS NULL OR v_secret NOT LIKE 'eyJ%' THEN
    RAISE EXCEPTION 'Secret Vault « service_role_key » absent ou invalide. Rien n''a ete modifie.';
  END IF;

  v_payload := translate(split_part(v_secret, '.', 2), '-_', '+/');
  v_payload := v_payload || repeat('=', (4 - length(v_payload) % 4) % 4);
  v_role := convert_from(decode(v_payload, 'base64'), 'UTF8')::jsonb ->> 'role';
  IF v_role IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Le secret Vault n''est pas la cle service_role (role lu : %). Rien n''a ete modifie.',
      coalesce(v_role, 'inconnu');
  END IF;

  SELECT substring(p.prosrc FROM 'Bearer (eyJ[A-Za-z0-9_.-]+)') INTO v_actuelle
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'notify_enrich_clothing';

  IF v_actuelle IS NOT NULL AND v_actuelle <> v_secret THEN
    RAISE EXCEPTION 'Le secret Vault differe de la cle qui fonctionne aujourd''hui. Recopier la cle service_role. Rien n''a ete modifie.';
  END IF;
END $$;

-- [1] notify_enrich_clothing : cle lue dans Vault, search_path fixe -------------
CREATE OR REPLACE FUNCTION public.notify_enrich_clothing()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_key text;
BEGIN
  IF (NEW.avatar_url IS NOT DISTINCT FROM OLD.avatar_url) THEN
    RETURN NEW;
  END IF;

  IF NEW.avatar_url IS NULL OR NEW.avatar_url = '' THEN
    RETURN NEW;
  END IF;

  -- securite_cles_declencheurs_v1 : la cle n'est plus ecrite ici, elle est lue dans Vault.
  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;
  IF v_key IS NULL THEN
    RAISE WARNING 'notify_enrich_clothing : secret Vault service_role_key absent, enrichissement ignore';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://rjbmhcoctpwmlqndzybm.supabase.co/functions/v1/enrich-clothing',
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)::jsonb,
      'old_record', row_to_json(OLD)::jsonb
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    )
  );
  RETURN NEW;
END;
$function$;

-- [2] places : declencheur equivalent au webhook du dashboard -------------------
CREATE OR REPLACE FUNCTION public.notify_enrich_place()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_key text;
BEGIN
  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;
  IF v_key IS NULL THEN
    RAISE WARNING 'notify_enrich_place : secret Vault service_role_key absent, enrichissement ignore';
    RETURN NEW;
  END IF;

  -- Memes donnees que le webhook du dashboard (supabase_functions.http_request).
  PERFORM net.http_post(
    url := 'https://rjbmhcoctpwmlqndzybm.supabase.co/functions/v1/enrich-place-environment',
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW)::jsonb,
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS "enrich-place-environment" ON public.places;
DROP TRIGGER IF EXISTS trigger_enrich_place_environment ON public.places;
CREATE TRIGGER trigger_enrich_place_environment
  AFTER INSERT OR UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION public.notify_enrich_place();

-- [3] Code mort : ancien enrichissement sur la tenue saisie ---------------------
DROP TRIGGER IF EXISTS on_clothing_style_change_child ON public.child_profiles;
DROP TRIGGER IF EXISTS on_clothing_style_change_family ON public.family_members;
DROP FUNCTION IF EXISTS public.trigger_enrich_clothing();

-- [4] Declencheurs obsoletes de book_requests -----------------------------------
DROP TRIGGER IF EXISTS "mcf-book-requests-insert" ON public.book_requests;
DROP TRIGGER IF EXISTS "1_TRIGGER_Commande_Livre_MCF" ON public.book_requests;

-- [5] Controle final ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosrc ILIKE '%eyJhbGci%'
  ) THEN
    RAISE EXCEPTION 'Un jeton est encore ecrit dans une fonction du schema public. Tout est annule.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers WHERE action_statement ILIKE '%eyJhbGci%'
  ) THEN
    RAISE EXCEPTION 'Un jeton est encore ecrit dans un declencheur. Tout est annule.';
  END IF;
END $$;

COMMIT;
