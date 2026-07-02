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
  const femaleTypes = ["mother", "sister", "grandmother", "aunt", "femaleCousin", "femaleFriend", "nanny"];
  const maleTypes = ["father", "brother", "grandfather", "uncle", "maleCousin", "maleFriend"];
  if (femaleTypes.includes(type)) return "female";
  if (maleTypes.includes(type)) return "male";
  return "male";
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
  const [isSavingRelative, setIsSavingRelative] = useState(false);
  const [existingRelatives, setExistingRelatives] = useState<ExistingRelative[]>([]);
  const [selectedExistingRelativeIds, setSelectedExistingRelativeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Revenir en haut quand on ouvre/ferme le sous-formulaire d'un proche
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isEditingRelative]);


  // Charger les proches existants de la famille
  useEffect(() => {
    const loadExistingRelatives = async () => {
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

        let relativesFromTable: ExistingRelative[] = [];

        // Si l'utilisateur a un family_id, charger depuis family_members
        if (profile?.family_id) {
          console.log('Loading family_members for family_id:', profile.family_id);

          const { data: familyMembers, error: fmError } = await supabase
            .from('family_members')
            .select('id, name, role, avatar, family_id')
            .eq('family_id', profile.family_id);

          if (fmError) {
            console.error('Error loading family_members:', fmError);
          } else if (familyMembers && familyMembers.length > 0) {
            relativesFromTable = familyMembers.map((fm: any) => ({
              id: fm.id,
              name: fm.name || 'Sans nom',
              role: fm.role || 'Proche',
              avatar: fm.avatar || '👤',
              family_id: fm.family_id || ''
            }));
            console.log('Loaded family_members:', relativesFromTable);
          }
        }

        // Les proches sont maintenant uniquement dans family_members

        if (relativesFromTable.length > 0) {
          setExistingRelatives(relativesFromTable);
        } else {
          console.log('No relatives found');
        }
      } catch (error) {
        console.error('Error loading existing relatives:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingRelatives();
  }, []);

  // Restaurer les sélections de proches existants depuis le formulaire
  useEffect(() => {
    const savedIds = form.getValues().family?.existingRelativeIds;
    if (savedIds && savedIds.length > 0) {
      setSelectedExistingRelativeIds(savedIds);
    }
  }, [form]);

  // Gérer la sélection/désélection des proches existants
  const handleToggleExistingRelative = (relativeId: string) => {
    setSelectedExistingRelativeIds(prev => {
      const newIds = prev.includes(relativeId)
        ? prev.filter(id => id !== relativeId)
        : [...prev, relativeId];
      
      // Sauvegarder immédiatement dans le formulaire
      form.setValue("family.existingRelativeIds", newIds);
      
      return newIds;
    });
  };
  const handleAddRelative = (relativeType: RelativeType) => {
    const gender = getRelativeGender(relativeType);

    // Créer un nouveau proche vide
    const newRelative: RelativeData = {
      id: '', // vide pour signaler un nouveau proche (évite le mode "modifier")
      type: relativeType,
      gender: gender,
      firstName: '',
      nickname: {
        type: "none"
      },
      age: '',
      birthDate: undefined,
      job: '',
      // Valeurs "custom" par défaut pour ne rien présélectionner dans l'UI
      skinColor: {
        type: "custom"
      },
      hairColor: {
        type: "custom"
      },
      hairType: "custom",
      glasses: false, // l'UI utilise un état séparé (null au départ)
      traits: []
    };
    setCurrentRelative(newRelative);
    setIsEditingRelative(true);
  };
  const handleSaveRelative = (relative: RelativeData, selectedChildrenIds?: string[]) => {
    // Marquer comme en cours de sauvegarde pour éviter les doubles clics
    if (isSavingRelative) return;
    setIsSavingRelative(true);
    
    // Sauvegarder les IDs des enfants sélectionnés pour les liens ultérieurs
    if (selectedChildrenIds && selectedChildrenIds.length > 0) {
      const existingLinks = form.getValues().family?.relativeChildLinks || {};
      const relativeId = relative.id || Date.now().toString();
      
      form.setValue("family.relativeChildLinks", {
        ...existingLinks,
        [relativeId]: selectedChildrenIds
      });
    }
    // Validation basique
    if (!relative.firstName) {
      toast.error("Le prénom est requis");
      setIsSavingRelative(false);
      return;
    }
    if (relative.traits.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 traits de caractère");
      setIsSavingRelative(false);
      return;
    }

    // Récupérer la liste actuelle des proches
    const currentRelatives = form.getValues().family?.relatives || [];

    // Déterminer s'il s'agit d'une mise à jour ou d'un ajout
    const isUpdate = relative.id && currentRelatives.some(r => r.id === relative.id);

    // Si ajout, générer un identifiant
    const relativeToSave: RelativeData = {
      ...relative,
      id: isUpdate ? relative.id : Date.now().toString(),
    } as RelativeData;

    // Ajouter ou mettre à jour le proche
    const updatedRelatives = isUpdate
      ? currentRelatives.map(r => r.id === relativeToSave.id ? relativeToSave : r)
      : [...currentRelatives, relativeToSave];

    // Mettre à jour le formulaire
    form.setValue("family.relatives", updatedRelatives);

    // Réinitialiser l'état de sélection après avoir sauvegardé un proche
    form.setValue("family.selectedRelatives", []);

    // CRITICAL FIX: Attendre que les Portals (DatePicker, etc.) se démontent proprement
    // avant de démonter le composant RelativeForm parent
    setTimeout(() => {
      setCurrentRelative(null);
      setIsEditingRelative(false);
      setIsSavingRelative(false);
    }, 100); // Délai suffisant pour permettre au Portal de se nettoyer
  };
  const handleEditRelative = (relative: RelativeData) => {
    // Ensure the relative has a gender property
    const relativeWithGender = {
      ...relative,
      gender: relative.gender || getRelativeGender(relative.type),
      // Préserver les enfants liés existants
      linkedChildrenIds: form.getValues().family?.relativeChildLinks?.[relative.id || ''] || []
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
  };
  const handleCancelRelativeEdit = () => {
    // CRITICAL FIX: Même logique pour l'annulation - laisser le temps aux Portals de se nettoyer
    setTimeout(() => {
      setCurrentRelative(null);
      setIsEditingRelative(false);
    }, 100);
  };
  const handleFamilySectionContinue = () => {
    // Sauvegarder les IDs et les données des proches existants sélectionnés
    const selectedRelativesData = existingRelatives.filter(r => 
      selectedExistingRelativeIds.includes(r.id)
    );
    
    form.setValue("family.existingRelativeIds", selectedExistingRelativeIds);
    form.setValue("family.existingRelativesData", selectedRelativesData as any);
    
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
        <h2 className="text-2xl font-bold text-mcf-primary mb-2">
          Famille et entourage
        </h2>
        <p className="text-sm text-gray-600 italic">Vous pourrez toujours ajouter ou modifier les membres de la famille plus tard si vous le souhaitez</p>
      </div>
      
      {!isEditingRelative ? <div className="space-y-8">
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
                  Pas d'inquiétude, vous pourrez en ajouter d'autres plus tard dans votre espace famille
                </p>
              </div>
            </div>
            
            <div className="pt-4 flex justify-between items-center">
              <Button type="button" onClick={handlePreviousStep} variant="outline" className="font-semibold">
                ← Retour
              </Button>
              
              <Button type="button" onClick={handleFamilySectionContinue} className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                {relatives.length > 0 ? "Oui, j'ai ajouté tous les proches !" : "Continuer sans ajouter de proches →"}
              </Button>
            </div>
          </div>
        </div> : currentRelative && <div className="animate-fade-in">
          <RelativeForm 
            relative={currentRelative} 
            onSave={handleSaveRelative} 
            onCancel={handleCancelRelativeEdit}
            isCreatingNewChild={true}
            isDisabled={isSavingRelative}
          />
        </div>}
    </div>;
};
export default FamilyForm;