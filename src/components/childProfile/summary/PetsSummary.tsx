import React from 'react';
import { Heart, LogOut } from 'lucide-react';
import type { ChildProfileFormData, PetData, PetType, PetTrait } from '@/types/childProfile';

type PetsSummaryProps = {
  data: ChildProfileFormData;
};

// Première lettre en majuscule (saisie utilisateur), sans toucher au reste.
const capitalizeFirst = (s?: string | null): string => {
  const str = (s ?? '').trim();
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
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
  // Statut d'inactivité (lecture seule ; les actions de statut restent sur ModifierAnimal)
  const petAny = pet as any;
  const petInactive = petAny.is_deceased === true || petAny.is_active === false;
  const petStatus = petAny.is_deceased === true
    ? { label: 'En mémoire', Icon: Heart }
    : petAny.is_active === false
      ? { label: "N'est plus avec nous", Icon: LogOut }
      : null;
  const PetStatusIcon = petStatus?.Icon;

  // Obtenir le libellé du type d'animal
  const getPetTypeLabel = (type: PetType) => {
    const labels: Record<PetType, string> = {
      dog: 'Chien',
      cat: 'Chat',
      rabbit: 'Lapin',
      bird: 'Oiseau',
      fish: 'Poisson',
      reptile: 'Reptile',
      other: capitalizeFirst(pet.otherType) || 'Autre'
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
      other: {
        label: typeof pet.customTraits?.other === 'string' ? pet.customTraits.other : 'Autre',
        icon: '✨'
      },
      other2: {
        label: typeof pet.customTraits?.other2 === 'string' ? pet.customTraits.other2 : 'Autre',
        icon: '✨'
      }
    };
    return traitData[trait] || { label: trait, icon: '❓' };
  };

  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 ${petInactive ? 'opacity-60' : ''}`}>
      <div className="text-center w-full">
        <div className="font-medium">{capitalizeFirst(pet.name)}</div>
        <div className="text-xs text-gray-600">
          {getPetTypeLabel(pet.type)}
          {pet.breed && <span> • {capitalizeFirst(pet.breed)}</span>}
        </div>

        {petStatus && PetStatusIcon && (
          <div className="mt-1 flex justify-center">
            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
              <PetStatusIcon className="h-3 w-3" />
              {petStatus.label}
            </span>
          </div>
        )}

        {pet.physicalDetails && (
          <div className="text-xs text-gray-500 mt-1 italic">
            {pet.physicalDetails}
          </div>
        )}

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
