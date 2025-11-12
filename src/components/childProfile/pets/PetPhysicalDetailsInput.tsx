import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

type PetPhysicalDetailsInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const SUGGESTIONS = [
  "Pelage noir",
  "Pelage blanc",
  "Pelage roux",
  "Taches brunes",
  "Taches blanches",
  "Grande taille",
  "Petite taille",
  "Oreille coupée",
  "Queue courte",
  "Yeux bleus",
  "Yeux verts",
  "Collier",
];

const PetPhysicalDetailsInput: React.FC<PetPhysicalDetailsInputProps> = ({
  value = [],
  onChange,
}) => {
  const MAX_DETAILS = 5;
  const [customInput, setCustomInput] = useState('');
  const details = value.length > 0 ? value : [];

  const handleAddSuggestion = (suggestion: string) => {
    if (!details.includes(suggestion) && details.length < MAX_DETAILS) {
      onChange([...details, suggestion]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !details.includes(trimmed) && details.length < MAX_DETAILS) {
      onChange([...details, trimmed]);
      setCustomInput('');
    }
  };

  const handleRemoveDetail = (detailToRemove: string) => {
    onChange(details.filter(d => d !== detailToRemove));
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          🐾 Des détails physiques marquants ?
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Couleur du pelage, taches, grande taille, oreille coupée, etc.
        </p>
      </div>

      {/* Détails sélectionnés */}
      {details.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-mcf-secondary-light/50 border border-mcf-primary rounded-full px-3 py-1.5"
            >
              <span className="text-sm">{detail}</span>
              <button
                type="button"
                onClick={() => handleRemoveDetail(detail)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {details.length < MAX_DETAILS && (
        <>
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Suggestions ({details.length}/{MAX_DETAILS})
            </Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.filter(s => !details.includes(s)).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddSuggestion(suggestion)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-full hover:border-mcf-primary hover:bg-mcf-secondary-light/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Champ personnalisé */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Autre (à préciser)
            </Label>
            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ex : Cicatrice sur la patte avant droite..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCustom}
                disabled={!customInput.trim() || details.length >= MAX_DETAILS}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {details.length >= MAX_DETAILS && (
        <p className="text-sm text-muted-foreground">
          Maximum de {MAX_DETAILS} détails atteint
        </p>
      )}
    </div>
  );
};

export default PetPhysicalDetailsInput;
