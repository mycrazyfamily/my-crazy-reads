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
      case 'partner': return 'Petit copain / petite copine';
      case 'teacher': return 'Maîtresse / Maître';
      case 'babysitter': return 'Baby-sitter / Nounou';
      default: return 'Proche';
    }
  };

  const nickname = relative.nickname?.custom || relative.nickname?.type || getRelativeTypeLabel(relative.type);

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
              className="w-full border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10 gap-1"
            >
              <Edit className="h-3 w-3" /> Modifier
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelativeProfileCard;
