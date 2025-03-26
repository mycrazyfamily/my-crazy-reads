
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { CHARACTER_TRAITS_OPTIONS } from '@/constants/childProfileOptions';

type RelativeTraitsSectionProps = {
  traits: string[];
  handleTraitToggle: (trait: string) => void;
  customTraits: Record<string, string>;
  setCustomTraits: (traits: Record<string, string>) => void;
};

const RelativeTraitsSection: React.FC<RelativeTraitsSectionProps> = ({
  traits,
  handleTraitToggle,
  customTraits,
  setCustomTraits
}) => {
  // Gestion des traits personnalisés
  const handleCustomTraitChange = (traitKey: string, value: string) => {
    setCustomTraits({
      ...customTraits,
      [traitKey]: value
    });
  };

  return (
    <div className="form-group">
      <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
        <span className="text-xl">💪</span> Traits de caractère (3 max)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {CHARACTER_TRAITS_OPTIONS.map((option) => {
          const isChecked = traits.includes(option.value);
          const isCustomTrait = option.value === 'other1' || option.value === 'other2' || option.value === 'other3';
          
          return (
            <div key={option.value}>
              <div 
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
              
              {/* Champ de texte pour les traits "Autre" */}
              {isChecked && isCustomTrait && (
                <div className="mt-2 ml-6">
                  <Input
                    placeholder="Précisez le trait..."
                    value={customTraits[option.value] || ''}
                    onChange={(e) => handleCustomTraitChange(option.value, e.target.value)}
                    className="border-mcf-amber text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelativeTraitsSection;
