
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ChildProfileFormData, PetData } from '@/types/childProfile';
import PetForm from './pets/PetForm';
import PetsList from './pets/PetsList';

type PetsFormProps = {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
};

const PetsForm: React.FC<PetsFormProps> = ({
  handleNextStep,
  handlePreviousStep
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [currentPet, setCurrentPet] = useState<PetData | null>(null);
  
  // Getter pour hasPets
  const hasPets = form.watch("pets.hasPets");
  
  // Getter pour la liste des animaux
  const pets = form.watch("pets.pets") || [];

  const handleHasPetsChange = (value: string) => {
    const hasPetsValue = value === "true";
    form.setValue("pets.hasPets", hasPetsValue, { shouldDirty: true });
    
    // Si "Non" est sélectionné, réinitialiser la liste des animaux
    if (!hasPetsValue) {
      form.setValue("pets.pets", [], { shouldDirty: true });
    }
  };

  const handleAddPet = () => {
    setCurrentPet(null);
    setIsAddingPet(true);
  };

  const handleEditPet = (pet: PetData) => {
    setCurrentPet(pet);
    setIsAddingPet(true);
  };

  const handleDeletePet = (id: string) => {
    const updatedPets = pets.filter(pet => pet.id !== id);
    form.setValue("pets.pets", updatedPets, { shouldDirty: true });
    toast.success("Animal supprimé avec succès");
  };

  const handleSavePet = (pet: PetData) => {
    const isEditing = pets.some(p => p.id === pet.id);
    let updatedPets;
    
    if (isEditing) {
      updatedPets = pets.map(p => p.id === pet.id ? pet : p);
    } else {
      updatedPets = [...pets, pet];
    }
    
    form.setValue("pets.pets", updatedPets, { shouldDirty: true });
    setIsAddingPet(false);
    setCurrentPet(null);
    
    toast.success(isEditing 
      ? "Animal modifié avec succès" 
      : "Animal ajouté avec succès"
    );
  };

  const handleCancelPetForm = () => {
    setIsAddingPet(false);
    setCurrentPet(null);
  };

  const handlePetsSectionContinue = () => {
    if (hasPets && pets.length === 0) {
      toast.error("Veuillez ajouter au moins un animal de compagnie ou sélectionner \"Non\"");
      return;
    }
    
    handleNextStep();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-primary flex items-center justify-center gap-2">
        <span className="text-2xl">🐾</span> Animaux de compagnie <span className="text-2xl">🐱</span>
      </h2>
      
      {!isAddingPet ? (
        <form className="space-y-8">
          {/* Question sur la présence d'animaux */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Votre enfant a-t-il un animal de compagnie ? 🐶🐱
            </Label>
            
            <RadioGroup 
              defaultValue={hasPets ? "true" : "false"}
              onValueChange={handleHasPetsChange}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="has-pets-yes" />
                <Label htmlFor="has-pets-yes" className="cursor-pointer">Oui</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="has-pets-no" />
                <Label htmlFor="has-pets-no" className="cursor-pointer">Non</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Section d'ajout d'animaux (visible uniquement si "Oui" est sélectionné) */}
          {hasPets && (
            <div className="space-y-6">
              <Button
                type="button"
                onClick={handleAddPet}
                className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-semibold"
              >
                Ajouter un animal +
              </Button>
              
              <PetsList 
                pets={pets} 
                onEditPet={handleEditPet} 
                onDeletePet={handleDeletePet} 
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
              onClick={handlePetsSectionContinue}
              className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Passer à l'étape suivante →
            </Button>
          </div>
        </form>
      ) : (
        <PetForm 
          pet={currentPet || undefined} 
          onSave={handleSavePet} 
          onCancel={handleCancelPetForm} 
        />
      )}
    </div>
  );
};

export default PetsForm;
