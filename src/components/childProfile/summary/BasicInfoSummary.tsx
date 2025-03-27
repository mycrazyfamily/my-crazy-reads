
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ChildProfileFormData } from '@/types/childProfile';

type BasicInfoSummaryProps = {
  data: ChildProfileFormData;
};

const BasicInfoSummary: React.FC<BasicInfoSummaryProps> = ({ data }) => {
  // Fonction pour obtenir l'initiale du prénom
  const getInitial = () => {
    return data.firstName ? data.firstName.charAt(0).toUpperCase() : '?';
  };

  // Fonction pour formater la date de naissance
  const formatBirthDate = () => {
    if (!data.birthDate) return 'Non spécifiée';
    return format(new Date(data.birthDate), 'dd MMMM yyyy', { locale: fr });
  };

  // Fonction pour obtenir le libellé du genre
  const getGenderLabel = () => {
    switch (data.gender) {
      case 'girl': return 'Fille';
      case 'boy': return 'Garçon';
      case 'neutral': return 'Non spécifié';
      default: return 'Non spécifié';
    }
  };

  // Fonction pour obtenir le surnom formaté
  const getNickname = () => {
    if (data.nickname.type === 'none') return 'Aucun';
    if (data.nickname.type === 'custom' && data.nickname.custom) return data.nickname.custom;
    return data.nickname.type;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
      <Avatar className="h-20 w-20 bg-mcf-amber/20 text-mcf-orange-dark text-2xl font-bold">
        <AvatarFallback>{getInitial()}</AvatarFallback>
      </Avatar>
      
      <div className="space-y-2 text-center sm:text-left">
        <h4 className="text-xl font-bold">{data.firstName}</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-600">Surnom:</span>{' '}
            <span>{getNickname()}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Genre:</span>{' '}
            <span>{getGenderLabel()}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Date de naissance:</span>{' '}
            <span>{formatBirthDate()}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Tranche d'âge:</span>{' '}
            <span>{data.age || 'Non spécifiée'}</span>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm"><span className="font-medium text-gray-600">Apparence:</span>{' '}
            {data.hairType && <>Cheveux {getHairTypeLabel(data.hairType)} </>}
            {data.hairColor && <>
              {data.hairColor.type === 'custom' && data.hairColor.custom 
                ? data.hairColor.custom 
                : getHairColorLabel(data.hairColor.type)}
            </>}
            {data.skinColor && <>, peau {
              data.skinColor.type === 'custom' && data.skinColor.custom 
                ? data.skinColor.custom 
                : getSkinColorLabel(data.skinColor.type)}
            </>}
            {data.glasses && <>, porte des lunettes</>}
          </p>
        </div>
      </div>
    </div>
  );
};

// Fonctions d'aide pour les traductions
const getHairTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'straight': 'lisses',
    'wavy': 'ondulés',
    'curly': 'bouclés',
    'coily': 'crépus'
  };
  return labels[type] || type;
};

const getHairColorLabel = (type: string) => {
  const labels: Record<string, string> = {
    'blonde': 'blonds',
    'chestnut': 'châtains',
    'brown': 'bruns',
    'red': 'roux',
    'black': 'noirs'
  };
  return labels[type] || type;
};

const getSkinColorLabel = (type: string) => {
  const labels: Record<string, string> = {
    'light': 'claire',
    'medium': 'moyenne',
    'dark': 'foncée'
  };
  return labels[type] || type;
};

export default BasicInfoSummary;
