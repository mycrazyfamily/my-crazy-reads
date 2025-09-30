
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
      const { error } = await (supabase as any)
        .from('drafts')
        .insert([
          {
            type: 'child_profile',
            data,
            created_by: userId,
          }
        ]);

      if (error) {
        console.error('Error saving child profile draft:', error);
        toast.error("Impossible d'enregistrer le profil. Réessayez.");
      } else {
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
