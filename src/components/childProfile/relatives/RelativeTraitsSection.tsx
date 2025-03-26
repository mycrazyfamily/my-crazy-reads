
import React from 'react';
import { CHARACTER_TRAITS_OPTIONS } from '@/constants/childProfileOptions';

type RelativeTraitsSectionProps = {
  traits: string[];
  handleTraitToggle: (trait: string) => void;
};

const RelativeTraitsSection: React.FC<RelativeTraitsSectionProps> = ({
  traits,
  handleTraitToggle
}) => {
  return (
    <div className="form-group">
      <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
        <span className="text-xl">💪</span> Traits de caractère (3 max)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {CHARACTER_TRAITS_OPTIONS.map((option) => {
          const isChecked = traits.includes(option.value);
          return (
            <div 
              key={option.value}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                isChecked 
                  ? "border-mcf-orange bg-mcf-amber/10" 
                  : "border-gray-200 hover:border-mcf-amber"
              }`}
              onClick={() => handleTraitToggle(option.value)}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  <div className={`flex h-4 w-4 items-center justify-center border ${
                    isChecked ? "border-primary bg-primary text-primary-foreground" : "border-primary"
                  } rounded-sm`}>
                    {isChecked && <span className="text-xs">✓</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div>{option.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelativeTraitsSection;
