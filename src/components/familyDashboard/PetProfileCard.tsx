import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import type { PetData } from '@/types/childProfile';

interface PetProfileCardProps {
  pet: PetData;
  childId: string;
  childName: string;
}

const PetProfileCard: React.FC<PetProfileCardProps> = ({ pet, childId, childName }) => {
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
      turtle: 'Tortue',
      snake: 'Serpent',
      other: 'Autre'
    };
    return labelMap[type] || type;
  };

  return (
    <Card className="overflow-hidden border-mcf-mint hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-br from-mcf-amber/10 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            {getPetTypeEmoji(pet.type)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-mcf-orange-dark">{pet.name}</h3>
            <p className="text-sm text-gray-600">{getPetTypeLabel(pet.type)}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Animal de compagnie de <span className="font-semibold text-mcf-orange-dark">{childName}</span>
          </p>
          
          {pet.traits && pet.traits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {pet.traits.slice(0, 3).map((trait, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-mcf-mint/20 text-mcf-primary px-2 py-1 rounded-full"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 border-mcf-mint hover:bg-mcf-mint/10"
          asChild
        >
          <Link to={`/modifier-animal/${childId}/${pet.id}`}>
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PetProfileCard;
