// AjouterAnimal  (chantier D2)
// Changelog D2 : avertissement avant de quitter le formulaire.
//   Le bouton de sortie en haut a gauche fait deux choses selon l'etat : s'il y a un
//   formulaire ouvert il revient a la selection, sinon il retourne a l'espace famille.
//   Dans le premier cas la saisie en cours est PERDUE, aucun brouillon n'existe sur cette
//   page. Une modale previent donc avant, variante 'perte' de LeaveFormDialog.
//   Le garde-fou est ACTIF UNIQUEMENT quand le formulaire est ouvert (showForm) : sur
//   l'ecran de selection il n'y a rien a perdre, avertir serait du bruit. Il couvre aussi
//   le bouton « Précédent » du navigateur, via useLeaveFormGuard.
// AjouterAnimal v2.3
// Changelog v2.3 :
//   LOT F4 — SOURCE UNIQUE DES DETAILS PHYSIQUES DES ANIMAUX. pets.physical_details devient la
//   seule source, comme family_members.physical_details l'est deja pour les proches. Les details
//   ne transitent plus par child_pets.traits_custom, qui ne garde que les traits de CARACTERE.
//   Motif : trois chemins d'ecriture divergents laissaient les deux sources se desynchroniser,
//   et les donnees etaient dupliquees sur chaque lien enfant. Convention : tableau VIDE = aucun
//   detail, le flag noPhysicalDetails n'est plus persiste.
//   Cet ecran n'ecrivait PAS pets.physical_details du tout : un animal cree ici naissait sans
//   aucun detail cote pets, et le chemin creation du Book Factory n'en voyait jamais.
// Changelog v2.2 : LOT F3 — fin du double encodage des colonnes jsonb.
//   Les colonnes physical_details et clothing_style, sur child_profiles, family_members et pets,
//   sont toutes de type jsonb (verifie sur information_schema le 20/08). Passer une CHAINE
//   produite par JSON.stringify fait stocker a Postgres une valeur JSON de type chaine, et non un
//   tableau : la base contenait "[\"Collier rouge\"]" la ou physical_details contenait proprement
//   ["Poil blanc"]. Le client Supabase serialise deja, il faut lui donner la valeur NATIVE.
//   Consequence mesuree : 4D2_Enrich_Context du Book Factory utilise clothing_style en fallback
//   direct quand clothing_style_resolved est absent, SANS le deballer. Le livre recevait alors la
//   chaine brute avec ses guillemets et ses antislashs.
//   Les fonctions de LECTURE qui deballent jusqu'a 3 niveaux sont volontairement CONSERVEES : les
//   lignes deja en base restent doublement encodees et doivent rester lisibles. On corrige
//   l'ecriture, on ne casse pas la lecture.
//   Corrige le clothing_style introduit en v2.1, qui reproduisait le defaut existant.
// Changelog v2.1 : persiste le nouveau champ « accessoire ou vêtement » (PetForm v1.7) dans
//   pets.clothing_style à la création, au même format JSON tableau que les autres écrans.
//   Sans ça le champ s'affichait à la création mais la saisie était perdue en silence.
//   Ajouté aussi à la blocklist des champs libres de cet écran, qui les vérifie de son côté.
//   Aucune autre logique modifiée.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveFormDialog from '@/components/childProfile/LeaveFormDialog';
import { useLeaveFormGuard } from '@/hooks/useLeaveFormGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { splitCamelCase } from '@/utils/nameFormatter';
import { toast } from 'sonner';
import { FORBIDDEN_NAME_ERROR, checkFreeTextFields, containsForbiddenWord, forbiddenFieldsError } from '@/utils/nameBlocklist';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
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

  // D2 : garde-fou de sortie. Actif seulement quand un formulaire est ouvert.
  const {
    confirmationOuverte,
    setConfirmationOuverte,
    demanderSortie,
    confirmerSortie,
  } = useLeaveFormGuard({ actif: showForm });

  const handleSortie = () => {
    if (showForm) {
      demanderSortie(() => setShowForm(false));
    } else {
      navigate('/espace-famille');
    }
  };
  const invalidateFamilyData = useInvalidateFamilyData();
  const { user, supabaseSession } = useAuth();
  
  // Synchroniser automatiquement le family_id
  useFamilyIdSync();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (selectedChildIds.length === 0) {
        toast.error('Veuillez sélectionner au moins un enfant');
        return;
      }

      // v2.0 — blocklist. Cet écran n'en avait AUCUNE, pas même sur le nom.
      if (containsForbiddenWord(petData.name)) {
        toast.error(FORBIDDEN_NAME_ERROR);
        return;
      }
      const champsLibres = checkFreeTextFields({
        'les détails physiques': (petData.physicalDetails ?? []) as string[], // v2.3
        'la race': petData.breed,
        "le type d'animal": petData.otherType,
        "l'accessoire ou le vêtement": petData.clothingStyle,
        'les traits de caractère': Object.values(petData.customTraits || {})
          .filter((v) => typeof v === 'string') as string[],
      });
      if (!champsLibres.ok) {
        toast.error(forbiddenFieldsError(champsLibres));
        return;
      }

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
          name: splitCamelCase(petData.name),
          type: finalType,
          gender: petData.gender || null,
          breed: petData.breed || null,
          // v2.1 : même format que les autres écrans, un tableau JSON à un élément
          clothing_style: petData.clothingStyle
            ? [petData.clothingStyle]
            : [],
          // v2.3 : source unique. Tableau vide = aucun detail physique.
          physical_details: Array.isArray(petData.physicalDetails)
            ? petData.physicalDetails.filter((d) => d && d.trim() !== '')
            : [],
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
        name: splitCamelCase(petData.name),
        birth_month_year: petData.birthMonthYear || null,
        traits: petData.traits?.join(', ') || null,
        // v2.3 : plus de details physiques ici, uniquement les traits de caractere.
        traits_custom: (() => {
          const ct: any = petData.customTraits;
          if (!ct || typeof ct !== 'object') return null;
          const { physicalDetails, noPhysicalDetails, ...rest } = ct;
          return Object.keys(rest).length > 0 ? rest : null;
        })(),
        relation_label: finalType,
        race: petData.breed || null
      }));
      

      const { error: linkError } = await supabase
        .from('child_pets')
        .insert(childPetRecords);

      if (linkError) throw linkError;

      // L'avatar est généré côté n8n (trigger à l'INSERT). On signale la régénération pour que la
      // carte du dashboard affiche « en création » jusqu'à l'arrivée du nouvel avatar.
      signalAvatarRegeneration(pet.id);

      toast.success('Animal ajouté avec succès !');
      invalidateFamilyData();
      navigate('/espace-famille');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'animal:', error);
      toast.error('Erreur lors de l\'ajout de l\'animal');
    } finally {
      setIsSubmitting(false);
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
            onClick={handleSortie}
            className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un animal de compagnie</h1>
        </div>

        <LeaveFormDialog
          open={confirmationOuverte}
          onOpenChange={setConfirmationOuverte}
          onConfirm={confirmerSortie}
          variante="perte"
        />

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
              <PetForm onSave={handleAddPet} onCancel={() => navigate('/espace-famille')} isDisabled={isSubmitting} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
