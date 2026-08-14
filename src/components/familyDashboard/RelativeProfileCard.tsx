// RelativeProfileCard v2.0
// Changelog v2.0 — transmet le statut de génération à AvatarDisplay.
//   Les trois colonnes viennent de useFamilyData v3.0 : le hook n'a plus besoin
//   de sa lecture individuelle au montage (une requête par carte en moins).
//   La carte affiche l'état d'échec sans dépendre du realtime : le refetch de
//   useFamilyData suffit.
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Users, Heart } from 'lucide-react';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import AvatarDisplay from '@/components/familyDashboard/AvatarDisplay';
import { getRelativeAvatarAlert } from '@/utils/avatarAgeAlert';

interface RelativeProfileCardProps {
  relative: {
    id: string;
    firstName: string;
    type: string;
    nickname?: { custom?: string; type?: string };
    traits?: string[];
    appearance?: any;
    age?: string;
    avatar_url?: string | null;
    birthDate?: string | null;
    details?: any;
    is_deceased?: boolean;
  };
  childrenNames: string[];
  primaryChildId: string;
}

const RelativeProfileCard: React.FC<RelativeProfileCardProps> = ({ relative, childrenNames, primaryChildId }) => {
  const { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc,
          avatarStatus, avatarErrorCode, avatarErrorFields } =
    useRealtimeAvatar({
      table: 'family_members',
      id: relative.id,
      initialAvatarUrl: relative.avatar_url,
      initialAvatarStatus: relative?.avatar_status ?? null,
      initialAvatarErrorCode: relative?.avatar_error_code ?? null,
      initialAvatarErrorFields: relative?.avatar_error_fields ?? null,
    });

  const parsedDetails = React.useMemo(() => {
    if (!relative.details) return null;
    if (typeof relative.details === 'string') {
      try { return JSON.parse(relative.details); } catch { return null; }
    }
    return relative.details;
  }, [relative.details]);

  const relativeBirthDate = relative.birthDate || parsedDetails?.birthDate || null;
  const ageAlert = getRelativeAvatarAlert(relative.firstName, relativeBirthDate, avatarUrl);

  const isDeceased = relative.is_deceased === true;

  const getRelativeTypeEmoji = (type: string) => {
    switch (type) {
      case 'father': return '👨';
      case 'mother': return '👩';
      case 'brother': return '👦';
      case 'sister': return '👧';
      case 'grandfather': return '👴';
      case 'grandmother': return '👵';
      case 'uncle': return '👨';
      case 'aunt': return '👩';
      case 'otherParent': return '🏡';
      case 'femaleCousin': return '👧';
      case 'maleCousin': return '👦';
      case 'femaleFriend': return '👭';
      case 'maleFriend': return '👬';
      case 'partner': return '💑';
      case 'teacher': return '👨‍🏫';
      case 'babysitter': return '👶';
      case 'other': return '✨';
      default: return '👤';
    }
  };

  const getRelativeTypeLabel = (type: string) => {
    switch (type) {
      case 'father': return 'Papa';
      case 'mother': return 'Maman';
      case 'brother': return 'Frère';
      case 'sister': return 'Sœur';
      case 'grandfather': return 'Grand-père';
      case 'grandmother': return 'Grand-mère';
      case 'uncle': return 'Oncle';
      case 'aunt': return 'Tante';
      case 'femaleCousin': return 'Cousine';
      case 'maleCousin': return 'Cousin';
      case 'femaleFriend': return 'Amie';
      case 'maleFriend': return 'Ami';
      case 'partner': return 'Petit copain / petite copine';
      case 'teacher': return 'Maîtresse / Maître';
      case 'babysitter': return 'Baby-sitter / Nounou';
      case 'other': return 'Autre proche';
      case 'otherParent': return 'Autre parent';
      default: return 'Proche';
    }
  };

  const getNickname = () => {
    if (!relative.nickname) return getRelativeTypeLabel(relative.type);
    if (typeof relative.nickname === 'string') return getRelativeTypeLabel(relative.nickname) || relative.nickname;
    if (typeof relative.nickname === 'object') {
      if (relative.nickname.custom) return relative.nickname.custom;
      if (relative.nickname.type) return getRelativeTypeLabel(relative.nickname.type);
    }
    return getRelativeTypeLabel(relative.type);
  };

  const nickname = getNickname();

  const fallback = (
    <span className="text-2xl flex items-center justify-center h-full w-full">
      {getRelativeTypeEmoji(relative.type)}
    </span>
  );

  return (
    <Card className={`overflow-hidden border-mcf-mint hover:shadow-lg transition-shadow ${isDeceased ? 'opacity-90' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4 mb-4">
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
          profileName={relative.firstName}
            onImageLoad={onImageLoad}
            onImageError={onImageError}
            fallback={fallback}
            alt={relative.firstName}
            size="h-16 w-16"
            ageAlert={ageAlert}
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-mcf-orange-dark truncate">{relative.firstName}</h3>
            {relative.age && (
              <p className="text-sm font-medium text-primary mb-1">{relative.age}</p>
            )}
            <p className="text-sm text-muted-foreground mb-1">{nickname}</p>
            <p className="text-xs text-muted-foreground">
              Proche de {childrenNames.join(' et ')}
            </p>
            {isDeceased && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                <Heart className="h-3 w-3" />
                En mémoire
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {relative.traits && relative.traits.length > 0 && (
            <div className="col-span-2 flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{relative.traits.length} trait{relative.traits.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Link 
            to={`/modifier-proche/${primaryChildId}/${relative.id}`}
            className="flex-1"
          >
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex items-center justify-center gap-2 border-[#B3D4F5] text-[#4A90E2] hover:bg-[#F8FBFF] hover:border-[#4A90E2] rounded-full font-semibold transition-all duration-300"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelativeProfileCard;
