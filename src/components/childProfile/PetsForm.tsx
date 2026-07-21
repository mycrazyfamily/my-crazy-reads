import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ChildProfileFormData, PetData } from '@/types/childProfile';
import PetForm from './pets/PetForm';
import PetsList from './pets/PetsList';
import ExistingPetsList from './pets/ExistingPetsList';
import { supabase } from "@/integrations/supabase/client";

type PetsFormProps = {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
};

type ExistingPet = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  family_id: string;
};

const PetsForm: React.FC<PetsFormProps> = ({
  handleNextStep,
  handlePreviousStep
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [currentPet, setCurrentPet] = useState<PetData | null>(null);
  const [existingPets, setExistingPets] = useState<ExistingPet[]>([]);
  const [selectedExistingPetIds, setSelectedExistingPetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Getter pour hasPets
  const hasPets = form.watch("pets.hasPets");
  
  // Getter pour la liste des animaux
  const pets = form.watch("pets.pets") || [];

  // Revenir en haut quand on ouvre/ferme le sous-formulaire d'un animal
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAddingPet]);

  // Charger les animaux existants de la famille
  useEffect(() => {
    const loadExistingPets = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user found');
          setLoading(false);
          return;
        }

        // Charger le family_id de l'utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading user profile:', profileError);
          setLoading(false);
          return;
        }

        let petsFromTable: ExistingPet[] = [];

        // Si l'utilisateur a un family_id, charger depuis pets
        if (profile?.family_id) {
          console.log('Loading pets for family_id:', profile.family_id);

          const { data: pets, error: petsError } = await supabase
            .from('pets')
            .select('id, name, type, emoji, family_id')
            .eq('family_id', profile.family_id);

          if (petsError) {
            console.error('Error loading pets:', petsError);
          } else if (pets && pets.length > 0) {
            petsFromTable = pets.map((pet: any) => ({
              id: pet.id,
              name: pet.name || 'Sans nom',
              type: pet.type || 'animal',
              emoji: pet.emoji || '🐾',
              family_id: pet.family_id || ''
            }));
            console.log('Loaded pets:', petsFromTable);
          }
        }

        // Fallback: si pas de family_id, chercher la famille créée par l'utilisateur
        if (!profile?.family_id && petsFromTable.length === 0) {
          console.log('No family_id, trying to find family...');
          
          const { data: families, error: familiesError } = await supabase
            .from('families')
            .select('id')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (familiesError) {
            console.error('Error loading families:', familiesError);
          } else if (families && families.length > 0) {
            const familyId = families[0].id;
            console.log('Found family:', familyId);
            
            // Mémoriser sur le profil
            await supabase
              .from('user_profiles')
              .update({ family_id: familyId })
              .eq('id', user.id);

            // Charger les animaux de cette famille
            const { data: pets, error: petsError } = await supabase
              .from('pets')
              .select('id, name, type, emoji, family_id')
              .eq('family_id', familyId);

            if (petsError) {
              console.error('Error loading pets:', petsError);
            } else if (pets && pets.length > 0) {
              petsFromTable = pets.map((pet: any) => ({
                id: pet.id,
                name: pet.name || 'Sans nom',
                type: pet.type || 'animal',
                emoji: pet.emoji || '🐾',
                family_id: pet.family_id || ''
              }));
              console.log('Loaded pets from fallback:', petsFromTable);
            }
          }
        }

        if (petsFromTable.length > 0) {
          setExistingPets(petsFromTable);
        } else {
          console.log('No pets found');
        }
      } catch (error) {
        console.error('Error loading existing pets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingPets();
  }, []);

  // Restaurer les sélections d'animaux existants depuis le formulaire
  useEffect(() => {
    const savedIds = form.getValues().pets?.existingPetsData?.map((pet: any) => pet.id) || [];
    if (savedIds.length > 0) {
      setSelectedExistingPetIds(savedIds);
    }
  }, [form]);

  // Gérer la sélection/désélection des animaux existants
  const handleToggleExistingPet = (petId: string) => {
    setSelectedExistingPetIds(prev => {
      const newIds = prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId];
      
      // Sauvegarder immédiatement dans le formulaire
      const selectedPetsData = existingPets.filter(p => newIds.includes(p.id));
      form.setValue("pets.existingPetsData", selectedPetsData as any, { shouldDirty: true });
      
      return newIds;
    });
  };

  const handleHasPetsChange = (value: string) => {
    const hasPetsValue = value === "true";
    form.setValue("pets.hasPets", hasPetsValue, { shouldDirty: true });
    
    // Si "Non" est sélectionné, réinitialiser la liste des animaux et les sélections
    if (!hasPetsValue) {
      form.setValue("pets.pets", [], { shouldDirty: true });
      setSelectedExistingPetIds([]);
      form.setValue("pets.existingPetsData", [], { shouldDirty: true });
    }
  };

  const handleAddPet = () => {
    setCurrentPet(null);
    setIsAddingPet(true);
  };

  const handleEditPet = (pet: PetData) => {
    // Récupérer les liens d'enfants depuis le formulaire
    const petChildLinks = form.getValues().pets?.petChildLinks || {};
    const linkedChildrenIds = petChildLinks[pet.id || ''] || [];
    
    // Passer les liens au formulaire d'édition
    const petWithLinks = {
      ...pet,
      linkedChildrenIds
    };
    
    setCurrentPet(petWithLinks);
    setIsAddingPet(true);
  };

  const handleDeletePet = (id: string) => {
    const updatedPets = pets.filter(pet => pet.id !== id);
    form.setValue("pets.pets", updatedPets, { shouldDirty: true });
  };

  const handleSavePet = (pet: PetData, selectedChildrenIds?: string[]) => {
    console.log('🐕 handleSavePet - pet reçu:', pet);
    console.log('🐕 handleSavePet - pet.customTraits:', pet.customTraits);
    
    // Sauvegarder les IDs des enfants sélectionnés pour les liens ultérieurs
    if (selectedChildrenIds && selectedChildrenIds.length > 0) {
      const existingLinks = form.getValues().pets?.petChildLinks || {};
      const petId = pet.id || Date.now().toString();
      
      form.setValue("pets.petChildLinks", {
        ...existingLinks,
        [petId]: selectedChildrenIds
      });
    }

    const isEditing = pets.some(p => p.id === pet.id);
    let updatedPets;
    
    if (isEditing) {
      updatedPets = pets.map(p => p.id === pet.id ? pet : p);
    } else {
      updatedPets = [...pets, pet];
    }
    
    console.log('🐕 handleSavePet - updatedPets:', updatedPets);
    form.setValue("pets.pets", updatedPets, { shouldDirty: true });
    setIsAddingPet(false);
    setCurrentPet(null);
  };

  const handleCancelPetForm = () => {
    setIsAddingPet(false);
    setCurrentPet(null);
  };

  const handlePetsSectionContinue = () => {
    // Vérification obligatoire de la réponse à la question "Oui/Non"
    if (hasPets === undefined || hasPets === null) {
      toast.error("Veuillez répondre à la question sur la présence d'un animal de compagnie");
      return;
    }

    // Sauvegarder les données des animaux existants sélectionnés
    const selectedPetsData = existingPets.filter(p => 
      selectedExistingPetIds.includes(p.id)
    );
    
    form.setValue("pets.existingPetsData", selectedPetsData as any);
    
    if (hasPets && pets.length === 0 && selectedExistingPetIds.length === 0) {
      toast.error("Veuillez ajouter ou sélectionner au moins un animal de compagnie");
      return;
    }
    
    handleNextStep();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-primary">
        Animaux de compagnie
      </h2>
      
      {!isAddingPet ? (
        <div className="space-y-8">
          {/* Question sur la présence d'animaux */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Votre enfant a-t-il un animal de compagnie ?
            </Label>
            
            <RadioGroup 
              value={hasPets === true ? "true" : hasPets === false ? "false" : undefined}
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
              {/* Liste des animaux existants à sélectionner */}
              {!loading && existingPets.length > 0 && (
                <ExistingPetsList 
                  existingPets={existingPets}
                  selectedPetIds={selectedExistingPetIds}
                  onTogglePet={handleToggleExistingPet}
                />
              )}

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-mcf-primary mb-4">Ajouter un nouvel animal</h3>
                <Button
                  type="button"
                  onClick={handleAddPet}
                  className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un nouvel animal
                </Button>
              </div>
              
              <PetsList 
                pets={pets} 
                onEditPet={handleEditPet} 
                onDeletePet={handleDeletePet} 
              />
            </div>
          )}
          
          {/* Boutons de navigation */}
          <div className="pt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button 
              type="button" 
              onClick={handlePreviousStep}
              variant="outline"
              className="font-semibold w-full sm:w-auto"
            >
              ← Retour
            </Button>
            
            <Button 
              type="button" 
              onClick={handlePetsSectionContinue}
              className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto h-auto whitespace-normal sm:whitespace-nowrap leading-tight"
            >
              Passer à l'étape suivante →
            </Button>
          </div>
        </div>
      ) : (
        <PetForm 
          pet={currentPet || undefined} 
          onSave={handleSavePet} 
          onCancel={handleCancelPetForm}
          isCreatingNewChild={true}
        />
      )}
    </div>
  );
};

export default PetsForm;
