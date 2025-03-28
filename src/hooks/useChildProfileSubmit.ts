
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChildProfileFormData } from '@/types/childProfile';

type UseChildProfileSubmitProps = {
  isGiftMode?: boolean;
  nextPath?: string;
};

export const useChildProfileSubmit = ({ isGiftMode = false, nextPath }: UseChildProfileSubmitProps) => {
  const navigate = useNavigate();
  const FORM_STORAGE_KEY = 'child-profile-form-state';

  const handleSubmit = (data: ChildProfileFormData) => {
    console.log("Handling form submission:", data);
    toast.success("Profil créé avec succès !");
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    // Définir la destination en fonction du mode
    const destination = isGiftMode && nextPath ? nextPath : '/pret-a-demarrer';
    console.log("Redirecting to:", destination);
    
    // Utiliser setTimeout pour s'assurer que la redirection se produit après la notification
    setTimeout(() => {
      if (isGiftMode && nextPath) {
        navigate(nextPath, { state: { childProfile: data } });
      } else {
        navigate('/pret-a-demarrer');
      }
    }, 300);
  };

  return { handleSubmit };
};
