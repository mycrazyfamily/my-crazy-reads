
import React from 'react';
import { PetData } from '@/types/childProfile';
import { Button } from "@/components/ui/button";
import { PET_TRAIT_OPTIONS, PET_TYPE_OPTIONS } from '@/constants/petOptions';
import { Dog, Cat, Rabbit, Bird, Fish, Pencil, Trash2 } from 'lucide-react';

type PetCardProps = {
  pet: PetData;
  onEdit: (pet: PetData) => void;
  onDelete: (id: string) => void;
};

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const getDisplayType = () => {
    if (pet.type === 'other' && pet.otherType) {
      return pet.otherType;
    }
    return PET_TYPE_OPTIONS.find(option => option.value === pet.type)?.label || pet.type;
  };

  const getPetIcon = () => {
    switch (pet.type) {
      case 'dog':
        return <Dog className="h-10 w-10 text-mcf-orange" />;
      case 'cat':
        return <Cat className="h-10 w-10 text-mcf-orange" />;
      case 'rabbit':
        return <Rabbit className="h-10 w-10 text-mcf-orange" />;
      case 'bird':
        return <Bird className="h-10 w-10 text-mcf-orange" />;
      case 'fish':
        return <Fish className="h-10 w-10 text-mcf-orange" />;
      default:
        return <span className="text-4xl">{PET_TYPE_OPTIONS.find(option => option.value === pet.type)?.icon}</span>;
    }
  };

  const getTraitLabel = (traitValue: string) => {
    const trait = PET_TRAIT_OPTIONS.find(t => t.value === traitValue);
    return trait ? `${trait.icon} ${trait.label}` : traitValue;
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 bg-mcf-amber/10 p-3 rounded-full">
          {getPetIcon()}
        </div>
        
        <div className="flex-grow">
          <h3 className="font-bold text-lg">{pet.name}</h3>
          <p className="text-gray-600">{getDisplayType()}</p>
          
          {pet.traits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {pet.traits.map(trait => (
                <span 
                  key={trait} 
                  className="inline-flex items-center gap-1 text-xs bg-mcf-amber/10 text-gray-700 px-2 py-1 rounded-full"
                >
                  {getTraitLabel(trait)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs"
          onClick={() => onEdit(pet)}
        >
          <Pencil className="h-3 w-3 mr-1" /> Modifier
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs text-red-500 hover:text-red-700"
          onClick={() => onDelete(pet.id)}
        >
          <Trash2 className="h-3 w-3 mr-1" /> Supprimer
        </Button>
      </div>
    </div>
  );
};

export default PetCard;
