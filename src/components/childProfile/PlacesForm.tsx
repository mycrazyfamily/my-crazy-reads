import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlaceData } from '@/types/place';
import { PlaceForm } from './places/PlaceForm';
import { PlacesList } from './places/PlacesList';
import { useChildProfileForm } from '@/contexts/ChildProfileFormContext';

interface PlacesFormProps {
  onNext: () => void;
  onPrev: () => void;
}

export const PlacesForm: React.FC<PlacesFormProps> = ({ onNext, onPrev }) => {
  const { form } = useChildProfileForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    setIsDialogOpen(true);
  };

  const handleEditPlace = (index: number) => {
    const place = places[index];
    setCurrentPlace(place);
    setChildLabel(place.childLabel || '');
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeletePlace = (index: number) => {
    const newPlaces = places.filter((_, i) => i !== index);
    form.setValue('places', newPlaces as any);
  };

  const handleSavePlace = () => {
    if (!currentPlace.label.trim()) {
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
    setIsDialogOpen(false);
    setCurrentPlace({
      label: '',
      type: 'maison_principale',
      details: {},
    });
    setChildLabel('');
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🏡 Lieux de vie</h2>
        <p className="text-muted-foreground">
          Ajoutez les différents lieux de vie de votre enfant (maison principale, maison secondaire, maison de l'autre parent si séparé, lieux de vacances, etc.)
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
        <Button onClick={onNext} className="flex-1">
          Suivant
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Modifier le lieu' : 'Ajouter un lieu'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
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
                onClick={() => setIsDialogOpen(false)}
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
        </DialogContent>
      </Dialog>
    </div>
  );
};
