import React from 'react';
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { CHARACTER_TRAITS_OPTIONS } from '@/constants/childProfileOptions';
import type { RelativeGender } from '@/types/childProfile';
type RelativeTraitsSectionProps = {
  traits: string[];
  handleTraitToggle: (trait: string) => void;
  customTraits: Record<string, string>;
  setCustomTraits: (traits: Record<string, string>) => void;
  gender: RelativeGender;
};
const RelativeTraitsSection: React.FC<RelativeTraitsSectionProps> = ({
  traits,
  handleTraitToggle,
  customTraits,
  setCustomTraits,
  gender
}) => {
  // Function to get gender-specific trait labels
  const getGenderedTraitLabel = (trait: { value: string, label: string, icon: string }) => {
    // For traits with gendered forms like "Généreux.se", use the appropriate form
    if (trait.label === "Généreux.se") {
      return gender === "female" ? "Généreuse" : "Généreux";
    }
    if (trait.label === "Aventurier.e") {
      return gender === "female" ? "Aventurière" : "Aventurier";
    }
    if (trait.label === "Protecteur.trice") {
      return gender === "female" ? "Protectrice" : "Protecteur";
    }
    if (trait.label === "Organisé.e") {
      return gender === "female" ? "Organisée" : "Organisé";
    }
    if (trait.label === "Bavard.e") {
      return gender === "female" ? "Bavarde" : "Bavard";
    }
    if (trait.label === "Têtu.e") {
      return gender === "female" ? "Têtue" : "Têtu";
    }
    
    // Return original label for non-gendered traits
    return trait.label;
  };
  // Gestion des traits personnalisés
  const handleCustomTraitChange = (traitKey: string, value: string) => {
    setCustomTraits({
      ...customTraits,
      [traitKey]: value
    });
  };
  return (
    <div className="form-group">
      <label className="block text-lg font-semibold mb-2">
        Traits de caractère (3 max)
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
                    ? "border-mcf-primary bg-mcf-secondary-light/50" 
                    : "border-gray-200 hover:border-mcf-amber"
                }`}
                onClick={() => handleTraitToggle(option.value)}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <div className={`flex h-4 w-4 items-center justify-center border ${
                      isChecked ? "border-primary bg-primary text-primary-foreground" : "border-primary"
                    } rounded-sm`}>
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xl mb-1">{option.icon}</div>
                    <div>{isCustomTrait ? option.label : getGenderedTraitLabel(option)}</div>
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
