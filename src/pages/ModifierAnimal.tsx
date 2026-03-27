import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PetForm from '@/components/childProfile/pets/PetForm';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { PetData, PetType, PetTrait } from '@/types/childProfile';
import ResetAvatarButton from '@/components/familyDashboard/ResetAvatarButton';

/**
 * Safely parse traits_custom from DB — handles double-encoded strings
 * and spread-of-string bugs that produce {"0":"a","1":"b",...}
 */
function sanitizeTraitsCustom(raw: any): Record<string, any> | undefined {
  if (!raw) return undefined;
  // If it's a string, try to parse it
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return sanitizeTraitsCustom(parsed); // recurse in case of double-encoding
      }
    } catch {
      return undefined;
    }
  }
  // If it's an object, check for spread-of-string pattern (numeric keys starting with "{")
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    const keys = Object.keys(raw);
    const hasNumericKeys = keys.some(k => /^\d+$/.test(k));
    const hasStringKeys = keys.some(k => !/^\d+$/.test(k));
    if (hasNumericKeys) {
      if (!hasStringKeys) {
        // All keys are numeric — this is a spread string, try to reconstruct
        try {
          const reconstructed = keys.sort((a, b) => Number(a) - Number(b)).map(k => raw[k]).join('');
          const parsed = JSON.parse(reconstructed);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
        } catch {
          return undefined;
        }
      } else {
        // Mixed: keep only non-numeric keys (the valid ones)
        const cleaned: Record<string, any> = {};
        for (const k of keys) {
          if (!/^\d+$/.test(k)) cleaned[k] = raw[k];
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
    }
    return raw;
  }
  return undefined;
}

const ModifierAnimal: React.FC = () => {
  const { childId, petId } = useParams<{ childId: string; petId: string }>();
  const navigate = useNavigate();
  const invalidateFamilyData = useInvalidateFamilyData();
  const [loading, setLoading] = useState(true);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [currentPetData, setCurrentPetData] = useState<PetData | null>(null);
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  const [originalBirthMonthYear, setOriginalBirthMonthYear] = useState<string | null>(null);

  useEffect(() => {
    loadPetData();
  }, [childId, petId]);

  const loadPetData = async () => {
    if (!childId || !petId) return;

    try {
      setLoading(true);
      
      // Charger l'animal depuis child_pets
      const { data, error } = await supabase
        .from('child_pets')
        .select(`
          *,
          pets (
            id,
            name,
            type,
            emoji,
            family_id,
            breed,
            physical_details,
            clothing_style
          )
        `)
        .eq('child_id', childId)
        .eq('pet_id', petId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.pets) {
        const storedType = data.relation_label || data.pets.type;
        const predefinedTypes = ['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other'];
        const isCustomType = storedType && !predefinedTypes.includes(storedType);
        
        // Nettoyer les customTraits pour éviter d'avoir à la fois physicalDetails et noPhysicalDetails
        let cleanedCustomTraits = sanitizeTraitsCustom((data as any).traits_custom);
        if (cleanedCustomTraits) {
          const hasPhysicalDetails = Array.isArray(cleanedCustomTraits.physicalDetails) && 
                                      cleanedCustomTraits.physicalDetails.length > 0 &&
                                      cleanedCustomTraits.physicalDetails.some((d: string) => d.trim() !== '');
          
          if (hasPhysicalDetails && cleanedCustomTraits.noPhysicalDetails) {
            // Si les deux sont présents, garder uniquement physicalDetails (dernière info saisie)
            const { noPhysicalDetails, ...rest } = cleanedCustomTraits;
            cleanedCustomTraits = rest;
            console.log('🧹 Nettoyage des données incohérentes : suppression du flag noPhysicalDetails');
          }
        }
        
        const pet: PetData = {
          id: data.pets.id,
          name: data.name || data.pets.name,
          type: isCustomType ? 'other' : (storedType as PetType),
          otherType: isCustomType ? storedType : undefined,
          birthMonthYear: data.birth_month_year || undefined,
          breed: data.race || (data.pets as any).breed || undefined,
          traits: (data.traits ? data.traits.split(', ') : []) as PetTrait[],
          customTraits: cleanedCustomTraits
        };
        setPetData(pet);
        setOriginalBirthMonthYear(data.birth_month_year || null);

        // Charger tous les enfants de la famille
        const { data: childrenData, error: childrenError } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('family_id', data.pets.family_id)
          .order('first_name');

        if (childrenError) throw childrenError;
        setExistingChildren(childrenData || []);

        // Charger les enfants liés à cet animal
        const { data: linkedChildren, error: linkedError } = await supabase
          .from('child_pets')
          .select('child_id')
          .eq('pet_id', petId);

        if (linkedError) throw linkedError;
        setSelectedChildrenIds(linkedChildren?.map(c => c.child_id) || []);
      } else {
        toast.error("Animal non trouvé");
        navigate('/espace-famille');
      }
    } catch (error) {
      console.error('Error loading pet data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChild = (childIdToToggle: string) => {
    setSelectedChildrenIds(prev => 
      prev.includes(childIdToToggle)
        ? prev.filter(id => id !== childIdToToggle)
        : [...prev, childIdToToggle]
    );
  };

  const handleSave = async (updatedPet: PetData) => {
    if (!petId) return;

    try {
      // Mettre à jour le pet dans la table pets
      const finalType = updatedPet.type === 'other' && updatedPet.otherType 
        ? updatedPet.otherType 
        : updatedPet.type;
      
      const { error: updatePetError } = await supabase
        .from('pets')
        .update({
          name: updatedPet.name,
          type: finalType,
          breed: updatedPet.breed || null
        })
        .eq('id', petId);

      if (updatePetError) throw updatePetError;

      // Charger les relations existantes pour cet animal
      const { data: existingRelations, error: fetchError } = await supabase
        .from('child_pets')
        .select('id, child_id')
        .eq('pet_id', petId);

      if (fetchError) throw fetchError;

      const existingChildIds = existingRelations?.map(r => r.child_id) || [];
      const childPetUpdates = {
        name: updatedPet.name,
        birth_month_year: updatedPet.birthMonthYear || null,
        traits: updatedPet.traits?.join(', ') || null,
        traits_custom: updatedPet.customTraits && typeof updatedPet.customTraits === 'object' ? updatedPet.customTraits : null,
        relation_label: finalType,
        race: updatedPet.breed || null
      };

      // Identifier les enfants à supprimer (qui ne sont plus sélectionnés)
      const childIdsToRemove = existingChildIds.filter(id => !selectedChildrenIds.includes(id));
      
      // Identifier les enfants à mettre à jour (qui existaient déjà)
      const childIdsToUpdate = selectedChildrenIds.filter(id => existingChildIds.includes(id));
      
      // Identifier les enfants à créer (nouveaux)
      const childIdsToCreate = selectedChildrenIds.filter(id => !existingChildIds.includes(id));

      // Supprimer les relations qui ne sont plus nécessaires
      if (childIdsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('child_pets')
          .delete()
          .eq('pet_id', petId)
          .in('child_id', childIdsToRemove);

        if (deleteError) throw deleteError;
      }

      // Mettre à jour les relations existantes
      if (childIdsToUpdate.length > 0) {
        for (const childId of childIdsToUpdate) {
          const { error: updateError } = await supabase
            .from('child_pets')
            .update(childPetUpdates)
            .eq('pet_id', petId)
            .eq('child_id', childId);

          if (updateError) throw updateError;
        }
      }

      // Créer les nouvelles relations
      if (childIdsToCreate.length > 0) {
        const childPetsData = childIdsToCreate.map(childId => ({
          child_id: childId,
          pet_id: petId,
          ...childPetUpdates
        }));

        const { error: insertError } = await supabase
          .from('child_pets')
          .insert(childPetsData);

        if (insertError) throw insertError;
      }
      
      // Récupérer l'avatar_url actuel avant de déclencher la regénération
      const { data: petRow } = await supabase
        .from('pets')
        .select('avatar_url')
        .eq('id', petId)
        .maybeSingle();

      // Appel webhook pour regénérer l'avatar
      try {
        await fetch('https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/edit-avatar-mcf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: petId,
            type: 'pet',
            current_avatar_url: petRow?.avatar_url || null,
            previous_birth_date: originalBirthMonthYear
          })
        });
      } catch (webhookErr) {
        console.error('Webhook avatar error:', webhookErr);
      }

      if (petId) signalAvatarRegeneration(petId);
      invalidateFamilyData();
      toast.success('Animal modifié avec succès !');
      setTimeout(() => {
        navigate('/espace-famille');
      }, 500);
    } catch (error) {
      console.error('Error saving pet:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleCancel = () => {
    navigate('/espace-famille');
  };

  const handleSubmitClick = () => {
    if (!currentPetData) {
      toast.error("Aucune donnée à enregistrer");
      return;
    }

    // Validation avant sauvegarde
    const errors: string[] = [];

    if (!currentPetData.name?.trim()) {
      errors.push("le nom de l'animal");
    }

    if (!currentPetData.type) {
      errors.push("le type d'animal");
    }

    if (currentPetData.type === 'other' && !currentPetData.otherType?.trim()) {
      errors.push("le type d'animal personnalisé");
    }

    if (!currentPetData.breed?.trim()) {
      errors.push("la race de l'animal");
    }

    if (!currentPetData.traits || currentPetData.traits.length === 0) {
      errors.push("au moins un trait de caractère");
    }

    // Vérifier que les traits personnalisés sont remplis
    const hasEmptyCustomTrait = currentPetData.traits?.some(trait => {
      if (trait === 'other' || trait === 'other2') {
        const value = currentPetData.customTraits?.[trait];
        return !value || (typeof value === 'string' && !value.trim());
      }
      return false;
    });

    if (hasEmptyCustomTrait) {
      errors.push("tous les traits personnalisés");
    }

    // Vérifier les détails physiques : au moins un détail OU la case "aucun détail" cochée
    const petPhysicalDetails = currentPetData.customTraits?.physicalDetails;
    const hasPhysicalDetails = Array.isArray(petPhysicalDetails) && petPhysicalDetails.length > 0 && petPhysicalDetails.some((d: string) => d.trim() !== '');
    // Vérifier si noPhysicalDetails est présent et true (peut être boolean ou string selon la source)
    const customTraitsAny = currentPetData.customTraits as any;
    const noPhysicalDetails = customTraitsAny?.noPhysicalDetails === true || customTraitsAny?.noPhysicalDetails === 'true';
    if (!hasPhysicalDetails && !noPhysicalDetails) {
      errors.push("un détail physique marquant (ou cochez 'Aucun détail physique particulier')");
    }

    // Vérifier qu'au moins un enfant est associé
    if (selectedChildrenIds.length === 0) {
      errors.push("au moins un enfant associé à cet animal");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return;
    }

    handleSave(currentPetData);
  };

  const handlePetDataChange = (updatedPet: PetData) => {
    setCurrentPetData(updatedPet);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!petData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-mcf-primary hover:bg-mcf-mint/10 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'espace famille
        </Button>

        <h1 className="text-3xl font-bold text-mcf-orange-dark mb-6">
          Modifier l'animal
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint space-y-6">
          <PetForm 
            pet={petData}
            onSave={handleSave}
            onCancel={handleCancel}
            showButtons={false}
            onDataChange={handlePetDataChange}
          />

          {existingChildren.length > 0 && (
            <ChildrenSelector
              children={existingChildren}
              selectedChildrenIds={selectedChildrenIds}
              onToggleChild={handleToggleChild}
              label="Enfants associés à cet animal"
            />
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex justify-between">
              <Button 
                type="button" 
                onClick={handleCancel}
                variant="outline"
              >
                Annuler
              </Button>
              
              <Button 
                type="button"
                onClick={handleSubmitClick}
                className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
              >
                Enregistrer les modifications
              </Button>
            </div>
            <div className="flex justify-center">
              <ResetAvatarButton
                profileId={petId!}
                profileType="pet"
                profileName={petData?.name}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierAnimal;
