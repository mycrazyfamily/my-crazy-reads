import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CLOTHING_STYLE_OPTIONS } from "@/constants/clothingStyleOptions";
import OptionCard from "./personality/OptionCard";

type ClothingStyleInputProps = {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  label?: string;
};

const ClothingStyleInput: React.FC<ClothingStyleInputProps> = ({
  value = [],
  onChange,
  label = "👕 Quel est son style vestimentaire favori ?"
}) => {
  // Get the selected predefined style or custom text
  const selectedPredefined = value.find(v => 
    CLOTHING_STYLE_OPTIONS.some(opt => v.startsWith(opt.emoji))
  );
  
  const customValue = value.find(v => 
    !CLOTHING_STYLE_OPTIONS.some(opt => v.startsWith(opt.emoji))
  );
  
  const [showCustomInput, setShowCustomInput] = useState(!!customValue && !selectedPredefined);
  const [customText, setCustomText] = useState(customValue || '');

  const handleOptionClick = (optionValue: string, optionLabel: string, optionEmoji: string) => {
    const fullValue = `${optionEmoji} ${optionLabel}`;
    onChange([fullValue]);
    setShowCustomInput(false);
    setCustomText('');
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    onChange(customText ? [customText] : []);
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomText(text);
    onChange(text ? [text] : []);
  };

  const isSelected = (optionEmoji: string) => {
    return selectedPredefined?.startsWith(optionEmoji) || false;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choisis le style qu'on retrouvera dans chaque histoire
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CLOTHING_STYLE_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            isSelected={isSelected(option.emoji)}
            isDisabled={false}
            onClick={() => handleOptionClick(option.value, option.label, option.emoji)}
            icon={option.emoji}
            label={option.label}
          />
        ))}
        
        <OptionCard
          isSelected={showCustomInput && !selectedPredefined}
          isDisabled={false}
          onClick={handleCustomClick}
          icon="✏️"
          label="Autre style"
        />
      </div>

      {showCustomInput && (
        <div className="space-y-2 mt-4 p-4 border-2 border-mcf-primary/50 rounded-lg bg-mcf-secondary-light/20">
          <Label htmlFor="custom-clothing" className="text-sm font-medium">
            ✏️ Décris le style vestimentaire favori
          </Label>
          <Input
            id="custom-clothing"
            placeholder="Ex : souvent des leggings licornes, porte toujours un chapeau..."
            value={customText}
            onChange={handleCustomTextChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default ClothingStyleInput;
