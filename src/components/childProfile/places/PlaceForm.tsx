import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceData, PlaceDetails } from '@/types/place';
import { DetailsInput } from './DetailsInput';

import {
  placeTypeOptions,
  habitatTypeOptions,
  luminositeOptions,
  frequenceUtilisationOptions,
  typeVacancesOptions,
  repasOuOptions,
} from '@/constants/placeOptions';

interface PlaceFormProps {
  place: PlaceData;
  onChange: (place: PlaceData) => void;
}

export const PlaceForm: React.FC<PlaceFormProps> = ({ place, onChange }) => {
  const [details, setDetails] = useState<PlaceDetails>(place.details || {});
  const [gardenDetails, setGardenDetails] = useState<string[]>(['']);
  const [noGardenDetails, setNoGardenDetails] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<string[]>(['']);
  const [noPlaceDetails, setNoPlaceDetails] = useState(false);

  // Synchroniser les détails physiques et autres champs quand place change
  useEffect(() => {
    if (place) {
      const d = place.details || {};
    
    // Only sync local state, don't propagate to parent
    setDetails(d);
    
    // Initialize garden details
    const gDetails = [d.jardin_autres_1, d.jardin_autres_2, d.jardin_autres_3].filter(v => v && v.trim() !== '');
    setGardenDetails(gDetails.length > 0 ? gDetails : ['']);
    setNoGardenDetails(d.noJardinDetails || false);
    
    // Initialize place details
    const pDetails = [d.autre_detail_1, d.autre_detail_2, d.autre_detail_3].filter(v => v && v.trim() !== '');
    setPlaceDetails(pDetails.length > 0 ? pDetails : ['']);
    setNoPlaceDetails(d.noAutreDetails || false);
    }
  }, [place.id]);


  const updateDetails = (key: keyof PlaceDetails, value: any) => {
    setDetails((prev) => {
      const newDetails = { ...prev, [key]: value };
      onChange({ ...place, details: newDetails });
      return newDetails;
    });
  };

  const updateManyDetails = (patch: Partial<PlaceDetails>) => {
    setDetails((prev) => {
      const newDetails = { ...prev, ...patch };
      onChange({ ...place, details: newDetails });
      return newDetails;
    });
  };

  const handleGardenDetailsChange = (values: string[]) => {
    setGardenDetails(values);
    updateManyDetails({
      jardin_autres_1: values[0] || '',
      jardin_autres_2: values[1] || '',
      jardin_autres_3: values[2] || '',
    });
  };

  const handleNoGardenDetailsChange = (checked: boolean) => {
    setNoGardenDetails(checked);
    updateDetails('noJardinDetails', checked);
    if (checked) {
      setGardenDetails(['']);
      updateManyDetails({
        jardin_autres_1: '',
        jardin_autres_2: '',
        jardin_autres_3: '',
      });
    }
  };

  const handlePlaceDetailsChange = (values: string[]) => {
    setPlaceDetails(values);
    updateManyDetails({
      autre_detail_1: values[0] || '',
      autre_detail_2: values[1] || '',
      autre_detail_3: values[2] || '',
    });
  };

  const handleNoPlaceDetailsChange = (checked: boolean) => {
    setNoPlaceDetails(checked);
    updateDetails('noAutreDetails', checked);
    if (checked) {
      setPlaceDetails(['']);
      updateManyDetails({
        autre_detail_1: '',
        autre_detail_2: '',
        autre_detail_3: '',
      });
    }
  };

  const isVacationPlace = place.type === 'vacances';

  return (
    <div className="space-y-6">
      {/* Basic Info */}
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
          <Select
            value={place.type}
            onValueChange={(value) = modal={false}> onChange({ ...place, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {placeTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="place-address">Adresse (optionnel)</Label>
          <Input
            id="place-address"
            value={place.address || ''}
            onChange={(e) => onChange({ ...place, address: e.target.value })}
            placeholder="Adresse complète"
          />
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

      {/* Detailed Questions — both blocks stay mounted, only hidden, to avoid
          unmounting Select/Popover portals mid-render when the type changes. */}
      <div className={isVacationPlace ? '' : 'hidden'}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Questions détaillées</h3>
          
          <div>
            <Label>🏕 Quel type de lieu est-ce ?</Label>
            <Select value={details.type_vacances || ''} onValueChange={(value) = modal={false}> updateDetails('type_vacances', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {typeVacancesOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="frequence-annuelle">🗓️ Combien de fois par an y allez-vous ?</Label>
            <Input
              id="frequence-annuelle"
              value={details.frequence_annuelle || ''}
              onChange={(e) => updateDetails('frequence_annuelle', e.target.value)}
              placeholder="Ex: 1 fois, 2-3 fois, chaque été..."
            />
          </div>

          <div>
            <Label>🛌 Avez-vous un hébergement attitré ?</Label>
            <RadioGroup
              value={details.hebergement_attitre === undefined ? '' : details.hebergement_attitre ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('hebergement_attitre', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="hebergement-oui" />
                <Label htmlFor="hebergement-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="hebergement-non" />
                <Label htmlFor="hebergement-non">Non</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>👨‍👩‍👧‍👦 La famille part-elle toujours au complet ?</Label>
            <RadioGroup
              value={details.famille_complete === undefined ? '' : details.famille_complete ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('famille_complete', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="famille-oui" />
                <Label htmlFor="famille-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="famille-non" />
                <Label htmlFor="famille-non">Non</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>🛋️ L'espace est-il partagé avec d'autres personnes ?</Label>
            <RadioGroup
              value={details.espace_partage === undefined ? '' : details.espace_partage ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('espace_partage', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="partage-oui" />
                <Label htmlFor="partage-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="partage-non" />
                <Label htmlFor="partage-non">Non</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="activites">🎒 Quelles activités l'enfant y fait-il habituellement ?</Label>
            <Textarea
              id="activites"
              value={details.activites || ''}
              onChange={(e) => updateDetails('activites', e.target.value)}
              placeholder="Ex: Chasse au trésor, baignade, feu de camp..."
            />
          </div>

          <div>
            <Label>🍽️ Où prenez-vous les repas ?</Label>
            <Select value={details.repas_ou || ''} onValueChange={(value) = modal={false}> updateDetails('repas_ou', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {repasOuOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>🛏️ L'enfant a-t-il son propre lit ?</Label>
            <RadioGroup
              value={details.propre_lit === undefined ? '' : details.propre_lit ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('propre_lit', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="lit-oui" />
                <Label htmlFor="lit-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="lit-non" />
                <Label htmlFor="lit-non">Non</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>🧸 Y a-t-il des objets familiers sur place ?</Label>
            <RadioGroup
              value={details.objets_familiers === undefined ? '' : details.objets_familiers ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('objets_familiers', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="objets-oui" />
                <Label htmlFor="objets-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="objets-non" />
                <Label htmlFor="objets-non">Non</Label>
              </div>
            </RadioGroup>
            {details.objets_familiers && (
              <Textarea
                className="mt-2"
                value={details.objets_familiers_description || ''}
                onChange={(e) => updateDetails('objets_familiers_description', e.target.value)}
                placeholder="Décrivez les objets familiers..."
              />
            )}
          </div>

          <div>
            <Label htmlFor="souvenir">📍 Un souvenir marquant à ce sujet ?</Label>
            <Textarea
              id="souvenir"
              value={details.souvenir_marquant || ''}
              onChange={(e) => updateDetails('souvenir_marquant', e.target.value)}
              placeholder="Ex: le petit-déjeuner en terrasse, les lucioles..."
            />
          </div>
        </div>
      </div>

      <div className={isVacationPlace ? 'hidden' : ''}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Questions détaillées</h3>
          
          <div>
            <Label>🏠 Quel type de logement est-ce ?</Label>
            <Select value={details.habitat_type || ''} onValueChange={(value) = modal={false}> updateDetails('habitat_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {habitatTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label>🌞 Lieu plutôt lumineux ou sombre ?</Label>
            <RadioGroup
              value={details.luminosite || ''}
              onValueChange={(value) => updateDetails('luminosite', value)}
            >
              {luminositeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`lum-${option.value}`} />
                  <Label htmlFor={`lum-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label>🛏️ L'enfant partage-t-il sa chambre ou est-il seul ?</Label>
            <RadioGroup
              value={details.enfants_dans_meme_chambre === undefined ? '' : details.enfants_dans_meme_chambre ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('enfants_dans_meme_chambre', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="chambre-oui" />
                <Label htmlFor="chambre-oui">Oui, il partage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="chambre-non" />
                <Label htmlFor="chambre-non">Non, il est seul</Label>
              </div>
            </RadioGroup>
            {details.enfants_dans_meme_chambre && (
              <Input
                className="mt-2"
                value={details.enfants_chambre_avec_qui || ''}
                onChange={(e) => updateDetails('enfants_chambre_avec_qui', e.target.value)}
                placeholder="Avec qui ? Ex: son frère, sa sœur..."
              />
            )}
          </div>

          <div>
            <Label htmlFor="pieces">🚪 Combien y a-t-il de pièces dans le logement ?</Label>
            <Input
              id="pieces"
              value={details.nombre_pieces || ''}
              onChange={(e) => updateDetails('nombre_pieces', e.target.value)}
              placeholder="Ex: 3, 4, 5..."
            />
          </div>

          <div>
            <Label htmlFor="salon">🛋️ Décris rapidement le salon</Label>
            <Textarea
              id="salon"
              value={details.salon_details || ''}
              onChange={(e) => updateDetails('salon_details', e.target.value)}
              placeholder="Ex: Canapé beige, grande télé, plante verte..."
            />
          </div>

          <div>
            <Label>🎮 Est-ce qu'il y a une télévision ?</Label>
            <RadioGroup
              value={details.television === undefined ? '' : details.television ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('television', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="tv-oui" />
                <Label htmlFor="tv-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="tv-non" />
                <Label htmlFor="tv-non">Non</Label>
              </div>
            </RadioGroup>
            {details.television && (
              <Input
                className="mt-2"
                value={details.television_ou || ''}
                onChange={(e) => updateDetails('television_ou', e.target.value)}
                placeholder="Où ? Ex: dans le salon, dans la chambre des parents..."
              />
            )}
          </div>

          <div>
            <Label>🧸 Y a-t-il une pièce de jeu ?</Label>
            <RadioGroup
              value={details.piece_jeu === undefined ? '' : details.piece_jeu ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('piece_jeu', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="jeu-oui" />
                <Label htmlFor="jeu-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="jeu-non" />
                <Label htmlFor="jeu-non">Non</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>🪟 Le sol fait-il du bruit quand on marche ?</Label>
            <RadioGroup
              value={details.bruit_sol === undefined ? '' : details.bruit_sol ? 'oui' : 'non'}
              onValueChange={(value) => updateDetails('bruit_sol', value === 'oui')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="bruit-oui" />
                <Label htmlFor="bruit-oui">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="bruit-non" />
                <Label htmlFor="bruit-non">Non</Label>
              </div>
            </RadioGroup>
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
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h4 className="font-medium">Questions supplémentaires sur le jardin</h4>
              
              <div>
                <Label>🏊 Y a-t-il une piscine ?</Label>
                <RadioGroup
                  value={details.jardin_piscine === undefined ? '' : details.jardin_piscine ? 'oui' : 'non'}
                  onValueChange={(value) => updateDetails('jardin_piscine', value === 'oui')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oui" id="piscine-oui" />
                    <Label htmlFor="piscine-oui">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non" id="piscine-non" />
                    <Label htmlFor="piscine-non">Non</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>🏓 Y a-t-il une table de ping-pong ?</Label>
                <RadioGroup
                  value={details.jardin_ping_pong === undefined ? '' : details.jardin_ping_pong ? 'oui' : 'non'}
                  onValueChange={(value) => updateDetails('jardin_ping_pong', value === 'oui')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oui" id="pingpong-oui" />
                    <Label htmlFor="pingpong-oui">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non" id="pingpong-non" />
                    <Label htmlFor="pingpong-non">Non</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>🛖 Y a-t-il une cabane, un abri ou une annexe au fond du jardin ?</Label>
                <RadioGroup
                  value={details.jardin_cabane === undefined ? '' : details.jardin_cabane ? 'oui' : 'non'}
                  onValueChange={(value) => updateDetails('jardin_cabane', value === 'oui')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oui" id="cabane-oui" />
                    <Label htmlFor="cabane-oui">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non" id="cabane-non" />
                    <Label htmlFor="cabane-non">Non</Label>
                  </div>
                </RadioGroup>
              </div>

              <DetailsInput
                value={gardenDetails}
                onChange={handleGardenDetailsChange}
                label="🎠 Autres éléments présents dans le jardin ? *"
                placeholder="Ex: Trampoline, bac à sable..."
                onNoDetailsChange={handleNoGardenDetailsChange}
                noDetailsValue={noGardenDetails}
                noDetailsLabel="Aucun élément particulier"
              />
            </div>
          )}

          <div>
            <Label htmlFor="environnement">🌳 Décris l'environnement autour du logement</Label>
            <Textarea
              id="environnement"
              value={details.environnement || ''}
              onChange={(e) => updateDetails('environnement', e.target.value)}
              placeholder="Ex: Quartier calme, voisinage proche, parc à 100m..."
            />
          </div>

          <div>
            <Label>🧳 Ce lieu est-il utilisé à l'année ou ponctuellement ?</Label>
            <Select value={details.frequence_utilisation || ''} onValueChange={(value) = modal={false}> updateDetails('frequence_utilisation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {frequenceUtilisationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DetailsInput
            value={placeDetails}
            onChange={handlePlaceDetailsChange}
            label="✏️ Y a-t-il des éléments ou détails marquants dans le logement ? *"
            placeholder="Ex: Grande cheminée en pierre..."
            onNoDetailsChange={handleNoPlaceDetailsChange}
            noDetailsValue={noPlaceDetails}
            noDetailsLabel="Aucun élément particulier"
          />
        </div>
      </div>
    </div>
  );
};
