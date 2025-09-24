import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  
  // États pour les sélections
  const [favoriteWorlds, setFavoriteWorlds] = useState<FavoriteWorldType[]>(
    form.getValues("worlds.favoriteWorlds") || []
  );
  const [discoveries, setDiscoveries] = useState<DiscoveryType[]>(
    form.getValues("worlds.discoveries") || []
  );
  
  // États pour les champs personnalisés
  const [customWorld1, setCustomWorld1] = useState(
    form.getValues("worlds.customWorlds") && form.getValues("worlds.customWorlds").other1 || ''
  );
  const [customWorld2, setCustomWorld2] = useState(
    form.getValues("worlds.customWorlds") && form.getValues("worlds.customWorlds").other2 || ''
  );
  const [customDiscovery1, setCustomDiscovery1] = useState(
    form.getValues("worlds.customDiscoveries") && form.getValues("worlds.customDiscoveries").other1 || ''
  );
  const [customDiscovery2, setCustomDiscovery2] = useState(
    form.getValues("worlds.customDiscoveries") && form.getValues("worlds.customDiscoveries").other2 || ''
  );

  // Met à jour le formulaire quand les états locaux changent
  useEffect(() => {
    form.setValue("worlds.favoriteWorlds", favoriteWorlds, { shouldDirty: true });
    
    // Mise à jour des champs personnalisés pour les univers
    if (favoriteWorlds.includes("other1") || favoriteWorlds.includes("other2")) {
      const customWorlds = {
        ...(favoriteWorlds.includes("other1") ? { other1: customWorld1 } : {}),
        ...(favoriteWorlds.includes("other2") ? { other2: customWorld2 } : {})
      };
      form.setValue("worlds.customWorlds", customWorlds, { shouldDirty: true });
    } else {
      form.setValue("worlds.customWorlds", undefined, { shouldDirty: true });
    }
  }, [favoriteWorlds, customWorld1, customWorld2, form]);

  useEffect(() => {
    form.setValue("worlds.discoveries", discoveries, { shouldDirty: true });
    
    // Mise à jour des champs personnalisés pour les découvertes
    if (discoveries.includes("other1") || discoveries.includes("other2")) {
      const customDiscoveries = {
        ...(discoveries.includes("other1") ? { other1: customDiscovery1 } : {}),
        ...(discoveries.includes("other2") ? { other2: customDiscovery2 } : {})
      };
      form.setValue("worlds.customDiscoveries", customDiscoveries, { shouldDirty: true });
    } else {
      form.setValue("worlds.customDiscoveries", undefined, { shouldDirty: true });
    }
  }, [discoveries, customDiscovery1, customDiscovery2, form]);

  // Gère la sélection/désélection d'un univers préféré
  const handleFavoriteWorldToggle = (world: FavoriteWorldType) => {
    if (favoriteWorlds.includes(world)) {
      // Si déjà sélectionné, on le retire
      setFavoriteWorlds(prev => prev.filter(w => w !== world));
    } else {
      // Si pas encore sélectionné et qu'on n'a pas atteint la limite
      if (favoriteWorlds.length < 3) {
        setFavoriteWorlds(prev => [...prev, world]);
      } else {
        toast.error("Vous pouvez sélectionner au maximum 3 univers préférés.");
      }
    }
  };

  // Gère la sélection/désélection d'une découverte
  const handleDiscoveryToggle = (discovery: DiscoveryType) => {
    if (discoveries.includes(discovery)) {
      // Si déjà sélectionné, on le retire
      setDiscoveries(prev => prev.filter(d => d !== discovery));
    } else {
      // Si pas encore sélectionné et qu'on n'a pas atteint la limite
      if (discoveries.length < 3) {
        setDiscoveries(prev => [...prev, discovery]);
      } else {
        toast.error("Vous pouvez sélectionner au maximum 3 types de découvertes.");
      }
    }
  };

  // Gère les changements dans les champs de texte personnalisés
  const handleCustomWorldChange = (value: string, fieldNumber: 1 | 2) => {
    if (fieldNumber === 1) {
      setCustomWorld1(value);
    } else {
      setCustomWorld2(value);
    }
  };

  const handleCustomDiscoveryChange = (value: string, fieldNumber: 1 | 2) => {
    if (fieldNumber === 1) {
      setCustomDiscovery1(value);
    } else {
      setCustomDiscovery2(value);
    }
  };

  const handleSubmit = () => {
    // Validation des champs personnalisés si nécessaire
    if (favoriteWorlds.includes("other1") && !customWorld1) {
      toast.error("Veuillez préciser l'univers personnalisé 1");
      return;
    }
    if (favoriteWorlds.includes("other2") && !customWorld2) {
      toast.error("Veuillez préciser l'univers personnalisé 2");
      return;
    }
    if (discoveries.includes("other1") && !customDiscovery1) {
      toast.error("Veuillez préciser la découverte personnalisée 1");
      return;
    }
    if (discoveries.includes("other2") && !customDiscovery2) {
      toast.error("Veuillez préciser la découverte personnalisée 2");
      return;
    }

    // Si tout est valide, on passe à l'étape suivante
    handleNextStep();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-primary flex items-center justify-center gap-2">
        <span className="text-2xl">🌍</span> Univers préféré & ouverture culturelle <span className="text-2xl">✨</span>
      </h2>
      
      <form className="space-y-8">
        {/* Univers préférés */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block">
              Quels sont ses univers préférés ? (3 maximum) 🚀
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
                      {isSelected && <span className="h-4 w-4 text-xs text-white">✓</span>}
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
            {favoriteWorlds.includes("other1") && (
              <div>
                <Label htmlFor="custom-world-1" className="text-sm font-medium">
                  Autre univers (1):
                </Label>
                <Input
                  id="custom-world-1"
                  value={customWorld1}
                  onChange={(e) => handleCustomWorldChange(e.target.value, 1)}
                  placeholder="Précisez l'univers"
                  className="mt-1"
                />
              </div>
            )}
            
            {favoriteWorlds.includes("other2") && (
              <div>
                <Label htmlFor="custom-world-2" className="text-sm font-medium">
                  Autre univers (2):
                </Label>
                <Input
                  id="custom-world-2"
                  value={customWorld2}
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
              Quel type de découvertes aime-t-il faire ? (3 maximum) 🔍
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
                      {isSelected && <span className="h-4 w-4 text-xs text-white">✓</span>}
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
            {discoveries.includes("other1") && (
              <div>
                <Label htmlFor="custom-discovery-1" className="text-sm font-medium">
                  Autre découverte (1):
                </Label>
                <Input
                  id="custom-discovery-1"
                  value={customDiscovery1}
                  onChange={(e) => handleCustomDiscoveryChange(e.target.value, 1)}
                  placeholder="Précisez le type de découverte"
                  className="mt-1"
                />
              </div>
            )}
            
            {discoveries.includes("other2") && (
              <div>
                <Label htmlFor="custom-discovery-2" className="text-sm font-medium">
                  Autre découverte (2):
                </Label>
                <Input
                  id="custom-discovery-2"
                  value={customDiscovery2}
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
            Voir le récapitulatif →
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorldsForm;
