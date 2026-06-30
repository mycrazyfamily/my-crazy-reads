import React from 'react';
import type { ChildProfileFormData } from '@/types/childProfile';
import { MapPin, MapPinOff } from 'lucide-react';
type PlacesSummaryProps = {
  data: ChildProfileFormData;
};
const PlacesSummary: React.FC<PlacesSummaryProps> = ({ data }) => {
  if (!data.places?.places || data.places.places.length === 0) {
    return <p className="text-gray-500 text-xs">Aucun lieu de vie ajouté.</p>;
  }
  return (
    <div className="space-y-3">
      {data.places.places.map((place, index) => {
        const placeAny = place as any;
        const placeInactive = placeAny.is_active === false;
        return (
        <div key={index} className={`bg-mcf-amber/5 rounded-lg p-2.5 border border-mcf-amber/20 ${placeInactive ? 'opacity-60' : ''}`}>
          <div className="flex items-start gap-2">
            {place.emoji && (
              <span className="text-xl flex-shrink-0">{place.emoji}</span>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h4 className="text-sm font-semibold text-mcf-primary-dark">
                  {place.label}
                </h4>
                {place.type && (
                  <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded">
                    {getPlaceTypeLabel(place.type)}
                  </span>
                )}
              </div>

              {placeInactive && (
                <div className="mb-1">
                  <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                    <MapPinOff className="h-3 w-3" />
                    Nous n'y vivons plus
                  </span>
                </div>
              )}

              {place.address && (
                <div className="flex items-start gap-1 text-xs text-gray-600 mb-1">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{place.address}</span>
                </div>
              )}
              {place.details && Object.keys(place.details).length > 0 && (
                <div className="mt-2 space-y-1">
                  {renderDetails(place.details)}
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};
const getPlaceTypeLabel = (type: string): string => {
  // Formatter les types avec underscores
  const formattedType = type.replace(/_/g, ' ');
  
  const labels: Record<string, string> = {
    'house': 'Maison',
    'apartment': 'Appartement',
    'maison secondaire': 'Maison secondaire',
    'secondary house': 'Maison secondaire',
    'other': 'Autre'
  };
  
  return labels[formattedType.toLowerCase()] || formattedType;
};
const renderDetails = (details: any) => {
  const detailsArray = [];
  if (details.hasGarden && details.gardenElements && details.gardenElements.length > 0) {
    const elements = details.gardenElements.filter((el: string) => el.trim() !== '');
    if (elements.length > 0) {
      detailsArray.push(
        <div key="garden" className="text-xs">
          <span className="text-gray-500">Jardin : </span>
          <span className="text-gray-700">{elements.join(', ')}</span>
        </div>
      );
    }
  }
  if (details.markableElements && details.markableElements.length > 0) {
    const elements = details.markableElements.filter((el: string) => el.trim() !== '');
    if (elements.length > 0) {
      detailsArray.push(
        <div key="markable" className="text-xs">
          <span className="text-gray-500">Éléments marquants : </span>
          <span className="text-gray-700">{elements.join(', ')}</span>
        </div>
      );
    }
  }
  if (details.hasBalcony) {
    detailsArray.push(
      <div key="balcony" className="text-xs text-gray-700">
        🏡 Balcon
      </div>
    );
  }
  if (details.floor) {
    detailsArray.push(
      <div key="floor" className="text-xs">
        <span className="text-gray-500">Étage : </span>
        <span className="text-gray-700">{details.floor}</span>
      </div>
    );
  }
  return detailsArray.length > 0 ? detailsArray : null;
};
export default PlacesSummary;
