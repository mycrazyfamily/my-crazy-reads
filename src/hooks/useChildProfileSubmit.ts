
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

  const handleSubmit = async (data: ChildProfileFormData) => {
    console.log("Handling form submission with data:", data);

    const userId = supabaseSession?.user?.id;
    if (!userId) {
      console.warn('No authenticated user found. Skipping server save.');
      toast.error("Veuillez vous connecter pour sauvegarder le profil.");
    } else {
      try {
        // 1. Vérifier si l'utilisateur a déjà une famille, sinon en créer une
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error loading user profile:', profileError);
          toast.error("Erreur lors du chargement du profil utilisateur");
          return;
        }

        let familyId = userProfile.family_id;

        // Si pas de famille, en créer une
        if (!familyId) {
          const { data: newFamily, error: familyError } = await supabase
            .from('families')
            .insert([{ 
              name: `Famille de ${data.firstName || 'utilisateur'}`,
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

        // 3. Serialiser les données du draft (convertir Date en string)
        const serializedData = JSON.parse(JSON.stringify(data));
        
        // 4. Créer le draft du profil enfant
        const { data: draft, error: draftError } = await supabase
          .from('drafts')
          .insert([
            {
              type: 'child_profile',
              data: serializedData,
              created_by: userId,
            }
          ])
          .select()
          .single();

        if (draftError) {
          console.error('Error saving child profile draft:', draftError);
          toast.error("Impossible d'enregistrer le profil. Réessayez.");
          return;
        }

        const childId = draft.id;

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
          const existingRelativesLinks: string[] = [];
          
          for (const existingRelative of data.family.existingRelativesData) {
            // Vérifier si c'est un proche qui vient des drafts (ID temporaire)
            if (existingRelative.isFromDraft && existingRelative.relativeData) {
              // Créer ce proche dans family_members
              const { data: newMember, error: memberError } = await supabase
                .from('family_members')
                .insert([{
                  family_id: familyId,
                  name: existingRelative.name,
                  role: existingRelative.role,
                  avatar: existingRelative.avatar || '👤',
                }])
                .select()
                .single();

              if (memberError) {
                console.error('Error creating family member from draft:', memberError);
              } else if (newMember) {
                existingRelativesLinks.push(newMember.id);
              }
            } else {
              // C'est un proche qui existe déjà dans family_members
              existingRelativesLinks.push(existingRelative.id);
            }
          }

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
