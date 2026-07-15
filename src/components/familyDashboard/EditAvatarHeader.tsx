// EditAvatarHeader v1.9
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

interface EditAvatarHeaderProps {
  profileId: string;
  profileType: ProfileType;
  profileName?: string;
}

const EditAvatarHeader: React.FC<EditAvatarHeaderProps> = ({ profileId, profileType, profileName }) => {
  const table = TABLE_MAP[profileType];
  const appearanceExamples =
    profileType === 'pet'
      ? 'couleur, pelage, taille'
      : profileType === 'comforter'
        ? 'couleur, matière, accessoires'
        : 'couleur, coiffure, tenue';
  const [initialAvatarUrl, setInitialAvatarUrl] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Lecture unique de l'avatar + family_id. family_id sert de « ceinture » dans le payload de reset
  // (le workflow n8n a de toute façon un fallback qui le relit en base). Dégrade proprement :
  // toute erreur → placeholder + family_id null (le reset reste fonctionnel via le fallback n8n).
  useEffect(() => {
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
  }, [table, profileId]);

  const {
    imgSrc,
    avatarUrl,
    isLoading,
    isNew,
    hasError,
    isRegenerating,
    onImageLoad,
    onImageError,
  } = useRealtimeAvatar({ table, id: profileId, initialAvatarUrl });

  const fallback = (
    <span className="flex items-center justify-center h-full w-full text-mcf-primary/40">
      <UserRound className="h-10 w-10" />
    </span>
  );

  // « Occupé » = régénération en cours OU aucun avatar affichable (création/génération non terminée).
  // Le bouton et le libellé suivent cet état, en cohérence avec le shimmer d'AvatarDisplay
  // (qui s'affiche dès qu'il n'y a pas d'avatar). Évite un bouton actif sous un avatar en shimmer.
  const busy = isRegenerating || !avatarUrl;

  return (
    <div className="flex flex-col items-center gap-3 pb-2">
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
        size="h-24 w-24"
      />

      {busy && (
        <p className="text-xs text-muted-foreground text-center">
          Nouvel avatar en cours de création…
        </p>
      )}

      {busy ? (
        <ResetAvatarButton
          profileId={profileId}
          profileType={profileType}
          profileName={profileName}
          familyId={familyId}
          disabled={busy}
        />
      ) : (
        <div className="w-full max-w-sm rounded-xl border border-mcf-mint bg-mcf-mint/5 px-4 py-3 flex flex-col items-center gap-1">
          <ResetAvatarButton
            profileId={profileId}
            profileType={profileType}
            profileName={profileName}
            familyId={familyId}
            disabled={busy}
          />
          <p className="text-[11px] leading-snug text-muted-foreground/80 text-center">
            Garde les mêmes caractéristiques physiques.
          </p>
          <p className="text-[11px] leading-snug text-muted-foreground/70 text-center mt-2 pt-2 border-t border-mcf-mint/40">
            ⚠️ Attention : pour changer l'apparence (couleur, coiffure, tenue…), modifiez les champs du formulaire ci-dessous et enregistrez.
          </p>
        </div>
      )}
    </div>
  );
};

export default EditAvatarHeader;
