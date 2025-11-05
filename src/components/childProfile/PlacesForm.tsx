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
    const errors: string[] = [];

    if (!currentPlace.label.trim()) errors.push("Nom du lieu");
    if (!currentPlace.city || !currentPlace.city.trim()) errors.push("Ville");
    if (!currentPlace.country || !currentPlace.country.trim()) errors.push("Pays");

    const details = currentPlace.details || {};

    if (currentPlace.type === 'vacances') {
      if (!details.type_vacances) errors.push("Type de lieu de vacances");
      if (!details.frequence_annuelle || !details.frequence_annuelle.trim()) errors.push("Fréquence annuelle");
      if (details.hebergement_attitre === undefined) errors.push("Hébergement attitré (oui/non)");
      if (details.famille_complete === undefined) errors.push("Famille au complet (oui/non)");
      if (details.espace_partage === undefined) errors.push("Espace partagé (oui/non)");
      if (!details.activites || !details.activites.trim()) errors.push("Activités habituelles");
      if (!details.repas_ou) errors.push("Lieu des repas");
      if (details.propre_lit === undefined) errors.push("Propre lit (oui/non)");
      if (details.objets_familiers === undefined) errors.push("Objets familiers (oui/non)");
      if (details.objets_familiers && (!details.objets_familiers_description || !details.objets_familiers_description.trim())) errors.push("Description des objets familiers");
      if (!details.souvenir_marquant || !details.souvenir_marquant.trim()) errors.push("Souvenir marquant");
    } else {
      if (!details.habitat_type) errors.push("Type de logement");
      if (details.habitat_type === 'Autre' && (!details.habitat_type_autre || !details.habitat_type_autre.trim())) errors.push("Précision du type de logement");
      if (!details.luminosite) errors.push("Lumineux ou sombre");
      if (details.enfants_dans_meme_chambre === undefined) errors.push("Partage de la chambre (oui/non)");
      if (details.enfants_dans_meme_chambre && (!details.enfants_chambre_avec_qui || !details.enfants_chambre_avec_qui.trim())) errors.push("Avec qui l'enfant partage sa chambre");
      if (!details.nombre_pieces || !details.nombre_pieces.trim()) errors.push("Nombre de pièces");
      if (!details.salon_details || !details.salon_details.trim()) errors.push("Description du salon");
      if (details.television === undefined) errors.push("Présence d'une télévision (oui/non)");
      if (details.television && (!details.television_ou || !details.television_ou.trim())) errors.push("Où se trouve la télévision");
      if (details.piece_jeu === undefined) errors.push("Présence d'une pièce de jeu (oui/non)");
      if (details.bruit_sol === undefined) errors.push("Le sol fait-il du bruit ? (oui/non)");
      if (details.jardin === undefined) errors.push("Présence d'un jardin ou d'une cour (oui/non)");
      if (details.jardin) {
        if (details.jardin_piscine === undefined) errors.push("Piscine dans le jardin (oui/non)");
        if (details.jardin_ping_pong === undefined) errors.push("Table de ping-pong dans le jardin (oui/non)");
        if (details.jardin_cabane === undefined) errors.push("Cabane/annexe dans le jardin (oui/non)");
        // Vérifier les détails du jardin
        const hasJardinDetails = [details.jardin_autres_1, details.jardin_autres_2, details.jardin_autres_3].some(d => d && d.trim() !== '');
        if (!hasJardinDetails && !details.noJardinDetails) {
          errors.push("Autres éléments du jardin (ou cochez 'Aucun élément particulier')");
        }
      }
      if (!details.environnement || !details.environnement.trim()) errors.push("Environnement autour du logement");
      if (!details.frequence_utilisation) errors.push("Fréquence d'utilisation du lieu");
      // Vérifier les détails marquants du logement
      const hasAutreDetails = [details.autre_detail_1, details.autre_detail_2, details.autre_detail_3].some(d => d && d.trim() !== '');
      if (!hasAutreDetails && !details.noAutreDetails) {
        errors.push("Éléments marquants du logement (ou cochez 'Aucun élément particulier')");
      }
    }

    if (errors.length > 0) {
      toast.error('Veuillez compléter les champs obligatoires', {
        description: `Champs manquants:\n• ${errors.join('\n• ')}`,
      });
      return;
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

          <Button onClick={handleAddPlace} variant="outline" className="w-full" type="button">
            + Ajouter un lieu
          </Button>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onPrev} className="flex-1" type="button">
              Précédent
            </Button>
            <Button onClick={handleContinue} className="flex-1" type="button">
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
              type="button"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSavePlace}
              className="flex-1"
              type="button"
            >
              {editingIndex !== null ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
