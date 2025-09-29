
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
    <div className="flex flex-col sm:flex-row gap-3 items-start">
      <Avatar className="h-14 w-14 bg-mcf-amber/20 text-mcf-orange-dark text-xl font-bold flex-shrink-0">
        <AvatarFallback>{getInitial()}</AvatarFallback>
      </Avatar>
      
      <div className="space-y-2 flex-1 min-w-0">
        <h4 className="text-lg font-bold text-mcf-primary-dark">{data.firstName}</h4>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex gap-1">
            <span className="font-medium text-gray-500">Surnom:</span>
            <span className="text-gray-700">{getNickname()}</span>
          </div>
          
          <div className="flex gap-1">
            <span className="font-medium text-gray-500">Genre:</span>
            <span className="text-gray-700">{getGenderLabel()}</span>
          </div>
          
          <div className="flex gap-1 col-span-2">
            <span className="font-medium text-gray-500">Né(e) le:</span>
            <span className="text-gray-700">{formatBirthDate()}</span>
          </div>
          
          <div className="flex gap-1">
            <span className="font-medium text-gray-500">Âge:</span>
            <span className="text-gray-700">{data.age || 'Non spécifié'}</span>
          </div>

          <div className="flex gap-1 col-span-2">
            <span className="font-medium text-gray-500">Apparence:</span>
            <span className="text-gray-700">
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
            </span>
          </div>
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
