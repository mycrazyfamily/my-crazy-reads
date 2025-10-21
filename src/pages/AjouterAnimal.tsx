import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { toast } from 'sonner';
import PetForm from '@/components/childProfile/pets/PetForm';
import ChildSelectionCard from '@/components/childProfile/ChildSelectionCard';
import FormProgressIndicator from '@/components/FormProgressIndicator';
import type { PetData } from '@/types/childProfile';

interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
}


export default function AjouterAnimal() {
  const navigate = useNavigate();
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

  const handleAddPet = async (petData: PetData) => {
    if (selectedChildIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un enfant');
      return;
    }

    try {
      let familyId: string | null = null;

      // 1. D'abord, essayer de récupérer le family_id depuis le profil enfant (child_profiles)
      const { data: childProfile, error: childError } = await supabase
        .from('child_profiles')
        .select('family_id')
        .eq('id', selectedChildIds[0])
        .maybeSingle();

      if (!childError && childProfile?.family_id) {
        familyId = childProfile.family_id;
        console.log('family_id récupéré depuis child_profiles:', familyId);
      }

      // 2. Si pas de family_id trouvé dans l'enfant, vérifier le user_profile
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

      // 3. Si toujours pas de family_id, en créer une nouvelle (cas rare)
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

      // 4. Synchroniser user_profiles.family_id si nécessaire
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('family_id')
        .eq('id', supabaseSession!.user.id)
        .maybeSingle();

      if (currentProfile && currentProfile.family_id !== familyId) {
        const { error: updateProfileError } = await supabase
          .from('user_profiles')
          .update({ family_id: familyId })
          .eq('id', supabaseSession!.user.id);

        if (updateProfileError) {
          console.error('Error updating user profile:', updateProfileError);
        } else {
          console.log('user_profiles.family_id synchronisé avec:', familyId);
        }
      }

      // 5. Les enfants sélectionnés sont déjà des child_profiles.id
      const childProfileIds = selectedChildIds;
      
      // Synchroniser les child_profiles.family_id si nécessaire
      for (const childId of childProfileIds) {
        const { data: child } = await supabase
          .from('child_profiles')
          .select('family_id')
          .eq('id', childId)
          .maybeSingle();
        
        if (child && child.family_id !== familyId) {
          await supabase
            .from('child_profiles')
            .update({ family_id: familyId, has_pet: true })
            .eq('id', childId);
        }
      }

      // 6. Créer l'animal dans la table pets avec le family_id
      const finalType = petData.type === 'other' && petData.otherType 
        ? petData.otherType 
        : petData.type;
      
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert({
          name: petData.name,
          type: finalType,
          breed: petData.breed || null,
          physical_details: petData.physicalDetails || null,
          emoji: null,
          family_id: familyId
        })
        .select()
        .single();

      if (petError) throw petError;

      // 7. Lier l'animal à chaque enfant (en utilisant les IDs de child_profiles)
      const childPetRecords = childProfileIds.map(childProfileId => ({
        child_id: childProfileId,
        pet_id: pet.id,
        name: petData.name,
        traits: petData.traits?.join(', ') || null,
        traits_custom: petData.customTraits || null,
        relation_label: finalType
      }));
      
      console.log('Saving pet with customTraits:', petData.customTraits);
      console.log('childPetRecords:', childPetRecords);

      const { error: linkError } = await supabase
        .from('child_pets')
        .insert(childPetRecords);

      if (linkError) throw linkError;
      navigate('/espace-famille');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'animal:', error);
      toast.error('Erreur lors de l\'ajout de l\'animal');
    }
  };

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
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un animal de compagnie</h1>
        </div>

        <FormProgressIndicator 
          currentStep={showForm ? 1 : 0}
          totalSteps={2}
          stepLabels={['Sélection', 'Informations']}
        />

        {!showForm ? (
          <>
            {/* Sélection des enfants */}
            {children.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-mcf-orange-dark">
                    Sélectionnez le(s) enfant(s) concerné(s)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Vous pouvez sélectionner plusieurs enfants pour leur ajouter le même animal
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
                    Vous devez d'abord créer le profil d'un enfant pour pouvoir lui ajouter des animaux de compagnie.
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
                Nouvel animal de compagnie
                <span className="text-sm font-normal text-gray-600">
                  pour {selectedChildIds.map(id => children.find(c => c.id === id)?.firstName).join(', ')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PetForm onSave={handleAddPet} onCancel={() => navigate('/espace-famille')} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}