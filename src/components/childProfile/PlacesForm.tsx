// PlacesForm v1.2
// Changelog v1.2 : les lieux de type "destination_libre" (créés à la volée depuis le wizard
// d'histoire pour UNE aventure ponctuelle, ex: "Koh Tao") sont désormais exclus de "Lieux déjà
// créés" — ils ne doivent jamais apparaître comme un lieu de vie réutilisable, conformément à la
// règle déjà appliquée côté dashboard (useFamilyData.ts). Les 2 branches (family_id direct +
// fallback via families.created_by) corrigées identiquement.
// Changelog v1.1 : même garde-fou que AjouterLieu.tsx — au moins une maison principale requise
// (parmi les lieux nouvellement ajoutés + ceux sélectionnés comme existants) avant de continuer.
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { PlaceData } from '@/types/place';
import { PlaceForm } from './places/PlaceForm';
import { PlacesList } from './places/PlacesList';
import ExistingPlacesList from './places/ExistingPlacesList';
import ChildrenSelector from './ChildrenSelector';
import { useChildProfileForm } from '@/contexts/ChildProfileFormContext';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from 'react-router-dom';

interface PlacesFormProps {
  onNext: () => void;
  onPrev: () => void;
}

type ExistingPlace = {
  id: string;
  label: string;
  type: string;
  emoji: string;
  city?: string;
  country?: string;
  family_id: string;
};

export const PlacesForm: React.FC<PlacesFormProps> = ({ onNext, onPrev }) => {
  const { form } = useChildProfileForm();
  const location = useLocation();
  const isCreatingNewChild = location.pathname.includes('/creer-profil-enfant') || location.pathname.includes('/nouvel-enfant');
  
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentPlace, setCurrentPlace] = useState<PlaceData>({
    label: '',
    type: 'maison_principale',
    details: {},
  });
  const [childLabel, setChildLabel] = useState('');
  const [existingPlaces, setExistingPlaces] = useState<ExistingPlace[]>([]);
  const [selectedExistingPlaceIds, setSelectedExistingPlaceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pour la sélection d'enfants existants
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

  const placesData = form.watch('places');
  const places = placesData?.places || [];

  // Revenir en haut quand on ouvre/ferme le sous-formulaire d'un lieu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAddingPlace]);


  // Charger les enfants existants
  useEffect(() => {
    const loadExistingChildren = async () => {
      if (!isCreatingNewChild) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profiles, error } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading children:', error);
        } else if (profiles) {
          setExistingChildren(profiles);
        }
      } catch (error) {
        console.error('Error loading existing children:', error);
      }
    };

    loadExistingChildren();
  }, [isCreatingNewChild]);

  // Charger les lieux existants de la famille
  useEffect(() => {
    const loadExistingPlaces = async () => {
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

        let placesFromTable: ExistingPlace[] = [];

        // Si l'utilisateur a un family_id, charger depuis places
        if (profile?.family_id) {
          console.log('Loading places for family_id:', profile.family_id);

          const { data: places, error: placesError } = await supabase
            .from('places')
            .select('id, label, type, emoji, city, country, family_id')
            .eq('family_id', profile.family_id)
            .neq('type', 'destination_libre');

          if (placesError) {
            console.error('Error loading places:', placesError);
          } else if (places && places.length > 0) {
            placesFromTable = places.map((place: any) => ({
              id: place.id,
              label: place.label || 'Sans nom',
              type: place.type || 'maison_principale',
              emoji: place.emoji || '🏠',
              city: place.city,
              country: place.country,
              family_id: place.family_id || ''
            }));
            console.log('Loaded places:', placesFromTable);
          }
        }

        // Fallback: si pas de family_id, chercher la famille créée par l'utilisateur
        if (!profile?.family_id && placesFromTable.length === 0) {
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

            // Charger les lieux de cette famille
            const { data: places, error: placesError } = await supabase
              .from('places')
              .select('id, label, type, emoji, city, country, family_id')
              .eq('family_id', familyId)
              .neq('type', 'destination_libre');

            if (placesError) {
              console.error('Error loading places:', placesError);
            } else if (places && places.length > 0) {
              placesFromTable = places.map((place: any) => ({
                id: place.id,
                label: place.label || 'Sans nom',
                type: place.type || 'maison_principale',
                emoji: place.emoji || '🏠',
                city: place.city,
                country: place.country,
                family_id: place.family_id || ''
              }));
              console.log('Loaded places from fallback:', placesFromTable);
            }
          }
        }

        if (placesFromTable.length > 0) {
          setExistingPlaces(placesFromTable);
        } else {
          console.log('No places found');
        }
      } catch (error) {
        console.error('Error loading existing places:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingPlaces();
  }, []);

  // Restaurer les sélections de lieux existants depuis le formulaire
  useEffect(() => {
    const savedIds = placesData?.existingPlacesData?.map((place: any) => place.id) || [];
    if (savedIds.length > 0) {
      setSelectedExistingPlaceIds(savedIds);
    }
  }, [placesData?.existingPlacesData]);

  // Gérer la sélection/désélection des lieux existants
  const handleToggleExistingPlace = (placeId: string) => {
    setSelectedExistingPlaceIds(prev => {
      const newIds = prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId];
      
      // Sauvegarder immédiatement dans le formulaire
      const selectedPlacesData = existingPlaces.filter(p => newIds.includes(p.id));
      form.setValue('places', {
        places: places,
        existingPlacesData: selectedPlacesData,
        placeChildLinks: placesData?.placeChildLinks || {}
      }, { shouldDirty: true });
      
      return newIds;
    });
  };

  const handleToggleChild = (childId: string) => {
    setSelectedChildrenIds(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  const handleAddPlace = () => {
    setCurrentPlace({
      label: '',
      type: 'maison_principale',
      details: {},
    });
    setChildLabel('');
    setSelectedChildrenIds([]); // Réinitialiser les enfants sélectionnés
    setEditingIndex(null);
    setIsAddingPlace(true);
  };

  const handleEditPlace = (index: number) => {
    const place = places[index];
    const placesData = form.getValues('places');
    const placeChildLinks = placesData?.placeChildLinks || {};
    const linkedChildrenIds = placeChildLinks[place.id || ''] || [];
    
    setCurrentPlace({ ...place, linkedChildrenIds });
    setChildLabel(place.childLabel || '');
    setSelectedChildrenIds(linkedChildrenIds); // Restaurer les enfants liés
    setEditingIndex(index);
    setIsAddingPlace(true);
  };

  const handleDeletePlace = (index: number) => {
    const newPlaces = places.filter((_, i) => i !== index);
    form.setValue('places', newPlaces as any);
  };

  const handleSavePlace = () => {
    const errors: string[] = [];

    if (!currentPlace.label.trim()) errors.push("Nom du lieu");
    if (!currentPlace.city || !currentPlace.city.trim()) errors.push("Ville");
    if (!currentPlace.country || !currentPlace.country.trim()) errors.push("Pays");

    const details = currentPlace.details || {};

    if (currentPlace.type === 'vacances') {
      if (!details.type_vacances) errors.push("Type de lieu de vacances");
      if (!details.environnement || !details.environnement.trim()) errors.push("Description de l'environnement");
      if (!details.activites || !details.activites.trim()) errors.push("Activités habituelles");
    } else {
      if (!details.habitat_type) errors.push("Type de logement");
      if (details.habitat_type === 'Autre' && (!details.habitat_type_autre || !details.habitat_type_autre.trim())) errors.push("Précision du type de logement");
      if (!details.environnement || !details.environnement.trim()) errors.push("Description de l'environnement autour du logement");
      if (details.jardin === undefined) errors.push("Présence d'un jardin ou d'une cour (oui/non)");
      if (details.jardin && (!details.jardin_elements || !details.jardin_elements.trim())) errors.push("Éléments marquants du jardin");
    }


    if (errors.length > 0) {
      toast.error('Veuillez compléter les champs obligatoires', {
        description: `Champs manquants:\n• ${errors.join('\n• ')}`,
      });
      return;
    }

    const placeToSave = { 
      ...currentPlace, 
      childLabel,
      id: currentPlace.id || Date.now().toString() // Ajouter un ID si pas déjà présent
    };
    let newPlaces: PlaceData[];

    if (editingIndex !== null) {
      newPlaces = [...places];
      newPlaces[editingIndex] = placeToSave;
    } else {
      newPlaces = [...places, placeToSave];
    }

    // Sauvegarder les IDs des enfants sélectionnés pour les liens ultérieurs
    if (isCreatingNewChild && selectedChildrenIds.length > 0) {
      const existingLinks = placesData?.placeChildLinks || {};
      const updatedLinks = {
        ...existingLinks,
        [placeToSave.id]: selectedChildrenIds
      };
      
      form.setValue('places', {
        places: newPlaces,
        existingPlacesData: placesData?.existingPlacesData || [],
        placeChildLinks: updatedLinks
      });
    } else {
      form.setValue('places', {
        places: newPlaces,
        existingPlacesData: placesData?.existingPlacesData || [],
        placeChildLinks: placesData?.placeChildLinks || {}
      });
    }
    
    setIsAddingPlace(false);
    setCurrentPlace({
      label: '',
      type: 'maison_principale',
      details: {},
    });
    setChildLabel('');
    setEditingIndex(null);
    setSelectedChildrenIds([]);
  };

  const handleCancelPlace = () => {
    setIsAddingPlace(false);
    setCurrentPlace({
      label: '',
      type: 'maison_principale',
      details: {},
    });
    setChildLabel('');
    setSelectedChildrenIds([]); // Réinitialiser les enfants sélectionnés
    setEditingIndex(null);
  };

  const handleContinue = () => {
    // Sauvegarder les données complètes pour référence
    const selectedPlacesData = existingPlaces.filter(p => 
      selectedExistingPlaceIds.includes(p.id)
    );
    
    form.setValue('places', {
      places: places,
      existingPlacesData: selectedPlacesData,
      placeChildLinks: placesData?.placeChildLinks || {}
    });
    
    if (places.length === 0 && selectedExistingPlaceIds.length === 0) {
      toast.error("Veuillez ajouter ou sélectionner au moins un lieu de vie pour votre enfant");
      return;
    }

    // Garde-fou : au moins une maison principale parmi les lieux (nouveaux + existants
    // sélectionnés). Même règle que sur AjouterLieu.tsx (page standalone).
    const hasPrincipal = places.some(p => p.type === 'maison_principale')
      || selectedPlacesData.some(p => p.type === 'maison_principale');

    if (!hasPrincipal) {
      toast.error("Ajoutez (ou sélectionnez) une maison principale avant de continuer — c'est le lieu de référence de l'enfant");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {!isAddingPlace ? (
        <>
          <div>
            <h2 className="text-2xl font-bold mb-2">Lieux de vie</h2>
            <p className="text-muted-foreground">
              Ajoutez les différents lieux de vie de votre enfant (maison principale, maison secondaire, maison de l'autre parent si séparés, lieux de vacances, etc.)
            </p>
          </div>

          {/* Liste des lieux existants à sélectionner */}
          {!loading && existingPlaces.length > 0 && (
            <ExistingPlacesList 
              existingPlaces={existingPlaces}
              selectedPlaceIds={selectedExistingPlaceIds}
              onTogglePlace={handleToggleExistingPlace}
            />
          )}

          <PlacesList
            places={places}
            onEdit={handleEditPlace}
            onDelete={handleDeletePlace}
          />

          <Button onClick={handleAddPlace} variant="outline" className="w-full" type="button">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un lieu
          </Button>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onPrev} className="flex-1" type="button">
              Précédent
            </Button>
            <Button onClick={handleContinue} className="flex-1" type="button">
              Suivant
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {editingIndex !== null ? 'Modifier le lieu' : 'Ajouter un lieu'}
            </h2>
          </div>

          <PlaceForm
            place={currentPlace}
            onChange={setCurrentPlace}
          />

          <div>
            <Label htmlFor="child-label">
              Ce lieu a-t-il un nom particulier ou un surnom utilisé par la famille pour en parler ? (optionnel)
            </Label>
            <Input
              id="child-label"
              value={childLabel}
              onChange={(e) => setChildLabel(e.target.value)}
              placeholder="Ex: Chez Papa, Maison de Mamie, Le camping..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ce nom sera utilisé dans les histoires pour que l'enfant reconnaisse le lieu
            </p>
          </div>

          {/* Sélection des enfants existants (uniquement lors de la création d'un nouvel enfant) */}
          {isCreatingNewChild && existingChildren.length > 0 && (
            <ChildrenSelector
              children={existingChildren}
              selectedChildrenIds={selectedChildrenIds}
              onToggleChild={handleToggleChild}
              label="Ce lieu est aussi le lieu de vie de :"
            />
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleCancelPlace}
              className="flex-1"
              type="button"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSavePlace}
              className="flex-1"
              type="button"
            >
              {editingIndex !== null ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
