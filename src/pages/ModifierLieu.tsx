import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPinOff } from 'lucide-react';
import { toast } from 'sonner';
import { checkFreeTextFields, forbiddenFieldsError } from '@/utils/nameBlocklist';
import { supabase } from '@/integrations/supabase/client';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PlaceForm } from '@/components/childProfile/places/PlaceForm';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { PlaceData } from '@/types/place';

// Statut « lieu inactif » : seul état d'entité (déménagement). Pas de décès, pas de brouille par enfant.
type PlaceStatus = 'active' | 'inactive';

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
  const [placeStatus, setPlaceStatus] = useState<PlaceStatus>('active');
  // Snapshot initial des liens, pour un diff qui préserve created_at (date d'apparition par enfant)
  const initialLinkIdsRef = useRef<Set<string>>(new Set());

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
        setPlaceStatus(place.is_active === false ? 'inactive' : 'active');

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
        setSelectedChildrenIds((linkedChildren || []).map((c: any) => c.child_id));
        initialLinkIdsRef.current = new Set((linkedChildren || []).map((c: any) => c.child_id));
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
          updated_at: new Date().toISOString(),
          // Statut « lieu inactif » (déménagement) — le trigger horodate inactive_at automatiquement.
          is_active: placeStatus === 'active',
          inactive_reason: placeStatus === 'active' ? null : 'moved_away',
        })
        .eq('id', placeId);

      if (updatePlaceError) throw updatePlaceError;

      // Synchronisation des liens enfant↔lieu en DIFF ciblé (insert / delete).
      // Préserve created_at (= date d'apparition par enfant) et n'effleure pas les liens conservés,
      // ce qui évite de déclencher inutilement le guard « résidence principale » sur le DELETE.
      const initialIds = initialLinkIdsRef.current;
      const toInsert = selectedChildrenIds.filter((id) => !initialIds.has(id));
      const toDelete = [...initialIds].filter((id) => !selectedChildrenIds.includes(id));

      if (toDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('child_places')
          .delete()
          .eq('place_id', placeId)
          .in('child_id', toDelete);
        if (delErr) throw delErr;
      }

      if (toInsert.length > 0) {
        const rows = toInsert.map((cid) => ({ child_id: cid, place_id: placeId }));
        const { error: insErr } = await supabase
          .from('child_places')
          .insert(rows);
        if (insErr) throw insErr;
      }

      toast.success('Lieu de vie modifié avec succès !');
      invalidateFamilyData();
      navigate('/espace-famille');
    } catch (error: any) {
      console.error('Error saving place:', error);
      // Guard DB « résidence principale obligatoire » → message clair (V1 : on n'automatise pas le remplacement).
      const msg = String(error?.message || '');
      const isResidenceGuard =
        error?.code === '23514' || msg.includes('Résidence principale') || msg.includes('maison_principale');
      if (isResidenceGuard) {
        toast.error(
          "Ce lieu est la résidence principale d'au moins un enfant. Ajoute d'abord une autre maison principale active pour cet enfant, puis reviens marquer ce lieu comme quitté."
        );
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
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

    // v2.0 — blocklist sur les champs libres du lieu. Ces textes partent dans
    // enrich-place-environment puis dans les prompts d'image : un mot interdit
    // s'y glisserait jusque dans le décor du livre.
    // Les clés de `details` varient selon le type de lieu (environnement,
    // activités, souvenir marquant, détails du jardin…) : plutôt que de les
    // énumérer et d'en oublier une au prochain champ ajouté, on balaie toutes
    // les valeurs textuelles de l'objet.
    const champsLibres = checkFreeTextFields({
      'le nom du lieu': currentPlaceData.label,
      'la description': currentPlaceData.description,
      'la ville': currentPlaceData.city,
      'le pays': currentPlaceData.country,
      "l'adresse": currentPlaceData.address,
      'les précisions du lieu': Object.values(currentPlaceData.details || {})
        .filter((v) => typeof v === 'string') as string[],
    });
    if (!champsLibres.ok) {
      toast.error(forbiddenFieldsError(champsLibres));
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

          {/* Statut du lieu */}
          <div className="space-y-3 pt-4 border-t border-mcf-mint/40">
            <Label className="text-base font-medium">Statut</Label>
            <RadioGroup
              value={placeStatus}
              onValueChange={(v) => setPlaceStatus(v as PlaceStatus)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="place-status-active" />
                <Label htmlFor="place-status-active" className="cursor-pointer font-normal">Lieu actuel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="place-status-inactive" />
                <Label htmlFor="place-status-inactive" className="cursor-pointer font-normal">Nous n'y vivons plus</Label>
              </div>
            </RadioGroup>
            {placeStatus === 'inactive' && (
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <MapPinOff className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>Ce lieu n'apparaîtra plus dans les nouvelles histoires. Vous pourrez revenir en arrière à tout moment.</span>
              </p>
            )}
          </div>

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
