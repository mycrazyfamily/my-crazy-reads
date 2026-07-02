
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChildProfileFormData } from '@/types/childProfile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { 
  SUPERPOWERS_OPTIONS, 
  PASSIONS_OPTIONS, 
  CHALLENGES_OPTIONS 
} from '@/constants/childProfileOptions';
import { FAVORITE_WORLDS_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';
import { splitCamelCase } from '@/utils/nameFormatter';

type UseChildProfileSubmitProps = {
  isGiftMode?: boolean;
  nextPath?: string;
};

export const useChildProfileSubmit = ({ isGiftMode = false, nextPath }: UseChildProfileSubmitProps) => {
  const navigate = useNavigate();
  const { supabaseSession } = useAuth();
  const FORM_STORAGE_KEY = 'child-profile-form-state';
  
  // Protection contre les soumissions multiples
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Générer un nom unique pour la famille
  const generateUniqueFamilyName = (firstName: string, birthDate?: Date): string => {
    // Extraire l'année de naissance
    const year = birthDate ? birthDate.getFullYear() : new Date().getFullYear();
    
    // Générer 4 caractères aléatoires alphanumériques
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomSuffix = Array.from({ length: 4 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    
    return `Famille-${firstName || 'Enfant'}-${year}-${randomSuffix}`;
  };

  // Convertir les values du formulaire en labels pour le lookup en base
  const convertValuesToLabels = (values: string[], options: Array<{ value: string; label: string }>) => {
    return values.map(value => {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    });
  };

  // Helper pour normaliser une date (string ou Date) en format ISO date (YYYY-MM-DD)
  const normalizeDateToISO = (date: string | Date | undefined | null): string | null => {
    if (!date) return null;
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (data: ChildProfileFormData) => {
    // Empêcher les soumissions multiples
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate request");
      return;
    }
    
    setIsSubmitting(true);
    console.log("🚀 [SUBMIT] Handling form submission with data:", data);
    console.log("🚀 [SUBMIT] Data.family:", data.family);
    console.log("🚀 [SUBMIT] Data.pets:", data.pets);
    console.log("🚀 [SUBMIT] Data.places:", data.places);
    console.log("🚀 [SUBMIT] Relatives:", data.family?.relatives);

    try {
      // Utiliser la session du contexte d'authentification
      const userId = supabaseSession?.user?.id;
      
      if (!userId) {
        console.error('No authenticated user found. Cannot save profile.');
        toast.error("Veuillez vous connecter pour sauvegarder le profil.");
        setIsSubmitting(false);
        return; // Arrêter l'exécution si pas d'utilisateur authentifié
      }
        // 1. Vérifier si l'utilisateur a déjà une famille, sinon en créer une
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading user profile:', profileError);
          toast.error("Erreur lors du chargement du profil utilisateur");
          setIsSubmitting(false);
          return;
        }

        // S'assurer que le profil utilisateur existe (première inscription)
        if (!userProfile) {
          const { error: ensureProfileError } = await supabase
            .from('user_profiles')
            .upsert({ id: userId }, { onConflict: 'id' });
          if (ensureProfileError) {
            console.warn('Could not ensure user profile exists:', ensureProfileError);
          }
        }

        let familyId = userProfile?.family_id ?? null;

        // Si pas de famille, en créer une
        if (!familyId) {
          const familyName = generateUniqueFamilyName(data.firstName, data.birthDate);
          
          const { data: newFamily, error: familyError } = await supabase
            .from('families')
            .insert([{ 
              name: familyName,
              created_by: userId 
            }])
            .select()
            .single();

          if (familyError) {
            console.error('Error creating family:', familyError);
            toast.error("Erreur lors de la création de la famille");
            setIsSubmitting(false);
            return;
          }

          familyId = newFamily.id;

          // Mettre à jour le user profile avec le family_id
          const { error: updateProfileError } = await supabase
            .from('user_profiles')
            .update({ family_id: familyId })
            .eq('id', userId);

          if (updateProfileError) {
            console.error('Error updating user profile:', updateProfileError);
          }
        }

        // 2. Créer les family_members pour les nouveaux proches
        const createdFamilyMembers: Array<{ id: string; relativeType: string; tempId: string }> = [];
        
        if (data.family?.relatives && data.family.relatives.length > 0) {
          const familyMembersToCreate = data.family.relatives.map(relative => ({
            family_id: familyId,
            name: splitCamelCase(relative.firstName),
            role: relative.type,
            avatar: '👤',
            physical_details: relative.noPhysicalDetails
              ? JSON.stringify([""])
              : (relative.physicalDetails && relative.physicalDetails.length > 0 
                ? JSON.stringify(relative.physicalDetails) 
                : JSON.stringify([])),
            clothing_style: relative.clothingStyle 
              ? JSON.stringify([relative.clothingStyle]) 
              : JSON.stringify([]),
            // Persist remaining profile data for edit prefill
            details: {
              nickname: relative.nickname
                ? {
                    ...relative.nickname,
                    custom: relative.nickname.custom
                      ? splitCamelCase(relative.nickname.custom)
                      : relative.nickname.custom,
                  }
                : relative.nickname,
              skinColor: relative.skinColor,
              eyeColor: relative.eyeColor,
              hairColor: relative.hairColor,
              hairType: relative.hairType,
              hairTypeCustom: relative.hairTypeCustom,
              hairLength: relative.hairLength,
              glasses: relative.glasses,
              traits: relative.traits,
              customTraits: relative.customTraits || {},
              age: relative.age,
              birthDate: normalizeDateToISO(relative.birthDate),
              job: relative.job,
              gender: relative.gender,
              otherTypeName: relative.otherTypeName,
              noPhysicalDetails: !!relative.noPhysicalDetails
            }
          }));

          const { data: createdMembers, error: membersError } = await supabase
            .from('family_members')
            .insert(familyMembersToCreate)
            .select();

          if (membersError) {
            console.error('Error creating family members:', membersError);
            toast.warning("Proches créés mais erreur lors de l'enregistrement");
          } else if (createdMembers) {
            // Stocker l'id, le type et le tempId de chaque membre créé pour le lien ultérieur
            createdFamilyMembers.push(
              ...createdMembers.map((m, index) => ({
                id: m.id,
                relativeType: data.family!.relatives[index].type,
                tempId: data.family!.relatives[index].id // L'ID temporaire du formulaire
              }))
            );
          }
        }
        // 3. Créer le profil enfant dans child_profiles
        console.log('[SAVE] clothing_style value before insert:', data.clothingStyle);
        
        const { data: childProfile, error: childError } = await supabase
          .from('child_profiles')
          .insert([
            {
              family_id: familyId,
              first_name: splitCamelCase(data.firstName),
              nickname: data.nickname?.type === 'custom'
                ? splitCamelCase(data.nickname.custom)
                : data.nickname?.type !== 'none' ? data.nickname?.type : null,
              birth_date: normalizeDateToISO(data.birthDate),
              gender: data.gender,
              height: data.height,
              height_relative_to_age: data.height, // Enregistrer aussi dans le champ height_relative_to_age
              appearance: {
                skinColor: data.skinColor,
                eyeColor: data.eyeColor,
                hairColor: data.hairColor,
                hairType: data.hairType,
                hairTypeCustom: data.hairTypeCustom,
                hairLength: data.hairType === 'bald' ? undefined : data.hairLength,
                glasses: data.glasses
              },
              physical_details: data.physicalDetails && data.physicalDetails.length > 0 
                ? JSON.stringify(data.physicalDetails) 
                : JSON.stringify([]),
              clothing_style: data.clothingStyle 
                ? JSON.stringify([data.clothingStyle]) 
                : JSON.stringify([]),
              has_pet: data.pets?.hasPets || false
            }
          ])
          .select()
          .single();

        console.log('[SAVE] Supabase response:', childError ? childError.message : '✅ success');

        if (childError) {
          console.error('Error creating child profile:', childError);
          toast.error("Impossible d'enregistrer le profil. Réessayez.");
          setIsSubmitting(false);
          return;
        }

        const childId = childProfile.id;
        
        // 4. Ajouter les superpowers (max 3)
        if (data.superpowers && data.superpowers.length > 0) {
          const limitedSuperpowers = Array.from(new Set(data.superpowers)).slice(0, 3);
          // Récupérer les UUIDs des superpowers depuis la table superpowers par value
          const { data: superpowers, error: superpowersLookupError } = await supabase
            .from('superpowers')
            .select('id, value')
            .in('value', limitedSuperpowers);
          
          if (superpowersLookupError) {
            console.error('Error looking up superpowers:', superpowersLookupError);
            toast.warning("Superpowers non enregistrés");
          } else if (superpowers && superpowers.length > 0) {
            console.log('Found superpowers:', superpowers);
            const { error: superpowersError } = await supabase
              .from('child_superpowers')
              .insert(superpowers.map(superpower => ({ child_id: childId, superpower_id: superpower.id })));
            if (superpowersError) {
              console.error('Error adding superpowers:', superpowersError);
              toast.warning("Superpowers non enregistrés");
            }
          } else {
            console.warn('No superpowers found for values:', data.superpowers);
          }
        }
        
        // 5. Ajouter les traits (anciens superpowers)
        // DEPRECATED: Cette section est conservée pour rétrocompatibilité mais n'est plus utilisée
        
        // 6. Ajouter les likes ("ce qu'aime le plus") (max 3)
        if (data.passions && data.passions.length > 0) {
          const limitedPassions = Array.from(new Set(data.passions)).slice(0, 3);
          // Récupérer les UUIDs des likes depuis la table likes par value
          const { data: likes, error: likesLookupError } = await supabase
            .from('likes')
            .select('id, value')
            .in('value', limitedPassions);
          
          if (likesLookupError) {
            console.error('Error looking up likes:', likesLookupError);
            toast.warning("Ce qu'aime le plus non enregistré");
          } else if (likes && likes.length > 0) {
            console.log('Found likes:', likes);
            const { error: likesError } = await supabase
              .from('child_likes')
              .insert(likes.map(like => ({ child_id: childId, like_id: like.id })));
            if (likesError) {
              console.error('Error adding likes:', likesError);
              toast.warning("Ce qu'aime le plus non enregistré");
            }
          } else {
            console.warn('No likes found for values:', data.passions);
          }
        }
        
        // 7. Ajouter les passions (DEPRECATED - conservé pour compatibilité)
        // Cette section n'est plus utilisée mais gardée au cas où
        
        // 8. Ajouter les challenges (max 3)
        if (data.challenges && data.challenges.length > 0) {
          const limitedChallenges = Array.from(new Set(data.challenges)).slice(0, 3);
          // Convertir les values en labels
          const challengeLabels = convertValuesToLabels(limitedChallenges, CHALLENGES_OPTIONS);
          console.log('Looking up challenges with labels:', challengeLabels);
          
          // Récupérer les UUIDs des challenges depuis la table challenges
          const { data: challenges, error: challengesLookupError } = await supabase
            .from('challenges')
            .select('id, label')
            .in('label', challengeLabels);
          
          if (challengesLookupError) {
            console.error('Error looking up challenges:', challengesLookupError);
            toast.warning("Défis non enregistrés");
          } else if (challenges && challenges.length > 0) {
            console.log('Found challenges:', challenges);
            const { error: challengesError } = await supabase
              .from('child_challenges')
              .insert(challenges.map(challenge => ({ child_id: childId, challenge_id: challenge.id })));
            if (challengesError) {
              console.error('Error adding challenges:', challengesError);
              toast.warning("Défis non enregistrés");
            }
          } else {
            console.warn('No challenges found for labels:', challengeLabels);
          }
        }
        
        // 7. Ajouter les univers favoris (filtrer les "other", max 3)
        if (data.worlds?.favoriteWorlds && data.worlds.favoriteWorlds.length > 0) {
          const worldsToAdd = Array.from(new Set(data.worlds.favoriteWorlds.filter(w => !w.startsWith('other')))).slice(0, 3);
          if (worldsToAdd.length > 0) {
            // Convertir les values en labels
            const worldLabels = convertValuesToLabels(worldsToAdd, FAVORITE_WORLDS_OPTIONS);
            console.log('Looking up universes with labels:', worldLabels);
            
            // Récupérer les UUIDs des univers depuis la table universes
            const { data: universes, error: universesLookupError } = await supabase
              .from('universes')
              .select('id, label')
              .in('label', worldLabels);
            
            if (universesLookupError) {
              console.error('Error looking up universes:', universesLookupError);
              toast.warning("Univers favoris non enregistrés");
            } else if (universes && universes.length > 0) {
              console.log('Found universes:', universes);
              const { error: worldsError } = await supabase
                .from('child_universes')
                .insert(universes.map(universe => ({ child_id: childId, universe_id: universe.id })));
              if (worldsError) {
                console.error('Error adding worlds:', worldsError);
                toast.warning("Univers favoris non enregistrés");
              }
            } else {
              console.warn('No universes found for labels:', worldLabels);
            }
          }
        }
        
        // 8. Ajouter les découvertes (filtrer les "other", max 3)
        if (data.worlds?.discoveries && data.worlds.discoveries.length > 0) {
          const discoveriesToAdd = Array.from(new Set(data.worlds.discoveries.filter(d => !d.startsWith('other') && d !== 'nothing'))).slice(0, 3);
          if (discoveriesToAdd.length > 0) {
            // Convertir les values en labels
            const discoveryLabels = convertValuesToLabels(discoveriesToAdd, DISCOVERY_OPTIONS);
            console.log('Looking up discoveries with labels:', discoveryLabels);
            
            // Récupérer les UUIDs des découvertes depuis la table discoveries
            const { data: discoveries, error: discoveriesLookupError } = await supabase
              .from('discoveries')
              .select('id, label')
              .in('label', discoveryLabels);
            
            if (discoveriesLookupError) {
              console.error('Error looking up discoveries:', discoveriesLookupError);
              toast.warning("Découvertes non enregistrées");
            } else if (discoveries && discoveries.length > 0) {
              console.log('Found discoveries:', discoveries);
              const { error: discoveriesError } = await supabase
                .from('child_discoveries')
                .insert(discoveries.map(discovery => ({ child_id: childId, discovery_id: discovery.id })));
              if (discoveriesError) {
                console.error('Error adding discoveries:', discoveriesError);
                toast.warning("Découvertes non enregistrées");
              }
            } else {
              console.warn('No discoveries found for labels:', discoveryLabels);
            }
          }
        }

        // 9. Créer les liens child_family_members pour les nouveaux proches créés
        if (createdFamilyMembers.length > 0) {
          const familyMemberLinks = createdFamilyMembers.map(member => ({
            child_id: childId,
            family_member_id: member.id,
            relation_label: member.relativeType
          }));

          const { error: linkError } = await supabase
            .from('child_family_members')
            .insert(familyMemberLinks);

          if (linkError) {
            console.error('Error linking new family members:', linkError);
            toast.warning("Profil créé mais erreur lors de l'association des proches");
          }
        }

        // 9b. Gérer les liens supplémentaires pour les proches (enfants existants)
        if (data.family?.relativeChildLinks) {
          const links: Array<{ child_id: string; family_member_id: string }> = [];
          
          console.log('🔗 Processing relativeChildLinks:', data.family.relativeChildLinks);
          console.log('🔗 Created family members:', createdFamilyMembers);
          
          Object.entries(data.family.relativeChildLinks).forEach(([relativeTempId, childIds]) => {
            // Trouver le family_member_id réel en utilisant le tempId
            const createdMember = createdFamilyMembers.find(m => m.tempId === relativeTempId);
            
            if (createdMember) {
              console.log(`🔗 Found created member for tempId ${relativeTempId}:`, createdMember.id);
              childIds.forEach(existingChildId => {
                links.push({
                  child_id: existingChildId,
                  family_member_id: createdMember.id
                });
              });
            } else {
              console.warn(`⚠️ Could not find created member for tempId ${relativeTempId}`);
            }
          });

          if (links.length > 0) {
            console.log('🔗 Creating additional relative links:', links);
            const { error } = await supabase
              .from('child_family_members')
              .insert(links);
            
            if (error) {
              console.error('❌ Error creating additional relative links:', error);
              toast.warning("Profil créé mais erreur lors de l'association des proches aux enfants existants");
            } else {
              console.log('✅ Successfully created additional relative links');
            }
          }
        }

        // 10. Gérer les proches existants sélectionnés
        if (data.family?.existingRelativesData && data.family.existingRelativesData.length > 0) {
          const existingRelativesLinks: string[] = data.family.existingRelativesData.map(
            existingRelative => existingRelative.id
          );

          // Créer les liens child_family_members pour tous les proches existants
          if (existingRelativesLinks.length > 0) {
            const existingLinks = existingRelativesLinks.map(familyMemberId => ({
              child_id: childId,
              family_member_id: familyMemberId
            }));

            const { error: existingLinkError } = await supabase
              .from('child_family_members')
              .insert(existingLinks);

            if (existingLinkError) {
              console.error('Error linking existing family members:', existingLinkError);
              toast.warning("Profil créé mais erreur lors de l'association des proches existants");
            }
          }
        }

        // 13. Créer les nouveaux animaux dans la table pets
        const createdPetIds: string[] = [];
        
        if (data.pets?.pets && data.pets.pets.length > 0) {
          console.log('🦴 Création des animaux - data.pets.pets:', data.pets.pets);
          
          const petsToCreate = data.pets.pets.map((pet, index) => {
            console.log(`🦴 Animal ${index} - customTraits:`, pet.customTraits);
            console.log(`🦴 Animal ${index} - customTraits.physicalDetails:`, pet.customTraits?.physicalDetails);
            
            return {
              family_id: familyId,
              name: pet.name,
              type: pet.type || pet.otherType || 'autre',
              breed: pet.breed || null,
              physical_details: (pet.customTraits?.physicalDetails && Array.isArray(pet.customTraits.physicalDetails) && pet.customTraits.physicalDetails.length > 0)
                ? JSON.stringify(pet.customTraits.physicalDetails) 
                : JSON.stringify([]),
              emoji: null
            };
          });
          
          console.log('🦴 petsToCreate:', petsToCreate);

          const { data: createdPets, error: petsError } = await supabase
            .from('pets')
            .insert(petsToCreate)
            .select();

          if (petsError) {
            console.error('Error creating pets:', petsError);
            toast.warning("Profil créé mais erreur lors de l'enregistrement des animaux");
          } else if (createdPets) {
            createdPetIds.push(...createdPets.map(p => p.id));
          }
        }

        // 14. Créer les liens child_pets pour les nouveaux animaux créés
        if (createdPetIds.length > 0 && data.pets?.pets) {
          const newPetLinks = createdPetIds.map((petId, index) => {
            const pet = data.pets!.pets[index];
            // Si le type est "other", utiliser le type personnalisé (otherType), sinon utiliser le type standard
            const relationLabel = pet.type === 'other' && pet.otherType 
              ? pet.otherType 
              : pet.type || null;
            
            return {
              child_id: childId,
              pet_id: petId,
              name: pet.name,
              traits: pet.traits?.join(', ') || null,
              traits_custom: pet.customTraits && typeof pet.customTraits === 'object' ? pet.customTraits : null,
              relation_label: relationLabel,
              birth_month_year: pet.birthMonthYear || null,
              race: pet.breed || null
            };
          });

          const { error: newPetLinkError } = await supabase
            .from('child_pets')
            .insert(newPetLinks);

          if (newPetLinkError) {
            console.error('Error linking new pets:', newPetLinkError);
            toast.warning("Profil créé mais erreur lors de l'association des nouveaux animaux");
          }
        }

        // 15. Gérer les animaux existants sélectionnés
        if (data.pets?.existingPetsData && data.pets.existingPetsData.length > 0) {
          const petLinks = data.pets.existingPetsData.map(pet => ({
            child_id: childId,
            pet_id: pet.id,
            name: pet.name,
            traits: '' // Peut être enrichi plus tard
          }));

          const { error: petLinkError } = await supabase
            .from('child_pets')
            .insert(petLinks);

          if (petLinkError) {
            console.error('Error linking existing pets:', petLinkError);
            toast.warning("Profil créé mais erreur lors de l'association des animaux existants");
          }
        }

        // 15b. Gérer les liens supplémentaires pour les animaux (enfants existants)
        if (data.pets?.petChildLinks) {
          const links: Array<{ child_id: string; pet_id: string; name: string; traits: string | null; traits_custom: any; relation_label: string | null; birth_month_year: string | null; race: string | null }> = [];
          
          Object.entries(data.pets.petChildLinks).forEach(([petId, childIds]) => {
            const pet = data.pets!.pets.find(p => p.id === petId);
            if (pet) {
              // Si le type est "other", utiliser le type personnalisé (otherType), sinon utiliser le type standard
              const relationLabel = pet.type === 'other' && pet.otherType 
                ? pet.otherType 
                : pet.type || null;
              
              childIds.forEach(existingChildId => {
                links.push({
                  child_id: existingChildId,
                  pet_id: createdPetIds[data.pets!.pets.indexOf(pet)] || petId,
                  name: pet.name || '',
                  traits: pet.traits?.join(', ') || null,
                  traits_custom: pet.customTraits && typeof pet.customTraits === 'object' ? pet.customTraits : null,
                  relation_label: relationLabel,
                  birth_month_year: pet.birthMonthYear || null,
                  race: pet.breed || null
                });
              });
            }
          });

          if (links.length > 0) {
            const { error } = await supabase
              .from('child_pets')
              .insert(links);
            
            if (error) console.error('Error creating additional pet links:', error);
          }
        }

        // 16. Sauvegarder les doudous dans comforters et child_comforters
        if (data.toys?.hasToys && data.toys?.toys && data.toys.toys.length > 0) {
          for (const toy of data.toys.toys) {
            // Si le doudou a déjà un comforterId, c'est un doudou existant à mettre à jour
            if (toy.comforterId) {
              // Mettre à jour le statut is_active du comforter existant
              const { error: updateError } = await supabase
                .from('comforters')
                .update({
                  is_active: toy.isActive !== false, // Par défaut actif si non spécifié
                  label: toy.name,
                  emoji: toy.type === 'plush' ? '🧸' : toy.type === 'blanket' ? '🛏️' : '✨'
                })
                .eq('id', toy.comforterId);

              if (updateError) {
                console.error('Error updating comforter:', updateError);
              }
            } else {
              // Créer un nouveau doudou dans comforters
              const { data: createdComforter, error: comforterError } = await supabase
                .from('comforters')
                .insert([{
                  label: toy.name,
                  emoji: toy.type === 'plush' ? '🧸' : toy.type === 'blanket' ? '🛏️' : '✨',
                  created_by: userId,
                  is_active: toy.isActive !== false // Par défaut actif si non spécifié
                }])
                .select()
                .maybeSingle();

              if (comforterError) {
                console.error('Error creating comforter:', comforterError);
                continue;
              }

              if (createdComforter) {
                // Lier le doudou à l'enfant dans child_comforters
                const { error: linkError } = await supabase
                  .from('child_comforters')
                  .insert([{
                    child_id: childId,
                    comforter_id: createdComforter.id,
                    name: toy.name,
                    appearance: toy.type,
                    roles: Array.isArray(toy.roles) ? toy.roles.join(', ') : toy.roles,
                    relation_label: toy.type
                  }]);

                if (linkError) {
                  console.error('Error linking comforter to child:', linkError);
                }
              }
            }
          }
        }
        
        // 17. Sauvegarder les lieux de vie dans places et child_places
        if (data.places?.places && data.places.places.length > 0) {
          console.log('📍 Saving places:', data.places.places);
          
          const createdPlaceIds: string[] = [];
          
          for (const place of data.places.places) {
            // Créer le lieu dans la table places
            const { data: createdPlace, error: placeError } = await supabase
              .from('places')
              .insert([{
                label: place.label,
                type: place.type,
                description: place.description || null,
                emoji: place.emoji || null,
                address: place.address || null,
                city: place.city || null,
                country: place.country || null,
                details: place.details || {},
                created_by: userId,
                family_id: familyId,
                is_active: true
              }])
              .select()
              .single();

            if (placeError) {
              console.error('Error creating place:', placeError);
              toast.warning(`Erreur lors de l'enregistrement du lieu ${place.label}`);
              continue;
            }

            createdPlaceIds.push(createdPlace.id);

            // Créer le lien child_places
            const { error: linkError } = await supabase
              .from('child_places')
              .insert([{
                child_id: childId,
                place_id: createdPlace.id,
                label: place.childLabel || null
              }]);

            if (linkError) {
              console.error('Error linking place to child:', linkError);
              toast.warning(`Erreur lors de l'association du lieu ${place.label} à l'enfant`);
            }
          }

          // 17b. Gérer les liens supplémentaires pour les lieux (enfants existants)
          if (data.places.placeChildLinks) {
            const links: Array<{ child_id: string; place_id: string; label: string | null }> = [];
            
            Object.entries(data.places.placeChildLinks).forEach(([placeId, childIds]) => {
              const place = data.places!.places.find(p => p.id === placeId);
              if (place) {
                childIds.forEach(existingChildId => {
                  links.push({
                    child_id: existingChildId,
                    place_id: createdPlaceIds[data.places!.places.indexOf(place)] || placeId,
                    label: place.childLabel || null
                  });
                });
              }
            });

            if (links.length > 0) {
              const { error } = await supabase
                .from('child_places')
                .insert(links);
              
              if (error) console.error('Error creating additional place links:', error);
            }
          }
        }
        
        // 18. Gérer les lieux existants sélectionnés
        const existingPlacesData = data.places?.existingPlacesData;
        if (existingPlacesData && existingPlacesData.length > 0) {
          console.log('📍 Linking existing places:', existingPlacesData);
          
          const placeLinks = existingPlacesData.map((place: any) => ({
            child_id: childId,
            place_id: place.id,
            label: null // Peut être enrichi plus tard si nécessaire
          }));

          const { error: placeLinkError } = await supabase
            .from('child_places')
            .insert(placeLinks);

          if (placeLinkError) {
            console.error('Error linking existing places:', placeLinkError);
            toast.warning("Profil créé mais erreur lors de l'association des lieux existants");
          }
        }
        
        // Clear stored form data only after a successful save
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error: any) {
        console.error('❌ [SUBMIT] Error in handleSubmit:', error);
        console.error('❌ [SUBMIT] Error message:', error?.message);
        console.error('❌ [SUBMIT] Error code:', error?.code);
        console.error('❌ [SUBMIT] Error details:', error?.details);
        console.error('❌ [SUBMIT] Error hint:', error?.hint);
        console.error('❌ [SUBMIT] Full error object:', JSON.stringify(error, null, 2));
        toast.error(`Une erreur est survenue lors de l'enregistrement: ${error?.message || error?.code || 'Erreur inconnue'}`);
        setIsSubmitting(false);
        return;
      }

    // Définir la destination en fonction du mode
    const destination = isGiftMode && nextPath ? nextPath : '/start-adventure';
    console.log("Will redirect to:", destination);

    // Navigate after a short delay so the toast is visible
    setTimeout(() => {
      console.log("Executing navigation to:", destination);
      setIsSubmitting(false);
      if (isGiftMode && nextPath) {
        navigate(nextPath, { state: { childProfile: data } });
      } else {
        navigate('/abonnement?context=adventure', { state: { childProfile: data } });
      }
    }, 1000);
  };

  return { handleSubmit, isSubmitting };
};
