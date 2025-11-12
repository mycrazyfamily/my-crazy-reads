import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
            .eq('family_id', profile.family_id);

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
              .eq('family_id', familyId);

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

  // Gérer la sélection/désélection des lieux existants
  const handleToggleExistingPlace = (placeId: string) => {
    setSelectedExistingPlaceIds(prev => {
      if (prev.includes(placeId)) {
        return prev.filter(id => id !== placeId);
      } else {
        return [...prev, placeId];
      }
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
    setEditingIndex(null);
    setIsAddingPlace(true);
  };

  const handleEditPlace = (index: number) => {
    const place = places[index];
    setCurrentPlace(place);
    setChildLabel(place.childLabel || '');
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
      if (!details.frequence_annuelle || !details.frequence_annuelle.trim()) errors.push("Fréquence annuelle");
      if (details.hebergement_attitre === undefined) errors.push("Hébergement attitré (oui/non)");
      if (details.famille_complete === undefined) errors.push("Famille au complet (oui/non)");
      if (details.espace_partage === undefined) errors.push("Espace partagé (oui/non)");
      if (!details.activites || !details.activites.trim()) errors.push("Activités habituelles");
      if (!details.repas_ou) errors.push("Lieu des repas");
      if (details.propre_lit === undefined) errors.push("Propre lit (oui/non)");
      if (details.objets_familiers === undefined) errors.push("Objets familiers (oui/non)");
      if (details.objets_familiers && (!details.objets_familiers_description || !details.objets_familiers_description.trim())) errors.push("Description des objets familiers");
      if (!details.souvenir_marquant || !details.souvenir_marquant.trim()) errors.push("Souvenir marquant");
    } else {
      if (!details.habitat_type) errors.push("Type de logement");
      if (details.habitat_type === 'Autre' && (!details.habitat_type_autre || !details.habitat_type_autre.trim())) errors.push("Précision du type de logement");
      if (!details.luminosite) errors.push("Lumineux ou sombre");
      if (details.enfants_dans_meme_chambre === undefined) errors.push("Partage de la chambre (oui/non)");
      if (details.enfants_dans_meme_chambre && (!details.enfants_chambre_avec_qui || !details.enfants_chambre_avec_qui.trim())) errors.push("Avec qui l'enfant partage sa chambre");
      if (!details.nombre_pieces || !details.nombre_pieces.trim()) errors.push("Nombre de pièces");
      if (!details.salon_details || !details.salon_details.trim()) errors.push("Description du salon");
      if (details.television === undefined) errors.push("Présence d'une télévision (oui/non)");
      if (details.television && (!details.television_ou || !details.television_ou.trim())) errors.push("Où se trouve la télévision");
      if (details.piece_jeu === undefined) errors.push("Présence d'une pièce de jeu (oui/non)");
      if (details.bruit_sol === undefined) errors.push("Le sol fait-il du bruit ? (oui/non)");
      if (details.jardin === undefined) errors.push("Présence d'un jardin ou d'une cour (oui/non)");
      if (details.jardin) {
        if (details.jardin_piscine === undefined) errors.push("Piscine dans le jardin (oui/non)");
        if (details.jardin_ping_pong === undefined) errors.push("Table de ping-pong dans le jardin (oui/non)");
        if (details.jardin_cabane === undefined) errors.push("Cabane/annexe dans le jardin (oui/non)");
        const hasJardinDetails = [details.jardin_autres_1, details.jardin_autres_2, details.jardin_autres_3].some(d => d && d.trim() !== '');
        if (!hasJardinDetails && !details.noJardinDetails) {
          errors.push("Autres éléments du jardin (ou cochez 'Aucun élément particulier')");
        }
      }
      if (!details.environnement || !details.environnement.trim()) errors.push("Environnement autour du logement");
      if (!details.frequence_utilisation) errors.push("Fréquence d'utilisation du lieu");
      const hasAutreDetails = [details.autre_detail_1, details.autre_detail_2, details.autre_detail_3].some(d => d && d.trim() !== '');
      if (!hasAutreDetails && !details.noAutreDetails) {
        errors.push("Éléments marquants du logement (ou cochez 'Aucun élément particulier')");
      }
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
    onNext();
  };

  return (
    <div className="space-y-6">
      {!isAddingPlace ? (
        <>
          <div>
            <h2 className="text-2xl font-bold mb-2">🏡 Lieux de vie</h2>
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
            + Ajouter un lieu
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
