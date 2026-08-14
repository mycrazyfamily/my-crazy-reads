// PetProfileCard v2.0
// Changelog v2.0 — transmet le statut de génération à AvatarDisplay.
//   Les trois colonnes viennent de useFamilyData v3.0 : le hook n'a plus besoin
//   de sa lecture individuelle au montage (une requête par carte en moins).
//   La carte affiche l'état d'échec sans dépendre du realtime : le refetch de
//   useFamilyData suffit.
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Heart, LogOut } from 'lucide-react';
import type { PetData } from '@/types/childProfile';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import AvatarDisplay from '@/components/familyDashboard/AvatarDisplay';

interface PetProfileCardProps {
  pet: PetData;
  childrenNames: string[];
  primaryChildId: string;
}

const PetProfileCard: React.FC<PetProfileCardProps> = ({ pet, childrenNames, primaryChildId }) => {
  const { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc,
          avatarStatus, avatarErrorCode, avatarErrorFields } =
    useRealtimeAvatar({
      table: 'pets',
      id: pet.id,
      initialAvatarUrl: (pet as any).avatar_url,
      initialAvatarStatus: (pet as any)?.avatar_status ?? null,
      initialAvatarErrorCode: (pet as any)?.avatar_error_code ?? null,
      initialAvatarErrorFields: (pet as any)?.avatar_error_fields ?? null,
    });

  const getPetTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      dog: '🐶', cat: '🐱', bird: '🐦', fish: '🐠',
      hamster: '🐹', rabbit: '🐰', turtle: '🐢', snake: '🐍', other: '🐾'
    };
    return emojiMap[type] || '🐾';
  };

  const getPetTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson',
      hamster: 'Hamster', rabbit: 'Lapin', reptile: 'Reptile'
    };
    return labelMap[type.toLowerCase()] || type;
  };

  const getTraitLabel = (trait: string) => {
    const traitMap: Record<string, string> = {
      playful: 'Joueur', lazy: 'Paresseux', protective: 'Protecteur',
      clingy: 'Collant', clever: 'Malin', grumpy: 'Grognon',
      gentle: 'Doux', noisy: 'Bruyant', talkative: 'Bavard'
    };
    return traitMap[trait] || trait;
  };

  const normalizedTraits = React.useMemo(() => {
    if (!pet.traits) return [];
    if (Array.isArray(pet.traits)) return pet.traits;
    if (typeof pet.traits === 'string') {
      try {
        const parsed = JSON.parse(pet.traits);
        return Array.isArray(parsed) ? parsed : [pet.traits];
      } catch {
        return [pet.traits];
      }
    }
    return [];
  }, [pet.traits]);

  const fallback = (
    <span className="text-2xl flex items-center justify-center h-full w-full">
      {getPetTypeEmoji(pet.type)}
    </span>
  );

  // Statut « entité inactive » — badge discret (décès / donné-perdu)
  const isDeceased = (pet as any).is_deceased === true;
  const isGone = !isDeceased && (pet as any).is_active === false;
  const statusBadge = isDeceased
    ? { label: 'En mémoire', Icon: Heart }
    : isGone
    ? { label: "N'est plus avec nous", Icon: LogOut }
    : null;

  return (
    <Card className={`overflow-hidden border-mcf-mint hover:shadow-md transition-shadow ${statusBadge ? 'opacity-90' : ''}`}>
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <AvatarDisplay
            imgSrc={imgSrc}
            avatarUrl={avatarUrl}
            isLoading={isLoading}
            isNew={isNew}
            hasError={hasError}
            isRegenerating={isRegenerating}
          avatarStatus={avatarStatus}
          avatarErrorCode={avatarErrorCode}
          avatarErrorFields={avatarErrorFields}
          profileName={pet.name}
            onImageLoad={onImageLoad}
            onImageError={onImageError}
            fallback={fallback}
            alt={pet.name}
            size="h-14 w-14"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-mcf-orange-dark">{pet.name}</h3>
            <p className="text-sm text-muted-foreground">
              {pet.type === 'other' && pet.otherType ? pet.otherType : getPetTypeLabel(pet.type)}
              {pet.breed && <span> • {pet.breed}</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Animal de {childrenNames.join(' et ')}
            </p>
            {statusBadge && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                <statusBadge.Icon className="h-3 w-3" />
                {statusBadge.label}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {pet.breed && (
          <div className="text-sm text-muted-foreground mb-3">
            <span className="font-medium">Apparence : </span>
            <span>{pet.breed}</span>
          </div>
        )}
        
        {normalizedTraits.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {normalizedTraits.slice(0, 3).map((trait, idx) => (
              <span key={idx} className="text-xs text-foreground/70 px-2 py-1">
                {getTraitLabel(trait)}
              </span>
            ))}
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 flex items-center justify-center gap-2 border-[#B3D4F5] text-[#4A90E2] hover:bg-[#F8FBFF] hover:border-[#4A90E2] rounded-full font-semibold transition-all duration-300"
          asChild
        >
          <Link to={`/modifier-animal/${primaryChildId}/${pet.id}`}>
            <Edit className="h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PetProfileCard;
