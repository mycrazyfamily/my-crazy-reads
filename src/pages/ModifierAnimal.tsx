import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PetForm from '@/components/childProfile/pets/PetForm';
import type { PetData, PetType, PetTrait } from '@/types/childProfile';

const ModifierAnimal: React.FC = () => {
  const { childId, petId } = useParams<{ childId: string; petId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [petData, setPetData] = useState<PetData | null>(null);

  useEffect(() => {
    loadPetData();
  }, [childId, petId]);

  const loadPetData = async () => {
    if (!childId || !petId) return;

    try {
      setLoading(true);
      
      // Charger depuis child_pets
      const { data, error } = await supabase
        .from('child_pets')
        .select(`
          *,
          pets (
            id,
            name,
            type,
            emoji
          )
        `)
        .eq('child_id', childId)
        .eq('pet_id', petId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.pets) {
        const pet: PetData = {
          id: data.pets.id,
          name: data.name || data.pets.name,
          type: (data.relation_label || data.pets.type) as PetType,
          traits: (data.traits ? data.traits.split(', ') : []) as PetTrait[]
        };
        setPetData(pet);
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

  const handleSave = async (updatedPet: PetData) => {
    if (!childId || !petId) return;

    try {
      setSaving(true);

      // Mettre à jour dans child_pets et pets
      const { error: updateChildPetError } = await supabase
        .from('child_pets')
        .update({
          name: updatedPet.name,
          traits: updatedPet.traits?.join(', ') || null,
          relation_label: updatedPet.type
        })
        .eq('child_id', childId)
        .eq('pet_id', petId);

      if (updateChildPetError) throw updateChildPetError;
      
      // Mettre à jour le pet dans la table pets
      const { error: updatePetError } = await supabase
        .from('pets')
        .update({
          name: updatedPet.name,
          type: updatedPet.type
        })
        .eq('id', petId);

      if (updatePetError) throw updatePetError;

      toast.success("Animal modifié avec succès !");
      navigate('/espace-famille');
    } catch (error) {
      console.error('Error saving pet:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/espace-famille');
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

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint">
          <PetForm 
            pet={petData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierAnimal;
