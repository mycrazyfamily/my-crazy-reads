// useRealtimeAvatar v2.5
// Changelog v2.5 — TRACES DE DIAGNOSTIC TEMPORAIRES pour le shimmer bloque (lot G1).
//   Le bug corrige en v2.4 n'etait pas reproductible a volonte : trois tests qui passent ne
//   prouvent pas qu'il a disparu. Ces traces permettent de trancher en une seconde s'il revient.
//   TOUTES sont prefixees [MCF-AVATAR] : une recherche sur cette chaine les retrouve toutes.
//   A RETIRER AVANT LA MISE EN PRODUCTION. Elles sont visibles dans la console du navigateur
//   des parents. Aucune donnee personnelle n'y transite, seulement des identifiants et des
//   etats techniques.
//   Trois points de trace, choisis pour couvrir tout le cycle de vie du shimmer :
//     MONTAGE  : ce que la RULE 1 decide, et sur quelles entrees. C'est la que naissait le bug.
//     LEVEE    : qui a leve le shimmer, et par quel chemin (realtime, polling ou parent).
//     BLOCAGE  : une alarme si la base dit 'ready' avec une URL alors que le shimmer est encore
//                affiche. Si cette ligne apparait, le bug est de retour et on sait exactement
//                quel etat client le maintient.
// useRealtimeAvatar v2.4
// Changelog v2.4 — LE SHIMMER « Création… » NE PEUT PLUS RESTER BLOQUÉ.
//   SYMPTÔME (reproduit le 20/08 sur Delphine, deux fois) : le workflow se termine, la base
//   contient la nouvelle URL et avatar_status = 'ready', mais la carte reste sur « Création… ».
//   Rafraîchir la page n'y change rien. L'affichage se débloque tout seul au bout de 5 minutes,
//   ou dès qu'on relance une modification.
//   CAUSE. Deux marqueurs client survivent 5 minutes : le signal sessionStorage et le flag
//   localStorage. La v2.3 avait déjà borné le second à 20 secondes de fraîcheur, mais PAS le
//   premier : consumeAvatarRegeneration renvoie true pendant 5 minutes et, malgré son nom, ne
//   supprime pas la clé. Au REMONTAGE du composant (retour sur la liste après avoir consulté une
//   fiche), la RULE 1 relit ce signal, repose isRegenerating à true et force avatarStatus à
//   'pending'.
//   Or plus rien ne peut alors lever le shimmer : applyNewUrl exige un CHANGEMENT d'URL, et
//   l'URL est déjà à jour puisque l'avatar est arrivé avant le remontage. Ni le realtime ni le
//   polling ne voient de transition. Le shimmer attend l'expiration des 5 minutes.
//   C'est pour cela que le bug ne se voit qu'en faisant des allers-retours entre la fiche et la
//   liste pendant la génération, et qu'il résiste au rechargement : sessionStorage y survit.
//   CORRECTIF, en deux points.
//   (a) LA BASE FAIT AUTORITÉ. Si elle annonce 'ready' ET qu'une URL est présente, aucune trace
//       client ne peut imposer le shimmer. Le cas devient impossible par construction, quelle
//       que soit la raison pour laquelle un marqueur traînait.
//   (b) SAUF PENDANT LA FENÊTRE DE FRAÎCHEUR. Juste après un clic, la base annonce encore
//       'ready' une seconde ou deux, le temps que 1A_Mark_Avatar_Pending écrive 'pending'.
//       Pendant ces 20 secondes, la demande locale continue de faire foi, sinon le shimmer ne
//       s'afficherait pas du tout au moment où le parent en a besoin.
//       startRegeneration horodate désormais la demande, ce qu'il ne faisait pas : sans cela la
//       fenêtre de fraîcheur restait vide sur ce chemin.
//   (c) LA RULE 1 NE FORCE PLUS 'pending' SUR UN SIGNAL PÉRIMÉ. C'est la racine : au remontage,
//       elle entrait dans sa branche sur le seul signal sessionStorage, vieux de trois minutes,
//       et écrasait optimistement le statut réel par 'pending'. Elle exige désormais que le flag
//       localStorage, quand il existe, soit lui aussi dans la fenêtre de 20 secondes. Un flag
//       présent mais ancien vaut preuve que la demande est terminée, et non l'inverse.
//   NON MODIFIÉ volontairement : consumeAvatarRegeneration ne supprime toujours pas sa clé. Un
//   même proche peut apparaître sur PLUSIEURS cartes (Delphine est liée à cinq enfants) ; une
//   consommation réellement unique priverait les autres cartes du signal. Le correctif (a) rend
//   cette suppression inutile.
// useRealtimeAvatar v2.3
// Changelog v2.3 — LE DRAPEAU PÉRIMÉ NE FAIT PLUS REVENIR « Création… ».
//   Le drapeau localStorage vit 5 minutes. En revenant sur la liste après avoir
//   consulté une fiche, la carte le relisait et réaffichait le shimmer plusieurs
//   secondes, alors que la génération était terminée EN ÉCHEC depuis longtemps.
//   La v2.1 aggravait le cas : elle ignorait le 'failed' venu du parent tant
//   qu'un drapeau traînait, quel que soit son âge.
//   On introduit une FENÊTRE DE FRAÎCHEUR : au-delà de 20 secondes, un drapeau
//   n'est plus une demande en cours mais un vestige — la base fait autorité et le
//   drapeau est effacé. En deçà, il protège encore du 'failed' périmé que renvoie
//   useFamilyData le temps que le workflow écrive 'pending'.
// useRealtimeAvatar v2.2
// Changelog v2.2 — expose `statusLoaded`.
//   Quand le parent ne fournit pas le statut (cas d'EditAvatarHeader), le hook va
//   le chercher lui-même : il y a donc un court instant où le statut est INCONNU.
//   Pendant ce temps, l'écran de modification affichait l'ANCIEN avatar, puis
//   basculait en rouge — un clignotement qui montrait au parent une image qui
//   n'existe plus. `statusLoaded` permet d'attendre de savoir avant d'afficher.
// useRealtimeAvatar v2.1
// Changelog v2.1 — LE RETOUR À LA NORMALE NE SE VOYAIT PAS.
//   Après correction, la carte restait rouge jusqu'au rechargement. Deux causes,
//   toutes deux traitées ici, la troisième l'étant côté workflow (le node
//   1A_Mark_Avatar_Pending écrit désormais 'pending' au début d'une régénération) :
//   (a) Au montage, quand le drapeau client dit « une régénération vient d'être
//       demandée », on efface OPTIMISTEMENT l'état d'échec précédent. Sans ça, la
//       carte affichait le rouge le temps que le workflow écrive 'pending'.
//   (b) Le parent (useFamilyData) peut renvoyer un 'failed' PÉRIMÉ pendant cette
//       fenêtre — son refetch part avant que le workflow n'ait écrit. On l'ignore
//       tant qu'une régénération est en cours localement.
// useRealtimeAvatar v2.0
// Changelog v2.0 — LECTURE DU STATUT DE GÉNÉRATION.
//   Avant, le hook ne connaissait que avatar_url. Le front ne pouvait donc pas
//   distinguer « en cours » de « échoué » : AvatarDisplay affichait le shimmer
//   « Création… » dès qu'une URL manquait, indéfiniment, y compris pour des
//   profils dont la génération avait échoué des mois plus tôt.
//   Le hook lit désormais avatar_status / avatar_error_code / avatar_error_fields,
//   écrits par MCF_Avatar_Factory (lot 2b).
//
//   Trois conséquences :
//   (a) isRegenerating vaut vrai si le drapeau client est posé OU si la base dit
//       'pending' — le second couvre le cas du parent qui revient depuis un autre
//       appareil, où le drapeau local n'existe pas.
//   (b) Le POLLING s'arrête sur 'ready' ET sur 'failed'. Avant, il tournait
//       jusqu'à épuisement des 15 tentatives sur un avatar qui n'arriverait jamais.
//   (c) initialAvatarStatus est OPTIONNEL : sans lui, lecture unique au montage.
//       Quand useFamilyData le fournira en props (lot 3b), elle disparaîtra.
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { consumeAvatarRegeneration, clearAvatarRegeneration, signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import { clearAvatarRegenerating, isAvatarRegenerating, getAvatarRegeneratingSince } from '@/utils/avatarRegeneratingFlag';
import { FAMILY_DATA_KEY } from '@/hooks/useFamilyData';
import type { AvatarStatus } from '@/utils/avatarStatus';

// Colonnes lues partout (montage, realtime, polling) — une seule liste pour les trois,
// pour qu'un ajout futur ne soit pas oublié dans l'un des chemins.
const AVATAR_COLUMNS = 'avatar_url, avatar_status, avatar_error_code, avatar_error_fields';

// v2.3 — au-delà de ce délai, un drapeau client n'est plus une demande en cours.
// 20 s couvre largement le temps que le workflow écrive 'pending' (une à deux
// secondes en pratique), sans laisser un vestige mentir pendant cinq minutes.
const FRAICHEUR_DEMANDE_MS = 20000;

let instanceCounter = 0;

// v+comforters : ajout de 'comforters' pour l'avatar des doudous (EditAvatarHeader).
// Realtime n'est pas actif sur cette table → le polling (RULE 3) prend le relais.
type AvatarTable = 'child_profiles' | 'family_members' | 'pets' | 'comforters';

interface UseRealtimeAvatarOptions {
  table: AvatarTable;
  id: string;
  initialAvatarUrl?: string | null;
  /** v2.0 — fourni par le parent quand il l'a déjà chargé. Sinon lecture unique au montage. */
  initialAvatarStatus?: AvatarStatus;
  initialAvatarErrorCode?: string | null;
  initialAvatarErrorFields?: string | null;
}

interface UseRealtimeAvatarResult {
  avatarUrl: string | null;
  isNew: boolean;
  isLoading: boolean;
  hasError: boolean;
  isRegenerating: boolean;
  onImageError: () => void;
  onImageLoad: () => void;
  imgSrc: string | null;
  startRegeneration: () => void;
  /** v2.0 — statut de génération lu en base. */
  avatarStatus: AvatarStatus;
  avatarErrorCode: string | null;
  avatarErrorFields: string | null;
  /** Raccourci : la génération a échoué et rien n'est en cours. */
  hasFailed: boolean;
  /** v2.2 — false tant que le statut n'est pas connu (lecture au montage en cours). */
  statusLoaded: boolean;
}

const normalizeAvatarUrl = (url?: string | null): string | null => {
  const normalized = url?.trim();
  return normalized ? normalized : null;
};

export function useRealtimeAvatar({
  table,
  id,
  initialAvatarUrl,
  initialAvatarStatus,
  initialAvatarErrorCode,
  initialAvatarErrorFields,
}: UseRealtimeAvatarOptions): UseRealtimeAvatarResult {
  const queryClient = useQueryClient();
  const normalizedInitial = normalizeAvatarUrl(initialAvatarUrl);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(normalizedInitial);
  const [isNew, setIsNew] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // v2.0 — statut de génération. `undefined` en entrée = le parent ne le fournit pas,
  // on ira le lire une fois au montage.
  const [avatarStatus, setAvatarStatus] = useState<AvatarStatus>(initialAvatarStatus ?? null);
  const [avatarErrorCode, setAvatarErrorCode] = useState<string | null>(initialAvatarErrorCode ?? null);
  const [avatarErrorFields, setAvatarErrorFields] = useState<string | null>(initialAvatarErrorFields ?? null);
  const parentProvidesStatus = initialAvatarStatus !== undefined;

  // v2.3 — horodatage de la demande de régénération en cours, s'il y en a une.
  const demandeDepuisRef = useRef<number | null>(null);
  const demandeEstRecente = useCallback(
    () => {
      const t = demandeDepuisRef.current;
      return t !== null && Date.now() - t < FRAICHEUR_DEMANDE_MS;
    },
    [],
  );

  // v2.3 — la base annonce un échec : on abandonne le drapeau client, quel qu'il
  // soit. Sans ça, un vestige continuerait d'imposer le shimmer par-dessus.
  const adopterEchec = useCallback(() => {
    demandeDepuisRef.current = null;
    setIsRegenerating(false);
    if (id) {
      clearAvatarRegeneration(id);
      clearAvatarRegenerating(id);
    }
  }, [id]);
  // v2.2 — si le parent fournit le statut, il est connu dès le premier rendu.
  // Sinon on attend le retour de la lecture au montage.
  const [statusLoaded, setStatusLoaded] = useState<boolean>(parentProvidesStatus);

  // Unique instance ID for channel naming — stable for the lifetime of this hook
  const instanceIdRef = useRef<number>(++instanceCounter);
  // Polling interval ref — isolated per instance
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Channel ref for cleanup
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // The URL we're "watching" — when it changes, we know a new avatar arrived
  const knownUrlRef = useRef<string | null>(normalizedInitial);

  // ─── RULE 1: Base fait loi au montage ───
  // On mount, if there's a sessionStorage signal, enter regenerating state
  // (works for BOTH new avatars and modifications of existing ones).
  // If no signal, display any existing URL immediately.
  useEffect(() => {
    if (!id) return;

    const demandeDepuis = getAvatarRegeneratingSince(id);
    const signalEphemere = consumeAvatarRegeneration(id);

    // v2.3 — on ne se fie au drapeau QUE s'il est récent. Un drapeau de plus de
    // 20 secondes vient d'une génération déjà terminée : le relire ferait
    // réapparaître « Création… » à chaque retour sur la liste.
    const demandeRecente =
      demandeDepuis !== null && Date.now() - demandeDepuis < FRAICHEUR_DEMANDE_MS;

    // v2.4 — un flag localStorage PRÉSENT mais ANCIEN prouve que la demande est terminée.
    // Sans ce garde, le signal sessionStorage (vrai pendant 5 minutes) suffisait à rentrer
    // dans la branche au remontage et à écraser le statut réel par 'pending' : le shimmer
    // repartait pour cinq minutes alors que l'avatar était déjà arrivé.
    const demandeAncienne =
      demandeDepuis !== null && Date.now() - demandeDepuis >= FRAICHEUR_DEMANDE_MS;

    // v2.5 — trace temporaire
    console.log('[MCF-AVATAR] montage', {
      table, id,
      signalEphemere,
      demandeDepuis: demandeDepuis ? new Date(demandeDepuis).toISOString() : null,
      ageDemandeMs: demandeDepuis ? Date.now() - demandeDepuis : null,
      demandeRecente,
      demandeAncienne,
      statutFourniParParent: parentProvidesStatus ? (initialAvatarStatus ?? null) : 'non fourni',
      urlInitiale: normalizeAvatarUrl(initialAvatarUrl),
      decision: ((signalEphemere || demandeRecente) && !demandeAncienne)
        ? 'SHIMMER (pending force)'
        : 'pas de shimmer',
    });

    if ((signalEphemere || demandeRecente) && !demandeAncienne) {
      demandeDepuisRef.current = demandeDepuis ?? Date.now();
      // Signal found → show shimmer (full if no URL, overlay if URL exists)
      setIsRegenerating(true);
      // v2.1 — une régénération vient d'être demandée : l'échec précédent n'a plus
      // cours. On l'efface tout de suite plutôt que d'attendre que le workflow
      // écrive 'pending', sinon la carte reste rouge une ou deux secondes de trop.
      setAvatarStatus('pending');
      setAvatarErrorCode(null);
      setAvatarErrorFields(null);
    } else {
      // No signal → display existing URL normally
      setIsRegenerating(false);
    }
  }, [id]);

  // Sync when parent re-fetches and passes a new initialAvatarUrl
  useEffect(() => {
    const incoming = normalizeAvatarUrl(initialAvatarUrl);
    const previousKnownUrl = knownUrlRef.current;

    setAvatarUrl(incoming);
    knownUrlRef.current = incoming;

    if (incoming) {
      setHasError(false);

      // Ne considérer comme « nouvel avatar arrivé » qu'une transition d'une URL EXISTANTE vers une
      // autre. La transition initiale null→URL (chargement de la référence, ex. fetch async de
      // EditAvatarHeader) ne doit PAS couper le shimmer.
      const avatarActuallyChanged = !!previousKnownUrl && incoming !== previousKnownUrl;
      // v2.5 — trace temporaire
      if (avatarActuallyChanged) {
        console.log('[MCF-AVATAR] levee par le parent', { id, ancienne: previousKnownUrl, nouvelle: incoming });
      }
      if (avatarActuallyChanged) {
        setIsRegenerating(false);
        clearAvatarRegeneration(id);   // signal éphémère (sessionStorage)
        clearAvatarRegenerating(id);   // flag persistant (localStorage)
      }
    }
  }, [initialAvatarUrl, id]);

  // v2.0 — applique les trois colonnes de statut, d'où qu'elles viennent.
  const applyStatusRow = useCallback((row: Record<string, unknown> | null | undefined) => {
    if (!row) return;
    setAvatarStatus((row.avatar_status as AvatarStatus) ?? null);
    setAvatarErrorCode((row.avatar_error_code as string | null) ?? null);
    setAvatarErrorFields((row.avatar_error_fields as string | null) ?? null);
  }, []);

  // v2.0 — lecture unique au montage, uniquement si le parent ne fournit pas le statut.
  useEffect(() => {
    if (!id || !table || parentProvidesStatus) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from(table).select(AVATAR_COLUMNS).eq('id', id).maybeSingle();
        if (!cancelled) applyStatusRow(data as Record<string, unknown> | null);
      } catch {
        /* statut inconnu : on dégrade sur le comportement historique */
      } finally {
        // v2.2 — succès ou échec, on cesse d'attendre : sans ce finally, une
        // erreur réseau figerait l'écran sur son placeholder neutre.
        if (!cancelled) setStatusLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [table, id, parentProvidesStatus, applyStatusRow]);

  // Le parent rafraîchit ses données → on suit.
  useEffect(() => {
    if (!parentProvidesStatus) return;
    // v2.3 — un 'failed' venu du parent n'est ignoré que si la demande de
    // régénération est RÉCENTE : dans ce cas son refetch est parti avant que le
    // workflow n'écrive 'pending', et l'accepter ferait clignoter la carte en
    // rouge. Passé la fenêtre, la base a raison.
    if ((initialAvatarStatus ?? null) === 'failed') {
      if (isRegenerating && demandeEstRecente()) return;
      adopterEchec();
    }
    setAvatarStatus(initialAvatarStatus ?? null);
    setAvatarErrorCode(initialAvatarErrorCode ?? null);
    setAvatarErrorFields(initialAvatarErrorFields ?? null);
  }, [parentProvidesStatus, initialAvatarStatus, initialAvatarErrorCode, initialAvatarErrorFields,
      isRegenerating, demandeEstRecente, adopterEchec]);

  // ─── Apply a genuinely NEW url from Realtime or polling ───
  const applyNewUrl = useCallback((newUrl: string | null) => {
    const normalized = normalizeAvatarUrl(newUrl);
    if (normalized && normalized !== knownUrlRef.current) {
      // v2.5 — trace temporaire
      console.log('[MCF-AVATAR] levee par nouvelle URL', {
        id, ancienne: knownUrlRef.current, nouvelle: normalized,
      });
      knownUrlRef.current = normalized;
      setAvatarUrl(normalized);
      setHasError(false);
      setIsNew(true);
      // ─── New avatar arrived → end regeneration ───
      setIsRegenerating(false);
      if (id) {
        clearAvatarRegeneration(id);   // signal sessionStorage (cartes dashboard)
        clearAvatarRegenerating(id);   // flag persistant localStorage (écran de modif)
      }
      // Réaligne le cache React Query. Sans ça, useFamilyData resterait sur l'ancienne image / âge /
      // caractéristiques (staleTime 5 min) → on reverrait l'ancien avatar au retour sur la page tant
      // qu'on n'a pas fait de F5. L'invalidation force un refetch de la ligne complète (avatar + âge).
      queryClient.invalidateQueries({ queryKey: [FAMILY_DATA_KEY] });
    }
  }, [id, queryClient]);

  // ─── RULE 2: startRegeneration — spinner stays indefinitely ───
  const startRegeneration = useCallback(() => {
    // v2.4 : on horodate la demande. Sans ça, demandeEstRecente() restait faux sur ce chemin
    // et la fenêtre de fraîcheur du calcul de `regenerating` ne s'ouvrait jamais.
    demandeDepuisRef.current = Date.now();
    setIsRegenerating(true);
    if (id) signalAvatarRegeneration(id);
  }, [id]);

  // ─── Realtime subscription (isolated per instance) ───
  useEffect(() => {
    if (!id) return;

    const channelName = `avatar-${table}-${id}-${instanceIdRef.current}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          // v2.0 — le payload realtime contient la ligne entière : on prend le statut
          // au passage, sans requête supplémentaire.
          applyStatusRow(row);
          applyNewUrl(row.avatar_url as string | null);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (channelRef.current === channel) {
        channelRef.current = null;
      }
    };
  }, [table, id, applyNewUrl, applyStatusRow]);

  // ─── RULE 3: Smart Polling — isolated per instance via useRef ───
  useEffect(() => {
    // Clear any previous polling for this instance
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Polling actif uniquement pendant une régénération explicite (reset / modif d'apparence).
    // Le rattrapage des avatars MANQUANTS (profil fraîchement créé) est géré de façon centralisée
    // par useFamilyData (refetchInterval tant qu'un avatar est absent) → pas de polling par-carte
    // ici, qui s'était révélé peu fiable (SELECT direct sensible au RLS selon la table).
    if (!id || !table || !isRegenerating) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 15;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const { data } = await supabase
          .from(table)
          .select(AVATAR_COLUMNS)
          .eq('id', id)
          .single();

        if (data) {
          const row = data as Record<string, unknown>;
          applyStatusRow(row);

          // v2.0 — un échec est un état FINAL : inutile de continuer à interroger
          // la base pour une image qui n'arrivera pas. Avant, le polling allait
          // au bout de ses 15 tentatives dans le vide.
          if (row.avatar_status === 'failed') {
            setIsRegenerating(false);
            if (id) {
              clearAvatarRegeneration(id);
              clearAvatarRegenerating(id);
            }
            clearInterval(interval);
            pollingIntervalRef.current = null;
            return;
          }

          const fetchedUrl = row.avatar_url as string | null;
          if (fetchedUrl && fetchedUrl !== knownUrlRef.current) {
            applyNewUrl(fetchedUrl);
            clearInterval(interval);
            pollingIntervalRef.current = null;
            return;
          }
        }
      } catch {
        // Ignore polling errors
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        pollingIntervalRef.current = null;
      }
    }, 10_000);

    pollingIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      if (pollingIntervalRef.current === interval) {
        pollingIntervalRef.current = null;
      }
    };
  }, [table, id, isRegenerating, applyNewUrl, applyStatusRow]);

  // Clear "new" badge after 10 seconds
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => setIsNew(false), 10000);
    return () => clearTimeout(timer);
  }, [isNew]);

  const onImageError = useCallback(() => setHasError(true), []);
  const onImageLoad = useCallback(() => {
    /* no-op — we don't gate display on image load */
  }, []);

  // Pas de cache-bust : les URLs sont déjà uniques par génération (timestamp dans le nom de fichier).
  // On sert l'URL telle quelle → le navigateur peut mettre l'image en cache, et une nouvelle
  // génération (nouvelle URL) déclenche naturellement le rechargement.
  const imgSrc = avatarUrl;

  const isLoading = !avatarUrl;

  // v2.0 — la base fait autorité pour « en cours ». Le drapeau client reste utile
  // comme pont optimiste sur les toutes premières secondes, avant que le workflow
  // n'ait écrit quoi que ce soit ; la base prend le relais et couvre le cas du
  // parent qui rouvre son espace depuis un autre appareil.
  // Un échec ferme la parenthèse : on ne montre plus « Création… » sur un avatar
  // dont on sait qu'il n'arrivera pas.
  const hasFailed = avatarStatus === 'failed';

  // v2.4 — LA BASE FAIT AUTORITÉ. 'ready' avec une URL présente est une fin de course : aucun
  // marqueur client ne peut imposer le shimmer par-dessus. Seule exception, la fenêtre de
  // fraîcheur : dans les 20 secondes qui suivent une demande, la base annonce encore 'ready'
  // le temps que le workflow écrive 'pending', et la demande locale doit primer.
  const baseDitPret = avatarStatus === 'ready' && !!avatarUrl;
  const regenerating =
    !hasFailed
    && (!baseDitPret || demandeEstRecente())
    && (isRegenerating || avatarStatus === 'pending');

  // v2.5 — ALARME temporaire. Si cette ligne apparait, le bug du shimmer bloque est de retour.
  // La base annonce un avatar pret ET une URL, mais le shimmer reste affiche : l'etat logue ici
  // dit exactement quel marqueur client le maintient.
  if (baseDitPret && regenerating) {
    console.warn('[MCF-AVATAR] BLOCAGE : base prete mais shimmer actif', {
      table, id, avatarUrl, avatarStatus,
      isRegeneratingLocal: isRegenerating,
      demandeDepuis: demandeDepuisRef.current
        ? new Date(demandeDepuisRef.current).toISOString()
        : null,
      ageDemandeMs: demandeDepuisRef.current ? Date.now() - demandeDepuisRef.current : null,
      demandeEstRecente: demandeEstRecente(),
    });
  }

  return {
    avatarUrl,
    isNew,
    isLoading,
    hasError,
    isRegenerating: regenerating,
    onImageError,
    onImageLoad,
    imgSrc,
    startRegeneration,
    avatarStatus,
    avatarErrorCode,
    avatarErrorFields,
    hasFailed,
    statusLoaded,
  };
}
