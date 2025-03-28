
import React from 'react';
import { useChildProfileForm } from '@/contexts/ChildProfileFormContext';
import BasicInfoForm from '@/components/childProfile/BasicInfoForm';
import PersonalityForm from '@/components/childProfile/PersonalityForm';
import FamilyForm from '@/components/childProfile/FamilyForm';
import PetsForm from '@/components/childProfile/PetsForm';
import ToysForm from '@/components/childProfile/ToysForm';
import WorldsForm from '@/components/childProfile/WorldsForm';
import FinalSummary from '@/components/childProfile/FinalSummary';

type FormStepsProps = {
  isGiftMode?: boolean;
  nextButtonText?: string;
  onFormSubmit: () => void;
};

const FormSteps: React.FC<FormStepsProps> = ({ isGiftMode = false, nextButtonText, onFormSubmit }) => {
  const { 
    formStep, 
    handleNextStep, 
    handlePreviousStep, 
    handleGoToStep,
    selectedNickname,
    setSelectedNickname,
    selectedSkinColor,
    setSelectedSkinColor,
    selectedEyeColor,
    setSelectedEyeColor,
    selectedHairColor,
    setSelectedHairColor
  } = useChildProfileForm();

  // Fonction pour gérer la soumission finale du formulaire
  const handleFinalSubmit = () => {
    console.log("Final form submission triggered");
    onFormSubmit();
  };

  return (
    <>
      {formStep === 0 && (
        <BasicInfoForm 
          selectedNickname={selectedNickname}
          setSelectedNickname={setSelectedNickname}
          selectedSkinColor={selectedSkinColor}
          setSelectedSkinColor={setSelectedSkinColor}
          selectedEyeColor={selectedEyeColor}
          setSelectedEyeColor={setSelectedEyeColor}
          selectedHairColor={selectedHairColor}
          setSelectedHairColor={setSelectedHairColor}
          handleNextStep={handleNextStep}
        />
      )}

      {formStep === 1 && (
        <PersonalityForm
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
        />
      )}

      {formStep === 2 && (
        <FamilyForm
          handlePreviousStep={handlePreviousStep}
          onSubmit={() => handleNextStep()}
        />
      )}

      {formStep === 3 && (
        <PetsForm
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
        />
      )}

      {formStep === 4 && (
        <ToysForm
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
        />
      )}

      {formStep === 5 && (
        <WorldsForm
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
        />
      )}

      {formStep === 6 && (
        <FinalSummary
          handlePreviousStep={handlePreviousStep}
          handleGoToStep={handleGoToStep}
          handleSubmit={handleFinalSubmit}
          isGiftMode={isGiftMode}
          nextButtonText={nextButtonText}
        />
      )}
    </>
  );
};

export default FormSteps;
