
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ChildProfileFormData, ToyData } from '@/types/childProfile';
import ToyForm from './toys/ToyForm';
import ToysList from './toys/ToysList';

type ToysFormProps = {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
};

const ToysForm: React.FC<ToysFormProps> = ({
  handleNextStep,
  handlePreviousStep
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const [isAddingToy, setIsAddingToy] = useState(false);
  const [currentToy, setCurrentToy] = useState<ToyData | null>(null);
  
  // Getter pour hasToys
  const hasToys = form.watch("toys.hasToys");
  
  // Getter pour la liste des doudous
  const toys = form.watch("toys.toys") || [];

  const handleHasToysChange = (value: string) => {
    const hasToysValue = value === "true";
    form.setValue("toys.hasToys", hasToysValue, { shouldDirty: true });
    
    // Si "Non" est sélectionné, réinitialiser la liste des doudous
    if (!hasToysValue) {
      form.setValue("toys.toys", [], { shouldDirty: true });
    }
  };

  const handleAddToy = () => {
    setCurrentToy(null);
    setIsAddingToy(true);
  };

  const handleEditToy = (toy: ToyData) => {
    setCurrentToy(toy);
    setIsAddingToy(true);
  };

  const handleDeleteToy = (id: string) => {
    const updatedToys = toys.filter(toy => toy.id !== id);
    form.setValue("toys.toys", updatedToys, { shouldDirty: true });
    toast.success("Doudou supprimé avec succès");
  };

  const handleSaveToy = (toy: ToyData) => {
    const isEditing = toys.some(t => t.id === toy.id);
    let updatedToys;
    
    if (isEditing) {
      updatedToys = toys.map(t => t.id === toy.id ? toy : t);
    } else {
      updatedToys = [...toys, toy];
    }
    
    form.setValue("toys.toys", updatedToys, { shouldDirty: true });
    setIsAddingToy(false);
    setCurrentToy(null);
    
    toast.success(isEditing 
      ? "Doudou modifié avec succès" 
      : "Doudou ajouté avec succès"
    );
  };

  const handleCancelToyForm = () => {
    setIsAddingToy(false);
    setCurrentToy(null);
  };

  const handleToysSectionContinue = () => {
    if (hasToys && toys.length === 0) {
      toast.error("Veuillez ajouter au moins un doudou ou objet magique, ou sélectionner \"Non\"");
      return;
    }
    
    handleNextStep();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-primary flex items-center justify-center gap-2">
        <span className="text-2xl">🧸</span> Doudous et objets magiques <span className="text-2xl">🪄</span>
      </h2>
      
      {!isAddingToy ? (
        <div className="space-y-8">
          {/* Question sur la présence de doudous */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Votre enfant a-t-il un doudou ou un objet fétiche ? 🧸
            </Label>
            
            <RadioGroup 
              defaultValue={hasToys ? "true" : "false"}
              onValueChange={handleHasToysChange}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="has-toys-yes" />
                <Label htmlFor="has-toys-yes" className="cursor-pointer">Oui</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="has-toys-no" />
                <Label htmlFor="has-toys-no" className="cursor-pointer">Non</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Section d'ajout de doudous (visible uniquement si "Oui" est sélectionné) */}
          {hasToys && (
            <div className="space-y-6">
              <Button
                type="button"
                onClick={handleAddToy}
                className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-semibold"
              >
                Ajouter un doudou +
              </Button>
              
              <ToysList 
                toys={toys} 
                onEditToy={handleEditToy} 
                onDeleteToy={handleDeleteToy} 
              />
            </div>
          )}
          
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
              onClick={handleToysSectionContinue}
              className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Passer à l'étape suivante →
            </Button>
          </div>
        </div>
      ) : (
        <ToyForm 
          toy={currentToy || undefined} 
          onSave={handleSaveToy} 
          onCancel={handleCancelToyForm} 
        />
      )}
    </div>
  );
};

export default ToysForm;
