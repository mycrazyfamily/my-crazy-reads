
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
    
    // Empêcher de sélectionner "Non" s'il y a des doudous actifs
    const activeToys = toys.filter(toy => toy.isActive !== false);
    if (!hasToysValue && activeToys.length > 0) {
      toast.error("Veuillez d'abord marquer tous les doudous comme perdus avant de sélectionner 'Non'");
      return;
    }
    
    form.setValue("toys.hasToys", hasToysValue, { shouldDirty: true });
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

  const handleToggleActive = (id: string) => {
    const updatedToys = toys.map(toy => 
      toy.id === id ? { ...toy, isActive: toy.isActive === false ? true : false } : toy
    );
    form.setValue("toys.toys", updatedToys, { shouldDirty: true });
    
    const toy = toys.find(t => t.id === id);
    if (toy?.isActive === false) {
      toast.success("Doudou marqué comme utilisé à nouveau");
    } else {
      toast.success("Doudou marqué comme perdu/non utilisé");
    }
  };

  const handleSaveToy = (toy: ToyData) => {
    const existing = toys.find(t => t.id === toy.id);
    const isEditing = !!existing;
    const merged = isEditing ? { ...existing, ...toy } : toy;
    // S'assurer de ne jamais perdre les champs de liaison
    const safeMerged: ToyData = {
      ...merged,
      comforterId: merged.comforterId ?? existing?.comforterId,
      isActive: merged.isActive ?? existing?.isActive
    };

    const updatedToys = isEditing
      ? toys.map(t => t.id === toy.id ? safeMerged : t)
      : [...toys, safeMerged];
    
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
    // Si l'utilisateur a sélectionné "Oui" mais n'a ajouté aucun doudou (ni actif ni inactif)
    if (hasToys && toys.length === 0) {
      toast.error("Veuillez ajouter au moins un doudou ou objet magique, ou sélectionner \"Non\"");
      return;
    }
    
    // Permettre la validation même si tous les doudous sont perdus
    // Les doudous perdus restent sauvegardés et visibles
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
                <RadioGroupItem 
                  value="false" 
                  id="has-toys-no" 
                  disabled={toys.filter(t => t.isActive !== false).length > 0}
                  className={toys.filter(t => t.isActive !== false).length > 0 ? "opacity-50 cursor-not-allowed" : ""}
                />
                <Label 
                  htmlFor="has-toys-no" 
                  className={toys.filter(t => t.isActive !== false).length > 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                >
                  Non
                </Label>
              </div>
            </RadioGroup>
            {toys.filter(t => t.isActive !== false).length > 0 && (
              <p className="text-sm text-muted-foreground italic mt-2">
                Marquez d'abord tous les doudous comme perdus pour pouvoir sélectionner "Non"
              </p>
            )}
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
                onToggleActive={handleToggleActive}
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
