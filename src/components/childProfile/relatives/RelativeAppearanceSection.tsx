
import React from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { RelativeGender } from '@/types/childProfile';

type RelativeAppearanceSectionProps = {
  selectedSkinColor: string;
  setSelectedSkinColor: (color: string) => void;
  skinColorCustomValue: string | undefined;
  setSkinColorCustomValue: (value: string) => void;
  selectedHairColor: string;
  setSelectedHairColor: (color: string) => void;
  hairColorCustomValue: string | undefined;
  setHairColorCustomValue: (value: string) => void;
  hairType: string;
  setHairType: (type: string) => void;
  hairTypeCustom?: string;
  setHairTypeCustom: (value: string) => void;
  glasses: boolean;
  setGlasses: (hasGlasses: boolean) => void;
  gender: RelativeGender;
};

const RelativeAppearanceSection: React.FC<RelativeAppearanceSectionProps> = ({
  selectedSkinColor,
  setSelectedSkinColor,
  skinColorCustomValue,
  setSkinColorCustomValue,
  selectedHairColor,
  setSelectedHairColor,
  hairColorCustomValue,
  setHairColorCustomValue,
  hairType,
  setHairType,
  hairTypeCustom,
  setHairTypeCustom,
  glasses,
  setGlasses,
  gender
}) => {
  // Function to get gender-specific text
  const getGenderedText = (maleText: string, femaleText: string, neutralText: string) => {
    if (gender === "male") return maleText;
    if (gender === "female") return femaleText;
    return neutralText;
  };

  return (
    <>
      {/* Couleur de peau */}
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">🖐️</span> Couleur de peau
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {[
            { value: "light", label: "Claire" },
            { value: "medium", label: "Mate" },
            { value: "dark", label: "Foncée" },
            { value: "custom", label: "Autre" },
          ].map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                selectedSkinColor === option.value
                  ? "border-mcf-primary bg-mcf-secondary-light/50"
                  : "border-gray-200 hover:border-mcf-primary/50"
              }`}
              onClick={() => setSelectedSkinColor(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Couleur de peau personnalisée */}
      {selectedSkinColor === "custom" && (
        <div className="form-group">
          <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span> Couleur de peau personnalisée
          </label>
          <Input 
            value={skinColorCustomValue || ''} 
            onChange={(e) => setSkinColorCustomValue(e.target.value)}
            placeholder="Description de la couleur de peau" 
            className="border-mcf-primary/50"
          />
        </div>
      )}
      
      {/* Couleur des cheveux */}
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">💇</span> Couleur des cheveux
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
          {[
            { value: "blonde", label: "Blonds" },
            { value: "chestnut", label: "Châtains" },
            { value: "brown", label: "Bruns" },
            { value: "red", label: "Roux" },
            { value: "black", label: "Noirs" },
            { value: "white", label: "Blancs" },
            { value: "custom", label: "Autre" },
          ].map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                selectedHairColor === option.value
                  ? "border-mcf-primary bg-mcf-secondary-light/50"
                  : "border-gray-200 hover:border-mcf-primary/50"
              }`}
              onClick={() => setSelectedHairColor(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Couleur des cheveux personnalisée */}
      {selectedHairColor === "custom" && (
        <div className="form-group">
          <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span> Couleur des cheveux personnalisée
          </label>
          <Input 
            value={hairColorCustomValue || ''} 
            onChange={(e) => setHairColorCustomValue(e.target.value)}
            placeholder="Description de la couleur des cheveux" 
            className="border-mcf-primary/50"
          />
        </div>
      )}
      
      {/* Type de cheveux */}
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">〰️</span> Type de cheveux
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {[
            { value: "straight", label: "Raides" },
            { value: "wavy", label: "Ondulés" },
            { value: "curly", label: "Bouclés" },
            { value: "coily", label: "Frisés" },
            { value: "bald", label: "Chauve" },
            { value: "ponytail", label: "Queue de cheval" },
            { value: "custom", label: "Autre" },
          ].map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                hairType === option.value
                  ? "border-mcf-primary bg-mcf-secondary-light/50"
                  : "border-gray-200 hover:border-mcf-primary/50"
              }`}
              onClick={() => setHairType(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Type de cheveux personnalisé */}
      {hairType === "custom" && (
        <div className="form-group">
          <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span> Type de cheveux personnalisé
          </label>
          <Input 
            value={hairTypeCustom || ''} 
            onChange={(e) => setHairTypeCustom(e.target.value)}
            placeholder="Description du type de cheveux" 
            className="border-mcf-primary/50"
          />
        </div>
      )}
      
      {/* Lunettes */}
      <div className="form-group mt-6">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">👓</span> {getGenderedText(
            "Porte-t-il des lunettes ?",
            "Porte-t-elle des lunettes ?",
            "Porte-t-il/elle des lunettes ?"
          )}
        </label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: true, label: "Oui" },
            { value: false, label: "Non" },
          ].map((option) => (
            <div
              key={option.value.toString()}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                glasses === option.value
                  ? "border-mcf-primary bg-mcf-secondary-light/50"
                  : "border-gray-200 hover:border-mcf-primary/50"
              }`}
              onClick={() => setGlasses(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RelativeAppearanceSection;
