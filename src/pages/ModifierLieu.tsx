import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PlaceForm } from '@/components/childProfile/places/PlaceForm';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { PlaceData } from '@/types/place';

const ModifierLieu: React.FC = () => {
  const { childId, placeId } = useParams<{ childId: string; placeId: string }>();
  const navigate = useNavigate();
  const invalidateFamilyData = useInvalidateFamilyData();
  const [loading, setLoading] = useState(true);
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [currentPlaceData, setCurrentPlaceData] = useState<PlaceData | null>(null);
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPlaceData();
  }, [childId, placeId]);

  const loadPlaceData = async () => {
    if (!childId || !placeId) return;

    try {
      setLoading(true);
      
      // Charger le lieu depuis places
      const { data: place, error: placeError } = await supabase
        .from('places')
        .select('*')
        .eq('id', placeId)
        .maybeSingle();

      if (placeError) throw placeError;

      if (place) {
        const placeDataObj: PlaceData = {
          id: place.id,
          label: place.label,
          type: place.type as any,
          description: place.description || undefined,
          emoji: place.emoji || undefined,
          address: place.address || undefined,
          city: place.city || undefined,
          country: place.country || undefined,
          details: (place.details || {}) as any
        };
        setPlaceData(placeDataObj);
        setCurrentPlaceData(placeDataObj);

        // Charger tous les enfants de la famille
        const { data: childrenData, error: childrenError } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('family_id', place.family_id)
          .order('first_name');

        if (childrenError) throw childrenError;
        setExistingChildren(childrenData || []);

        // Charger les enfants liés à ce lieu
        const { data: linkedChildren, error: linkedError } = await supabase
          .from('child_places')
          .select('child_id')
          .eq('place_id', placeId);

        if (linkedError) throw linkedError;
        setSelectedChildrenIds(linkedChildren?.map(c => c.child_id) || []);
      } else {
        toast.error("Lieu non trouvé");
        navigate('/espace-famille');
      }
    } catch (error) {
      console.error('Error loading place data:', error);
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

  const handleSave = async (updatedPlace: PlaceData) => {
    if (!placeId) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Mettre à jour le lieu dans la table places
      const { error: updatePlaceError } = await supabase
        .from('places')
        .update({
          label: updatedPlace.label,
          type: updatedPlace.type,
          description: updatedPlace.description || null,
          emoji: updatedPlace.emoji || null,
          address: updatedPlace.address || null,
          city: updatedPlace.city || null,
          country: updatedPlace.country || null,
          details: (updatedPlace.details || {}) as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', placeId);

      if (updatePlaceError) throw updatePlaceError;

      // Supprimer toutes les anciennes relations
      const { error: deleteError } = await supabase
        .from('child_places')
        .delete()
        .eq('place_id', placeId);

      if (deleteError) throw deleteError;

      // Créer les nouvelles relations
      if (selectedChildrenIds.length > 0) {
        const childPlacesData = selectedChildrenIds.map(childId => ({
          child_id: childId,
          place_id: placeId
        }));

        const { error: insertError } = await supabase
          .from('child_places')
          .insert(childPlacesData);

        if (insertError) throw insertError;
      }

      toast.success('Lieu de vie modifié avec succès !');
      invalidateFamilyData();
      navigate('/espace-famille');
    } catch (error) {
      console.error('Error saving place:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/espace-famille');
  };

  const handleSubmitClick = () => {
    if (!currentPlaceData) {
      toast.error("Aucune donnée à enregistrer");
      return;
    }

    // Validation avant sauvegarde
    const errors: string[] = [];

    if (!currentPlaceData.label?.trim()) {
      errors.push("le nom du lieu");
    }

    if (!currentPlaceData.type) {
      errors.push("le type de lieu");
    }

    // Vérifier qu'au moins un enfant est associé
    if (selectedChildrenIds.length === 0) {
      errors.push("au moins un enfant associé à ce lieu");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return;
    }

    handleSave(currentPlaceData);
  };

  const handlePlaceDataChange = (updatedPlace: PlaceData) => {
    setCurrentPlaceData(updatedPlace);
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

  if (!placeData) {
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
          Modifier le lieu de vie
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint space-y-6">
          <PlaceForm 
            place={currentPlaceData || placeData}
            onChange={handlePlaceDataChange}
          />

          {existingChildren.length > 0 && (
            <ChildrenSelector
              children={existingChildren}
              selectedChildrenIds={selectedChildrenIds}
              onToggleChild={handleToggleChild}
              label="Enfants associés à ce lieu"
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
              disabled={isSubmitting}
              className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierLieu;
