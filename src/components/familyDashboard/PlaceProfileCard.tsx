import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, MapPinOff } from 'lucide-react';
import type { PlaceData } from '@/types/place';

interface PlaceProfileCardProps {
  place: PlaceData;
  childrenNames: string[];
  primaryChildId: string;
}

const PlaceProfileCard: React.FC<PlaceProfileCardProps> = ({ place, childrenNames, primaryChildId }) => {
  const isInactive = (place as any).is_active === false;
  const getPlaceTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      maison_principale: '🏠',
      maison_secondaire: '🏡',
      autre_parent: '🏘️',
      vacances: '🏖️'
    };
    return emojiMap[type] || place.emoji || '📍';
  };

  const getPlaceTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      maison_principale: 'Maison principale',
      maison_secondaire: 'Maison secondaire',
      autre_parent: 'Chez l\'autre parent',
      vacances: 'Lieu de vacances'
    };
    return labelMap[type] || type;
  };

  return (
    <Card className={`overflow-hidden border-mcf-mint hover:shadow-md transition-shadow ${isInactive ? 'opacity-90' : ''}`}>
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            {getPlaceTypeEmoji(place.type)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-mcf-orange-dark">{place.label}</h3>
            <p className="text-sm text-gray-600">
              {getPlaceTypeLabel(place.type)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Lieu de vie de {childrenNames.join(' et ')}
            </p>
            {isInactive && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                <MapPinOff className="h-3 w-3" />
                Nous n'y vivons plus
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {(place.address || place.city || place.country) && (
          <div className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Adresse : </span>
            <span>
              {[place.address, place.city, place.country]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        )}
        
        {place.description && (
          <div className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Description : </span>
            <span>{place.description}</span>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 flex items-center justify-center gap-2 border-[#B3D4F5] text-[#4A90E2] hover:bg-[#F8FBFF] hover:border-[#4A90E2] rounded-full font-semibold transition-all duration-300"
          asChild
        >
          <Link to={`/modifier-lieu/${primaryChildId}/${place.id}`}>
            <Edit className="h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlaceProfileCard;
