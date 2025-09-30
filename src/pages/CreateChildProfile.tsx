
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import FormSteps from '@/components/childProfile/FormSteps';
import { ChildProfileFormProvider } from '@/contexts/ChildProfileFormContext';
import { useChildProfileSubmit } from '@/hooks/useChildProfileSubmit';
import 'react-datepicker/dist/react-datepicker.css';
import type { ChildProfileFormData } from '@/types/childProfile';

type CreateChildProfileProps = {
  isGiftMode?: boolean;
  familyCode?: string;
  nextPath?: string;
  initialStep?: number;
  editMode?: boolean;
  editChildId?: string;
};

const CreateChildProfile = ({ 
  isGiftMode = false, 
  familyCode, 
  nextPath,
  initialStep,
  editMode = false,
  editChildId
}: CreateChildProfileProps) => {
  const navigate = useNavigate();
  const { handleSubmit } = useChildProfileSubmit({ isGiftMode, nextPath });
  const location = useLocation();
  const locationState = location.state as { targetStep?: number } | null;
  
  const handleFormSubmit = async (data: ChildProfileFormData) => {
    if (editMode && editChildId) {
      // Mode édition : mettre à jour le profil existant
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Serialiser les données (convertir Date en string)
        const serializedData = JSON.parse(JSON.stringify(data));
        
        const { error } = await supabase
          .from('drafts')
          .update({
            data: serializedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editChildId);

        if (error) throw error;

        toast.success("Profil modifié avec succès !");
        navigate('/espace-famille');
      } catch (error) {
        console.error('Error updating child profile:', error);
        toast.error("Erreur lors de la mise à jour");
      }
    } else {
      // Mode création : utiliser la logique normale
      await handleSubmit(data);
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
        >
          <FormSteps 
            isGiftMode={isGiftMode} 
            nextButtonText={isGiftMode ? "Continuer vers le choix du thème →" : undefined}
            onFormSubmit={isGiftMode ? () => {} : undefined}
            editMode={editMode}
          />
        </ChildProfileFormProvider>
      </div>
    </div>
  );
};

export default CreateChildProfile;
