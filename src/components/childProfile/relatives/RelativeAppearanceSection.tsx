
import React from 'react';
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  glasses: boolean;
  setGlasses: (hasGlasses: boolean) => void;
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
  glasses,
  setGlasses
}) => {
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
                  ? "border-mcf-orange bg-mcf-amber/10"
                  : "border-gray-200 hover:border-mcf-amber"
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
            className="border-mcf-amber"
          />
        </div>
      )}
      
      {/* Couleur des cheveux */}
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">💇</span> Couleur des cheveux
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
          {[
            { value: "blonde", label: "Blonds" },
            { value: "chestnut", label: "Châtains" },
            { value: "brown", label: "Bruns" },
            { value: "red", label: "Roux" },
            { value: "black", label: "Noirs" },
            { value: "custom", label: "Autre" },
          ].map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                selectedHairColor === option.value
                  ? "border-mcf-orange bg-mcf-amber/10"
                  : "border-gray-200 hover:border-mcf-amber"
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
            className="border-mcf-amber"
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
          ].map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                hairType === option.value
                  ? "border-mcf-orange bg-mcf-amber/10"
                  : "border-gray-200 hover:border-mcf-amber"
              }`}
              onClick={() => setHairType(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Lunettes - version avec boutons radio au lieu de checkbox */}
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">👓</span> Porte-t-il/elle des lunettes ?
        </label>
        <RadioGroup 
          onValueChange={(value) => setGlasses(value === "true")} 
          value={glasses ? "true" : "false"}
          className="flex gap-4 mt-2"
        >
          <div className={`px-6 py-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
            glasses ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"
          }`}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="relative-glasses-yes" className="peer h-5 w-5" />
              <label htmlFor="relative-glasses-yes" className="cursor-pointer">Oui</label>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
            !glasses ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"
          }`}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="relative-glasses-no" className="peer h-5 w-5" />
              <label htmlFor="relative-glasses-no" className="cursor-pointer">Non</label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};

export default RelativeAppearanceSection;
