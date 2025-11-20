import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Users } from 'lucide-react';

interface RelativeProfileCardProps {
  relative: {
    id: string;
    firstName: string;
    type: string;
    nickname?: { custom?: string; type?: string };
    traits?: string[];
    appearance?: any;
    age?: string;
  };
  childrenNames: string[];
  primaryChildId: string;
}

const RelativeProfileCard: React.FC<RelativeProfileCardProps> = ({ relative, childrenNames, primaryChildId }) => {
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

  // Calculer le nickname affiché en traduisant toujours les types
  const getNickname = () => {
    if (!relative.nickname) {
      return getRelativeTypeLabel(relative.type);
    }
    
    // Si nickname est une string directe, la traduire si c'est un type connu
    if (typeof relative.nickname === 'string') {
      return getRelativeTypeLabel(relative.nickname) || relative.nickname;
    }
    
    // Si nickname est un objet
    if (typeof relative.nickname === 'object') {
      if (relative.nickname.custom) {
        return relative.nickname.custom;
      }
      if (relative.nickname.type) {
        return getRelativeTypeLabel(relative.nickname.type);
      }
    }
    
    // Par défaut, utiliser le type du relative
    return getRelativeTypeLabel(relative.type);
  };

  const nickname = getNickname();

  return (
    <Card className="overflow-hidden border-mcf-mint hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16 bg-mcf-amber/20 border-2 border-mcf-mint">
            <AvatarFallback className="text-2xl">
              {getRelativeTypeEmoji(relative.type)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-mcf-orange-dark truncate">{relative.firstName}</h3>
            {relative.age && (
              <p className="text-sm font-medium text-mcf-primary mb-1">{relative.age}</p>
            )}
            <p className="text-sm text-gray-600 mb-1">{nickname}</p>
            <p className="text-xs text-gray-500">
              Proche de {childrenNames.join(' et ')}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {relative.traits && relative.traits.length > 0 && (
            <div className="col-span-2 flex items-center gap-1 text-gray-600">
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
