import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import type { PetData } from '@/types/childProfile';

interface PetProfileCardProps {
  pet: PetData;
  childrenNames: string[];
  primaryChildId: string;
}

const PetProfileCard: React.FC<PetProfileCardProps> = ({ pet, childrenNames, primaryChildId }) => {
  const getPetTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      dog: '🐶',
      cat: '🐱',
      bird: '🐦',
      fish: '🐠',
      hamster: '🐹',
      rabbit: '🐰',
      turtle: '🐢',
      snake: '🐍',
      other: '🐾'
    };
    return emojiMap[type] || '🐾';
  };

  const getPetTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      dog: 'Chien',
      cat: 'Chat',
      bird: 'Oiseau',
      fish: 'Poisson',
      hamster: 'Hamster',
      rabbit: 'Lapin',
      reptile: 'Reptile'
    };
    // Si le type n'est pas dans la map, retourner le type tel quel (ex: "Tigre")
    return labelMap[type.toLowerCase()] || type;
  };

  const getTraitLabel = (trait: string) => {
    const traitMap: Record<string, string> = {
      playful: 'Joueur',
      lazy: 'Paresseux',
      protective: 'Protecteur',
      clingy: 'Collant',
      clever: 'Malin',
      grumpy: 'Grognon',
      gentle: 'Doux',
      noisy: 'Bruyant',
      talkative: 'Bavard'
    };
    return traitMap[trait] || trait;
  };

  return (
    <Card className="overflow-hidden border-mcf-mint hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            {getPetTypeEmoji(pet.type)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-mcf-orange-dark">{pet.name}</h3>
            <p className="text-sm text-gray-600">
              {pet.type === 'other' && pet.otherType ? pet.otherType : getPetTypeLabel(pet.type)}
              {pet.breed && <span> • {pet.breed}</span>}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Animal de {childrenNames.join(' et ')}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {pet.physicalDetails && (
          <div className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Apparence : </span>
            <span>{pet.physicalDetails}</span>
          </div>
        )}
        
        {pet.traits && pet.traits.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {pet.traits.slice(0, 3).map((trait, idx) => (
              <span 
                key={idx}
                className="text-xs text-gray-700 px-2 py-1"
              >
                {getTraitLabel(trait)}
              </span>
            ))}
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 border-mcf-primary text-mcf-primary hover:bg-mcf-primary/10"
          asChild
        >
          <Link to={`/modifier-animal/${primaryChildId}/${pet.id}`}>
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PetProfileCard;
