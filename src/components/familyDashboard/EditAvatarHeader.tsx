// EditAvatarHeader v1.5
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
