import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { toast } from 'sonner';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { PlaceForm } from '@/components/childProfile/places/PlaceForm';
import ChildSelectionCard from '@/components/childProfile/ChildSelectionCard';
import FormProgressIndicator from '@/components/FormProgressIndicator';
import type { PlaceData } from '@/types/place';

interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
}

export default function AjouterLieu() {
  const navigate = useNavigate();
  const invalidateFamilyData = useInvalidateFamilyData();
  const { childId } = useParams<{ childId?: string }>();
  const { user, supabaseSession } = useAuth();
  
  // Synchroniser automatiquement le family_id
  useFamilyIdSync();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseSession?.user) {
      fetchChildren();
    }
  }, [supabaseSession]);

  useEffect(() => {
    // Si childId est fourni en paramètre URL, pré-sélectionner cet enfant
    if (childId && children.length > 0) {
      setSelectedChildIds([childId]);
      setShowForm(true);
    }
  }, [childId, children]);

  const fetchChildren = async () => {
    if (!supabaseSession?.user) return;

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('id, first_name, birth_date, gender, created_at')
        .eq('user_id', supabaseSession.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedChildren = (data || []).map((profile: any) => ({
        id: profile.id,
        firstName: profile.first_name || 'Enfant',
        lastName: '',
        birthDate: profile.birth_date,
        gender: profile.gender
      }));

      setChildren(mappedChildren);
    } catch (error) {
      console.error('Erreur lors de la récupération des enfants:', error);
      toast.error('Erreur lors de la récupération des enfants');
    } finally {
      setLoading(false);
    }
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildIds(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleContinue = () => {
    if (selectedChildIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un enfant');
      return;
    }
    setShowForm(true);
  };

  const handleAddPlace = async () => {
    if (selectedChildIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un enfant');
      return;
    }

    if (!currentPlaceData.label?.trim()) {
      toast.error('Veuillez renseigner le nom du lieu');
      return;
    }

    if (!currentPlaceData.type) {
      toast.error('Veuillez sélectionner le type de lieu');
      return;
    }

    try {
      let familyId: string | null = null;

      // 1. Récupérer le family_id depuis le profil enfant
      const { data: childProfile, error: childError } = await supabase
        .from('child_profiles')
        .select('family_id')
        .eq('id', selectedChildIds[0])
        .maybeSingle();

      if (!childError && childProfile?.family_id) {
        familyId = childProfile.family_id;
        console.log('family_id récupéré depuis child_profiles:', familyId);
      }

      // 2. Si pas de family_id trouvé, vérifier le user_profile
      if (!familyId) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', supabaseSession!.user.id)
          .maybeSingle();

        if (profileError) {
          toast.error('Impossible de récupérer les informations de famille');
          return;
        }

        familyId = userProfile.family_id;
      }

      // 3. Si toujours pas de family_id, en créer une nouvelle
      if (!familyId) {
        console.log('Aucune famille trouvée, création en cours...');
        const { data: newFamily, error: familyError } = await supabase
          .from('families')
          .insert([{ 
            name: 'Ma famille',
            created_by: supabaseSession!.user.id 
          }])
          .select()
          .single();

        if (familyError) {
          console.error('Error creating family:', familyError);
          toast.error('Erreur lors de la création de la famille');
          return;
        }

        familyId = newFamily.id;
        console.log('Famille créée avec succès:', familyId);
      }

      // 4. Créer le lieu dans la table places
      const { data: place, error: placeError } = await supabase
        .from('places')
        .insert({
          label: currentPlaceData.label,
          type: currentPlaceData.type,
          description: currentPlaceData.description || null,
          emoji: currentPlaceData.emoji || null,
          address: currentPlaceData.address || null,
          city: currentPlaceData.city || null,
          country: currentPlaceData.country || null,
          details: (currentPlaceData.details || {}) as any,
          created_by: supabaseSession!.user.id,
          family_id: familyId,
          is_active: true
        })
        .select()
        .single();

      if (placeError) throw placeError;

      // 5. Lier le lieu à chaque enfant sélectionné
      const childPlaceRecords = selectedChildIds.map(childProfileId => ({
        child_id: childProfileId,
        place_id: place.id
      }));

      const { error: linkError } = await supabase
        .from('child_places')
        .insert(childPlaceRecords);

      if (linkError) throw linkError;

      toast.success('Lieu de vie ajouté avec succès !');
      navigate('/espace-famille');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lieu:', error);
      toast.error('Erreur lors de l\'ajout du lieu');
    }
  };

  const [currentPlaceData, setCurrentPlaceData] = useState<PlaceData>({
    label: '',
    type: 'maison_principale' as any,
    details: {}
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcf-orange mx-auto mb-4"></div>
          <p className="text-mcf-orange-dark">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => showForm ? setShowForm(false) : navigate('/espace-famille')}
            className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un lieu de vie</h1>
        </div>

        <FormProgressIndicator 
          currentStep={showForm ? 1 : 0}
          totalSteps={2}
          stepLabels={['Sélection', 'Informations']}
        />

        {!showForm ? (
          <>
            {children.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-mcf-orange-dark">
                    Sélectionnez le(s) enfant(s) concerné(s)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Vous pouvez sélectionner plusieurs enfants pour leur ajouter le même lieu de vie
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {children.map((child) => (
                      <ChildSelectionCard
                        key={child.id}
                        child={child}
                        selected={selectedChildIds.includes(child.id)}
                        onToggle={toggleChildSelection}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedChildIds.length} enfant(s) sélectionné(s)
                    </p>
                    <Button
                      onClick={handleContinue}
                      disabled={selectedChildIds.length === 0}
                      className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                    >
                      Continuer <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {children.length === 0 && (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <p className="text-lg font-medium text-mcf-orange-dark">
                    Aucun enfant trouvé
                  </p>
                  <p className="text-gray-600">
                    Vous devez d'abord créer le profil d'un enfant pour pouvoir lui ajouter des lieux de vie.
                  </p>
                  <Button 
                    className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                    onClick={() => navigate('/creer-profil-enfant')}
                  >
                    <Plus className="h-4 w-4" /> Créer le profil d'un enfant
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-mcf-orange-dark flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouveau lieu de vie
                <span className="text-sm font-normal text-gray-600">
                  pour {selectedChildIds.map(id => children.find(c => c.id === id)?.firstName).join(', ')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlaceForm 
                place={currentPlaceData}
                onChange={setCurrentPlaceData}
              />
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  onClick={() => navigate('/espace-famille')}
                  variant="outline"
                >
                  Annuler
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleAddPlace}
                  className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
                >
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
