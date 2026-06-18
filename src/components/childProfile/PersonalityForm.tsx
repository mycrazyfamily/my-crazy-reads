import React from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from "sonner";
import { 
  SUPERPOWERS_OPTIONS, 
  PASSIONS_OPTIONS, 
  CHALLENGES_OPTIONS 
} from '@/constants/childProfileOptions';
import type { ChildProfileFormData } from '@/types/childProfile';
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
    // Validation obligatoire : au moins 1 sélection dans chaque catégorie
    const superpowers = form.getValues().superpowers || [];
    const passions = form.getValues().passions || [];
    const challenges = form.getValues().challenges || [];
    const errors: string[] = [];
    if (superpowers.length === 0) {
      errors.push("au moins un super-pouvoir");
    }
    if (passions.length === 0) {
      errors.push("au moins une passion");
    }
    if (challenges.length === 0) {
      errors.push("au moins un défi");
    }
    if (errors.length > 0) {
      toast.error(`Veuillez sélectionner : ${errors.join(', ')}`);
      return;
    }
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
    handleNextStep();
  };
  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-primary">
        Personnalité et passions
      </h2>
      
      <div className="space-y-8" role="group" aria-label="Personnalité">
        {/* Super-pouvoirs */}
        <MultiSelectOptionsGroup 
          fieldName="superpowers"
          options={SUPERPOWERS_OPTIONS}
          label="Quels sont les super-pouvoirs de votre enfant ? (3 max)"
        />
        
        {/* Passions */}
        <MultiSelectOptionsGroup 
          fieldName="passions"
          options={PASSIONS_OPTIONS}
          label="Qu'aime le plus votre enfant ? (3 max)"
        />
        {/* Défis */}
        <MultiSelectOptionsGroup 
          fieldName="challenges"
          options={CHALLENGES_OPTIONS}
          label="Quels sont les grands défis de votre enfant ? (3 max)"
        />
        <NavigationButtons 
          handlePreviousStep={handlePreviousStep}
          handleContinue={handleContinue}
        />
      </div>
    </div>
  );
};
export default PersonalityForm;