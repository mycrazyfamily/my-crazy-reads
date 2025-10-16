
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import FormSteps from '@/components/childProfile/FormSteps';
import { ChildProfileFormProvider } from '@/contexts/ChildProfileFormContext';
import { useChildProfileSubmit } from '@/hooks/useChildProfileSubmit';
import 'react-datepicker/dist/react-datepicker.css';
import type { ChildProfileFormData } from '@/types/childProfile';
import { CHALLENGES_OPTIONS } from '@/constants/childProfileOptions';
import { FAVORITE_WORLDS_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';
type CreateChildProfileProps = {
  isGiftMode?: boolean;
  familyCode?: string;
  nextPath?: string;
  initialStep?: number;
  editMode?: boolean;
  editChildId?: string;
  useSavedDraft?: boolean;
};

const CreateChildProfile = ({ 
  isGiftMode = false, 
  familyCode, 
  nextPath,
  initialStep,
  editMode = false,
  editChildId,
  useSavedDraft = true,
}: CreateChildProfileProps) => {
  const navigate = useNavigate();
  const { handleSubmit } = useChildProfileSubmit({ isGiftMode, nextPath });
  const location = useLocation();
  const locationState = location.state as { targetStep?: number } | null;
  
  // Protection contre la double soumission
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleFormSubmit = async (data: ChildProfileFormData) => {
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress, ignoring duplicate');
      return;
    }
    
    setIsSubmitting(true);
    if (editMode && editChildId) {
      // Mode édition : mettre à jour le profil existant dans child_profiles
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        console.log('🔄 Mode édition - Données reçues du formulaire:', {
          superpowers: data.superpowers,
          passions: data.passions,
          challenges: data.challenges,
          favoriteWorlds: data.worlds?.favoriteWorlds,
          discoveries: data.worlds?.discoveries
        });
        
        // Mettre à jour child_profiles
        const { error: updateError } = await supabase
          .from('child_profiles')
          .update({
            first_name: data.firstName,
            nickname: data.nickname?.type === 'custom' ? data.nickname.custom : 
                     data.nickname?.type !== 'none' ? data.nickname?.type : null,
            birth_date: data.birthDate ? data.birthDate.toISOString().split('T')[0] : null,
            gender: data.gender,
            height: data.height,
            appearance: {
              skinColor: data.skinColor,
              eyeColor: data.eyeColor,
              hairColor: data.hairColor,
              hairType: data.hairType,
              hairTypeCustom: data.hairTypeCustom,
              glasses: data.glasses
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', editChildId);

        if (updateError) throw updateError;
        
        // Mettre à jour les relations (sélections multiples)
        // Supprimer puis réinsérer pour simplifier (et vérifier les erreurs RLS)
        const deleteResults = await Promise.all([
          supabase.from('child_superpowers').delete().eq('child_id', editChildId),
          supabase.from('child_likes').delete().eq('child_id', editChildId),
          supabase.from('child_challenges').delete().eq('child_id', editChildId),
          supabase.from('child_universes').delete().eq('child_id', editChildId),
          supabase.from('child_discoveries').delete().eq('child_id', editChildId),
        ] as const);

        const deleteErrors = deleteResults.map(r => r.error).filter(Boolean);
        if (deleteErrors.length) {
          console.error('❌ Pivot delete errors:', deleteErrors);
          throw deleteErrors[0];
        }
        // Utils de nettoyage
        const uniq = <T,>(arr: T[]) => Array.from(new Set((arr || []).filter(Boolean)));
        const top3 = (arr: string[]) => uniq(arr).slice(0, 3);

        // Super-pouvoirs (max 3)
        const selectedSP = top3(data.superpowers || []);
        if (selectedSP.length) {
          const { data: sp, error: spLookupError } = await supabase
            .from('superpowers')
            .select('id, value')
            .in('value', selectedSP);
          if (!spLookupError && sp?.length) {
            await supabase.from('child_superpowers').insert(
              sp.map(s => ({ child_id: editChildId, superpower_id: s.id }))
            );
          }
        }

        // Ce que l'enfant aime (likes) (max 3)
        const selectedLikes = top3(data.passions || []);
        if (selectedLikes.length) {
          const { data: likes, error: likesLookupError } = await supabase
            .from('likes')
            .select('id, value')
            .in('value', selectedLikes);
          if (!likesLookupError && likes?.length) {
            await supabase.from('child_likes').insert(
              likes.map(l => ({ child_id: editChildId, like_id: l.id }))
            );
          }
        }

        // Défis (max 3) (map value to label for DB lookup)
        const selectedChallenges = top3(data.challenges || []);
        if (selectedChallenges.length) {
          const challengeLabels = selectedChallenges
            .map(v => CHALLENGES_OPTIONS.find(o => o.value === v)?.label)
            .filter(Boolean) as string[];
          if (challengeLabels.length) {
            const { data: challenges, error: challengesLookupError } = await supabase
              .from('challenges')
              .select('id, label')
              .in('label', challengeLabels);
            if (!challengesLookupError && challenges?.length) {
              await supabase.from('child_challenges').insert(
                challenges.map(c => ({ child_id: editChildId, challenge_id: c.id }))
              );
            }
          }
        }

        // Univers favoris (max 3) (ignorer "Autre*")
        const worldsRaw = (data.worlds?.favoriteWorlds || []).filter(w => !String(w).startsWith('other'));
        const selectedWorlds = top3(worldsRaw.map(v => String(v)));
        if (selectedWorlds.length) {
          const labels = selectedWorlds.map(v => FAVORITE_WORLDS_OPTIONS.find(o => o.value === v)?.label || String(v));
          const { data: universes, error: universesLookupError } = await supabase
            .from('universes')
            .select('id, label')
            .in('label', labels);
          if (!universesLookupError && universes?.length) {
            await supabase.from('child_universes').insert(
              universes.map(u => ({ child_id: editChildId, universe_id: u.id }))
            );
          }
        }

        // Découvertes (ignorer "Autre*" et "nothing") - déduplication + limit à 3
        const discoveriesToAdd = top3(uniq((data.worlds?.discoveries || []).filter(d => !String(d).startsWith('other') && d !== 'nothing').map(d => String(d))));
        if (discoveriesToAdd.length) {
          const labels = discoveriesToAdd.map(v => DISCOVERY_OPTIONS.find(o => o.value === v)?.label || String(v));
          const { data: discoveries, error: discoveriesLookupError } = await supabase
            .from('discoveries')
            .select('id, label')
            .in('label', labels);
          if (!discoveriesLookupError && discoveries?.length) {
            await supabase.from('child_discoveries').insert(
              discoveries.map(d => ({ child_id: editChildId, discovery_id: d.id }))
            );
          }
        }

        // Gérer les doudous (comforters) - mise à jour et création
        if (data.toys?.toys && data.toys.toys.length > 0) {
          console.log('🧸 Updating/Creating comforters:', data.toys.toys);
          
          // Récupérer les liens existants dans child_comforters
          const { data: existingComforterLinks } = await supabase
            .from('child_comforters')
            .select('*')
            .eq('child_id', editChildId);
          
          // Pour chaque doudou dans le formulaire
          for (const toy of data.toys.toys) {
            console.log(`Processing toy: ${toy.name}, comforterId: ${toy.comforterId}, isActive: ${toy.isActive}`);
            
            if (toy.comforterId) {
              // CAS 1: Mise à jour d'un doudou existant
              // 1. Mettre à jour le statut isActive dans la table comforters
              const emoji = toy.type === 'plush' ? '🧸' : toy.type === 'blanket' ? '🧣' : toy.type === 'doll' ? '🧍' : toy.type === 'miniCar' ? '🚗' : toy.type === 'figurine' ? '🦸' : '✨';
              const { error: updateComforterError } = await supabase
                .from('comforters')
                .update({ 
                  is_active: toy.isActive !== false,
                  label: toy.name,
                  emoji,
                  updated_at: new Date().toISOString()
                })
                .eq('id', toy.comforterId);
              
              if (updateComforterError) {
                console.error('❌ Error updating comforter:', updateComforterError);
              }
              
              // 2. Mettre à jour les détails (appearance, roles) dans child_comforters
              const existingLink = existingComforterLinks?.find(link => link.comforter_id === toy.comforterId);
              
              if (existingLink) {
                const { error: updateLinkError } = await supabase
                  .from('child_comforters')
                  .update({
                    name: toy.name,
                    appearance: toy.appearance?.trim() || '',
                    roles: Array.isArray(toy.roles) ? toy.roles.join(',') : (toy.roles as any) || '',
                    relation_label: toy.type === 'other' ? (toy.otherType?.trim() || 'other') : toy.type
                  })
                  .eq('id', existingLink.id);
                
                if (updateLinkError) {
                  console.error('❌ Error updating child_comforters:', updateLinkError);
                } else {
                  console.log(`✅ Updated comforter details for ${toy.name}`);
                }
              }
            } else {
              // CAS 2: Création d'un nouveau doudou
              console.log(`🆕 Creating new comforter: ${toy.name}`);
              const emoji = toy.type === 'plush' ? '🧸' : toy.type === 'blanket' ? '🧣' : toy.type === 'doll' ? '🧍' : toy.type === 'miniCar' ? '🚗' : toy.type === 'figurine' ? '🦸' : '✨';
              
              // 1. Créer le comforter dans la table comforters
              const { supabase: supabaseClient } = await import('@/integrations/supabase/client');
              const userId = (await supabaseClient.auth.getUser()).data.user?.id;
              
              const { data: createdComforter, error: createComforterError } = await supabase
                .from('comforters')
                .insert([{
                  label: toy.name,
                  emoji,
                  created_by: userId,
                  is_active: toy.isActive !== false
                }])
                .select()
                .maybeSingle();
              
              if (createComforterError || !createdComforter) {
                console.error('❌ Error creating comforter:', createComforterError);
                continue;
              }
              
              console.log(`✅ Created comforter with ID: ${createdComforter.id}`);
              
              // 2. Créer le lien dans child_comforters
              const { error: createLinkError } = await supabase
                .from('child_comforters')
                .insert([{
                  child_id: editChildId,
                  comforter_id: createdComforter.id,
                  name: toy.name,
                  appearance: toy.appearance?.trim() || '',
                  roles: Array.isArray(toy.roles) ? toy.roles.join(',') : (toy.roles as any) || '',
                  relation_label: toy.type === 'other' ? (toy.otherType?.trim() || 'other') : toy.type
                }]);
              
              if (createLinkError) {
                console.error('❌ Error creating child_comforters link:', createLinkError);
              } else {
                console.log(`✅ Created comforter link for ${toy.name}`);
              }
            }
          }
        }

        // Gérer les animaux (pets) - mise à jour
        if (data.pets?.pets && data.pets.pets.length > 0) {
          // Récupérer les liens existants
          const { data: existingLinks } = await supabase
            .from('child_pets')
            .select('*')
            .eq('child_id', editChildId);

          // Pour chaque animal dans le formulaire
          for (const pet of data.pets.pets) {
            const existingLink = existingLinks?.find(link => link.pet_id === pet.id);
            
            if (existingLink) {
              // Mettre à jour le lien existant
              await supabase
                .from('child_pets')
                .update({
                  name: pet.name,
                  traits: pet.traits?.join(', '),
                  relation_label: pet.type
                })
                .eq('id', existingLink.id);
            }
          }
        }

        toast.success("Profil modifié avec succès !");
        
        // Petit délai pour laisser le toast s'afficher avant la navigation
        setTimeout(() => {
          navigate('/espace-famille');
        }, 500);
      } catch (error) {
        console.error('Error updating child profile:', error);
        toast.error("Erreur lors de la mise à jour");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Mode création : utiliser la logique normale
      try {
        await handleSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Use either the prop or the location state
  const effectiveInitialStep = initialStep !== undefined ? initialStep : locationState?.targetStep;
  
  console.log("CreateChildProfile - effectiveInitialStep:", effectiveInitialStep);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-mcf-orange-dark">
        {editMode ? "Modifier le profil de l'enfant" : (isGiftMode ? "Profil de l'enfant pour son livre cadeau 🎁" : "Créer le profil de l'enfant")}
      </h1>
      <p className="text-center text-gray-600 mb-8">
        {editMode 
          ? "Modifiez les informations de votre enfant pour mettre à jour son profil"
          : (isGiftMode 
            ? "Pour offrir une histoire vraiment personnalisée, remplissez ces informations sur l'enfant"
            : "Personnalisez l'aventure magique de votre enfant en nous parlant de lui/elle")
        }
      </p>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint">
        <ChildProfileFormProvider 
          familyCode={familyCode} 
          onSubmit={handleFormSubmit}
          initialStep={effectiveInitialStep}
          editMode={editMode}
          editChildId={editChildId}
          useSavedDraft={useSavedDraft}
        >
          <FormSteps 
            isGiftMode={isGiftMode} 
            nextButtonText={isGiftMode ? "Continuer vers le choix du thème →" : undefined}
            onFormSubmit={isGiftMode ? () => {} : undefined}
            editMode={editMode}
            isSubmitting={isSubmitting}
          />
        </ChildProfileFormProvider>
      </div>
    </div>
  );
};

export default CreateChildProfile;
