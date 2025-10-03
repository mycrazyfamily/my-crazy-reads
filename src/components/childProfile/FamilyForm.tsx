import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ChildProfileFormData, RelativeData, RelativeType, RelativeGender } from '@/types/childProfile';
import RelativeForm from './RelativeForm';
import RelativeTypeSelection from './relatives/RelativeTypeSelection';
import RelativesList from './relatives/RelativesList';
import ExistingRelativesList from './relatives/ExistingRelativesList';
import { supabase } from "@/integrations/supabase/client";
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
type ExistingRelative = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  family_id: string;
};

const FamilyForm: React.FC<FamilyFormProps> = ({
  handlePreviousStep,
  onSubmit
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const [currentRelative, setCurrentRelative] = useState<RelativeData | null>(null);
  const [isEditingRelative, setIsEditingRelative] = useState(false);
  const [existingRelatives, setExistingRelatives] = useState<ExistingRelative[]>([]);
  const [selectedExistingRelativeIds, setSelectedExistingRelativeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les proches existants de la famille
  useEffect(() => {
    const loadExistingRelatives = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Récupérer le family_id de l'utilisateur
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();

        if (!profile?.family_id) {
          setLoading(false);
          return;
        }

        // Récupérer tous les family_members de cette famille
        const { data: familyMembers, error } = await supabase
          .from('family_members')
          .select('*')
          .eq('family_id', profile.family_id);

        if (error) {
          console.error('Error loading family members:', error);
          setLoading(false);
          return;
        }

        if (familyMembers) {
          setExistingRelatives(familyMembers.map(fm => ({
            id: fm.id,
            name: fm.name || 'Sans nom',
            role: fm.role || 'Proche',
            avatar: fm.avatar || '👤',
            family_id: fm.family_id || ''
          })));
        }
      } catch (error) {
        console.error('Error loading existing relatives:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingRelatives();
  }, []);

  // Gérer la sélection/désélection des proches existants
  const handleToggleExistingRelative = (relativeId: string) => {
    setSelectedExistingRelativeIds(prev => {
      if (prev.includes(relativeId)) {
        return prev.filter(id => id !== relativeId);
      } else {
        return [...prev, relativeId];
      }
    });
  };
  const handleAddRelative = (relativeType: RelativeType) => {
    const gender = getRelativeGender(relativeType);

    // Créer un nouveau proche vide
    const newRelative: RelativeData = {
      id: Date.now().toString(),
      type: relativeType,
      gender: gender,
      firstName: '',
      nickname: {
        type: "none"
      },
      age: '',
      birthDate: undefined,
      job: '',
      skinColor: {
        type: "light"
      },
      hairColor: {
        type: "blonde"
      },
      hairType: "straight",
      glasses: false,
      traits: []
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
    const updatedRelatives = currentRelatives.some(r => r.id === relative.id) ? currentRelatives.map(r => r.id === relative.id ? relative : r) : [...currentRelatives, relative];

    // Mettre à jour le formulaire
    form.setValue("family.relatives", updatedRelatives);

    // Réinitialiser l'état de sélection après avoir sauvegardé un proche
    form.setValue("family.selectedRelatives", []);

    // Réinitialiser l'état
    setCurrentRelative(null);
    setIsEditingRelative(false);
    toast.success(currentRelatives.some(r => r.id === relative.id) ? "Proche modifié avec succès !" : "Proche ajouté avec succès !");
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
    // Sauvegarder les IDs des proches existants sélectionnés dans le formulaire
    form.setValue("family.existingRelativeIds", selectedExistingRelativeIds);
    
    // Suppression de la vérification obligatoire des proches
    // Le formulaire permet maintenant de continuer même sans ajouter de proche
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
    form.setValue("family.selectedRelatives", newValues, {
      shouldDirty: true
    });
  };

  // Récupérer l'état actuel des types de proches sélectionnés
  const selectedRelatives = form.watch("family.selectedRelatives") || [];
  const relatives = form.watch("family.relatives") || [];
  return <div className="mb-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-mcf-primary flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">👨‍👩‍👦‍👦</span> Famille et entourage <span className="text-2xl">💞</span>
        </h2>
        <p className="text-sm text-gray-600 italic">Vous pourrez toujours ajouter ou modifier les membres de la famille plus tard si vous le souhaitez</p>
      </div>
      
      {!isEditingRelative ? <form className="space-y-8">
          {/* Liste des proches existants à sélectionner */}
          {!loading && existingRelatives.length > 0 && (
            <ExistingRelativesList 
              existingRelatives={existingRelatives}
              selectedRelativeIds={selectedExistingRelativeIds}
              onToggleRelative={handleToggleExistingRelative}
            />
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-mcf-primary mb-4">Ajouter un nouveau proche</h3>
            <RelativeTypeSelection selectedRelatives={selectedRelatives} handleRelativeTypeToggle={handleRelativeTypeToggle} onAddRelative={handleAddRelative} />
          </div>
          
          <RelativesList relatives={relatives} onEditRelative={handleEditRelative} onDeleteRelative={handleDeleteRelative} />
          
          {/* Section de confirmation et bouton de finalisation */}
          <div className="mt-10 space-y-6">
            <div className="bg-gradient-to-r from-mcf-mint/20 to-mcf-amber/20 p-6 rounded-xl border-2 border-mcf-primary/20 shadow-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-mcf-primary mb-2">
                  Avez-vous ajouté tous les personnages importants pour votre enfant ?
                </h3>
                <p className="text-mcf-orange-dark font-medium">
                  Pas d'inquiétude, vous pourrez en ajouter d'autres plus tard dans votre espace famille 😉
                </p>
              </div>
            </div>
            
            <div className="pt-4 flex justify-between items-center">
              <Button type="button" onClick={handlePreviousStep} variant="outline" className="font-semibold">
                ← Retour
              </Button>
              
              <Button type="button" onClick={handleFamilySectionContinue} className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                {relatives.length > 0 ? "Oui, j'ai ajouté tous les proches ! 🧡" : "Continuer sans ajouter de proches →"}
              </Button>
            </div>
          </div>
        </form> : currentRelative && <div className="animate-fade-in">
          <RelativeForm relative={currentRelative} onSave={handleSaveRelative} onCancel={handleCancelRelativeEdit} />
        </div>}
    </div>;
};
export default FamilyForm;