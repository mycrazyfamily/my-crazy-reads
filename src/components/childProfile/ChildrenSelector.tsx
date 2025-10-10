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
    <div className="space-y-3 p-4 bg-mcf-cream/30 rounded-lg border border-mcf-mint/30">
      <Label className="text-base font-semibold text-mcf-primary">
        {label}
      </Label>
      <div className="space-y-2">
        {children.map((child) => (
          <div key={child.id} className="flex items-center space-x-2">
            <Checkbox
              id={`child-${child.id}`}
              checked={selectedChildrenIds.includes(child.id)}
              onCheckedChange={() => onToggleChild(child.id)}
            />
            <Label
              htmlFor={`child-${child.id}`}
              className="text-sm cursor-pointer"
            >
              {child.first_name}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 italic mt-2">
        Sélectionnez tous les enfants concernés par ce proche/animal
      </p>
    </div>
  );
};

export default ChildrenSelector;
