import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

type DetailsInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder: string;
  onNoDetailsChange: (hasNoDetails: boolean) => void;
  noDetailsValue: boolean;
  noDetailsLabel?: string;
};

export const DetailsInput: React.FC<DetailsInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  onNoDetailsChange,
  noDetailsValue,
  noDetailsLabel = "Aucun élément particulier",
}) => {
  const MAX_DETAILS = 3;

  const handleAddDetail = () => {
    if (value.length < MAX_DETAILS) {
      onChange([...value, '']);
    }
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = value.filter((_, i) => i !== index);
    onChange(newDetails.length > 0 ? newDetails : ['']);
  };

  const handleChangeDetail = (index: number, newValue: string) => {
    const newDetails = [...value];
    newDetails[index] = newValue;
    onChange(newDetails);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">{label}</Label>
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
        <Checkbox
          id={`no-details-${label}`}
          checked={noDetailsValue}
          onCheckedChange={onNoDetailsChange}
        />
        <Label
          htmlFor={`no-details-${label}`}
          className="text-sm font-normal cursor-pointer"
        >
          {noDetailsLabel}
        </Label>
      </div>

      {!noDetailsValue && (
        <>
          <div className="space-y-2">
            {value.map((detail, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={detail}
                  onChange={(e) => handleChangeDetail(index, e.target.value)}
                  placeholder={index === 0 ? placeholder : 'Ajouter un autre détail...'}
                  className="flex-1"
                />
                {value.length > 1 && (
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

          {value.length < MAX_DETAILS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un autre détail ({value.length}/{MAX_DETAILS})
            </Button>
          )}
        </>
      )}
    </div>
  );
};
