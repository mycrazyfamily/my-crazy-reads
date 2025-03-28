
import React from 'react';
import { Form } from "@/components/ui/form";
import FormSteps from '@/components/childProfile/FormSteps';
import { ChildProfileFormProvider } from '@/contexts/ChildProfileFormContext';
import { useChildProfileSubmit } from '@/hooks/useChildProfileSubmit';
import type { ChildProfileFormData } from '@/types/childProfile';

type CreateChildProfileProps = {
  isGiftMode?: boolean;
  familyCode?: string;
  nextPath?: string;
};

const CreateChildProfile = ({ isGiftMode = false, familyCode, nextPath }: CreateChildProfileProps) => {
  const { handleSubmit } = useChildProfileSubmit({ isGiftMode, nextPath });

  const triggerFormSubmit = () => {
    console.log("Triggering form submit");
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    } else {
      console.error("Form element not found");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-mcf-orange-dark">
        {isGiftMode ? "Profil de l'enfant pour son livre cadeau 🎁" : "Créer le profil de l'enfant"}
      </h1>
      <p className="text-center text-gray-600 mb-8">
        {isGiftMode 
          ? "Pour offrir une histoire vraiment personnalisée, remplissez ces informations sur l'enfant"
          : "Personnalisez l'aventure magique de votre enfant en nous parlant de lui/elle"
        }
      </p>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-amber/20">
        <ChildProfileFormProvider familyCode={familyCode} onSubmit={handleSubmit}>
          <FormSteps 
            isGiftMode={isGiftMode} 
            nextButtonText={isGiftMode ? "Continuer vers le choix du thème →" : undefined}
            onFormSubmit={triggerFormSubmit}
          />
        </ChildProfileFormProvider>
      </div>
    </div>
  );
};

export default CreateChildProfile;
