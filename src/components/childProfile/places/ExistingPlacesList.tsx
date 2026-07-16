// ExistingPlacesList v1.1
// Changelog v1.1 (AFFICHAGE UNIQUEMENT) : les lieux INACTIFS (is_active === false, ex. « on n'y vit
// plus ») sont désormais grisés + NON cliquables (case désactivée, aucun onTogglePlace), avec
// l'indication « Nous n'y vivons plus » (même formulation que le dashboard). On ne peut donc plus
// les sélectionner pour un enfant. Les lieux actifs sont inchangés.
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { MapPinOff } from 'lucide-react';

type ExistingPlace = {
  id: string;
  label: string;
  type: string;
  emoji: string;
  city?: string;
  country?: string;
  family_id: string;
  is_active?: boolean;
};

type ExistingPlacesListProps = {
  existingPlaces: ExistingPlace[];
  selectedPlaceIds: string[];
  onTogglePlace: (placeId: string) => void;
};

const getPlaceEmoji = (type: string): string => {
  const emojiMap: Record<string, string> = {
    'maison_principale': '🏠',
    'maison_secondaire': '🏡',
    'autre_parent': '🏘️',
    'grands_parents': '👴👵',
    'vacances': '🏖️',
  };
  return emojiMap[type] || '📍';
};

const getPlaceTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'maison_principale': 'Maison principale',
    'maison_secondaire': 'Maison secondaire',
    'autre_parent': 'Chez l\'autre parent',
    'grands_parents': 'Chez les grands-parents',
    'vacances': 'Lieu de vacances',
  };
  return labelMap[type] || type;
};

const ExistingPlacesList: React.FC<ExistingPlacesListProps> = ({
  existingPlaces,
  selectedPlaceIds,
  onTogglePlace
}) => {

  if (existingPlaces.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-mcf-primary">Lieux déjà créés</h3>
        <p className="text-sm text-gray-600">
          Sélectionnez les lieux déjà existants pour les associer à cet enfant
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {existingPlaces.map((place) => {
          // Lieu inactif (on n'y vit plus) → grisé + non sélectionnable.
          const isInactive = place.is_active === false;
          const isSelected = !isInactive && selectedPlaceIds.includes(place.id);

          return (
            <Card
              key={place.id}
              className={`transition-all ${
                isInactive
                  ? 'cursor-not-allowed opacity-60 bg-gray-50 border-gray-200'
                  : isSelected
                    ? 'cursor-pointer border-mcf-orange bg-mcf-amber/10'
                    : 'cursor-pointer border-gray-200 hover:border-mcf-orange/50'
              }`}
              onClick={() => { if (!isInactive) onTogglePlace(place.id); }}
              aria-disabled={isInactive}
            >
              <div className="p-4 flex items-center gap-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    disabled={isInactive}
                    onCheckedChange={() => { if (!isInactive) onTogglePlace(place.id); }}
                    className="h-5 w-5 rounded-md border-2 border-mcf-primary bg-white transition-all duration-200 data-[state=checked]:bg-mcf-primary data-[state=checked]:border-mcf-primary data-[state=checked]:text-white hover:border-mcf-primary-dark"
                    aria-label={`Sélectionner ${place.label}`}
                  />
                </div>
                <div className="text-3xl">{place.emoji || getPlaceEmoji(place.type)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-mcf-orange-dark">
                    {place.label}
                  </p>
                  <p className="text-sm text-gray-600">{getPlaceTypeLabel(place.type)}</p>
                  {(place.city || place.country) && (
                    <p className="text-xs text-gray-500">
                      {place.city}{place.city && place.country ? ', ' : ''}{place.country}
                    </p>
                  )}
                  {isInactive && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      <MapPinOff className="h-3 w-3" />
                      Nous n'y vivons plus
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExistingPlacesList;
