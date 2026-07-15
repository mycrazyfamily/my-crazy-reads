// EditAvatarHeader v1.1
// Changelog v1.1 : simplifié — plus de useRealtimeAvatar ni de shimmer in-place. Après un reset,
// ResetAvatarButton renvoie vers l'espace famille où le nouveau visage apparaît (comme une modif).
// Ce header affiche l'avatar actuel + le bouton « Générer une autre proposition » juste dessous.
import React, { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

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
          setAvatarUrl((data as any)?.avatar_url ?? null);
          setFamilyId((data as any)?.family_id ?? null);
        }
      } catch {
        /* placeholder + family_id null */
      }
    })();
    return () => { cancelled = true; };
  }, [table, profileId]);

  return (
    <div className="flex flex-col items-center gap-3 pb-2">
      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-mcf-mint bg-mcf-mint/10 shadow-md">
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={profileName ? `Avatar de ${profileName}` : 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-mcf-primary/40">
            <UserRound className="h-10 w-10" />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">Ce visage ne lui ressemble pas ?</p>

      <ResetAvatarButton
        profileId={profileId}
        profileType={profileType}
        profileName={profileName}
        familyId={familyId}
      />
    </div>
  );
};

export default EditAvatarHeader;
