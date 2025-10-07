import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type ExistingPet = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  family_id: string;
};

type ExistingPetsListProps = {
  existingPets: ExistingPet[];
  selectedPetIds: string[];
  onTogglePet: (petId: string) => void;
};

const ExistingPetsList: React.FC<ExistingPetsListProps> = ({
  existingPets,
  selectedPetIds,
  onTogglePet
}) => {

  if (existingPets.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-mcf-primary">Animaux déjà créés</h3>
        <p className="text-sm text-gray-600">
          Sélectionnez les animaux déjà existants pour les associer à cet enfant
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {existingPets.map((pet) => {
          const isSelected = selectedPetIds.includes(pet.id);
          
          return (
            <Card
              key={pet.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-mcf-orange bg-mcf-amber/10'
                  : 'border-gray-200 hover:border-mcf-orange/50'
              }`}
              onClick={() => onTogglePet(pet.id)}
            >
              <div className="p-4 flex items-center gap-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onTogglePet(pet.id)}
                    className="h-6 w-6 rounded-md border-2 border-mcf-primary bg-white transition-all duration-200 data-[state=checked]:bg-mcf-primary data-[state=checked]:border-mcf-primary data-[state=checked]:text-white hover:border-mcf-primary-dark"
                    aria-label={`Sélectionner ${pet.name}`}
                  />
                </div>
                <div className="text-3xl">{pet.emoji || '🐾'}</div>
                <div className="flex-1">
                  <p className="font-semibold text-mcf-orange-dark">
                    {pet.name}
                  </p>
                  {pet.type && (
                    <p className="text-sm text-gray-600 capitalize">{pet.type}</p>
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

export default ExistingPetsList;
