
import React from 'react';
import { PetData } from '@/types/childProfile';
import PetCard from './PetCard';

type PetsListProps = {
  pets: PetData[];
  onEditPet: (pet: PetData) => void;
  onDeletePet: (id: string) => void;
};

const PetsList: React.FC<PetsListProps> = ({ pets, onEditPet, onDeletePet }) => {
  if (pets.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
        <p>Vous n'avez pas encore ajouté d'animal de compagnie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pets.map(pet => (
        <PetCard 
          key={pet.id} 
          pet={pet} 
          onEdit={onEditPet} 
          onDelete={onDeletePet}
        />
      ))}
    </div>
  );
};

export default PetsList;
