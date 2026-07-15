// EditAvatarHeader v1.3
// Changelog v1.3 : l'avatar est rendu via AvatarDisplay (le même composant que les cartes du
// dashboard) → clic-pour-agrandir identique + shimmer géré nativement par isRegenerating. On
// retire l'<img> et l'overlay maison de la v1.2.
// Changelog v1.2 : état « en régénération » persistant et partagé (localStorage via
// avatarRegeneratingFlag). Au montage, si un reset est en cours pour ce profil, on amorce
// useRealtimeAvatar (shimmer + polling) même si le dashboard a déjà consommé le signal
// sessionStorage → l'écran de modif affiche « en création », verrouille le bouton (pas de relance
// à l'aveugle), et bascule sur le nouveau visage dès qu'il arrive (le hook lève alors le flag).
import React, { useEffect, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import { isAvatarRegenerating } from '@/utils/avatarRegeneratingFlag';
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
    startRegeneration,
  } = useRealtimeAvatar({ table, id: profileId, initialAvatarUrl });

  // Amorçage : si un reset est déjà en cours (flag persistant), lancer l'état régénération une fois
  // (shimmer + polling) même si le signal sessionStorage a été consommé ailleurs. Le hook lèvera le
  // flag et repassera isRegenerating à false dès l'arrivée du nouvel avatar.
  const primed = useRef(false);
  useEffect(() => {
    if (!primed.current && isAvatarRegenerating(profileId)) {
      primed.current = true;
      startRegeneration();
    }
  }, [profileId, startRegeneration]);

  const fallback = (
    <span className="flex items-center justify-center h-full w-full text-mcf-primary/40">
      <UserRound className="h-10 w-10" />
    </span>
  );

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

      <p className="text-xs text-muted-foreground text-center">
        {isRegenerating ? 'Nouveau visage en cours de création…' : 'Ce visage ne lui ressemble pas ?'}
      </p>

      <ResetAvatarButton
        profileId={profileId}
        profileType={profileType}
        profileName={profileName}
        familyId={familyId}
        disabled={isRegenerating}
      />
    </div>
  );
};

export default EditAvatarHeader;
