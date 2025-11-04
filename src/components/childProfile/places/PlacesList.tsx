import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Edit } from 'lucide-react';
import { PlaceData } from '@/types/place';
import { placeTypeOptions } from '@/constants/placeOptions';

interface PlacesListProps {
  places: PlaceData[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const PlacesList: React.FC<PlacesListProps> = ({ places, onEdit, onDelete }) => {
  if (places.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun lieu ajouté pour le moment
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    const option = placeTypeOptions.find(opt => opt.value === type);
    return option ? option.emoji : '🏠';
  };

  return (
    <div className="grid gap-4">
      {places.map((place, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getTypeLabel(place.type)}</span>
                <h4 className="font-semibold text-lg">{place.label}</h4>
              </div>
              {place.city && (
                <p className="text-sm text-muted-foreground">
                  📍 {place.city}{place.country && `, ${place.country}`}
                </p>
              )}
              {place.childLabel && (
                <p className="text-sm text-muted-foreground mt-1">
                  Pour l'enfant : {place.childLabel}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(index)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
