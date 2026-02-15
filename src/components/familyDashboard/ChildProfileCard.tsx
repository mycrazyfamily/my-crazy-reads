
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Edit, Users, Palette, Cat, Gamepad2, MapPin } from 'lucide-react';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import AvatarDisplay from '@/components/familyDashboard/AvatarDisplay';

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
}

interface ChildProfileCardProps {
  child: Child;
}

const ChildProfileCard: React.FC<ChildProfileCardProps> = ({ child }) => {
  const { avatarUrl, isNew, isLoading, hasError, onImageError, onImageLoad, imgSrc } =
    useRealtimeAvatar({
      table: 'child_profiles',
      id: child.id,
      initialAvatarUrl: child.avatar,
    });

  const fallback = (
    <span className="text-2xl flex items-center justify-center h-full w-full bg-mcf-amber/20 text-mcf-orange-dark">
      {child.personalityEmoji || child.firstName.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <Card className="overflow-hidden border-mcf-mint animate-fade-in">
      <CardHeader className="bg-gradient-to-br from-mcf-amber/20 to-transparent p-4 flex flex-row items-center gap-4">
        <AvatarDisplay
          imgSrc={imgSrc}
          avatarUrl={avatarUrl}
          isLoading={isLoading}
          isNew={isNew}
          hasError={hasError}
          onImageLoad={onImageLoad}
          onImageError={onImageError}
          fallback={fallback}
          alt={child.firstName}
          size="h-16 w-16"
        />
        <div>
          <h3 className="text-xl font-bold text-mcf-orange-dark">{child.firstName}</h3>
          <p className="text-muted-foreground">{child.age}</p>
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
