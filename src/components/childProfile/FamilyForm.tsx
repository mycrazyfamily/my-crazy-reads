
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ChildProfileFormData, RelativeData, RelativeType, RelativeGender } from '@/types/childProfile';
import RelativeForm from './RelativeForm';
import RelativeTypeSelection from './relatives/RelativeTypeSelection';
import RelativesList from './relatives/RelativesList';

type FamilyFormProps = {
  handlePreviousStep: () => void;
  onSubmit: () => void;
};

// Helper function to determine gender based on relative type
const getRelativeGender = (type: RelativeType): RelativeGender => {
  const femaleTypes = ["mother", "sister", "grandmother", "femaleCousin", "femaleFriend"];
  const maleTypes = ["father", "brother", "grandfather", "maleCousin", "maleFriend"];
  
  if (femaleTypes.includes(type)) return "female";
  if (maleTypes.includes(type)) return "male";
  return "neutral";
};

const FamilyForm: React.FC<FamilyFormProps> = ({
  handlePreviousStep,
  onSubmit
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const [currentRelative, setCurrentRelative] = useState<RelativeData | null>(null);
  const [isEditingRelative, setIsEditingRelative] = useState(false);
  
  const handleAddRelative = (relativeType: RelativeType) => {
    const gender = getRelativeGender(relativeType);

    // Créer un nouveau proche vide
    const newRelative: RelativeData = {
      id: Date.now().toString(),
      type: relativeType,
      gender: gender,
      firstName: '',
      nickname: { type: "none" },
      age: '',
      job: '',
      skinColor: { type: "light" },
      hairColor: { type: "blonde" },
      hairType: "straight",
      glasses: false,
      traits: [],
    };

    setCurrentRelative(newRelative);
    setIsEditingRelative(true);
  };

  const handleSaveRelative = (relative: RelativeData) => {
    // Validation basique
    if (!relative.firstName) {
      toast.error("Le prénom est requis");
      return;
    }

    if (relative.traits.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 traits de caractère");
      return;
    }

    // Récupérer la liste actuelle des proches
    const currentRelatives = form.getValues().family?.relatives || [];
    
    // Ajouter ou mettre à jour le proche
    const updatedRelatives = currentRelatives.some(r => r.id === relative.id)
      ? currentRelatives.map(r => r.id === relative.id ? relative : r)
      : [...currentRelatives, relative];
    
    // Mettre à jour le formulaire
    form.setValue("family.relatives", updatedRelatives);
    
    // Réinitialiser l'état de sélection après avoir sauvegardé un proche
    form.setValue("family.selectedRelatives", []);
    
    // Réinitialiser l'état
    setCurrentRelative(null);
    setIsEditingRelative(false);
    
    toast.success(
      currentRelatives.some(r => r.id === relative.id) 
        ? "Proche modifié avec succès !" 
        : "Proche ajouté avec succès !"
    );
  };

  const handleEditRelative = (relative: RelativeData) => {
    // Ensure the relative has a gender property
    const relativeWithGender = {
      ...relative,
      gender: relative.gender || getRelativeGender(relative.type)
    };
    
    setCurrentRelative(relativeWithGender);
    setIsEditingRelative(true);
  };

  const handleDeleteRelative = (id: string) => {
    // Récupérer la liste actuelle des proches
    const currentRelatives = form.getValues().family?.relatives || [];
    
    // Filtrer pour retirer le proche à supprimer
    const updatedRelatives = currentRelatives.filter(r => r.id !== id);
    
    // Mettre à jour le formulaire
    form.setValue("family.relatives", updatedRelatives);
    
    toast.success("Proche supprimé avec succès !");
  };

  const handleCancelRelativeEdit = () => {
    setCurrentRelative(null);
    setIsEditingRelative(false);
  };

  const handleFamilySectionContinue = () => {
    // Vérifier si au moins un proche a été ajouté
    const relatives = form.getValues().family?.relatives || [];
    
    if (relatives.length === 0) {
      toast.error("Veuillez ajouter au moins un proche");
      return;
    }

    // Passer à l'étape suivante (animaux de compagnie) au lieu de soumettre le formulaire
    onSubmit();
  };

  // Simplifier le toggle pour qu'un seul type puisse être sélectionné à la fois
  const handleRelativeTypeToggle = (relativeType: RelativeType) => {
    const currentValues = form.getValues().family?.selectedRelatives || [];
    let newValues;
    
    if (currentValues.includes(relativeType)) {
      // Désélectionner
      newValues = [];
    } else {
      // Sélectionner uniquement ce type
      newValues = [relativeType];
    }
    
    form.setValue("family.selectedRelatives", newValues, { shouldDirty: true });
  };
  
  // Récupérer l'état actuel des types de proches sélectionnés
  const selectedRelatives = form.watch("family.selectedRelatives") || [];
  const relatives = form.watch("family.relatives") || [];
  
  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
        <span className="text-2xl">👨‍👩‍👦‍👦</span> Famille et entourage <span className="text-2xl">💞</span>
      </h2>
      
      {!isEditingRelative ? (
        <form className="space-y-8">
          <RelativeTypeSelection 
            selectedRelatives={selectedRelatives}
            handleRelativeTypeToggle={handleRelativeTypeToggle}
            onAddRelative={handleAddRelative}
          />
          
          <RelativesList
            relatives={relatives}
            onEditRelative={handleEditRelative}
            onDeleteRelative={handleDeleteRelative}
          />
          
          {/* Section de confirmation et bouton de finalisation */}
          <div className="mt-10 space-y-6">
            <div className="bg-mcf-amber/10 p-4 rounded-lg border border-mcf-amber/30">
              <p className="text-center text-gray-700">
                Avez-vous ajouté tous les personnages importants pour votre enfant ?<br />
                <span className="text-sm italic">Pas d'inquiétude, vous pourrez en ajouter d'autres plus tard dans votre espace famille 😉</span>
              </p>
            </div>
            
            <div className="pt-4 flex justify-between items-center">
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
                onClick={handleFamilySectionContinue}
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Oui, j'ai ajouté tous les proches ! 🧡
              </Button>
            </div>
          </div>
        </form>
      ) : currentRelative && (
        <div className="animate-fade-in">
          <RelativeForm
            relative={currentRelative}
            onSave={handleSaveRelative}
            onCancel={handleCancelRelativeEdit}
          />
        </div>
      )}
    </div>
  );
};

export default FamilyForm;
