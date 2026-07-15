// EditAvatarHeader v1.0
// v1.0 : bloc partagé affiché EN TÊTE des écrans de modification (enfant / proche / animal / doudou).
// Montre l'avatar courant + le bouton « Générer une autre proposition » (ResetAvatarButton) juste dessous.
// Monte useRealtimeAvatar → shimmer pendant la régénération + désactivation du bouton (anti-rafale).
// Auto-fetch avatar_url + family_id : aucun couplage avec l'état de l'écran parent, un seul select léger.
// NB comforters : realtime non actif sur cette table → le hook bascule sur son polling (15×10 s).
import React, { useEffect, useState } from 'react';
import { UserRound, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
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

  // Lecture unique de l'avatar + family_id. family_id sert de "ceinture" dans le payload de reset
  // (le workflow n8n a de toute façon un fallback qui le relit en base). Dégrade proprement :
  // toute erreur → placeholder + family_id null (le reset restera fonctionnel via le fallback n8n).
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

  const { imgSrc, isRegenerating, hasError, onImageError, startRegeneration } = useRealtimeAvatar({
    table,
    id: profileId,
    initialAvatarUrl,
  });

  return (
    <div className="flex flex-col items-center gap-3 pb-2">
      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-mcf-mint bg-mcf-mint/10 shadow-md">
        {imgSrc && !hasError ? (
          <img
            src={imgSrc}
            alt={profileName ? `Avatar de ${profileName}` : 'Avatar'}
            className="h-full w-full object-cover"
            onError={onImageError}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-mcf-primary/40">
            <UserRound className="h-10 w-10" />
          </div>
        )}
        {isRegenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-mcf-orange" />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">Ce visage ne lui ressemble pas ?</p>

      <ResetAvatarButton
        profileId={profileId}
        profileType={profileType}
        profileName={profileName}
        familyId={familyId}
        isRegenerating={isRegenerating}
        onRegenerate={startRegeneration}
      />
    </div>
  );
};

export default EditAvatarHeader;