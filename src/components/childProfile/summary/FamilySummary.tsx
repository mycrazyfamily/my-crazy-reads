
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChildProfileFormData, RelativeData, RelativeType } from '@/types/childProfile';

type FamilySummaryProps = {
  data: ChildProfileFormData;
};

const FamilySummary: React.FC<FamilySummaryProps> = ({ data }) => {
  const { relatives } = data.family;

  if (!relatives || relatives.length === 0) {
    return <p className="text-gray-500">Aucun membre de famille n'a été ajouté.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {relatives.map((relative) => (
          <RelativeSummaryItem key={relative.id} relative={relative} />
        ))}
      </div>
    </div>
  );
};

type RelativeSummaryItemProps = {
  relative: RelativeData;
};

const RelativeSummaryItem: React.FC<RelativeSummaryItemProps> = ({ relative }) => {
  // Obtenir l'initiale du prénom
  const getInitial = () => {
    return relative.firstName ? relative.firstName.charAt(0).toUpperCase() : '?';
  };

  // Obtenir le libellé du type de relation
  const getRelationshipLabel = (type: RelativeType) => {
    const labels: Record<RelativeType, string> = {
      mother: 'Maman',
      father: 'Papa',
      otherParent: 'Parent',
      sister: 'Sœur',
      brother: 'Frère',
      grandmother: 'Grand-mère',
      grandfather: 'Grand-père',
      femaleCousin: 'Cousine',
      maleCousin: 'Cousin',
      femaleFriend: 'Amie',
      maleFriend: 'Ami',
      other: relative.otherTypeName || 'Autre'
    };
    return labels[type] || type;
  };

  // Obtenir le surnom formaté
  const getNickname = () => {
    if (relative.nickname.type === 'none') return '';
    if (relative.nickname.type === 'custom' && relative.nickname.custom) return relative.nickname.custom;
    return relative.nickname.type;
  };

  const avatarBgColor = getAvatarColor(relative.type);

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50">
      <Avatar className={`h-10 w-10 ${avatarBgColor} text-white`}>
        <AvatarFallback>{getInitial()}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{relative.firstName}</div>
        <div className="text-xs text-gray-500 flex flex-wrap gap-1">
          <span>{getRelationshipLabel(relative.type)}</span>
          {getNickname() && <span>({getNickname()})</span>}
        </div>
      </div>
    </div>
  );
};

// Fonction pour déterminer la couleur de l'avatar en fonction du type de relation
const getAvatarColor = (type: RelativeType): string => {
  const colors: Record<string, string> = {
    mother: 'bg-pink-500',
    father: 'bg-blue-500',
    otherParent: 'bg-purple-500',
    sister: 'bg-pink-400',
    brother: 'bg-blue-400',
    grandmother: 'bg-pink-600',
    grandfather: 'bg-blue-600',
    femaleCousin: 'bg-pink-300',
    maleCousin: 'bg-blue-300',
    femaleFriend: 'bg-green-400',
    maleFriend: 'bg-green-500',
    other: 'bg-gray-500'
  };
  return colors[type] || 'bg-gray-500';
};

export default FamilySummary;
