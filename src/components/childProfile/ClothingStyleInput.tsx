import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CLOTHING_STYLE_OPTIONS } from "@/constants/clothingStyleOptions";
import OptionCard from "./personality/OptionCard";
type ClothingStyleInputProps = {
  value: string | string[] | undefined;
  onChange: (value: string) => void;
  label?: string;
};
const ClothingStyleInput: React.FC<ClothingStyleInputProps> = ({
  value = "",
  onChange,
  label = "Quel est son style vestimentaire favori ?"
}) => {
  // Normalize value: handle both old array format and new string format
  const normalizedValue = Array.isArray(value) ? (value[0] || "") : (value || "");
  
  // Check if the value is a predefined style
  const isPredefinedStyle = CLOTHING_STYLE_OPTIONS.some(opt => 
    normalizedValue?.startsWith(opt.emoji)
  );
  
  const [showCustomInput, setShowCustomInput] = useState(!!normalizedValue && !isPredefinedStyle);
  const [customText, setCustomText] = useState(!isPredefinedStyle ? normalizedValue : '');
  // Update local state when value prop changes (e.g., when loading from database)
  useEffect(() => {
    const normalized = Array.isArray(value) ? (value[0] || "") : (value || "");
    const isPredefined = CLOTHING_STYLE_OPTIONS.some(opt => normalized?.startsWith(opt.emoji));
    
    if (!isPredefined && normalized) {
      setShowCustomInput(true);
      setCustomText(normalized);
    } else if (isPredefined) {
      setShowCustomInput(false);
      setCustomText('');
    }
  }, [value]);
  const handleOptionClick = (optionValue: string, optionLabel: string, optionEmoji: string) => {
    const fullValue = `${optionEmoji} ${optionLabel}`;
    onChange(fullValue);
    setShowCustomInput(false);
    setCustomText('');
  };
  const handleCustomClick = () => {
    setShowCustomInput(true);
    onChange(customText || '');
  };
  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomText(text);
    onChange(text);
  };
  const isSelected = (optionEmoji: string) => {
    return normalizedValue?.startsWith(optionEmoji) || false;
  };
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {label}
        </Label>
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
          isSelected={showCustomInput && !isPredefinedStyle}
          isDisabled={false}
          onClick={handleCustomClick}
          icon="✏️"
          label="Autre style"
        />
      </div>
      {showCustomInput && (
        <div className="space-y-2 mt-4 p-4 border-2 border-mcf-primary/50 rounded-lg bg-mcf-secondary-light/20">
          <Label htmlFor="custom-clothing" className="text-sm font-medium">
            Décris le style vestimentaire favori
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