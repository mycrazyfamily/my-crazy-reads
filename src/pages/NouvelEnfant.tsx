import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import CreateChildProfile from './CreateChildProfile';
import 'react-datepicker/dist/react-datepicker.css';

const NouvelEnfant: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editChildId = searchParams.get('edit');

  const handleGoBack = () => {
    // Si on est en mode édition, toujours retourner à l'espace famille
    if (editChildId) {
      navigate('/espace-famille');
    } else {
      // Sinon, essayer de revenir en arrière ou aller à l'espace famille
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/espace-famille');
      }
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-mcf-primary hover:bg-mcf-mint/10 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
      <CreateChildProfile 
        key={editChildId ? `edit-${editChildId}` : 'create-new'}
        isGiftMode={false} 
        nextPath="/espace-famille"
        initialStep={0}
        editMode={!!editChildId}
        editChildId={editChildId || undefined}
        useSavedDraft={!editChildId}
      />
    </div>
  );
};

export default NouvelEnfant;