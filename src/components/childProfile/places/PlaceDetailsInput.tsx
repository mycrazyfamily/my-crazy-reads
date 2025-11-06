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

  // Always work with a fixed-length array (3 slots) to keep indices stable
  const normalized: string[] = Array.from({ length: MAX_DETAILS }, (_, i) => (value?.[i] ?? ''));

  // Derive how many inputs should be visible by default
  const nonEmptyCount = normalized.filter((v) => v.trim() !== '').length;
  const defaultVisible = Math.max(1, Math.min(MAX_DETAILS, nonEmptyCount + (nonEmptyCount < MAX_DETAILS ? 1 : 0)));
  const [visibleCount, setVisibleCount] = useState<number>(defaultVisible);

  // We compute the actual number of rendered inputs from state OR derived default (no effect needed)
  const renderCount = Math.max(visibleCount, defaultVisible);

  const handleAddDetail = () => {
    if (renderCount < MAX_DETAILS) {
      const nextCount = renderCount + 1;
      // Ensure parent holds at least nextCount slots
      const next = [...normalized];
      while (next.length < nextCount) next.push('');
      onChange(next);
      setVisibleCount(nextCount);
    }
  };

  const handleRemoveDetail = (index: number) => {
    // Remove the slot and compact values to the left, keep fixed length
    const compact = normalized.filter((_, i) => i !== index).filter((v) => v.trim() !== '');
    while (compact.length < MAX_DETAILS) compact.push('');
    onChange(compact);
    setVisibleCount((c) => Math.max(1, Math.min(MAX_DETAILS, Math.min(c - 1, compact.filter((v) => v.trim() !== '').length + 1))));
  };

  const handleChangeDetail = (index: number, newValue: string) => {
    const next = [...normalized];
    next[index] = newValue;
    onChange(next);
  };
  const handleNoDetailsChange = (checked: boolean) => {
    setNoDetails(checked);
    if (onNoDetailsChange) {
      onNoDetailsChange(checked);
    }
    if (checked) {
      // Sauvegarder les détails actuels avant de les masquer
      const currentDetails = normalized.filter(d => d.trim() !== '');
      if (currentDetails.length > 0) {
        setSavedDetails(currentDetails);
      }
      onChange(['', '', ''].slice(0, MAX_DETAILS));
      setVisibleCount(1);
    } else {
      // Restaurer les détails sauvegardés si disponibles
      if (savedDetails.length > 0) {
        const restored = [...savedDetails];
        while (restored.length < MAX_DETAILS) restored.push('');
        onChange(restored);
        setVisibleCount(Math.max(1, Math.min(MAX_DETAILS, savedDetails.length + 1)));
      }
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
            {normalized.slice(0, renderCount).map((detail, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={detail}
                  onChange={(e) => handleChangeDetail(index, e.target.value)}
                  placeholder={index === 0 ? placeholder : "Ajouter un autre détail..."}
                  className="flex-1"
                />
                {renderCount > 1 && (
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

          {renderCount < MAX_DETAILS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetail}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un autre détail ({renderCount}/{MAX_DETAILS})
            </Button>
          )}
        </>
      )}
    </div>
  );
};
