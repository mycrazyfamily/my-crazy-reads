
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FAVORITE_WORLDS_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';
import type { ChildProfileFormData, FavoriteWorldType, DiscoveryType } from '@/types/childProfile';

type WorldsFormProps = {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
};

const MAX_SELECTIONS = 3;

const WorldsForm: React.FC<WorldsFormProps> = ({
  handleNextStep,
  handlePreviousStep
}) => {
  const form = useFormContext<ChildProfileFormData>();
  
  // État local pour les sélections
  const [favoriteWorlds, setFavoriteWorlds] = useState<FavoriteWorldType[]>(
    form.getValues("worlds.favoriteWorlds") || []
  );
  const [discoveries, setDiscoveries] = useState<DiscoveryType[]>(
    form.getValues("worlds.discoveries") || []
  );

  // Met à jour le formulaire quand les états locaux changent
  useEffect(() => {
    form.setValue("worlds.favoriteWorlds", favoriteWorlds, { shouldDirty: true });
  }, [favoriteWorlds, form]);

  useEffect(() => {
    form.setValue("worlds.discoveries", discoveries, { shouldDirty: true });
  }, [discoveries, form]);

  // Gestionnaires pour les changements de sélection
  const handleFavoriteWorldToggle = (value: FavoriteWorldType) => {
    setFavoriteWorlds(prev => {
      if (prev.includes(value)) {
        return prev.filter(w => w !== value);
      } else {
        // Limiter à 3 sélections maximum
        if (prev.length < MAX_SELECTIONS) {
          return [...prev, value];
        }
        return prev;
      }
    });
  };

  const handleDiscoveryToggle = (value: DiscoveryType) => {
    // Si "Rien de tout cela" est sélectionné, désélectionner les autres options
    if (value === 'nothing') {
      setDiscoveries(prev => {
        if (prev.includes('nothing')) {
          return prev.filter(d => d !== 'nothing');
        } else {
          return ['nothing'];
        }
      });
      return;
    }

    // Si on sélectionne une autre option, désélectionner "Rien de tout cela"
    setDiscoveries(prev => {
      const withoutNothing = prev.filter(d => d !== 'nothing');
      
      if (prev.includes(value)) {
        return withoutNothing.filter(d => d !== value);
      } else {
        // Limiter à 3 sélections maximum
        if (withoutNothing.length < MAX_SELECTIONS) {
          return [...withoutNothing, value];
        }
        return withoutNothing;
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Soumettre le formulaire
    form.handleSubmit(() => {
      handleNextStep();
    })();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2 text-mcf-orange flex items-center justify-center gap-2">
        <span className="text-2xl">🌍</span> Univers préféré & ouverture culturelle <span className="text-2xl">🌟</span>
      </h2>
      
      <p className="text-center text-gray-600 mb-8">
        Quels mondes voulez-vous explorer avec votre enfant ? 🌟
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Univers préférés */}
        <div className="space-y-4">
          <Label className="text-base font-medium block mb-2">
            Quels sont ses univers préférés ? <span className="text-sm text-gray-500 font-normal">(3 maximum)</span>
          </Label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {FAVORITE_WORLDS_OPTIONS.map((world) => {
              const isSelected = favoriteWorlds.includes(world.value);
              const isDisabled = favoriteWorlds.length >= MAX_SELECTIONS && !isSelected;
              
              return (
                <div
                  key={world.value}
                  className={`relative flex items-center rounded-md border p-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-mcf-amber/20 border-mcf-amber' 
                      : isDisabled 
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed' 
                        : 'bg-white border-mcf-amber/30 hover:bg-mcf-amber/5'
                  }`}
                  onClick={() => !isDisabled && handleFavoriteWorldToggle(world.value)}
                >
                  <Checkbox
                    id={`world-${world.value}`}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && handleFavoriteWorldToggle(world.value)}
                    className="mr-2"
                  />
                  <Label
                    htmlFor={`world-${world.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                  >
                    <span className="text-xl">{world.icon}</span>
                    <span>{world.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Découvertes */}
        <div className="space-y-4">
          <Label className="text-base font-medium block mb-2">
            Aime-t-il découvrir... <span className="text-sm text-gray-500 font-normal">(3 maximum)</span>
          </Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DISCOVERY_OPTIONS.map((discovery) => {
              const isSelected = discoveries.includes(discovery.value);
              const isDisabled = discovery.value !== 'nothing' && 
                                discoveries.length >= MAX_SELECTIONS && 
                                !isSelected && 
                                !discoveries.includes('nothing');
              
              return (
                <div
                  key={discovery.value}
                  className={`relative flex items-center rounded-md border p-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-mcf-amber/20 border-mcf-amber' 
                      : isDisabled 
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed' 
                        : 'bg-white border-mcf-amber/30 hover:bg-mcf-amber/5'
                  }`}
                  onClick={() => !isDisabled && handleDiscoveryToggle(discovery.value)}
                >
                  <Checkbox
                    id={`discovery-${discovery.value}`}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && handleDiscoveryToggle(discovery.value)}
                    className="mr-2"
                  />
                  <Label
                    htmlFor={`discovery-${discovery.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                  >
                    <span className="text-xl">{discovery.icon}</span>
                    <span>{discovery.label}</span>
                  </Label>
                </div>
              );
            })}
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
            type="submit"
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Terminer le profil →
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorldsForm;
