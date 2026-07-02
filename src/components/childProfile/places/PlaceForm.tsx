import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlaceData, PlaceDetails } from '@/types/place';

import {
  placeTypeOptions,
  habitatTypeOptions,
  typeVacancesOptions,
} from '@/constants/placeOptions';

interface PlaceFormProps {
  place: PlaceData;
  onChange: (place: PlaceData) => void;
}

export const PlaceForm: React.FC<PlaceFormProps> = ({ place, onChange }) => {
  const [details, setDetails] = useState<PlaceDetails>(place.details || {});

  // Synchronise le state local quand on charge un lieu existant (mode édition)
  // Dépendance sur place.id uniquement pour ne pas boucler sur chaque keystroke
  useEffect(() => {
    if (place) {
      setDetails(place.details || {});
    }
  }, [place.id]);

  const updateDetails = (key: keyof PlaceDetails, value: any) => {
    setDetails((prev) => {
      const newDetails = { ...prev, [key]: value };
      onChange({ ...place, details: newDetails });
      return newDetails;
    });
  };

  const isVacationPlace = place.type === 'vacances';

  return (
    <div className="space-y-6">
      {/* ─── Champs communs ─── */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="place-label">Nom du lieu *</Label>
          <Input
            id="place-label"
            value={place.label}
            onChange={(e) => onChange({ ...place, label: e.target.value })}
            placeholder="Ex: Notre maison, Chez Papa, Camping du Lac..."
            required
          />
        </div>

        <div>
          <Label htmlFor="place-type">Type de lieu *</Label>
          <select
            id="place-type"
            value={place.type}
            onChange={(e) => onChange({ ...place, type: e.target.value as any })}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="" disabled>Sélectionner un type</option>
            {placeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="place-city">Ville</Label>
            <Input
              id="place-city"
              value={place.city || ''}
              onChange={(e) => onChange({ ...place, city: e.target.value })}
              placeholder="Ville"
            />
          </div>

          <div>
            <Label htmlFor="place-country">Pays</Label>
            <Input
              id="place-country"
              value={place.country || ''}
              onChange={(e) => onChange({ ...place, country: e.target.value })}
              placeholder="Pays"
            />
          </div>
        </div>
      </div>

      {/* ─── Bloc VACANCES ───
          Reste monté même quand caché pour éviter les problèmes de portail Radix */}
      <div className={isVacationPlace ? '' : 'hidden'}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Questions détaillées</h3>

          <div>
            <Label htmlFor="type-vacances">Quel type de lieu est-ce ?</Label>
            <select
              id="type-vacances"
              value={details.type_vacances || ''}
              onChange={(e) => updateDetails('type_vacances', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="" disabled>Sélectionner</option>
              {typeVacancesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="environnement-vacances">
              Décris l'environnement *
            </Label>
            <Textarea
              id="environnement-vacances"
              value={details.environnement || ''}
              onChange={(e) => updateDetails('environnement', e.target.value)}
              placeholder="Ex: Plage de sable fin, montagne enneigée, forêt de pins méditerranéens..."
            />
          </div>

          <div>
            <Label htmlFor="activites">
              Quelles activités l'enfant y fait-il habituellement ?
            </Label>
            <Textarea
              id="activites"
              value={details.activites || ''}
              onChange={(e) => updateDetails('activites', e.target.value)}
              placeholder="Ex: Tennis, baignade, randonnée, châteaux de sable, vélo..."
            />
          </div>
        </div>
      </div>

      {/* ─── Bloc MAISON (principale / secondaire / autre parent) ───
          Reste monté même quand caché */}
      <div className={isVacationPlace ? 'hidden' : ''}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Questions détaillées</h3>

          <div>
            <Label>Quel type de logement est-ce ?</Label>
            <select
              value={details.habitat_type || ''}
              onChange={(e) => updateDetails('habitat_type', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="" disabled>Sélectionner</option>
              {habitatTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
            {details.habitat_type === 'Autre' && (
              <Input
                className="mt-2"
                value={details.habitat_type_autre || ''}
                onChange={(e) => updateDetails('habitat_type_autre', e.target.value)}
                placeholder="Précisez le type de logement..."
              />
            )}
          </div>

          <div>
            <Label htmlFor="environnement-maison">
              Décris l'environnement autour du logement *
            </Label>
            <Textarea
              id="environnement-maison"
              value={details.environnement || ''}
              onChange={(e) => updateDetails('environnement', e.target.value)}
              placeholder="Ex: Garrigue provençale, forêt de châtaigniers, bord de mer, quartier animé de Paris..."
            />
            <p className="text-xs text-gray-500 mt-1">
              C'est la description la plus importante pour personnaliser l'histoire !
            </p>
          </div>

          <div>
            <Label>Y a-t-il un jardin ou une cour ?</Label>
            <RadioGroup
              value={details.jardin === undefined ? '' : details.jardin ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('jardin', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="jardin-oui" />
                <Label htmlFor="jardin-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="jardin-non" />
                <Label htmlFor="jardin-non">Non</Label>
              </div>
            </RadioGroup>
          </div>

          {details.jardin && (
            <div>
              <Label htmlFor="jardin-elements">
                Quels sont les jeux ou éléments marquants dans le jardin ?
              </Label>
              <Textarea
                id="jardin-elements"
                value={details.jardin_elements || ''}
                onChange={(e) => updateDetails('jardin_elements', e.target.value)}
                placeholder="Ex: Piscine, trampoline, cabane en bois, grand chêne centenaire, bac à sable..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};