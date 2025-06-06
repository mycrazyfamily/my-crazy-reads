
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from "sonner";
import { 
  SUPERPOWERS_OPTIONS, 
  PASSIONS_OPTIONS, 
  CHALLENGES_OPTIONS 
} from '@/constants/childProfileOptions';
import type { ChildProfileFormData } from '@/types/childProfile';
import HeightSelector from './personality/HeightSelector';
import MultiSelectOptionsGroup from './personality/MultiSelectOptionsGroup';
import NavigationButtons from './personality/NavigationButtons';

type PersonalityFormProps = {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
};

const PersonalityForm: React.FC<PersonalityFormProps> = ({
  handleNextStep,
  handlePreviousStep
}) => {
  const form = useFormContext<ChildProfileFormData>();

  const handleContinue = () => {
    // Vérifier si les champs de la section 2 sont valides
    const superpowers = form.getValues().superpowers || [];
    const passions = form.getValues().passions || [];
    const challenges = form.getValues().challenges || [];

    // Validation des sélections maximales
    if (superpowers.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 super-pouvoirs");
      return;
    }
    if (passions.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 passions");
      return;
    }
    if (challenges.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 défis");
      return;
    }

    // Passer à l'étape suivante
    handleNextStep();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
        <span className="text-2xl">🎭</span> Personnalité et passions <span className="text-2xl">🚀</span>
      </h2>
      
      <form className="space-y-8">
        {/* Taille par rapport à son âge */}
        <HeightSelector />

        {/* Super-pouvoirs */}
        <MultiSelectOptionsGroup 
          fieldName="superpowers"
          options={SUPERPOWERS_OPTIONS}
          label="Quels sont les super-pouvoirs de votre enfant ? (3 max)"
          icon="🦸‍♀️"
        />
        
        {/* Passions */}
        <MultiSelectOptionsGroup 
          fieldName="passions"
          options={PASSIONS_OPTIONS}
          label="Qu'aime le plus votre enfant ? (3 max)"
          icon="💖"
        />

        {/* Défis */}
        <MultiSelectOptionsGroup 
          fieldName="challenges"
          options={CHALLENGES_OPTIONS}
          label="Quels sont les grands défis de votre enfant ? (3 max)"
          icon="🏆"
        />

        <NavigationButtons 
          handlePreviousStep={handlePreviousStep}
          handleContinue={handleContinue}
        />
      </form>
    </div>
  );
};

export default PersonalityForm;
