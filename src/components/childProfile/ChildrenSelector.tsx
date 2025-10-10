import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Child {
  id: string;
  first_name: string;
}

interface ChildrenSelectorProps {
  children: Child[];
  selectedChildrenIds: string[];
  onToggleChild: (childId: string) => void;
  label: string;
}

const ChildrenSelector: React.FC<ChildrenSelectorProps> = ({
  children,
  selectedChildrenIds,
  onToggleChild,
  label
}) => {
  if (children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-mcf-mint/20 to-mcf-gradient-end/20 rounded-xl border border-mcf-secondary/30 shadow-sm">
      <Label className="text-lg font-semibold text-mcf-primary block">
        {label}
      </Label>
      <div className="space-y-3">
        {children.map((child) => (
          <div 
            key={child.id} 
            className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
          >
            <Checkbox
              id={`child-${child.id}`}
              checked={selectedChildrenIds.includes(child.id)}
              onCheckedChange={() => onToggleChild(child.id)}
              className="data-[state=checked]:bg-mcf-primary data-[state=checked]:border-mcf-primary"
            />
            <Label
              htmlFor={`child-${child.id}`}
              className="text-base cursor-pointer font-medium text-mcf-text flex-1"
            >
              {child.first_name}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground italic">
        Sélectionnez tous les enfants concernés par ce proche/animal
      </p>
    </div>
  );
};

export default ChildrenSelector;
