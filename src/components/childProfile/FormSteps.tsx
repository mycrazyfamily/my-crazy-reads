// FormSteps v1.6
// Changelog v1.6 (chantier D2) : le clic sur un rond de l'indicateur VALIDE le formulaire
//   avant d'avancer, et ne valide rien pour reculer. Detail au-dessus de allerVersRond.
// FormSteps v1.5
// Changelog v1.5 (chantier D2) : transmission de maxStepAtteint a FormProgressIndicator,
//   avec la conversion etape reelle vers index affiche qu'impose le mode edition.
// FormSteps v1.4
// Changelog v1.4 (chantier D2) : les ronds d'etape deviennent cliquables pour revenir en
//   arriere. FormProgressIndicator v1.2 n'autorise que les etapes DEJA VISITEES. Une
//   traduction inverse est necessaire en mode edition, ou getAdjustedStep compresse 8 etapes
//   en 4 : sans elle, un clic sur le rond 3 renverrait a Animaux au lieu d'Univers.
//   Le squelette de chargement ne recoit PAS onStepClick : cliquer pendant le chargement
//   des donnees n'aurait pas de sens.
// FormSteps v1.3
// Changelog v1.3 (AFFICHAGE UNIQUEMENT) : prop forceLoading — permet au parent de garder le skeleton
// affiché tant que l'avatar du haut n'est pas prêt, pour révéler avatar + champs EN MÊME TEMPS.
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
import { toast } from "sonner";
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
  /** Force le skeleton même si les données du form sont prêtes (ex. attente de l'avatar en haut). */
  forceLoading?: boolean;
};

const FormSteps: React.FC<FormStepsProps> = ({ 
  isGiftMode = false, 
  nextButtonText, 
  onFormSubmit, 
  editMode = false, 
  editChildId,
  isSubmitting = false,
  forceLoading = false
}) => {
  const { 
    form,
    formStep, 
    handleNextStep, 
    handlePreviousStep, 
    handleGoToStep,
    maxStepAtteint,
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

  // v1.4 (chantier D2) : traduction INVERSE de l'index affiche vers l'etape reelle.
  // En mode edition, 8 etapes sont compressees en 4 par getAdjustedStep ; sans cette
  // traduction, un clic sur le rond 3 renverrait a formStep 3 (Animaux) au lieu de
  // formStep 5 (Univers). Hors edition les deux index coincident.
  // v1.5 : conversion dans l'autre sens, pour traduire maxStepAtteint (une etape REELLE)
  // en index affiche. Meme table que getAdjustedStep, avec repli sur l'etape la plus
  // proche vers le bas pour les etapes masquees en mode edition.
  // v1.6 (chantier D2) : clic sur un rond de l'indicateur.
  //
  // RECULER est toujours permis, sans validation, exactement comme le bouton « Étape
  // précédente ». Sans cette dissymetrie on creerait une impasse : un formulaire rendu
  // invalide par un champ de l'etape 2 empecherait de cliquer sur le rond 2, c'est-a-dire
  // sur l'endroit meme ou se trouve le probleme a corriger.
  //
  // AVANCER applique la MEME validation que « Continuer », soit form.trigger(). Sans elle,
  // on pouvait revenir a une etape deja validee, vider un champ obligatoire comme le prenom,
  // puis sauter directement a l'etape 5 sans le moindre avertissement. La validation finale
  // rattrapait le coup, mais tres loin de l'endroit ou le champ manquait.
  const allerVersRond = React.useCallback(async (indexAffiche: number) => {
    const cible = etapeReelleDepuisAffichee(indexAffiche);
    if (cible <= formStep) {
      goTo(cible);
      return;
    }
    const estValide = await form.trigger();
    if (!estValide) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    goTo(cible);
  }, [formStep, form, goTo, editMode]);

  const etapeAfficheeDepuisReelle = (etapeReelle: number): number => {
    if (!editMode) return etapeReelle;
    if (etapeReelle >= 7) return 3;
    if (etapeReelle >= 5) return 2;
    if (etapeReelle >= 1) return 1;
    return 0;
  };

  const etapeReelleDepuisAffichee = (indexAffiche: number): number => {
    if (!editMode) return indexAffiche;
    const inverse: { [key: number]: number } = { 0: 0, 1: 1, 2: 5, 3: 7 };
    return inverse[indexAffiche] ?? 0;
  };

  // v1.2 : pendant le chargement des données d'édition, on montre un skeleton de champs au lieu des
  // valeurs par défaut (qui « sauteraient » ensuite aux vraies valeurs). La barre de progression est
  // conservée à l'identique → pas de décalage au moment où les vrais champs apparaissent.
  if (isEditDataLoading || forceLoading) {
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
        onStepClick={allerVersRond}
        maxStepAtteint={etapeAfficheeDepuisReelle(maxStepAtteint)}
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
