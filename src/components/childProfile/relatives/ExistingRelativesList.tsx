import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type ExistingRelative = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  family_id: string;
};

type ExistingRelativesListProps = {
  existingRelatives: ExistingRelative[];
  selectedRelativeIds: string[];
  onToggleRelative: (relativeId: string) => void;
};

const ExistingRelativesList: React.FC<ExistingRelativesListProps> = ({
  existingRelatives,
  selectedRelativeIds,
  onToggleRelative
}) => {
  if (existingRelatives.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-mcf-primary">Proches déjà créés</h3>
        <p className="text-sm text-gray-600">
          Sélectionnez les proches déjà existants pour les associer à cet enfant
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {existingRelatives.map((relative) => {
          const isSelected = selectedRelativeIds.includes(relative.id);
          
          return (
            <Card
              key={relative.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-mcf-orange bg-mcf-amber/10'
                  : 'border-gray-200 hover:border-mcf-orange/50'
              }`}
              onClick={() => onToggleRelative(relative.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleRelative(relative.id)}
                    className="data-[state=checked]:bg-mcf-orange data-[state=checked]:border-mcf-orange"
                    aria-label={`Sélectionner ${relative.name}`}
                  />
                </div>
                <div className="text-3xl">{relative.avatar || '👤'}</div>
                <div className="flex-1">
                  <p className="font-semibold text-mcf-orange-dark">
                    {relative.name}
                  </p>
                  <p className="text-sm text-gray-600">{relative.role}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExistingRelativesList;
