import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

type PhysicalDetailsInputProps = {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  onNoDetailsChange?: (hasNoDetails: boolean) => void;
  noDetailsValue?: boolean;
};

const PhysicalDetailsInput: React.FC<PhysicalDetailsInputProps> = ({
  value = [],
  onChange,
  label = "🧬 Un détail physique marquant ? *",
  placeholder = "Ex : un grain de beauté sur la joue gauche, une cicatrice derrière l'oreille...",
  onNoDetailsChange,
  noDetailsValue = false
}) => {
  const MAX_DETAILS = 5;
  const [noDetails, setNoDetails] = useState(noDetailsValue);
  const [savedDetails, setSavedDetails] = useState<string[]>([]);
  const details = value.length > 0 ? value : [''];

  useEffect(() => {
    setNoDetails(noDetailsValue);
  }, [noDetailsValue]);

  const handleAddDetail = () => {
    if (details.length < MAX_DETAILS) {
      onChange([...details, '']);
    }
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    onChange(newDetails.length > 0 ? newDetails : ['']);
  };

  const handleChangeDetail = (index: number, newValue: string) => {
    const newDetails = [...details];
    newDetails[index] = newValue;
    onChange(newDetails);
  };

  const handleNoDetailsChange = (checked: boolean) => {
    setNoDetails(checked);
    if (onNoDetailsChange) {
      onNoDetailsChange(checked);
    }
    if (checked) {
      // Sauvegarder les détails actuels avant de les masquer
      const currentDetails = details.filter(d => d.trim() !== '');
      if (currentDetails.length > 0) {
        setSavedDetails(currentDetails);
      }
      onChange(['']);
    } else {
      // Restaurer les détails sauvegardés si disponibles
      if (savedDetails.length > 0) {
        onChange(savedDetails);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Boucles d'oreilles, cicatrice, tatouage… Donne-nous tous les petits détails, et surtout dis-nous exactement où ils sont !
        </p>
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
        <Checkbox
          id="no-details"
          checked={noDetails}
          onCheckedChange={handleNoDetailsChange}
        />
        <Label
          htmlFor="no-details"
          className="text-sm font-normal cursor-pointer"
        >
          Aucun détail physique particulier
        </Label>
      </div>

      {!noDetails && (
        <>
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={detail}
                  onChange={(e) => handleChangeDetail(index, e.target.value)}
                  placeholder={index === 0 ? placeholder : "Ajouter un autre détail..."}
                  className="flex-1"
                />
                {details.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDetail(index)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {details.length < MAX_DETAILS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un autre détail ({details.length}/{MAX_DETAILS})
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default PhysicalDetailsInput;
