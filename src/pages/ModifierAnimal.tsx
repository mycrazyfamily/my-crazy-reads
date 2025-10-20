import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PetForm from '@/components/childProfile/pets/PetForm';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { PetData, PetType, PetTrait } from '@/types/childProfile';

const ModifierAnimal: React.FC = () => {
  const { childId, petId } = useParams<{ childId: string; petId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [currentPetData, setCurrentPetData] = useState<PetData | null>(null);
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

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
            physical_details
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
        
        const pet: PetData = {
          id: data.pets.id,
          name: data.name || data.pets.name,
          type: isCustomType ? 'other' : (storedType as PetType),
          otherType: isCustomType ? storedType : undefined,
          breed: (data.pets as any).breed || undefined,
          physicalDetails: (data.pets as any).physical_details || undefined,
          traits: (data.traits ? data.traits.split(', ') : []) as PetTrait[],
          customTraits: (data as any).traits_custom || undefined
        };
        setPetData(pet);

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
          breed: updatedPet.breed || null,
          physical_details: updatedPet.physicalDetails || null
        })
        .eq('id', petId);

      if (updatePetError) throw updatePetError;

      // Supprimer toutes les anciennes relations
      const { error: deleteError } = await supabase
        .from('child_pets')
        .delete()
        .eq('pet_id', petId);

      if (deleteError) throw deleteError;

      // Créer les nouvelles relations
      if (selectedChildrenIds.length > 0) {
        const childPetsData = selectedChildrenIds.map(childId => ({
          child_id: childId,
          pet_id: petId,
          name: updatedPet.name,
          traits: updatedPet.traits?.join(', ') || null,
          traits_custom: updatedPet.customTraits || null,
          relation_label: finalType
        }));
        
        console.log('Saving pet with customTraits:', updatedPet.customTraits);
        console.log('childPetsData:', childPetsData);

        const { error: insertError } = await supabase
          .from('child_pets')
          .insert(childPetsData);

        if (insertError) throw insertError;
      }

      toast.success("Animal modifié avec succès !");
      navigate('/espace-famille');
    } catch (error) {
      console.error('Error saving pet:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleCancel = () => {
    navigate('/espace-famille');
  };

  const handleSubmitClick = () => {
    if (currentPetData) {
      handleSave(currentPetData);
    }
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
          <div className="flex justify-between pt-4">
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierAnimal;
