
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dog, Cat, Rabbit, Bird, Fish, HelpCircle } from 'lucide-react';
import type { ChildProfileFormData, PetData, PetType, PetTrait } from '@/types/childProfile';

type PetsSummaryProps = {
  data: ChildProfileFormData;
};

const PetsSummary: React.FC<PetsSummaryProps> = ({ data }) => {
  const { pets } = data.pets;

  if (!data.pets.hasPets || !pets || pets.length === 0) {
    return <p className="text-gray-500">Aucun animal de compagnie n'a été ajouté.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pets.map((pet) => (
          <PetSummaryItem key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
};

type PetSummaryItemProps = {
  pet: PetData;
};

const PetSummaryItem: React.FC<PetSummaryItemProps> = ({ pet }) => {
  // Obtenir l'initiale du nom
  const getInitial = () => {
    return pet.name ? pet.name.charAt(0).toUpperCase() : '?';
  };

  // Obtenir le libellé du type d'animal
  const getPetTypeLabel = (type: PetType) => {
    const labels: Record<PetType, string> = {
      dog: 'Chien',
      cat: 'Chat',
      rabbit: 'Lapin',
      bird: 'Oiseau',
      fish: 'Poisson',
      reptile: 'Reptile',
      other: pet.otherType || 'Autre'
    };
    return labels[type] || type;
  };

  // Obtenir une traduction du trait avec son emoji
  const getPetTraitLabelWithIcon = (trait: PetTrait): { label: string; icon: string } => {
    const traitData: Record<PetTrait, { label: string; icon: string }> = {
      playful: { label: 'Joueur', icon: '🎾' },
      lazy: { label: 'Paresseux', icon: '😴' },
      protective: { label: 'Protecteur', icon: '🛡️' },
      clingy: { label: 'Câlin', icon: '🤗' },
      clever: { label: 'Intelligent', icon: '🧠' },
      grumpy: { label: 'Grognon', icon: '😾' },
      gentle: { label: 'Doux', icon: '💕' },
      noisy: { label: 'Bruyant', icon: '📢' },
      talkative: { label: 'Bavard', icon: '💬' },
      other: { label: pet.customTraits?.other || 'Autre', icon: '✨' },
      other2: { label: pet.customTraits?.other2 || 'Autre', icon: '✨' }
    };
    return traitData[trait] || { label: trait, icon: '❓' };
  };

  // Obtenir l'icône en fonction du type d'animal
  const getPetIcon = () => {
    switch (pet.type) {
      case 'dog':
        return <Dog className="h-5 w-5" />;
      case 'cat':
        return <Cat className="h-5 w-5" />;
      case 'rabbit':
        return <Rabbit className="h-5 w-5" />;
      case 'bird':
        return <Bird className="h-5 w-5" />;
      case 'fish':
        return <Fish className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
      <Avatar className="h-12 w-12 bg-mcf-amber/20 text-mcf-orange">
        <AvatarFallback className="flex items-center justify-center">
          {getPetIcon()}
        </AvatarFallback>
      </Avatar>
      <div className="text-center w-full">
        <div className="font-medium">{pet.name}</div>
        <div className="text-xs text-gray-600">{getPetTypeLabel(pet.type)}</div>
        
        {pet.traits && pet.traits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
            {pet.traits.map((trait, index) => {
              const { label, icon } = getPetTraitLabelWithIcon(trait);
              return (
                <span 
                  key={index} 
                  className="inline-flex items-center gap-1 text-xs bg-mcf-amber/10 text-mcf-orange-dark px-2 py-0.5 rounded-full font-medium"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetsSummary;
