
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { 
  SUPERPOWERS_OPTIONS, 
  PASSIONS_OPTIONS, 
  CHALLENGES_OPTIONS 
} from '@/constants/childProfileOptions';
import type { ChildProfileFormData } from '@/types/childProfile';

type PersonalityFormProps = {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
};

const PersonalityForm: React.FC<PersonalityFormProps> = ({
  handleNextStep,
  handlePreviousStep
}) => {
  const form = useFormContext<ChildProfileFormData>();

  const handleContinue = () => {
    // Vérifier si les champs de la section 2 sont valides
    const superpowers = form.getValues().superpowers || [];
    const passions = form.getValues().passions || [];
    const challenges = form.getValues().challenges || [];

    // Validation des sélections maximales
    if (superpowers.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 super-pouvoirs");
      return;
    }
    if (passions.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 passions");
      return;
    }
    if (challenges.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 défis");
      return;
    }

    // Passer à l'étape suivante
    handleNextStep();
  };

  const handleOptionToggle = (field: 'superpowers' | 'passions' | 'challenges', value: string) => {
    const currentValues = form.getValues()[field] || [];
    
    if (currentValues.includes(value)) {
      // Remove value
      form.setValue(
        field, 
        currentValues.filter(val => val !== value)
      );
    } else {
      // Add value if less than 3 selected
      if (currentValues.length < 3) {
        form.setValue(field, [...currentValues, value]);
      } else {
        toast.error(`Vous pouvez sélectionner 3 ${field === 'superpowers' ? 'super-pouvoirs' : field === 'passions' ? 'passions' : 'défis'} maximum`);
      }
    }
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
        <span className="text-2xl">🎭</span> Personnalité et passions <span className="text-2xl">🚀</span>
      </h2>
      
      <form className="space-y-8">
        {/* Taille par rapport à son âge */}
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">📏</span> Comment est sa taille par rapport à son âge ?
              </FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {[
                  { value: "small", label: "Petit(e) pour son âge" },
                  { value: "medium", label: "Taille moyenne" },
                  { value: "tall", label: "Grand(e) pour son âge" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      field.value === option.value
                        ? "border-mcf-orange bg-mcf-amber/10"
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => form.setValue("height", option.value as any)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Super-pouvoirs */}
        <FormField
          control={form.control}
          name="superpowers"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">🦸‍♀️</span> Quels sont les super-pouvoirs de votre enfant ? (3 max)
              </FormLabel>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {SUPERPOWERS_OPTIONS.map((option) => {
                  const isSelected = form.watch('superpowers')?.includes(option.value);
                  const totalSelected = form.watch('superpowers')?.length || 0;
                  const isDisabled = !isSelected && totalSelected >= 3;
                  
                  return (
                    <div 
                      key={option.value}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-mcf-orange bg-mcf-amber/10" 
                          : isDisabled 
                            ? "border-gray-200 opacity-60 cursor-not-allowed"
                            : "border-gray-200 hover:border-mcf-amber"
                      }`}
                      onClick={() => {
                        if (!isDisabled || isSelected) {
                          handleOptionToggle('superpowers', option.value);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-primary"
                          }`}>
                            {isSelected && <span className="text-xs text-white">✓</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-xl mb-1">{option.icon}</div>
                          <div>{option.label}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Passions */}
        <FormField
          control={form.control}
          name="passions"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">💖</span> Qu'aime le plus votre enfant ? (3 max)
              </FormLabel>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                {PASSIONS_OPTIONS.map((option) => {
                  const isSelected = form.watch('passions')?.includes(option.value);
                  const totalSelected = form.watch('passions')?.length || 0;
                  const isDisabled = !isSelected && totalSelected >= 3;
                  
                  return (
                    <div 
                      key={option.value}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-mcf-orange bg-mcf-amber/10" 
                          : isDisabled 
                            ? "border-gray-200 opacity-60 cursor-not-allowed"
                            : "border-gray-200 hover:border-mcf-amber"
                      }`}
                      onClick={() => {
                        if (!isDisabled || isSelected) {
                          handleOptionToggle('passions', option.value);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-primary"
                          }`}>
                            {isSelected && <span className="text-xs text-white">✓</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-xl mb-1">{option.icon}</div>
                          <div>{option.label}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Défis */}
        <FormField
          control={form.control}
          name="challenges"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">🏆</span> Quels sont les grands défis de votre enfant ? (3 max)
              </FormLabel>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {CHALLENGES_OPTIONS.map((option) => {
                  const isSelected = form.watch('challenges')?.includes(option.value);
                  const totalSelected = form.watch('challenges')?.length || 0;
                  const isDisabled = !isSelected && totalSelected >= 3;
                  
                  return (
                    <div 
                      key={option.value}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-mcf-orange bg-mcf-amber/10" 
                          : isDisabled 
                            ? "border-gray-200 opacity-60 cursor-not-allowed"
                            : "border-gray-200 hover:border-mcf-amber"
                      }`}
                      onClick={() => {
                        if (!isDisabled || isSelected) {
                          handleOptionToggle('challenges', option.value);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-primary"
                          }`}>
                            {isSelected && <span className="text-xs text-white">✓</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-xl mb-1">{option.icon}</div>
                          <div>{option.label}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <FormMessage />
            </FormItem>
          )}
        />

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
            onClick={handleContinue}
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Continuer l'aventure →
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalityForm;
