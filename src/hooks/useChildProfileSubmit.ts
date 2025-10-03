
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
      // Serialiser les données (convertir Date en string)
      const serializedData = JSON.parse(JSON.stringify(data));
      
      // D'abord créer le draft du profil enfant
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
      } else {
        // Si des proches existants ont été sélectionnés, créer les liens
        if (data.family?.existingRelativeIds && data.family.existingRelativeIds.length > 0 && draft) {
          const childId = draft.id;
          
          // Créer les liens dans child_family_members
          const familyMemberLinks = data.family.existingRelativeIds.map(familyMemberId => ({
            child_id: childId,
            family_member_id: familyMemberId
          }));

          const { error: linkError } = await supabase
            .from('child_family_members')
            .insert(familyMemberLinks);

          if (linkError) {
            console.error('Error linking existing family members:', linkError);
            toast.warning("Profil créé mais erreur lors de l'association des proches existants");
          }
        }

        toast.success(isGiftMode
          ? "Profil créé et sauvegardé !"
          : "Profil enregistré, l'aventure peut commencer !");
        // Clear stored form data only after a successful save
        localStorage.removeItem(FORM_STORAGE_KEY);
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
