import React from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { RelativeGender } from '@/types/childProfile';
import PhysicalDetailsInput from '../PhysicalDetailsInput';
import ClothingStyleInput from '../ClothingStyleInput';

type RelativeAppearanceSectionProps = {
  selectedSkinColor: string;
  setSelectedSkinColor: (color: string) => void;
  skinColorCustomValue: string | undefined;
  setSkinColorCustomValue: (value: string) => void;
  selectedHairColor: string;
  setSelectedHairColor: (color: string) => void;
  hairColorCustomValue: string | undefined;
  setHairColorCustomValue: (value: string) => void;
  selectedEyeColor?: string;
  setSelectedEyeColor?: (color: string) => void;
  eyeColorCustomValue?: string | undefined;
  setEyeColorCustomValue?: (value: string) => void;
  hairLength?: string;
  setHairLength?: (value: string) => void;
  hairType: string;
  setHairType: (type: string) => void;
  hairTypeCustom?: string;
  setHairTypeCustom: (value: string) => void;
  glasses: boolean | null;
  setGlasses: (hasGlasses: boolean) => void;
  gender: RelativeGender;
  physicalDetails?: string[];
  setPhysicalDetails: (details: string[]) => void;
  clothingStyle?: string;
  setClothingStyle: (style: string) => void;
  noPhysicalDetails?: boolean;
  setNoPhysicalDetails?: (value: boolean) => void;
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
  selectedEyeColor,
  setSelectedEyeColor,
  eyeColorCustomValue,
  setEyeColorCustomValue,
  hairLength,
  setHairLength,
  hairType,
  setHairType,
  hairTypeCustom,
  setHairTypeCustom,
  glasses,
  setGlasses,
  gender,
  physicalDetails,
  setPhysicalDetails,
  clothingStyle,
  setClothingStyle,
  noPhysicalDetails,
  setNoPhysicalDetails
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
        <label className="block text-lg font-semibold mb-2">
          Couleur de peau
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
          <label className="block text-lg font-semibold mb-2">
            Couleur de peau personnalisée
          </label>
          <Input 
            value={skinColorCustomValue || ''} 
            onChange={(e) => setSkinColorCustomValue(e.target.value)}
            placeholder="Description de la couleur de peau" 
            className="border-mcf-primary/50"
          />
        </div>
      )}
      
      {/* Couleur des yeux */}
      <div className="form-group">
        <label className="block text-lg font-semibold mb-2">
          Couleur des yeux
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2">
          {[
            { value: "blue", label: "Bleus" },
            { value: "green", label: "Verts" },
            { value: "brown", label: "Marrons" },
            { value: "black", label: "Noirs" },
            { value: "custom", label: "Autre" },
          ].map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                selectedEyeColor === option.value
                  ? "border-mcf-primary bg-mcf-secondary-light/50"
                  : "border-gray-200 hover:border-mcf-primary/50"
              }`}
              onClick={() => setSelectedEyeColor && setSelectedEyeColor(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>

      {selectedEyeColor === "custom" && (
        <div className="form-group">
          <label className="block text-lg font-semibold mb-2">
            Couleur des yeux personnalisée
          </label>
          <Input
            value={eyeColorCustomValue || ''}
            onChange={(e) => setEyeColorCustomValue && setEyeColorCustomValue(e.target.value)}
            placeholder="Description de la couleur des yeux"
            className="border-mcf-primary/50"
          />
        </div>
      )}

      {/* Couleur des cheveux */}
      <div className="form-group">
        <label className="block text-lg font-semibold mb-2">
          Couleur des cheveux
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
          <label className="block text-lg font-semibold mb-2">
            Couleur des cheveux personnalisée
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
        <label className="block text-lg font-semibold mb-2">
          Type de cheveux
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
          <label className="block text-lg font-semibold mb-2">
            Type de cheveux personnalisé
          </label>
          <Input 
            value={hairTypeCustom || ''} 
            onChange={(e) => setHairTypeCustom(e.target.value)}
            placeholder="Description du type de cheveux" 
            className="border-mcf-primary/50"
          />
        </div>
      )}
      
      {/* Longueur des cheveux — masquée si Chauve */}
      {hairType !== "bald" && (
        <div className="form-group">
          <label className="block text-lg font-semibold mb-2">
            Longueur des cheveux
          </label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { value: "short", label: "Court" },
              { value: "medium", label: "Mi-long" },
              { value: "long", label: "Long" },
            ].map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                  hairLength === option.value
                    ? "border-mcf-primary bg-mcf-secondary-light/50"
                    : "border-gray-200 hover:border-mcf-primary/50"
                }`}
                onClick={() => setHairLength && setHairLength(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lunettes */}
      <div className="form-group mt-6">
        <label className="block text-lg font-semibold mb-2">
          {getGenderedText(
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

      {/* Détails physiques */}
      <PhysicalDetailsInput
        value={physicalDetails}
        onChange={setPhysicalDetails}
        noDetailsValue={noPhysicalDetails}
        onNoDetailsChange={setNoPhysicalDetails}
      />

      {/* Style vestimentaire */}
      <ClothingStyleInput
        value={clothingStyle}
        onChange={setClothingStyle}
      />
    </>
  );
};

export default RelativeAppearanceSection;
