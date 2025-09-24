
import React from 'react';
import { Input } from "@/components/ui/input";
import type { RelativeType } from '@/types/childProfile';

type RelativeNicknameSectionProps = {
  selectedNickname: string;
  setSelectedNickname: (nickname: string) => void;
  nicknameCustomValue: string | undefined;
  setNicknameCustomValue: (value: string) => void;
  relativeType: RelativeType;
};

// Define nickname options based on relative type
const getNicknameOptions = (type: RelativeType) => {
  switch (type) {
    case "mother":
      return [
        { value: "mamoune", label: "Mamoune" },
        { value: "mamandamour", label: "Maman d'amour" },
      ];
    case "father":
      return [
        { value: "papou", label: "Papou" },
        { value: "papaours", label: "Papa ours" },
      ];
    case "otherParent":
      return [
        { value: "tata", label: "Tata ❤️" },
        { value: "tonton", label: "Tonton cool" },
      ];
    case "sister":
      return [
        { value: "soeurette", label: "Sœurette" },
        { value: "chouquette", label: "Chouquette" },
      ];
    case "brother":
      return [
        { value: "frerot", label: "Frérot" },
        { value: "loulou", label: "Loulou" },
      ];
    case "grandmother":
      return [
        { value: "mamie", label: "Mamie" },
        { value: "maminou", label: "Maminou" },
      ];
    case "grandfather":
      return [
        { value: "papi", label: "Papi" },
        { value: "papinou", label: "Papinou" },
      ];
    case "femaleCousin":
      return [
        { value: "cousinette", label: "Cousinette" },
        { value: "lili", label: "Lili" },
      ];
    case "maleCousin":
      return [
        { value: "cousinou", label: "Cousinou" },
        { value: "nino", label: "Nino" },
      ];
    case "femaleFriend":
      return [
        { value: "copinedecoeur", label: "Copine de cœur" },
        { value: "bff", label: "BFF" },
      ];
    case "maleFriend":
      return [
        { value: "copainfidele", label: "Copain fidèle" },
        { value: "bff", label: "BFF" },
      ];
    default:
      return [];
  }
};

const RelativeNicknameSection: React.FC<RelativeNicknameSectionProps> = ({
  selectedNickname,
  setSelectedNickname,
  nicknameCustomValue,
  setNicknameCustomValue,
  relativeType
}) => {
  const nicknameOptions = getNicknameOptions(relativeType);
  
  // Create the complete options array
  const options = [
    { value: "none", label: "Aucun" },
    ...nicknameOptions,
    { value: "custom", label: "Autre" },
  ];
  
  return (
    <>
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">💖</span> Surnom (facultatif)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {options.map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                selectedNickname === option.value
                  ? "border-mcf-primary bg-mcf-secondary-light/50"
                  : "border-gray-200 hover:border-mcf-primary/50"
              }`}
              onClick={() => setSelectedNickname(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
      
      {selectedNickname === "custom" && (
        <div className="form-group">
          <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span> Surnom personnalisé
          </label>
          <Input 
            value={nicknameCustomValue || ''} 
            onChange={(e) => setNicknameCustomValue(e.target.value)}
            placeholder="Son surnom personnalisé" 
            className="border-mcf-primary/50"
          />
        </div>
      )}
    </>
  );
};

export default RelativeNicknameSection;
