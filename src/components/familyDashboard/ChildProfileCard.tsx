// ChildProfileCard v2.2
// Changelog v2.2 — CORRECTIF : l'enfant lisait des champs inexistants.
//   useFamilyData expose l'enfant en camelCase (contrat de l'interface
//   FamilyChild : avatarStatus, avatarErrorCode, avatarErrorFields), alors que
//   les proches, animaux et doudous sont enrichis en snake_case. La v2.1 lisait
//   child.avatar_status pour les quatre : undefined pour l'enfant seulement.
//   La carte croyait donc que tout allait bien et affichait l'ancien avatar,
//   alors que la base disait 'failed' et que la fiche affichait bien l'erreur.
//   Non détecté par esbuild, qui retire les types sans les vérifier.
// ChildProfileCard v2.1
// Changelog v2.1 — un avatar en échec est CLIQUABLE et mène à l'écran de modification.
//   Les infobulles ne s'ouvrent pas au toucher : sans ce clic, un parent sur mobile
//   voyait la pastille rouge sans aucun moyen de lire le message ni de corriger.
// ChildProfileCard v2.0
// Changelog v2.0 — transmet le statut de génération à AvatarDisplay.
//   Les trois colonnes viennent de useFamilyData v3.0 : le hook n'a plus besoin
//   de sa lecture individuelle au montage (une requête par carte en moins).
//   La carte affiche l'état d'échec sans dépendre du realtime : le refetch de
//   useFamilyData suffit.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Edit, Users, Palette, Cat, Gamepad2, MapPin, Heart } from 'lucide-react';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import AvatarDisplay from '@/components/familyDashboard/AvatarDisplay';
import { getChildAvatarAlert } from '@/utils/avatarAgeAlert';

interface Child {
  id: string;
  firstName: string;
  age: string;
  avatar: string | null;
  personalityEmoji: string;
  relatives?: any[];
  places?: any[];
  toysCount?: number;
  preferencesCount?: number;
  hasPets?: number;
  birthDate?: string | null;
  isDeceased?: boolean;
  /** v2.2 — camelCase, comme le reste de FamilyChild. Voir useFamilyData v3.0. */
  avatarStatus?: string | null;
  avatarErrorCode?: string | null;
  avatarErrorFields?: string | null;
}

interface ChildProfileCardProps {
  child: Child;
}

const ChildProfileCard: React.FC<ChildProfileCardProps> = ({ child }) => {
  const navigate = useNavigate();
  const { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc,
          avatarStatus, avatarErrorCode, avatarErrorFields } =
    useRealtimeAvatar({
      table: 'child_profiles',
      id: child.id,
      initialAvatarUrl: child.avatar,
      initialAvatarStatus: (child?.avatarStatus ?? null) as any,
      initialAvatarErrorCode: child?.avatarErrorCode ?? null,
      initialAvatarErrorFields: child?.avatarErrorFields ?? null,
    });

  const ageAlert = getChildAvatarAlert(child.firstName, child.birthDate, avatarUrl);

  const fallback = (
    <span className="text-2xl flex items-center justify-center h-full w-full bg-mcf-amber/20 text-mcf-orange-dark">
      {child.personalityEmoji || child.firstName.charAt(0).toUpperCase()}
    </span>
  );

  const isBirthdayToday = React.useMemo(() => {
    if (!child.birthDate) return false;
    const today = new Date();
    const birth = new Date(child.birthDate);
    return birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate();
  }, [child.birthDate]);

  return (
    <Card className="overflow-hidden border-mcf-mint animate-fade-in">
      <CardHeader className="relative bg-gradient-to-br from-mcf-amber/20 to-transparent p-4 flex flex-row items-center gap-4">
        {isBirthdayToday && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 animate-bounce">
            🎂 Anniversaire !
          </div>
        )}
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
          profileName={child.firstName}
          onErrorClick={() => navigate(`/creer-profil-enfant?edit=${child.id}`)}
          onImageLoad={onImageLoad}
          onImageError={onImageError}
          fallback={fallback}
          alt={child.firstName}
          size="h-16 w-16"
          ageAlert={ageAlert}
        />
        <div>
          <h3 className="text-xl font-bold text-mcf-orange-dark">{child.firstName}</h3>
          {child.isDeceased ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-mcf-orange-dark/70 mt-0.5">
              <Heart className="h-3.5 w-3.5" />
              En mémoire
            </span>
          ) : (
            <p className="text-muted-foreground">{child.age}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-mcf-orange" />
            <span>Proches {child.relatives ? child.relatives.length : 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Cat className="h-4 w-4 text-mcf-orange" />
            <span>Animaux {child.hasPets || 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-mcf-orange" />
            <span>Lieux {child.places ? child.places.length : 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-mcf-orange" />
            <span>Jouets préférés {child.toysCount || 0}</span>
          </div>
          
          <div className="flex items-center gap-2 col-span-2">
            <Palette className="h-4 w-4 text-mcf-orange" />
            <span>Préférences {child.preferencesCount || 0}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2">
        <Link 
          to={`/creer-profil-enfant?edit=${child.id}`}
          className="flex-1"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2 border-[#B3D4F5] text-[#4A90E2] hover:bg-[#F8FBFF] hover:border-[#4A90E2] rounded-full font-semibold transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ChildProfileCard;
