// FormSteps v1.8 (07/10/2026)
// Changelog v1.8 : RETOUR EN HAUT DE PAGE A CHAQUE CHANGEMENT D'ETAPE.
//   Test du 07/10 : apres « Continuer » en bas de l'etape 1, l'etape 2 s'ouvrait en bas de page.
//   Toute nouvelle etape (Suivant, Precedent, clic sur un rond) remonte desormais d'un coup en
//   haut de la page, sans animation. Rien d'autre ne change.
// FormSteps v1.7
// Changelog v1.7 (chantier D2, retour arriere) : LES RONDS NE FONT PLUS QUE RECULER.
//   Les v1.5 et v1.6 permettaient de ressauter en avant vers une etape deja visitee. Or le
//   formulaire n'a AUCUN schema de validation global (useForm sans resolver) : form.trigger()
//   repond toujours vrai, et la vraie validation vit dans le bouton « Continuer » de chaque
//   etape. Sauter en avant contournait donc toute validation, jusqu'a permettre de creer un
//   enfant sans prenom, constate en test le 26/08.
//   Comportement retenu, celui du site des impots : on recule librement en cliquant sur un
//   rond, on avance uniquement par « Continuer », qui valide. Tout etant deja enregistre,
//   retraverser les etapes est rapide. maxStepAtteint et la validation au clic sont retires ;
//   FormProgressIndicator retombe sur son comportement par defaut, recul seulement.
//   En derniere ceinture, ChildProfileFormContext v1.7 refuse desormais la soumission finale
//   sans prenom, quel que soit le chemin emprunte.
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

  // v1.8 : chaque changement d'etape ramene en haut de page, d'un coup (aucun scroll-behavior
  // smooth n'est defini dans le CSS du site, scrollTo(0, 0) est donc instantane).
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [formStep])

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
        onStepClick={(index) => goTo(etapeReelleDepuisAffichee(index))}
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
