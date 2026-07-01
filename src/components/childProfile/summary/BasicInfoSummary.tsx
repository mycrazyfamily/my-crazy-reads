import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ChildProfileFormData } from '@/types/childProfile';

type BasicInfoSummaryProps = {
  data: ChildProfileFormData;
};

// Première lettre en majuscule (saisie utilisateur), sans toucher au reste.
const capitalizeFirst = (s?: string | null): string => {
  const str = (s ?? '').trim();
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
};

const BasicInfoSummary: React.FC<BasicInfoSummaryProps> = ({ data }) => {
  // Fonction pour formater la date de naissance
  const formatBirthDate = () => {
    if (!data.birthDate) return 'Non spécifiée';
    const d = new Date(data.birthDate);
    if (isNaN(d.getTime())) return 'Non spécifiée';
    return format(d, 'dd MMMM yyyy', { locale: fr });
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
    const nk: any = (data as any).nickname;
    if (!nk) return 'Aucun';
    if (typeof nk === 'object') {
      if (nk.type === 'none') return 'Aucun';
      return nk.custom || nk.type || 'Aucun';
    }
    if (typeof nk === 'string') return nk || 'Aucun';
    return 'Aucun';
  };

  // Âge réel calculé depuis la date de naissance (ex. « 3 ans et 4 mois »).
  // < 1 an → mois uniquement ; « et 0 mois » masqué ; singulier/pluriel gérés.
  const formatAge = () => {
    if (!data.birthDate) return 'Non spécifié';
    const birth = new Date(data.birthDate);
    if (isNaN(birth.getTime())) return 'Non spécifié';
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months -= 1;
    if (months < 0) months = 0;
    if (months < 1) return 'Nouveau-né';
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) return `${rem} mois`;
    const yearsPart = `${years} ${years > 1 ? 'ans' : 'an'}`;
    return rem > 0 ? `${yearsPart} et ${rem} mois` : yearsPart;
  };

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-bold text-mcf-primary-dark">{capitalizeFirst(data.firstName)}</h4>

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

        <div className="flex gap-1 col-span-2">
          <span className="font-medium text-gray-500">Âge:</span>
          <span className="text-gray-700">{formatAge()}</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSummary;
