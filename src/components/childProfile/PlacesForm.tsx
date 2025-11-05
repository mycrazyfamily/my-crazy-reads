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
              Comment l'enfant appelle-t-il ce lieu ? (optionnel)
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
              disabled={!currentPlace.label.trim()}
            >
              {editingIndex !== null ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
