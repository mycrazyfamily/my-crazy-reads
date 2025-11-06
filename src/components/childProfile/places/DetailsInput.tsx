import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

// Stateless, mirrors PhysicalDetailsInput behavior
// - No local state, no effects
// - Renders 1 field if no value provided
// - Adds/removes by emitting updated arrays
// - Hides inputs when noDetailsValue is true

type DetailsInputProps = {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  label: string;
  placeholder: string;
  description?: string;
  onNoDetailsChange?: (hasNoDetails: boolean) => void;
  noDetailsValue?: boolean;
  noDetailsLabel?: string;
};

export const DetailsInput: React.FC<DetailsInputProps> = ({
  value = [],
  onChange,
  label,
  placeholder,
  description,
  onNoDetailsChange,
  noDetailsValue = false,
  noDetailsLabel = "Aucun élément particulier",
}) => {
  const MAX_DETAILS = 3;
  const details = value.length > 0 ? value : [''];

  // Debug log to inspect values flow during typing
  // eslint-disable-next-line no-console
  console.log('[DetailsInput]', { label, value, details, noDetailsValue });

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
    onNoDetailsChange?.(checked);
    if (checked) {
      onChange(['']);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
        <Checkbox
          id={`no-details-${label}`}
          checked={noDetailsValue}
          onCheckedChange={handleNoDetailsChange}
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
            {details.map((detail, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={detail}
                  onChange={(e) => handleChangeDetail(index, e.target.value)}
                  placeholder={index === 0 ? placeholder : 'Ajouter un autre détail...'}
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
