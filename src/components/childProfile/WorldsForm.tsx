// WorldsForm v1.5
// Changelog D2 : le bouton de recul en bas d'etape s'appelle « Étape précédente » et non plus
//   « Retour ». Le mot « Retour » designait aussi le bouton du haut, qui ferme tout le
//   formulaire, et les testeurs confondaient les deux. Le bouton du haut est devenu
//   « Quitter » avec une croix (NouvelEnfant), celui-ci nomme ce qu'il fait.
//   Ces ecrans n'utilisent pas NavigationButtons, ils ont leur propre bouton en dur : le
//   libelle est donc a corriger fichier par fichier.
// WorldsForm v1.4
// Changelog v1.4 : les options « Autre » sont RETIRÉES, univers et découvertes.
//   Le texte saisi n'a jamais été enregistré (voir le commentaire dans le
//   composant) : le parent croyait être écouté et ne l'était pas. Décision
//   produit du 18/08, assumée pour la V1 — mieux vaut ne pas proposer que
//   proposer sans suite. On rouvrira si des utilisateurs le demandent, avec une
//   vraie persistance derrière.
//   Disparaissent avec elles : les quatre champs de saisie, leur validation et
//   leurs deux gestionnaires. Aucune blocklist n'est nécessaire ici puisqu'il
//   ne reste plus aucun texte libre sur cette étape.
// WorldsForm v1.3
// Changelog v1.3 (MOBILE) : nav « Retour / Continuer l'aventure » empilée sur mobile (flex-col) +
//   bouton qui peut revenir à la ligne — fini le chevauchement. Desktop strictement inchangé.
// WorldsForm v1.2
// Changelog v1.2 : validation des customs other1/other2 (univers + découvertes) avec .trim() —
// avant, un champ rempli uniquement d'espaces passait la validation (donnée vide en génération).
// WorldsForm v1.1
// Changelog v1.1 : wording bouton corrigé — "Voir le récapitulatif →" était trompeur (l'étape
// suivante est Lieux, pas Résumé) → "Continuer l'aventure →"
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { FAVORITE_WORLDS_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';
import type { ChildProfileFormData, FavoriteWorldType, DiscoveryType } from '@/types/childProfile';

type WorldsFormProps = {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
};

const WorldsForm: React.FC<WorldsFormProps> = ({
  handleNextStep,
  handlePreviousStep
}) => {
  const form = useFormContext<ChildProfileFormData>();

  // v1.4 — les options « Autre » sont RETIRÉES de l'affichage.
  // Le texte saisi n'était jamais enregistré : useChildProfileSubmit filtre les
  // valeurs commençant par « other » et n'insère que les libellés du catalogue.
  // Vérifié en base le 17/08 : aucun libellé hors catalogue n'existe. Le parent
  // croyait donc être écouté et ne l'était pas.
  // Le filtre est posé ICI plutôt que dans @/constants/worldOptions, qui sert
  // aussi à WorldsSummary : on ne casse rien ailleurs, et le jour où ces univers
  // seront réellement exploités, il suffira de retirer ces deux lignes.
  const OPTIONS_UNIVERS = FAVORITE_WORLDS_OPTIONS.filter((o) => !String(o.value).startsWith('other'));
  const OPTIONS_DECOUVERTES = DISCOVERY_OPTIONS.filter((o) => !String(o.value).startsWith('other'));
  
  // Lecture directe depuis react-hook-form (pas d'état local)
  const favoriteWorlds = form.watch("worlds.favoriteWorlds") || [];
  const discoveries = form.watch("worlds.discoveries") || [];
  const customWorlds = form.watch("worlds.customWorlds") || {};
  const customDiscoveries = form.watch("worlds.customDiscoveries") || {};

  // Gère la sélection/désélection d'un univers préféré
  const handleFavoriteWorldToggle = (world: FavoriteWorldType) => {
    const current = [...favoriteWorlds];
    if (current.includes(world)) {
      // Retirer
      const updated = current.filter(w => w !== world);
      form.setValue("worlds.favoriteWorlds", updated, { shouldDirty: true });
      // Nettoyer le customWorld si on retire other1/other2
      if (world === "other1" || world === "other2") {
        const updatedCustom = { ...customWorlds };
        delete updatedCustom[world];
        form.setValue("worlds.customWorlds", Object.keys(updatedCustom).length ? updatedCustom : undefined, { shouldDirty: true });
      }
    } else {
      // Ajouter (max 3)
      if (current.length < 3) {
        form.setValue("worlds.favoriteWorlds", [...current, world], { shouldDirty: true });
      } else {
        toast.error("Vous pouvez sélectionner au maximum 3 univers préférés.");
      }
    }
  };

  // Gère la sélection/désélection d'une découverte
  const handleDiscoveryToggle = (discovery: DiscoveryType) => {
    const current = [...discoveries];
    if (current.includes(discovery)) {
      // Retirer
      const updated = current.filter(d => d !== discovery);
      form.setValue("worlds.discoveries", updated, { shouldDirty: true });
      // Nettoyer le customDiscovery si on retire other1/other2
      if (discovery === "other1" || discovery === "other2") {
        const updatedCustom = { ...customDiscoveries };
        delete updatedCustom[discovery];
        form.setValue("worlds.customDiscoveries", Object.keys(updatedCustom).length ? updatedCustom : undefined, { shouldDirty: true });
      }
    } else {
      // Ajouter (max 3)
      if (current.length < 3) {
        form.setValue("worlds.discoveries", [...current, discovery], { shouldDirty: true });
      } else {
        toast.error("Vous pouvez sélectionner au maximum 3 types de découvertes.");
      }
    }
  };

  const handleSubmit = () => {
    const errors: string[] = [];

    // Validation des sélections minimales (facultatives mais si sélectionnées, doivent être valides)
    if (favoriteWorlds.length === 0) {
      errors.push("au moins un univers préféré");
    }
    if (discoveries.length === 0) {
      errors.push("au moins un type de découverte");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez sélectionner ou préciser : ${errors.join(', ')}`);
      return;
    }

    // Si tout est valide, on passe à l'étape suivante
    handleNextStep();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-primary">
        Univers préféré & ouverture culturelle
      </h2>
      
      <div className="space-y-8" role="group" aria-label="Univers et découvertes">
        {/* Univers préférés */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block">
              Quels sont ses univers préférés ? (3 maximum)
            </Label>
            <p className="text-gray-500 text-sm mb-4">Ces univers seront mis en avant dans ses histoires.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPTIONS_UNIVERS.map((world) => {
              const isSelected = favoriteWorlds.includes(world.value as FavoriteWorldType);
              const isDisabled = favoriteWorlds.length >= 3 && !isSelected;
              
              return (
                <div 
                  key={world.value}
                  className={`flex items-center p-2 rounded-md border cursor-pointer transition-colors ${
                    isSelected ? 'border-mcf-primary bg-mcf-secondary-light/50' : 'border-gray-200 hover:bg-gray-50'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isDisabled && handleFavoriteWorldToggle(world.value as FavoriteWorldType)}
                >
                  <div className="mr-2">
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      isSelected 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-primary'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <Label
                    htmlFor={`world-${world.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                  >
                    <span>{world.icon}</span> {world.label}
                  </Label>
                </div>
              );
            })}
          </div>
          
        </div>
        
        {/* Découvertes */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block">
              Quel type de découvertes aime-t-il faire ? (3 maximum)
            </Label>
            <p className="text-gray-500 text-sm mb-4">Ces thèmes seront intégrés subtilement dans ses histoires pour l'ouvrir sur le monde.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPTIONS_DECOUVERTES.map((discovery) => {
              const isSelected = discoveries.includes(discovery.value as DiscoveryType);
              const isDisabled = discoveries.length >= 3 && !isSelected;
              
              return (
                <div 
                  key={discovery.value}
                  className={`flex items-center p-2 rounded-md border cursor-pointer transition-colors ${
                    isSelected ? 'border-mcf-primary bg-mcf-secondary-light/50' : 'border-gray-200 hover:bg-gray-50'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isDisabled && handleDiscoveryToggle(discovery.value as DiscoveryType)}
                >
                  <div className="mr-2">
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      isSelected 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-primary'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <Label
                    htmlFor={`discovery-${discovery.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                  >
                    <span>{discovery.icon}</span> {discovery.label}
                  </Label>
                </div>
              );
            })}
          </div>
          
        </div>
        
        {/* Boutons de navigation */}
        <div className="pt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button 
            type="button" 
            onClick={handlePreviousStep}
            variant="outline"
            className="font-semibold w-full sm:w-auto"
          >
            ← Étape précédente
          </Button>
          
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto h-auto whitespace-normal sm:whitespace-nowrap leading-tight"
          >
            Continuer l'aventure →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorldsForm;
