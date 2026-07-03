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

  // Gère les changements dans les champs de texte personnalisés
  const handleCustomWorldChange = (value: string, fieldNumber: 1 | 2) => {
    const key = fieldNumber === 1 ? "other1" : "other2";
    form.setValue(`worlds.customWorlds.${key}`, value, { shouldDirty: true });
  };

  const handleCustomDiscoveryChange = (value: string, fieldNumber: 1 | 2) => {
    const key = fieldNumber === 1 ? "other1" : "other2";
    form.setValue(`worlds.customDiscoveries.${key}`, value, { shouldDirty: true });
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

    // Validation des champs personnalisés si nécessaire
    if (favoriteWorlds.includes("other1" as FavoriteWorldType) && !customWorlds?.other1) {
      errors.push("l'univers personnalisé 1");
    }
    if (favoriteWorlds.includes("other2" as FavoriteWorldType) && !customWorlds?.other2) {
      errors.push("l'univers personnalisé 2");
    }
    if (discoveries.includes("other1" as DiscoveryType) && !customDiscoveries?.other1) {
      errors.push("la découverte personnalisée 1");
    }
    if (discoveries.includes("other2" as DiscoveryType) && !customDiscoveries?.other2) {
      errors.push("la découverte personnalisée 2");
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
            {FAVORITE_WORLDS_OPTIONS.map((world) => {
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
          
          {/* Champs personnalisés pour les univers */}
          <div className="space-y-3 mt-3">
            {favoriteWorlds.includes("other1" as FavoriteWorldType) && (
              <div>
                <Label htmlFor="custom-world-1" className="text-sm font-medium">
                  Autre univers (1):
                </Label>
                <Input
                  id="custom-world-1"
                  value={customWorlds?.other1 || ''}
                  onChange={(e) => handleCustomWorldChange(e.target.value, 1)}
                  placeholder="Précisez l'univers"
                  className="mt-1"
                />
              </div>
            )}
            
            {favoriteWorlds.includes("other2" as FavoriteWorldType) && (
              <div>
                <Label htmlFor="custom-world-2" className="text-sm font-medium">
                  Autre univers (2):
                </Label>
                <Input
                  id="custom-world-2"
                  value={customWorlds?.other2 || ''}
                  onChange={(e) => handleCustomWorldChange(e.target.value, 2)}
                  placeholder="Précisez l'univers"
                  className="mt-1"
                />
              </div>
            )}
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
            {DISCOVERY_OPTIONS.map((discovery) => {
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
          
          {/* Champs personnalisés pour les découvertes */}
          <div className="space-y-3 mt-3">
            {discoveries.includes("other1" as DiscoveryType) && (
              <div>
                <Label htmlFor="custom-discovery-1" className="text-sm font-medium">
                  Autre découverte (1):
                </Label>
                <Input
                  id="custom-discovery-1"
                  value={customDiscoveries?.other1 || ''}
                  onChange={(e) => handleCustomDiscoveryChange(e.target.value, 1)}
                  placeholder="Précisez le type de découverte"
                  className="mt-1"
                />
              </div>
            )}
            
            {discoveries.includes("other2" as DiscoveryType) && (
              <div>
                <Label htmlFor="custom-discovery-2" className="text-sm font-medium">
                  Autre découverte (2):
                </Label>
                <Input
                  id="custom-discovery-2"
                  value={customDiscoveries?.other2 || ''}
                  onChange={(e) => handleCustomDiscoveryChange(e.target.value, 2)}
                  placeholder="Précisez le type de découverte"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Boutons de navigation */}
        <div className="pt-6 flex justify-between">
          <Button 
            type="button" 
            onClick={handlePreviousStep}
            variant="outline"
            className="font-semibold"
          >
            ← Retour
          </Button>
          
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Continuer l'aventure →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorldsForm;
