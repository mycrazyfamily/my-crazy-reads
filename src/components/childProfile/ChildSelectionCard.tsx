import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
}

interface ChildSelectionCardProps {
  child: Child;
  selected: boolean;
  onToggle: (childId: string) => void;
}

export default function ChildSelectionCard({ child, selected, onToggle }: ChildSelectionCardProps) {
  const getChildEmoji = (gender?: string) => {
    if (gender === 'male') return '👦';
    if (gender === 'female') return '👧';
    return '🧒';
  };

  const getAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const age = differenceInYears(new Date(), new Date(birthDate));
    return `${age} ans`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        selected 
          ? 'border-mcf-orange bg-mcf-amber/10' 
          : 'border-gray-200 hover:border-mcf-orange/50'
      }`}
      onClick={() => onToggle(child.id)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Checkbox 
          checked={selected} 
          onCheckedChange={() => onToggle(child.id)}
          className="data-[state=checked]:bg-mcf-orange data-[state=checked]:border-mcf-orange"
        />
        <div className="text-4xl">{getChildEmoji(child.gender)}</div>
        <div className="flex-1">
          <p className="font-semibold text-mcf-orange-dark">
            {child.firstName} {child.lastName || ''}
          </p>
          {getAge(child.birthDate) && (
            <p className="text-sm text-gray-600">{getAge(child.birthDate)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
