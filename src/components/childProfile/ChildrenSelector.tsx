import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserCheck, UserMinus } from 'lucide-react';

interface Child {
  id: string;
  first_name: string;
}

interface ChildrenSelectorProps {
  children: Child[];
  selectedChildrenIds: string[];
  onToggleChild: (childId: string) => void;
  label: string;
  // --- Brouille par enfant (optionnel) : utilisé uniquement pour les proches.
  // Si onToggleEstrangement n'est pas fourni, le composant reste 100% binaire (animal / lieu / création).
  estrangedChildIds?: string[];
  onToggleEstrangement?: (childId: string) => void;
  estrangementActiveLabel?: string;
  estrangementLabel?: string;
}

const ChildrenSelector: React.FC<ChildrenSelectorProps> = ({
  children,
  selectedChildrenIds,
  onToggleChild,
  label,
  estrangedChildIds,
  onToggleEstrangement,
  estrangementActiveLabel = 'En contact',
  estrangementLabel = 'Plus en contact',
}) => {
  if (children.length === 0) {
    return null;
  }

  const estrangementEnabled = typeof onToggleEstrangement === 'function';

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-mcf-mint/20 to-mcf-gradient-end/20 rounded-xl border border-mcf-secondary/30 shadow-sm">
      <Label className="text-lg font-semibold text-mcf-primary block">
        {label}
      </Label>
      <div className="space-y-3">
        {children.map((child) => {
          const isSelected = selectedChildrenIds.includes(child.id);
          const isEstranged = (estrangedChildIds || []).includes(child.id);
          return (
            <div
              key={child.id}
              className="flex items-center gap-1 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
            >
              <Checkbox
                id={`child-${child.id}`}
                checked={isSelected}
                onCheckedChange={() => onToggleChild(child.id)}
                className="data-[state=checked]:bg-mcf-primary data-[state=checked]:border-mcf-primary"
              />
              <Label
                htmlFor={`child-${child.id}`}
                className="text-base cursor-pointer font-medium text-mcf-text text-left"
              >
                {child.first_name}
              </Label>

              {estrangementEnabled && isSelected && (
                <button
                  type="button"
                  onClick={() => onToggleEstrangement!(child.id)}
                  aria-pressed={isEstranged}
                  className={`ml-auto inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                    isEstranged
                      ? 'bg-muted text-muted-foreground border-border'
                      : 'bg-mcf-mint/40 text-mcf-primary border-mcf-secondary/40 hover:bg-mcf-mint/60'
                  }`}
                >
                  {isEstranged
                    ? <UserMinus className="h-3.5 w-3.5" />
                    : <UserCheck className="h-3.5 w-3.5" />}
                  {isEstranged ? estrangementLabel : estrangementActiveLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground italic">
        Sélectionnez tous les enfants concernés par ce proche/animal
      </p>
      {estrangementEnabled && (
        <p className="text-xs text-muted-foreground">
          « {estrangementLabel} » : ce proche n'apparaîtra plus dans les histoires de cet enfant, sans être supprimé. Réversible à tout moment.
        </p>
      )}
    </div>
  );
};

export default ChildrenSelector;
