import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, UserMinus } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {relatives.map((relative) => (
        <RelativeSummaryItem key={relative.id} relative={relative} />
      ))}
    </div>
  );
};

// Safe renderer to avoid crashing if a non-string sneaks in
const SafeText: React.FC<{ value: any; className?: string }> = ({ value, className }) => {
  if (typeof value === 'object' && value !== null) {
    console.error('❌ Invalid JSX value in SafeText:', value);
    return <span className={className}>[objet]</span>;
  }
  return <span className={className}>{value as any}</span>;
};

type RelativeSummaryItemProps = {
  relative: RelativeData;
};

const RelativeSummaryItem: React.FC<RelativeSummaryItemProps> = ({ relative }) => {
  try {
    console.group('🧩 DEBUG RelativeSummaryItem');
    console.log('Raw relative:', relative);
    for (const [key, value] of Object.entries(relative)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        console.warn(`⚠️ ${key} is an object`, value);
      } else {
        console.log(`✅ ${key}:`, value);
      }
    }
    console.groupEnd();
  } catch (error) {
    console.error('❌ Failed to log relative data:', error);
  }

  // Statut (lecture seule ; géré sur ModifierProche). Décès = entité ; brouille = lien enfant.
  const relAny = relative as any;
  const relInactive = relAny.is_deceased === true || relAny.link_is_active === false;
  const relStatus = relAny.is_deceased === true
    ? { label: 'En mémoire', Icon: Heart }
    : relAny.link_is_active === false
      ? { label: 'Plus en contact', Icon: UserMinus }
      : null;
  const RelStatusIcon = relStatus?.Icon;

  // Obtenir l'emoji du type de relation
  const getRelativeTypeIcon = (type: RelativeType) => {
    const icons: Partial<Record<RelativeType, string>> = {
      mother: '👩', father: '👨', otherParent: '🧑',
      sister: '👧', brother: '👦',
      grandmother: '👵', grandfather: '👴',
      uncle: '👨', aunt: '👩',
      cousin: '👦', bestFriend: '👬',
      partner: '💑', teacher: '👨‍🏫',
      babysitter: '👶', nanny: '👶',
      femaleCousin: '👧', maleCousin: '👦',
      femaleFriend: '👧', maleFriend: '👦',
      other: '👤'
    };
    return icons[type] || '👤';
  };

  // Obtenir le libellé du type de relation
  const getRelationshipLabel = (type: RelativeType) => {
    const labels: Partial<Record<RelativeType, string>> = {
      mother: 'Maman', father: 'Papa', otherParent: 'Parent',
      sister: 'Sœur', brother: 'Frère',
      grandmother: 'Grand-mère', grandfather: 'Grand-père',
      uncle: 'Oncle', aunt: 'Tante',
      cousin: 'Cousin(e)', bestFriend: 'Meilleur(e) ami(e)',
      partner: 'Petit copain / Petite copine',
      teacher: 'Maître / Maîtresse',
      babysitter: 'Baby-sitter', nanny: 'Nounou',
      femaleCousin: 'Cousine', maleCousin: 'Cousin',
      femaleFriend: 'Amie', maleFriend: 'Ami',
      other: relative.otherTypeName || 'Autre'
    };
    return labels[type] || type;
  };

  // Obtenir le surnom formaté
  const getNickname = () => {
    const nk: any = (relative as any).nickname;
    if (!nk) return '';
    if (typeof nk === 'object') {
      if (nk.type === 'none') return '';
      // Traduire le type s'il n'y a pas de custom
      if (!nk.custom && nk.type) {
        return getRelationshipLabel(nk.type as RelativeType);
      }
      return nk.custom || '';
    }
    if (typeof nk === 'string') return nk;
    return '';
  };

  const avatarBgColor = getAvatarColor(relative.type);

  // Normaliser les valeurs pour éviter d'afficher des objets directement
  const normalizeValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return value.custom || value.type || '';
    }
    return String(value);
  };

  const displayType = normalizeValue(relative.type);
  const displayFirstName = normalizeValue(relative.firstName);

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border border-mcf-amber/20 hover:bg-mcf-amber/5 transition-colors ${relInactive ? 'opacity-60' : ''}`}>
      <Avatar className="h-9 w-9 bg-mcf-amber/20 text-lg flex-shrink-0">
        <AvatarFallback className="bg-transparent">{getRelativeTypeIcon(displayType as RelativeType)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm text-gray-700 truncate"><SafeText value={displayFirstName} /></div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <span><SafeText value={getRelationshipLabel(displayType as RelativeType)} /></span>
          {getNickname() && <span className="text-mcf-orange-dark">· <SafeText value={getNickname()} /></span>}
        </div>
        {relStatus && RelStatusIcon && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
              <RelStatusIcon className="h-3 w-3" />
              {relStatus.label}
            </span>
          </div>
        )}
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
