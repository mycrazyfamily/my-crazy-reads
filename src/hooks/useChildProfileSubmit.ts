
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChildProfileFormData } from '@/types/childProfile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type UseChildProfileSubmitProps = {
  isGiftMode?: boolean;
  nextPath?: string;
};

export const useChildProfileSubmit = ({ isGiftMode = false, nextPath }: UseChildProfileSubmitProps) => {
  const navigate = useNavigate();
  const { supabaseSession } = useAuth();
  const FORM_STORAGE_KEY = 'child-profile-form-state';

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

  const handleSubmit = async (data: ChildProfileFormData) => {
    console.log("Handling form submission with data:", data);

    // Récupérer la session la plus récente au moment de la soumission
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found. Cannot save profile.');
      toast.error("Veuillez vous connecter pour sauvegarder le profil.");
      return; // Arrêter l'exécution si pas d'utilisateur authentifié
    }

    try {
        // 1. Vérifier si l'utilisateur a déjà une famille, sinon en créer une
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading user profile:', profileError);
          toast.error("Erreur lors du chargement du profil utilisateur");
          return;
        }

        let familyId = userProfile.family_id;

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
        const createdFamilyMemberIds: string[] = [];
        
        if (data.family?.relatives && data.family.relatives.length > 0) {
          const familyMembersToCreate = data.family.relatives.map(relative => ({
            family_id: familyId,
            name: relative.firstName,
            role: relative.type,
            avatar: '👤', // On pourrait générer un avatar basé sur le type
          }));

          const { data: createdMembers, error: membersError } = await supabase
            .from('family_members')
            .insert(familyMembersToCreate)
            .select();

          if (membersError) {
            console.error('Error creating family members:', membersError);
            toast.warning("Proches créés mais erreur lors de l'enregistrement");
          } else if (createdMembers) {
            createdFamilyMemberIds.push(...createdMembers.map(m => m.id));
          }
        }
        // 3. Créer le profil enfant dans child_profiles
        const { data: childProfile, error: childError } = await supabase
          .from('child_profiles')
          .insert([
            {
              family_id: familyId,
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
              has_pet: data.pets?.hasPets || false
            }
          ])
          .select()
          .single();

        if (childError) {
          console.error('Error creating child profile:', childError);
          toast.error("Impossible d'enregistrer le profil. Réessayez.");
          return;
        }

        const childId = childProfile.id;
        
        // 4. Ajouter les superpowers, passions, challenges
        if (data.superpowers && data.superpowers.length > 0) {
          const { error: traitsError } = await supabase
            .from('child_traits')
            .insert(data.superpowers.map(trait => ({ child_id: childId, trait_id: trait })));
          if (traitsError) console.error('Error adding traits:', traitsError);
        }
        
        if (data.passions && data.passions.length > 0) {
          const { error: passionsError } = await supabase
            .from('child_passions')
            .insert(data.passions.map(passion => ({ child_id: childId, passion_id: passion })));
          if (passionsError) console.error('Error adding passions:', passionsError);
        }
        
        if (data.challenges && data.challenges.length > 0) {
          const { error: challengesError } = await supabase
            .from('child_challenges')
            .insert(data.challenges.map(challenge => ({ child_id: childId, challenge_id: challenge })));
          if (challengesError) console.error('Error adding challenges:', challengesError);
        }
        
        if (data.worlds?.favoriteWorlds && data.worlds.favoriteWorlds.length > 0) {
          const { error: worldsError } = await supabase
            .from('child_universes')
            .insert(data.worlds.favoriteWorlds.map(world => ({ child_id: childId, universe_id: world })));
          if (worldsError) console.error('Error adding worlds:', worldsError);
        }
        
        if (data.worlds?.discoveries && data.worlds.discoveries.length > 0) {
          const { error: discoveriesError } = await supabase
            .from('child_discoveries')
            .insert(data.worlds.discoveries.map(discovery => ({ child_id: childId, discovery_id: discovery })));
          if (discoveriesError) console.error('Error adding discoveries:', discoveriesError);
        }

        // 5. Créer les liens child_family_members pour les nouveaux proches créés
        if (createdFamilyMemberIds.length > 0) {
          const familyMemberLinks = createdFamilyMemberIds.map(familyMemberId => ({
            child_id: childId,
            family_member_id: familyMemberId
          }));

          const { error: linkError } = await supabase
            .from('child_family_members')
            .insert(familyMemberLinks);

          if (linkError) {
            console.error('Error linking new family members:', linkError);
            toast.warning("Profil créé mais erreur lors de l'association des proches");
          }
        }

        // 6. Gérer les proches existants sélectionnés
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

        // 7. Créer les nouveaux animaux dans la table pets
        const createdPetIds: string[] = [];
        
        if (data.pets?.pets && data.pets.pets.length > 0) {
          const petsToCreate = data.pets.pets.map(pet => ({
            family_id: familyId,
            name: pet.name,
            type: pet.type || pet.otherType || 'autre',
            emoji: null
          }));

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

        // 8. Créer les liens child_pets pour les nouveaux animaux créés
        if (createdPetIds.length > 0 && data.pets?.pets) {
          const newPetLinks = createdPetIds.map((petId, index) => ({
            child_id: childId,
            pet_id: petId,
            name: data.pets!.pets[index].name,
            traits: data.pets!.pets[index].traits?.join(', ') || null,
            relation_label: data.pets!.pets[index].type || data.pets!.pets[index].otherType || null
          }));

          const { error: newPetLinkError } = await supabase
            .from('child_pets')
            .insert(newPetLinks);

          if (newPetLinkError) {
            console.error('Error linking new pets:', newPetLinkError);
            toast.warning("Profil créé mais erreur lors de l'association des nouveaux animaux");
          }
        }

        // 9. Gérer les animaux existants sélectionnés
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

        // 10. Sauvegarder les doudous dans comforters et child_comforters
        if (data.toys?.hasToys && data.toys?.toys && data.toys.toys.length > 0) {
          for (const toy of data.toys.toys) {
            // Créer le doudou dans comforters
            const { data: createdComforter, error: comforterError } = await supabase
              .from('comforters')
              .insert([{
                label: toy.name,
                emoji: toy.type === 'plush' ? '🧸' : toy.type === 'blanket' ? '🛏️' : '✨',
                created_by: userId
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
                  roles: Array.isArray(toy.roles) ? toy.roles.join(', ') : toy.roles
                }]);

              if (linkError) {
                console.error('Error linking comforter to child:', linkError);
              }
            }
          }
        }

        toast.success(isGiftMode
          ? "Profil créé et sauvegardé !"
          : "Profil enregistré, l'aventure peut commencer !");
        
        // Clear stored form data only after a successful save
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        toast.error("Une erreur est survenue lors de l'enregistrement");
        return;
      }

    // Définir la destination en fonction du mode
    const destination = isGiftMode && nextPath ? nextPath : '/start-adventure';
    console.log("Will redirect to:", destination);

    // Navigate after a short delay so the toast is visible
    setTimeout(() => {
      console.log("Executing navigation to:", destination);
      if (isGiftMode && nextPath) {
        navigate(nextPath, { state: { childProfile: data } });
      } else {
        navigate('/start-adventure', { state: { childProfile: data } });
      }
    }, 1000);
  };

  return { handleSubmit };
};
