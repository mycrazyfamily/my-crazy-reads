import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlaceData } from '@/types/place';
import { PlaceForm } from './places/PlaceForm';
import { PlacesList } from './places/PlacesList';
import { useChildProfileForm } from '@/contexts/ChildProfileFormContext';
import { toast } from 'sonner';

interface PlacesFormProps {
  onNext: () => void;
  onPrev: () => void;
}

export const PlacesForm: React.FC<PlacesFormProps> = ({ onNext, onPrev }) => {
  const { form } = useChildProfileForm();
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentPlace, setCurrentPlace] = useState<PlaceData>({
    label: '',
    type: 'maison_principale',
    details: {},
  });
  const [childLabel, setChildLabel] = useState('');

  const places = (form.watch('places') as PlaceData[] | undefined) || [];

  const handleAddPlace = () => {
    setCurrentPlace({
      label: '',
      type: 'maison_principale',
      details: {},
    });
    setChildLabel('');
    setEditingIndex(null);
    setIsAddingPlace(true);
  };

  const handleEditPlace = (index: number) => {
    const place = places[index];
    setCurrentPlace(place);
    setChildLabel(place.childLabel || '');
    setEditingIndex(index);
    setIsAddingPlace(true);
  };

  const handleDeletePlace = (index: number) => {
    const newPlaces = places.filter((_, i) => i !== index);
    form.setValue('places', newPlaces as any);
  };

  const handleSavePlace = () => {
    if (!currentPlace.label.trim()) {
      toast.error("Veuillez saisir un nom pour le lieu");
      return;
    }

    if (!currentPlace.city || !currentPlace.city.trim()) {
      toast.error("Veuillez saisir une ville");
      return;
    }

    if (!currentPlace.country || !currentPlace.country.trim()) {
      toast.error("Veuillez saisir un pays");
      return;
    }

    const details = currentPlace.details || {};
    
    if (currentPlace.type === 'vacances') {
      // Validation pour lieu de vacances
      if (!details.type_vacances) {
        toast.error("Veuillez sélectionner le type de lieu de vacances");
        return;
      }
      if (!details.frequence_annuelle || !details.frequence_annuelle.trim()) {
        toast.error("Veuillez indiquer la fréquence annuelle");
        return;
      }
      if (details.hebergement_attitre === undefined) {
        toast.error("Veuillez indiquer si vous avez un hébergement attitré");
        return;
      }
      if (details.famille_complete === undefined) {
        toast.error("Veuillez indiquer si la famille part toujours au complet");
        return;
      }
      if (details.espace_partage === undefined) {
        toast.error("Veuillez indiquer si l'espace est partagé");
        return;
      }
      if (!details.activites || !details.activites.trim()) {
        toast.error("Veuillez décrire les activités");
        return;
      }
      if (!details.repas_ou) {
        toast.error("Veuillez indiquer où vous prenez les repas");
        return;
      }
      if (details.propre_lit === undefined) {
        toast.error("Veuillez indiquer si l'enfant a son propre lit");
        return;
      }
      if (details.objets_familiers === undefined) {
        toast.error("Veuillez indiquer s'il y a des objets familiers");
        return;
      }
      if (details.objets_familiers && (!details.objets_familiers_description || !details.objets_familiers_description.trim())) {
        toast.error("Veuillez décrire les objets familiers");
        return;
      }
      if (!details.souvenir_marquant || !details.souvenir_marquant.trim()) {
        toast.error("Veuillez partager un souvenir marquant");
        return;
      }
    } else {
      // Validation pour lieu de vie régulier
      if (!details.habitat_type) {
        toast.error("Veuillez sélectionner le type de logement");
        return;
      }
      if (details.habitat_type === 'Autre' && (!details.habitat_type_autre || !details.habitat_type_autre.trim())) {
        toast.error("Veuillez préciser le type de logement");
        return;
      }
      if (!details.luminosite) {
        toast.error("Veuillez indiquer si le lieu est lumineux ou sombre");
        return;
      }
      if (details.enfants_dans_meme_chambre === undefined) {
        toast.error("Veuillez indiquer si l'enfant partage sa chambre");
        return;
      }
      if (details.enfants_dans_meme_chambre && (!details.enfants_chambre_avec_qui || !details.enfants_chambre_avec_qui.trim())) {
        toast.error("Veuillez indiquer avec qui l'enfant partage sa chambre");
        return;
      }
      if (!details.nombre_pieces || !details.nombre_pieces.trim()) {
        toast.error("Veuillez indiquer le nombre de pièces");
        return;
      }
      if (!details.salon_details || !details.salon_details.trim()) {
        toast.error("Veuillez décrire le salon");
        return;
      }
      if (details.television === undefined) {
        toast.error("Veuillez indiquer s'il y a une télévision");
        return;
      }
      if (details.television && (!details.television_ou || !details.television_ou.trim())) {
        toast.error("Veuillez indiquer où se trouve la télévision");
        return;
      }
      if (details.piece_jeu === undefined) {
        toast.error("Veuillez indiquer s'il y a une pièce de jeu");
        return;
      }
      if (details.bruit_sol === undefined) {
        toast.error("Veuillez indiquer si le sol fait du bruit");
        return;
      }
      if (details.jardin === undefined) {
        toast.error("Veuillez indiquer s'il y a un jardin ou une cour");
        return;
      }
      if (details.jardin) {
        if (details.jardin_piscine === undefined) {
          toast.error("Veuillez indiquer s'il y a une piscine dans le jardin");
          return;
        }
        if (details.jardin_ping_pong === undefined) {
          toast.error("Veuillez indiquer s'il y a une table de ping-pong dans le jardin");
          return;
        }
        if (details.jardin_cabane === undefined) {
          toast.error("Veuillez indiquer s'il y a une cabane dans le jardin");
          return;
        }
      }
      if (!details.environnement || !details.environnement.trim()) {
        toast.error("Veuillez décrire l'environnement autour du logement");
        return;
      }
      if (!details.frequence_utilisation) {
        toast.error("Veuillez indiquer la fréquence d'utilisation du lieu");
        return;
      }
    }

    const placeToSave = { ...currentPlace, childLabel };
    let newPlaces: PlaceData[];

    if (editingIndex !== null) {
      newPlaces = [...places];
      newPlaces[editingIndex] = placeToSave;
    } else {
      newPlaces = [...places, placeToSave];
    }

    form.setValue('places', newPlaces as any);
    setIsAddingPlace(false);
    setCurrentPlace({
      label: '',
      type: 'maison_principale',
      details: {},
    });
    setChildLabel('');
    setEditingIndex(null);
  };

  const handleCancelPlace = () => {
    setIsAddingPlace(false);
    setCurrentPlace({
      label: '',
      type: 'maison_principale',
      details: {},
    });
    setChildLabel('');
    setEditingIndex(null);
  };

  const handleContinue = () => {
    if (places.length === 0) {
      toast.error("Veuillez ajouter au moins un lieu de vie pour votre enfant");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {!isAddingPlace ? (
        <>
          <div>
            <h2 className="text-2xl font-bold mb-2">🏡 Lieux de vie</h2>
            <p className="text-muted-foreground">
              Ajoutez les différents lieux de vie de votre enfant (maison principale, maison secondaire, maison de l'autre parent si séparés, lieux de vacances, etc.)
            </p>
          </div>

          <PlacesList
            places={places}
            onEdit={handleEditPlace}
            onDelete={handleDeletePlace}
          />

          <Button onClick={handleAddPlace} variant="outline" className="w-full">
            + Ajouter un lieu
          </Button>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onPrev} className="flex-1">
              Précédent
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              Suivant
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {editingIndex !== null ? 'Modifier le lieu' : 'Ajouter un lieu'}
            </h2>
          </div>

          <PlaceForm
            place={currentPlace}
            onChange={setCurrentPlace}
          />

          <div>
            <Label htmlFor="child-label">
              Ce lieu a-t-il un nom particulier ou un surnom utilisé par la famille pour en parler ? (optionnel)
            </Label>
            <Input
              id="child-label"
              value={childLabel}
              onChange={(e) => setChildLabel(e.target.value)}
              placeholder="Ex: Chez Papa, Maison de Mamie, Le camping..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ce nom sera utilisé dans les histoires pour que l'enfant reconnaisse le lieu
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleCancelPlace}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSavePlace}
              className="flex-1"
            >
              {editingIndex !== null ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
