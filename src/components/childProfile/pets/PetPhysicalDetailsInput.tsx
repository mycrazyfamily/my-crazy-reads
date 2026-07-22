// PetPhysicalDetailsInput v1.3
// Changelog v1.3 : exemple adapté à l'ANIMAL (« Ex : cicatrice à la patte ») — ce composant est
//   celui utilisé par PetForm ; l'exemple précédent (« cicatrice au menton ») venait du gabarit
//   humain et n'avait pas de sens sur une fiche animal.
// PhysicalDetailsInput v1.2
// Changelog v1.2 (B4) : placeholder raccourci + « … » retiré (ne débordait plus mais restait long).
// PhysicalDetailsInput v1.1
// Changelog v1.1 : (a) B4 — exemple (placeholder) raccourci ; (b) B5 — après l'ajout d'un détail
//   personnalisé (le champ se vide alors que la chip apparaît plus haut dans « Détails
//   sélectionnés »), on affiche un « ✓ ajouté » ~2,5 s sous le champ, pour que l'utilisateur voie
//   que sa saisie a bien été prise en compte (notamment au « ✓ » du clavier iOS = onBlur).
import React, { useState, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Check } from "lucide-react";

type PetPhysicalDetailsInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  onNoDetailsChange?: (hasNoDetails: boolean) => void;
  noDetailsValue?: boolean;
};

const SUGGESTIONS = [
  "Taches de rousseur",
  "Grain de beauté",
  "Fossettes",
  "Cicatrice",
  "Appareil dentaire",
  "Boucles d'oreilles",
  "Mèche colorée",
  "Grande taille",
  "Petite taille",
  "Tache de naissance",
];

const PetPhysicalDetailsInput: React.FC<PetPhysicalDetailsInputProps> = ({
  value = [],
  onChange,
  onNoDetailsChange,
  noDetailsValue = false
}) => {
  const MAX_DETAILS = 5;
  const [customInput, setCustomInput] = useState('');
  const [noDetails, setNoDetails] = useState(noDetailsValue);
  // v1.1 (B5) : mémorise le dernier détail ajouté pour afficher un « ✓ ajouté » temporaire.
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const justAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const details = value.length > 0 ? value : [];

  const handleAddSuggestion = (suggestion: string) => {
    if (!details.includes(suggestion) && details.length < MAX_DETAILS) {
      onChange([...details, suggestion]);
      // Décocher automatiquement "aucun détail" quand on ajoute un détail
      if (noDetails) {
        setNoDetails(false);
        if (onNoDetailsChange) {
          onNoDetailsChange(false);
        }
      }
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !details.includes(trimmed) && details.length < MAX_DETAILS) {
      onChange([...details, trimmed]);
      setCustomInput('');
      // v1.1 (B5) : feedback visible que l'ajout a bien été pris en compte
      setJustAdded(trimmed);
      if (justAddedTimer.current) clearTimeout(justAddedTimer.current);
      justAddedTimer.current = setTimeout(() => setJustAdded(null), 2500);
      // Décocher automatiquement "aucun détail" quand on ajoute un détail
      if (noDetails) {
        setNoDetails(false);
        if (onNoDetailsChange) {
          onNoDetailsChange(false);
        }
      }
    }
  };

  const handleRemoveDetail = (detailToRemove: string) => {
    onChange(details.filter(d => d !== detailToRemove));
  };

  const handleNoDetailsChange = (checked: boolean) => {
    console.info('👆 noPhysicalDetails (animal) toggled', {
      checked,
      previous: noDetails,
      currentDetails: details,
    });
    setNoDetails(checked);
    if (onNoDetailsChange) {
      onNoDetailsChange(checked);
    }
    if (checked) {
      onChange([]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          Des détails physiques marquants ? *
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Taches de rousseur, grain de beauté, fossettes, cicatrice, etc.
        </p>
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
        <Checkbox
          id="no-physical-details-pet"
          checked={noDetails}
          onCheckedChange={handleNoDetailsChange}
        />
        <Label
          htmlFor="no-physical-details-pet"
          className="text-sm font-normal cursor-pointer"
        >
          Aucun détail physique particulier
        </Label>
      </div>

      {/* Détails sélectionnés */}
      {!noDetails && details.length > 0 && (
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
      {!noDetails && details.length < MAX_DETAILS && (
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
                placeholder="Ex : cicatrice à la patte"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                onBlur={() => {
                  // Ajouter automatiquement la valeur saisie si l'utilisateur oublie de cliquer sur +
                  handleAddCustom();
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
            {justAdded && (
              <p className="text-sm text-mcf-primary flex items-center gap-1 mt-2" aria-live="polite">
                <Check className="h-4 w-4 flex-shrink-0" />
                « {justAdded} » ajouté à la liste
              </p>
            )}
          </div>
        </>
      )}

      {!noDetails && details.length >= MAX_DETAILS && (
        <p className="text-sm text-muted-foreground">
          Maximum de {MAX_DETAILS} détails atteint
        </p>
      )}
    </div>
  );
};

export default PetPhysicalDetailsInput;
