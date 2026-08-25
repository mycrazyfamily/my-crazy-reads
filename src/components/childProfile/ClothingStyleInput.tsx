// ClothingStyleInput v2.0
// Changelog v2.0 (chantier C2) : la tenue sur mesure devient le chemin principal, et la
//   consigne exige du detail. Deux constats.
//   [1] LES STYLES PREDEFINIS SONT TROP VAGUES. « Sportif », « Coloré / fun », « Bohème /
//       nature » ne decrivent ni piece, ni couleur, ni matiere. Le prompt d'image doit alors
//       tout inventer, et deux enfants « sportifs » sortent habilles pareil. La description
//       libre est la seule qui produise une tenue reconnaissable.
//   [2] LE CHAMP LIBRE NE DEMANDAIT RIEN DE PRECIS. Le placeholder « Ex : sweat bleu,
//       baskets » n'appelait ni les couleurs completes, ni le bas, ni les chaussures.
//   Ce qui change concretement :
//     - une phrase sous le titre annonce que la description libre donne un bien meilleur
//       resultat, et que les styles predefinis sont un repli rapide ;
//     - la carte « Décris sa tenue toi-même » porte une mention « Recommandé » ;
//     - le champ passe en zone de texte sur deux lignes, plafonnee a 200 caracteres avec
//       compteur, comme les details physiques (PhysicalDetailsInput v3.0) ;
//     - la consigne demande explicitement le haut, le bas, les chaussures et les couleurs,
//       avec un exemple avant/apres.
//   AUCUN CHANGEMENT DE FORMAT : la valeur reste une chaine unique, les styles predefinis
//   gardent leur forme « emoji + libelle », et la detection isPredefinedStyle est inchangee.
//   Rien ne bouge en base ni dans l'Edge Function enrich-clothing.
// ClothingStyleInput v1.2
// Changelog v1.2 (B4) : « … » retiré du placeholder (donnait l'impression d'être coupé).
// ClothingStyleInput v1.1
// Changelog v1.1 (B4) : exemple (placeholder) du style vestimentaire raccourci pour ne plus être coupé.
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLOTHING_STYLE_OPTIONS } from "@/constants/clothingStyleOptions";
import OptionCard from "./personality/OptionCard";

type ClothingStyleInputProps = {
  value: string | string[] | undefined;
  onChange: (value: string) => void;
  label?: string;
};

// Meme plafond que les details physiques, pour que les deux champs libres du formulaire
// se comportent de la meme facon.
const MAX_CARACTERES = 200;

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
    }
  }, [value]);

  const handleOptionClick = (optionValue: string, optionLabel: string, optionEmoji: string) => {
    const fullValue = `${optionEmoji} ${optionLabel}`;
    onChange(fullValue);
    setShowCustomInput(false);
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    onChange(customText || '');
  };

  // v2.0 : Input remplace par Textarea, le type de l'evenement change en consequence.
  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCustomText(text);
    onChange(text);
  };

  const isSelected = (optionEmoji: string) => {
    return normalizedValue?.startsWith(optionEmoji) || false;
  };

  const restants = MAX_CARACTERES - customText.length;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {label}
        </Label>
        {/* v2.0 : oriente vers la description libre, qui est la seule a produire une tenue
            reconnaissable. Les styles predefinis restent disponibles comme repli rapide. */}
        <p className="text-sm text-muted-foreground mt-1 leading-snug">
          Le décrire vous-même donne un résultat bien plus fidèle. Les styles ci-dessous
          sont un choix rapide, mais ils restent génériques.
        </p>
      </div>

      <div className="relative">
        <OptionCard
          isSelected={showCustomInput && !isPredefinedStyle}
          isDisabled={false}
          onClick={handleCustomClick}
          icon="✏️"
          label="Décris sa tenue toi-même"
        />
        <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-mcf-primary/10 text-mcf-primary pointer-events-none">
          Recommandé
        </span>
      </div>

      {showCustomInput && (
        <div className="space-y-2 p-4 border-2 border-mcf-primary/50 rounded-lg bg-mcf-secondary-light/20">
          <Label htmlFor="custom-clothing" className="text-sm font-medium">
            Décris sa tenue préférée
          </Label>
          <p className="text-sm text-muted-foreground leading-snug">
            Donnez le <strong>haut</strong>, le <strong>bas</strong>, les{' '}
            <strong>chaussures</strong> et les <strong>couleurs</strong>.
            Écrivez « sweat bleu marine à capuche, jean clair et baskets blanches »
            plutôt que « sweat ».
          </p>
          <Textarea
            id="custom-clothing"
            placeholder="Ex : sweat bleu marine à capuche, jean clair et baskets blanches"
            value={customText}
            onChange={handleCustomTextChange}
            maxLength={MAX_CARACTERES}
            rows={2}
            className="w-full resize-none"
          />
          <div className="flex justify-end">
            <span
              className={`text-xs ${restants <= 20 ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {customText.length}/{MAX_CARACTERES}
            </span>
          </div>
        </div>
      )}

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
      </div>
    </div>
  );
};

export default ClothingStyleInput;
