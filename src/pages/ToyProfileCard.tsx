// ToyProfileCard v1.0
// Nouveau fichier — calqué sur PetProfileCard.tsx pour la parité visuelle.
// Note : labels des types/rôles devinés (pas d'accès à constants/toyOptions.ts) — à ajuster
// si le wording ne colle pas exactement à ce qui est affiché ailleurs dans l'app.
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, LogOut } from 'lucide-react';
import type { ToyData } from '@/types/childProfile';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import AvatarDisplay from '@/components/familyDashboard/AvatarDisplay';

interface ToyProfileCardProps {
  toy: ToyData;
  childrenNames: string[];
  primaryChildId: string;
}

const ToyProfileCard: React.FC<ToyProfileCardProps> = ({ toy, childrenNames, primaryChildId }) => {
  const { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc } =
    useRealtimeAvatar({
      table: 'comforters',
      id: toy.comforterId || toy.id,
      initialAvatarUrl: (toy as any).avatar_url,
    });

  const getToyTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      plush: '🧸', blanket: '🧣', doll: '🧍', miniCar: '🚗', figurine: '🦸', other: '✨'
    };
    return emojiMap[type] || '🧸';
  };

  const getToyTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      plush: 'Peluche', blanket: 'Doudou / couverture', doll: 'Poupée',
      miniCar: 'Petite voiture', figurine: 'Figurine', other: 'Autre'
    };
    return labelMap[type] || type;
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      sleepGuardian: 'Gardien du sommeil', invisibleFriend: 'Ami invisible',
      magicProtector: 'Protecteur magique', secretHero: 'Héros secret',
      playmate: 'Compagnon de jeu', noSpecificRole: 'Aucun rôle particulier',
      otherRole1: 'Rôle personnalisé', otherRole2: 'Rôle personnalisé'
    };
    return roleMap[role] || role;
  };

  const normalizedRoles = React.useMemo(() => {
    if (!toy.roles) return [];
    if (Array.isArray(toy.roles)) return toy.roles;
    if (typeof toy.roles === 'string') return (toy.roles as string).split(',').map(r => r.trim()).filter(Boolean);
    return [];
  }, [toy.roles]);

  const fallback = (
    <span className="text-2xl flex items-center justify-center h-full w-full">
      {getToyTypeEmoji(toy.type)}
    </span>
  );

  // Statut « perdu » — badge discret, même esprit que pets/relatives
  const isLost = toy.isActive === false;
  const statusBadge = isLost ? { label: 'Perdu', Icon: LogOut } : null;

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
            onImageLoad={onImageLoad}
            onImageError={onImageError}
            fallback={fallback}
            alt={toy.name}
            size="h-14 w-14"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-mcf-orange-dark">{toy.name}</h3>
            <p className="text-sm text-muted-foreground">
              {toy.type === 'other' && toy.otherType ? toy.otherType : getToyTypeLabel(toy.type)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Doudou de {childrenNames.join(' et ')}
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
        {toy.appearance && (
          <div className="text-sm text-muted-foreground mb-3">
            <span className="font-medium">Apparence : </span>
            <span>{toy.appearance}</span>
          </div>
        )}

        {normalizedRoles.length > 0 && normalizedRoles[0] !== 'noSpecificRole' && (
          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {normalizedRoles.slice(0, 2).map((role, idx) => (
              <span key={idx} className="text-xs text-foreground/70 px-2 py-1">
                {getRoleLabel(role)}
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
          <Link to={`/modifier-doudou/${primaryChildId}/${toy.comforterId || toy.id}`}>
            <Edit className="h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ToyProfileCard;
