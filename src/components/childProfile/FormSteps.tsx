
import React from 'react';
import { useChildProfileForm } from '@/contexts/ChildProfileFormContext';
import BasicInfoForm from '@/components/childProfile/BasicInfoForm';
import PersonalityForm from '@/components/childProfile/PersonalityForm';
import FamilyForm from '@/components/childProfile/FamilyForm';
import PetsForm from '@/components/childProfile/PetsForm';
import ToysForm from '@/components/childProfile/ToysForm';
import WorldsForm from '@/components/childProfile/WorldsForm';
import { PlacesForm } from '@/components/childProfile/PlacesForm';
import FinalSummary from '@/components/childProfile/FinalSummary';
import NavigationButtons from '@/components/childProfile/personality/NavigationButtons';
import FormProgressIndicator from '@/components/FormProgressIndicator';
import ErrorBoundary from '@/components/util/ErrorBoundary';

type FormStepsProps = {
  isGiftMode?: boolean;
  nextButtonText?: string;
  onFormSubmit?: () => void; // Rendu optionnel
  editMode?: boolean;
  editChildId?: string;
  isSubmitting?: boolean;
};

const FormSteps: React.FC<FormStepsProps> = ({ 
  isGiftMode = false, 
  nextButtonText, 
  onFormSubmit, 
  editMode = false, 
  editChildId,
  isSubmitting = false 
}) => {
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
    : ['Infos', 'Personnalité', 'Famille', 'Animaux', 'Jouets', 'Univers', 'Lieux', 'Résumé'];
  
  const totalSteps = editMode ? 5 : 8;
  
  // Mapping correct des étapes en mode édition
  const getAdjustedStep = () => {
    if (!editMode) return formStep;
    
    const stepMap: { [key: number]: number } = {
      0: 0, // Infos
      1: 1, // Personnalité
      4: 2, // Jouets
      5: 3, // Univers
      7: 4, // Résumé
    };
    
    return stepMap[formStep] ?? 0;
  };
  
  const adjustedStep = getAdjustedStep();

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

      {formStep === 6 && !editMode && (
        <PlacesForm
          onNext={goNext}
          onPrev={goPrev}
        />
      )}

      {formStep === 7 && (
        <FinalSummary
          handlePreviousStep={handlePreviousStep}
          handleGoToStep={handleGoToStep}
          handleSubmit={handleFinalSubmit}
          isGiftMode={isGiftMode}
          nextButtonText={nextButtonText}
          isSubmitting={isSubmitting}
          editMode={editMode}
          editChildId={editChildId}
        />
      )}
    </>
  );
};

export default FormSteps;
