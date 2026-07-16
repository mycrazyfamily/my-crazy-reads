// EditAvatarHeader v2.1
// Changelog v2.1 (AFFICHAGE UNIQUEMENT — aucun texte ni logique de contenu modifié) :
//   • P1 (flash « 🎨 Création… » à l'ouverture) : on PRÉCHARGE l'avatar de référence existant
//     (new Image()) et, tant qu'il n'est pas prêt (et hors régénération), on affiche un placeholder
//     NEUTRE statique (disque de même taille, sans animation ni « Création… »). AvatarDisplay n'est
//     monté que lorsque l'image est en cache → révélation instantanée, plus de passage par le shimmer.
//     La vraie régénération (isRegenerating) reste inchangée : son shimmer légitime passe normalement.
//     AvatarDisplay (composant partagé) n'est PAS touché → zéro effet de bord ailleurs.
//   • P2 (encart qui apparaît d'un coup → reflow) : l'encart d'aide est DÉSORMAIS TOUJOURS rendu
//     (structure/hauteur stables) ; seul le bouton se (dé)verrouille via disabled={busy}. Le message
//     « Nouvel avatar en cours de création… » occupe une ligne à HAUTEUR RÉSERVÉE (opacité 0/1) au
//     lieu d'apparaître/disparaître → plus aucun décalage de mise en page au passage busy true→false.
// Changelog v2.0 : accepte initialAvatarUrl + familyId en PROPS. Quand le parent les fournit
// (chargés avec le reste du profil, pendant le skeleton), on évite un 2ᵉ fetch et le reflow
// « l'avatar arrive après coup » (busy true→false qui décalait la mise en page). Compat ascendante :
// si le parent ne fournit pas ces props, on les charge ici comme avant.
// Changelog v1.9 : préfixe « ⚠️ Attention : » sur la ligne « Pour changer l'apparence… » de l'encart.
// Changelog v1.8 : retrait de « L'avatar ne lui ressemble pas ? » ; bouton + aides regroupés dans
// un encart (fond léger + bordure) pour être remarqués. « Garde les mêmes caractéristiques
// physiques » collé au bouton (même intention) ; « Pour changer l'apparence… » séparé plus bas pour
// marquer la différence des deux voies.
// Changelog v1.7 : micro-copie d'aide sous le bouton pour lever l'ambiguïté régénérer vs modifier
// (2 lignes courtes, scannables) : « Générer une autre proposition » garde les caractéristiques ;
// modifier les champs + enregistrer change l'apparence. Masquée pendant une génération en cours.
// Changelog v1.6 : le bouton et le libellé suivent l'affichage réel de l'avatar via
// busy = isRegenerating || !avatarUrl. Corrige le cas « proche créé » où le shimmer s'affichait
// (pas encore d'avatar) mais le bouton restait actif car le flag avait déjà été levé. Libellés
// « visage » → « avatar » (on régénère tout l'avatar, pas seulement le visage).
// Changelog v1.5 : simplifié. L'amorçage du shimmer est désormais géré par useRealtimeAvatar
// lui-même (il lit le flag persistant au montage) et le sync effect du hook n'interprète plus la
// transition null→URL comme une fin de régénération. Plus besoin de refLoaded/startRegeneration ici.
// Le header ne fait que : charger l'avatar de référence + family_id, afficher via AvatarDisplay
// (clic-pour-agrandir + shimmer natifs), et rendre le bouton (verrouillé pendant la régé).
import React, { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import AvatarDisplay from '@/components/familyDashboard/AvatarDisplay';
import ResetAvatarButton from '@/components/familyDashboard/ResetAvatarButton';

type ProfileType = 'child' | 'relative' | 'pet' | 'comforter';
type AvatarTable = 'child_profiles' | 'family_members' | 'pets' | 'comforters';

const TABLE_MAP: Record<ProfileType, AvatarTable> = {
  child: 'child_profiles',
  relative: 'family_members',
  pet: 'pets',
  comforter: 'comforters',
};

// Taille unique de l'avatar — partagée entre le placeholder de preload et AvatarDisplay
// pour garantir des hauteurs identiques (aucun reflow au moment de la révélation de l'image).
const AVATAR_SIZE = 'h-24 w-24';

interface EditAvatarHeaderProps {
  profileId: string;
  profileType: ProfileType;
  profileName?: string;
  /** Fournis par le parent (chargés avec le profil) → évite un 2ᵉ fetch et le reflow de l'avatar. */
  initialAvatarUrl?: string | null;
  familyId?: string | null;
}

const EditAvatarHeader: React.FC<EditAvatarHeaderProps> = ({
  profileId,
  profileType,
  profileName,
  initialAvatarUrl: avatarUrlProp,
  familyId: familyIdProp,
}) => {
  const table = TABLE_MAP[profileType];
  const appearanceExamples =
    profileType === 'pet'
      ? 'couleur, pelage, taille'
      : profileType === 'comforter'
        ? 'couleur, matière, accessoires'
        : 'couleur, coiffure, tenue';
  const [initialAvatarUrl, setInitialAvatarUrl] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Le parent fournit-il déjà l'avatar ? (prop définie, même à null) → pas de fetch interne, pas de reflow.
  const hasParentData = avatarUrlProp !== undefined;

  // Lecture unique de l'avatar + family_id (fallback si le parent ne les passe pas). family_id sert
  // de « ceinture » dans le payload de reset (n8n a de toute façon un fallback). Dégrade proprement.
  useEffect(() => {
    if (hasParentData) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from(table)
          .select('avatar_url, family_id')
          .eq('id', profileId)
          .maybeSingle();
        if (!cancelled) {
          setInitialAvatarUrl((data as any)?.avatar_url ?? null);
          setFamilyId((data as any)?.family_id ?? null);
        }
      } catch {
        /* placeholder + family_id null */
      }
    })();
    return () => { cancelled = true; };
  }, [table, profileId, hasParentData]);

  const resolvedAvatarUrl = hasParentData ? (avatarUrlProp ?? null) : initialAvatarUrl;
  const resolvedFamilyId = familyIdProp !== undefined ? (familyIdProp ?? null) : familyId;

  const {
    imgSrc,
    avatarUrl,
    isLoading,
    isNew,
    hasError,
    isRegenerating,
    onImageLoad,
    onImageError,
  } = useRealtimeAvatar({ table, id: profileId, initialAvatarUrl: resolvedAvatarUrl });

  // ─── P1 : preload de l'avatar de référence existant ───
  // Tant que l'image n'est pas téléchargée (et hors régénération), on montre un placeholder neutre
  // au lieu de laisser AvatarDisplay passer par son shimmer « Création… » le temps du téléchargement.
  const [imgReady, setImgReady] = useState(false);
  useEffect(() => {
    if (!resolvedAvatarUrl) {
      setImgReady(false);
      return;
    }
    setImgReady(false);
    let cancelled = false;
    const img = new Image();
    const done = () => { if (!cancelled) setImgReady(true); };
    img.onload = done;
    img.onerror = done; // on révèle quand même : AvatarDisplay gère l'erreur (fallback)
    img.src = resolvedAvatarUrl;
    if (img.complete) done(); // déjà en cache navigateur → révélation immédiate, aucun placeholder visible
    return () => { cancelled = true; };
  }, [resolvedAvatarUrl]);

  const fallback = (
    <span className="flex items-center justify-center h-full w-full text-mcf-primary/40">
      <UserRound className="h-10 w-10" />
    </span>
  );

  // « Occupé » = régénération en cours OU aucun avatar affichable (création/génération non terminée).
  // Le bouton suit cet état (disabled), en cohérence avec le shimmer d'AvatarDisplay.
  const busy = isRegenerating || !avatarUrl;

  // Placeholder de preload : uniquement pour un avatar EXISTANT pas encore téléchargé et hors régé.
  // (Sans avatar → AvatarDisplay affiche son « Création… » légitime ; en régé → shimmer légitime.)
  const showStablePlaceholder = !!resolvedAvatarUrl && !imgReady && !isRegenerating;

  return (
    <div className="flex flex-col items-center gap-3 pb-2">
      {showStablePlaceholder ? (
        // Disque neutre, même taille que l'avatar, sans animation ni texte → aucun flash, aucun reflow.
        <div className={cn('rounded-full bg-mcf-mint/15', AVATAR_SIZE)} aria-hidden />
      ) : (
        <AvatarDisplay
          imgSrc={imgSrc}
          avatarUrl={avatarUrl}
          isLoading={isLoading}
          isNew={isNew}
          hasError={hasError}
          isRegenerating={isRegenerating}
          onImageLoad={onImageLoad}
          onImageError={onImageError}
          fallback={fallback}
          alt={profileName || 'Avatar'}
          size={AVATAR_SIZE}
        />
      )}

      {/* Ligne de statut à HAUTEUR RÉSERVÉE : présente en permanence, on ne fait que varier l'opacité
          → l'apparition/disparition du message ne décale plus rien. */}
      <p
        className={cn(
          'text-xs text-muted-foreground text-center min-h-[1rem] leading-4 transition-opacity duration-200',
          busy ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden={!busy}
      >
        Nouvel avatar en cours de création…
      </p>

      {/* Encart TOUJOURS rendu (structure stable) : seul le bouton se (dé)verrouille. */}
      <div className="w-full max-w-sm rounded-xl border border-mcf-mint bg-mcf-mint/5 px-4 py-3 flex flex-col items-center gap-1">
        <ResetAvatarButton
          profileId={profileId}
          profileType={profileType}
          profileName={profileName}
          familyId={resolvedFamilyId}
          disabled={busy}
        />
        <p className="text-[11px] leading-snug text-muted-foreground/80 text-center">
          Garde les mêmes caractéristiques physiques.
        </p>
        <p className="text-[11px] leading-snug text-muted-foreground/70 text-center mt-2 pt-2 border-t border-mcf-mint/40">
          ⚠️ Attention : pour changer l'apparence ({appearanceExamples}), modifiez les champs du formulaire ci-dessous et enregistrez.
        </p>
      </div>
    </div>
  );
};

export default EditAvatarHeader;
