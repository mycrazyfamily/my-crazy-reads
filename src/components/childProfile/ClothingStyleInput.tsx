import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CLOTHING_STYLE_OPTIONS } from "@/constants/clothingStyleOptions";

type ClothingStyleInputProps = {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  label?: string;
};

const ClothingStyleInput: React.FC<ClothingStyleInputProps> = ({
  value = [],
  onChange,
  label = "👕 Quel est le style vestimentaire habituel ?"
}) => {
  // Separate predefined styles from custom text
  const predefinedValues = value.filter(v => 
    CLOTHING_STYLE_OPTIONS.some(opt => v.startsWith(opt.emoji))
  );
  
  const customValues = value.filter(v => 
    !CLOTHING_STYLE_OPTIONS.some(opt => v.startsWith(opt.emoji))
  );
  
  const [customText, setCustomText] = useState(customValues.join('\n'));

  const handleCheckboxChange = (optionValue: string, optionLabel: string, optionEmoji: string, checked: boolean) => {
    const fullValue = `${optionEmoji} ${optionLabel}`;
    let newPredefined: string[];
    
    if (checked) {
      newPredefined = [...predefinedValues, fullValue];
    } else {
      newPredefined = predefinedValues.filter(v => !v.startsWith(optionEmoji));
    }
    
    onChange([...newPredefined, ...customValues]);
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCustomText(text);
    
    const newCustomValues = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    onChange([...predefinedValues, ...newCustomValues]);
  };

  const isChecked = (optionEmoji: string) => {
    return predefinedValues.some(v => v.startsWith(optionEmoji));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choisis dans les propositions ou décris-le librement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CLOTHING_STYLE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`clothing-${option.value}`}
              checked={isChecked(option.emoji)}
              onCheckedChange={(checked) => 
                handleCheckboxChange(option.value, option.label, option.emoji, checked as boolean)
              }
            />
            <label
              htmlFor={`clothing-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {option.emoji} {option.label}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-clothing" className="text-sm font-medium">
          ✏️ Autre style (texte libre)
        </Label>
        <Textarea
          id="custom-clothing"
          placeholder="Ex : souvent des leggings licornes, porte toujours un chapeau..."
          value={customText}
          onChange={handleCustomTextChange}
          className="min-h-[80px] resize-y"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Vous pouvez saisir plusieurs styles (un par ligne)
        </p>
      </div>
    </div>
  );
};

export default ClothingStyleInput;
