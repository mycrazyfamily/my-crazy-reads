// FormSteps v1.2
// Changelog v1.2 (AFFICHAGE UNIQUEMENT) : en mode édition, affiche un skeleton de champs tant que
// le contexte charge les données (isEditDataLoading) → supprime l'effet « valeurs par défaut qui
// se remplissent » à l'ouverture. La barre de progression reste affichée (stable). Rien d'autre changé.
// FormSteps v1.1
// Changelog v1.1 : étape Jouets retirée du mode édition (garde !editMode ajoutée, cohérent avec
// Famille/Animaux/Lieux) + stepLabels/totalSteps/stepMap mis à jour en conséquence (4 étapes
// au lieu de 5 en édition). Contrepartie obligatoire dans ChildProfileFormContext.tsx (v1.1).
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
    handleSubmitForm,
    isEditDataLoading
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
    ? ['Infos', 'Personnalité', 'Univers', 'Résumé']
    : ['Infos', 'Personnalité', 'Famille', 'Animaux', 'Jouets', 'Univers', 'Lieux', 'Résumé'];
  
  const totalSteps = editMode ? 4 : 8;
  
  // Mapping correct des étapes en mode édition
  const getAdjustedStep = () => {
    if (!editMode) return formStep;
    
    const stepMap: { [key: number]: number } = {
      0: 0, // Infos
      1: 1, // Personnalité
      5: 2, // Univers
      7: 3, // Résumé
    };
    
    return stepMap[formStep] ?? 0;
  };
  
  const adjustedStep = getAdjustedStep();

  // v1.2 : pendant le chargement des données d'édition, on montre un skeleton de champs au lieu des
  // valeurs par défaut (qui « sauteraient » ensuite aux vraies valeurs). La barre de progression est
  // conservée à l'identique → pas de décalage au moment où les vrais champs apparaissent.
  if (isEditDataLoading) {
    return (
      <>
        <FormProgressIndicator
          currentStep={adjustedStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />
        <div className="space-y-6 animate-pulse mt-6" aria-hidden="true">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="h-16 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
          <div className="flex justify-end pt-4">
            <div className="h-10 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      </>
    );
  }

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

      {formStep === 4 && !editMode && (
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
