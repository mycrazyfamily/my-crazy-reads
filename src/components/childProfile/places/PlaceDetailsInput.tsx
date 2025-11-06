import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

type PlaceDetailsInputProps = {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  label: string;
  placeholder: string;
  description?: string;
  onNoDetailsChange?: (hasNoDetails: boolean) => void;
  noDetailsValue?: boolean;
  noDetailsLabel?: string;
};

export const PlaceDetailsInput: React.FC<PlaceDetailsInputProps> = ({
  value = [],
  onChange,
  label,
  placeholder,
  description,
  onNoDetailsChange,
  noDetailsValue = false,
  noDetailsLabel = "Aucun élément particulier"
}) => {
  const MAX_DETAILS = 3;
  const [noDetails, setNoDetails] = useState(noDetailsValue);
  const [savedDetails, setSavedDetails] = useState<string[]>([]);
  const [internalDetails, setInternalDetails] = useState<string[]>(
    value && value.length > 0 ? value : ['']
  );

  useEffect(() => {
    setNoDetails(noDetailsValue);
  }, [noDetailsValue]);

  // Keep internal details in sync with external non-empty values without losing local placeholders
  useEffect(() => {
    if (noDetails) return;
    const external = (value ?? []);
    const extNonEmpty = external.filter((d) => (d ?? '').trim() !== '');

    // Merge external non-empty values into current state WITHOUT shrinking the number of fields
    // - Keeps existing placeholders so inputs don't disappear while typing
    // - Expands only when external provides more values than current length (e.g., when editing saved data)
    if (extNonEmpty.length === 0) {
      if (internalDetails.length === 0) {
        setInternalDetails(['']);
      }
      return;
    }

    const desiredLength = Math.max(internalDetails.length, extNonEmpty.length, 1);
    const merged: string[] = Array.from({ length: desiredLength }, (_, i) =>
      i < extNonEmpty.length ? extNonEmpty[i] : (internalDetails[i] ?? '')
    );

    if (merged.length !== internalDetails.length || merged.some((v, i) => v !== internalDetails[i])) {
      setInternalDetails(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, noDetails]);

  const handleAddDetail = () => {
    if (internalDetails.length < MAX_DETAILS) {
      const next = [...internalDetails, ''];
      setInternalDetails(next);
      onChange(next);
    }
  };

  const handleRemoveDetail = (index: number) => {
    const next = internalDetails.filter((_, i) => i !== index);
    const normalized = next.length > 0 ? next : [''];
    setInternalDetails(normalized);
    onChange(normalized);
  };

  const handleChangeDetail = (index: number, newValue: string) => {
    const next = [...internalDetails];
    next[index] = newValue;
    setInternalDetails(next);
    onChange(next);
  };

  const handleNoDetailsChange = (checked: boolean) => {
    setNoDetails(checked);
    if (onNoDetailsChange) {
      onNoDetailsChange(checked);
    }
    if (checked) {
      // Sauvegarder les détails actuels avant de les masquer
      const currentDetails = internalDetails.filter(d => d.trim() !== '');
      if (currentDetails.length > 0) {
        setSavedDetails(currentDetails);
      }
      setInternalDetails(['']);
      onChange(['']);
    } else {
      // Restaurer les détails sauvegardés si disponibles
      const restored = savedDetails.length > 0 ? savedDetails : [''];
      setInternalDetails(restored);
      onChange(restored);
    }
  };
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
        <Checkbox
          id={`no-details-${label}`}
          checked={noDetails}
          onCheckedChange={handleNoDetailsChange}
        />
        <Label
          htmlFor={`no-details-${label}`}
          className="text-sm font-normal cursor-pointer"
        >
          {noDetailsLabel}
        </Label>
      </div>

      {!noDetails && (
        <>
          <div className="space-y-2">
            {internalDetails.map((detail, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={detail}
                  onChange={(e) => handleChangeDetail(index, e.target.value)}
                  placeholder={placeholder}
                  className="flex-1"
                />
                {internalDetails.length > 1 && (
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

          {internalDetails.length < MAX_DETAILS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un autre détail ({internalDetails.length}/{MAX_DETAILS})
            </Button>
          )}
        </>
      )}
    </div>
  );
};
