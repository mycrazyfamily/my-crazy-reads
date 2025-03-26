
import React from 'react';
import { Input } from "@/components/ui/input";

type RelativeNicknameSectionProps = {
  selectedNickname: string;
  setSelectedNickname: (nickname: string) => void;
  nicknameCustomValue: string | undefined;
  setNicknameCustomValue: (value: string) => void;
};

const RelativeNicknameSection: React.FC<RelativeNicknameSectionProps> = ({
  selectedNickname,
  setSelectedNickname,
  nicknameCustomValue,
  setNicknameCustomValue
}) => {
  return (
    <>
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">💖</span> Surnom (facultatif)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {[
            { value: "none", label: "Aucun" },
            { value: "mamoune", label: "Mamoune" },
            { value: "papou", label: "Papou" },
            { value: "custom", label: "Autre" },
          ].map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                selectedNickname === option.value
                  ? "border-mcf-orange bg-mcf-amber/10"
                  : "border-gray-200 hover:border-mcf-amber"
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
            className="border-mcf-amber"
          />
        </div>
      )}
    </>
  );
};

export default RelativeNicknameSection;
