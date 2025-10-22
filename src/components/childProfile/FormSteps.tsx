
import React from 'react';
import { useChildProfileForm } from '@/contexts/ChildProfileFormContext';
import BasicInfoForm from '@/components/childProfile/BasicInfoForm';
import PersonalityForm from '@/components/childProfile/PersonalityForm';
import FamilyForm from '@/components/childProfile/FamilyForm';
import PetsForm from '@/components/childProfile/PetsForm';
import ToysForm from '@/components/childProfile/ToysForm';
import WorldsForm from '@/components/childProfile/WorldsForm';
import FinalSummary from '@/components/childProfile/FinalSummary';
import NavigationButtons from '@/components/childProfile/personality/NavigationButtons';
import FormProgressIndicator from '@/components/FormProgressIndicator';
import ErrorBoundary from '@/components/util/ErrorBoundary';

type FormStepsProps = {
  isGiftMode?: boolean;
  nextButtonText?: string;
  onFormSubmit?: () => void; // Rendu optionnel
  editMode?: boolean;
  isSubmitting?: boolean;
};

const FormSteps: React.FC<FormStepsProps> = ({ isGiftMode = false, nextButtonText, onFormSubmit, editMode = false, isSubmitting = false }) => {
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
    setSelectedHairColor,
    handleSubmitForm
  } = useChildProfileForm();

  const goNext = React.useCallback(() => {
    console.log("🎯 Changing step:", formStep, "→", formStep + 1)
    handleNextStep()
  }, [formStep, handleNextStep])
  const goPrev = React.useCallback(() => {
    console.log("🎯 Changing step:", formStep, "→", formStep - 1)
    handlePreviousStep()
  }, [formStep, handlePreviousStep])
  const goTo = React.useCallback((n: number) => {
    console.log("🎯 Changing step:", formStep, "→", n)
    handleGoToStep(n)
  }, [formStep, handleGoToStep])

  console.log("Current form step:", formStep);

  // Fonction pour gérer la soumission finale du formulaire
  const handleFinalSubmit = () => {
    console.log("Final form submission triggered via direct context call");
    handleSubmitForm(); // Appel direct de la méthode du contexte
    if (onFormSubmit) {
      onFormSubmit();
    }
  };

  const stepLabels = editMode 
    ? ['Infos', 'Personnalité', 'Jouets', 'Univers', 'Résumé']
    : ['Infos', 'Personnalité', 'Famille', 'Animaux', 'Jouets', 'Univers', 'Résumé'];
  
  const totalSteps = editMode ? 5 : 7;
  const adjustedStep = editMode && formStep > 1 ? formStep - 2 : formStep;

  return (
    <>
      <FormProgressIndicator 
        currentStep={adjustedStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
      />
      
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
          handleNextStep={goNext}
        />
      )}

      {formStep === 1 && (
        <PersonalityForm
          handleNextStep={goNext}
          handlePreviousStep={goPrev}
        />
      )}

      {formStep === 2 && !editMode && (
        <ErrorBoundary fallback={<div>Erreur dans la fiche proche</div>}>
          <FamilyForm
            handlePreviousStep={goPrev}
            onSubmit={() => goNext()}
          />
        </ErrorBoundary>
      )}

      {formStep === 3 && !editMode && (
        <PetsForm
          handleNextStep={goNext}
          handlePreviousStep={goPrev}
        />
      )}

      {formStep === 4 && (
        <ToysForm
          handleNextStep={goNext}
          handlePreviousStep={goPrev}
        />
      )}

      {formStep === 5 && (
        <WorldsForm
          handleNextStep={goNext}
          handlePreviousStep={goPrev}
        />
      )}

      {formStep === 6 && (
        <FinalSummary
          handlePreviousStep={handlePreviousStep}
          handleGoToStep={handleGoToStep}
          handleSubmit={handleFinalSubmit}
          isGiftMode={isGiftMode}
          nextButtonText={nextButtonText}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default FormSteps;
