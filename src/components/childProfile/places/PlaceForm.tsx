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

export const PlaceForm: React.FC = ({ place, onChange }) => {
  const [details, setDetails] = useState(place.details || {});

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
    




      {/* ─── Champs communs ─── */}
      


        


          Nom du lieu *
           onChange({ ...place, label: e.target.value })}
            placeholder="Ex: Notre maison, Chez Papa, Camping du Lac..."
            required
          />
        



        


          Type de lieu *
           onChange({ ...place, type: e.target.value as any })}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
          >
            Sélectionner un type
            {placeTypeOptions.map((option) => (
              
                {option.label}
              
            ))}
          
        



        


          


            Ville
             onChange({ ...place, city: e.target.value })}
              placeholder="Ville"
            />
          


          


            Pays
             onChange({ ...place, country: e.target.value })}
              placeholder="Pays"
            />
          


        


      



      {/* ─── Bloc VACANCES ───
          Reste monté même quand caché pour éviter les problèmes de portail Radix */}
      


        


          

Questions détaillées



          

            🏕 Quel type de lieu est-ce ?
             updateDetails('type_vacances', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
            >
              Sélectionner
              {typeVacancesOptions.map((option) => (
                
                  {option.value}
                
              ))}
            
          



          


            
              🌳 Décris l'environnement *
            
             updateDetails('environnement', e.target.value)}
              placeholder="Ex: Plage de sable fin, montagne enneigée, forêt de pins méditerranéens..."
            />
            <p className="text-xs text-gray-500 mt-1">
              C'est la description la plus importante pour personnaliser l'histoire !
            </p>
          </div>

          <div>
            <Label htmlFor="activites">
              🎒 Quelles activités l'enfant y fait-il habituellement ?
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
            <Label>🏠 Quel type de logement est-ce ?</Label>
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
            <Label htmlFor="environnement">
              🌳 Décris l'environnement autour du logement *
            </Label>
            <Textarea
              id="environnement"
              value={details.environnement || ''}
              onChange={(e) => updateDetails('environnement', e.target.value)}
              placeholder="Ex: Garrigue provençale, forêt de châtaigniers, bord de mer, quartier animé de Paris..."
            />
            <p className="text-xs text-gray-500 mt-1">
              C'est la description la plus importante pour personnaliser l'histoire !
            </p>
          </div>

          <div>
            <Label>🏡 Y a-t-il un jardin ou une cour ?</Label>
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
                🎠 Quels sont les jeux ou éléments marquants dans le jardin ?
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
