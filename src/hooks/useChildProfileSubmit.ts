
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
    
    // Clear stored form data
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    // Show success message
    toast.success(isGiftMode 
      ? "Profil créé avec succès !" 
      : "L'aventure de votre enfant commence maintenant !");
    
    // Définir la destination en fonction du mode
    const destination = isGiftMode && nextPath ? nextPath : '/start-adventure';
    console.log("Redirecting to:", destination);
    
    // Utiliser setTimeout pour s'assurer que la redirection se produit après la notification
    setTimeout(() => {
      if (isGiftMode && nextPath) {
        navigate(nextPath, { state: { childProfile: data } });
      } else {
        navigate('/start-adventure', { state: { childProfile: data } });
      }
    }, 1500); // Increased timeout to ensure redirection happens
  };

  return { handleSubmit };
};
