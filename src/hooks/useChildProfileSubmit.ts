
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
    console.log(data);
    toast.success("Profil créé avec succès !");
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    if (isGiftMode && nextPath) {
      navigate(nextPath, { state: { childProfile: data } });
    } else {
      navigate('/pret-a-demarrer');
    }
  };

  return { handleSubmit };
};
