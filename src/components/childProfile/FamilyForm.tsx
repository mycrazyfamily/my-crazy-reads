
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RELATIVE_TYPE_OPTIONS } from '@/constants/childProfileOptions';
import RelativeForm from './RelativeForm';
import RelativeCard from './RelativeCard';
import type { ChildProfileFormData, RelativeData, RelativeType } from '@/types/childProfile';

type FamilyFormProps = {
  handlePreviousStep: () => void;
  onSubmit: (data: ChildProfileFormData) => void;
};

const FamilyForm: React.FC<FamilyFormProps> = ({
  handlePreviousStep,
  onSubmit
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const [currentRelative, setCurrentRelative] = useState<RelativeData | null>(null);
  const [isEditingRelative, setIsEditingRelative] = useState(false);
  
  const handleAddRelative = () => {
    // Vérifier si des types de proches ont été sélectionnés
    const selectedRelatives = form.getValues().family?.selectedRelatives || [];
    
    if (selectedRelatives.length === 0) {
      toast.error("Veuillez sélectionner au moins un type de proche");
      return;
    }

    // Créer un nouveau proche vide
    const newRelative: RelativeData = {
      id: Date.now().toString(),
      type: selectedRelatives[0], // Par défaut, utiliser le premier type sélectionné
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
    setCurrentRelative({...relative});
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

    // Soumission du formulaire
    form.handleSubmit(onSubmit)();
  };

  // Modifier cette fonction pour éviter la boucle infinie
  const handleRelativeTypeToggle = (relativeType: RelativeType) => {
    const currentValues = form.getValues().family?.selectedRelatives || [];
    let newValues;
    
    if (currentValues.includes(relativeType)) {
      // Remove value
      newValues = currentValues.filter(val => val !== relativeType);
    } else {
      // Add value
      newValues = [...currentValues, relativeType];
    }
    
    form.setValue("family.selectedRelatives", newValues, { shouldDirty: true });
  };
  
  // Récupérer l'état actuel des types de proches sélectionnés
  const selectedRelatives = form.watch("family.selectedRelatives") || [];
  
  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
        <span className="text-2xl">👨‍👩‍👦‍👦</span> Famille et entourage <span className="text-2xl">💞</span>
      </h2>
      
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="family.selectedRelatives"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">👪</span> Qui accompagnera votre enfant dans son aventure ?
              </FormLabel>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {RELATIVE_TYPE_OPTIONS.map((option) => {
                  const isChecked = selectedRelatives.includes(option.value as RelativeType);
                  
                  return (
                    <div 
                      key={option.value}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        isChecked 
                          ? "border-mcf-orange bg-mcf-amber/10" 
                          : "border-gray-200 hover:border-mcf-amber"
                      }`}
                      onClick={() => handleRelativeTypeToggle(option.value as RelativeType)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <div className={`h-4 w-4 border ${isChecked ? "bg-primary border-primary" : "border-primary"} rounded-sm flex items-center justify-center`}>
                            {isChecked && <span className="text-white text-xs">✓</span>}
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
        
        {/* Nom personnalisé pour "autre" */}
        {selectedRelatives.includes('other') && (
          <FormField
            control={form.control}
            name="family.otherRelativeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✨</span> Précisez quel(s) autre(s) type(s) de proche(s)
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: nounou, ami de la famille..." 
                    {...field} 
                    className="border-mcf-amber" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Liste des proches */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Proches ajoutés</h3>
            <Button 
              onClick={handleAddRelative}
              className="bg-mcf-orange hover:bg-mcf-orange-dark text-white"
            >
              <Plus className="mr-1 h-4 w-4" /> Ajouter un proche
            </Button>
          </div>
          
          {form.watch('family.relatives')?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>Aucun proche n'a encore été ajouté.</p>
                <p className="text-sm mt-2">Cliquez sur "Ajouter un proche" pour commencer.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {form.watch('family.relatives')?.map((relative) => (
                <RelativeCard
                  key={relative.id}
                  relative={relative}
                  onEdit={handleEditRelative}
                  onDelete={handleDeleteRelative}
                />
              ))}
            </div>
          )}
        </div>
        
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
            onClick={handleFamilySectionContinue}
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Finaliser le profil
          </Button>
        </div>
      </form>
      
      {isEditingRelative && currentRelative && (
        <RelativeForm
          relative={currentRelative}
          onSave={handleSaveRelative}
          onCancel={handleCancelRelativeEdit}
        />
      )}
    </div>
  );
};

export default FamilyForm;
