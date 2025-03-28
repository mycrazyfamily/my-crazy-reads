import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import BasicInfoForm from '@/components/childProfile/BasicInfoForm';
import PersonalityForm from '@/components/childProfile/PersonalityForm';
import FamilyForm from '@/components/childProfile/FamilyForm';
import PetsForm from '@/components/childProfile/PetsForm';
import ToysForm from '@/components/childProfile/ToysForm';
import WorldsForm from '@/components/childProfile/WorldsForm';
import FinalSummary from '@/components/childProfile/FinalSummary';
import type { ChildProfileFormData } from '@/types/childProfile';

const FORM_STORAGE_KEY = 'child-profile-form-state';

type CreateChildProfileProps = {
  isGiftMode?: boolean;
  familyCode?: string;
  nextPath?: string;
};

const CreateChildProfile = ({ isGiftMode = false, familyCode, nextPath }: CreateChildProfileProps) => {
  const [formStep, setFormStep] = useState(0);
  const [selectedNickname, setSelectedNickname] = useState<string>("");
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>("");
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>("");
  const [selectedHairColor, setSelectedHairColor] = useState<string>("");
  const navigate = useNavigate();
  
  const form = useForm<ChildProfileFormData>({
    defaultValues: {
      firstName: '',
      nickname: { type: "none" },
      birthDate: undefined,
      age: undefined as unknown as "0-2" | "3-5" | "6-7" | "8-10",
      gender: undefined as unknown as "girl" | "boy" | "neutral",
      skinColor: { type: "light" },
      eyeColor: { type: "blue" },
      hairColor: { type: "blonde" },
      hairType: undefined as unknown as "straight" | "wavy" | "curly" | "coily",
      glasses: undefined,
      height: undefined as unknown as "small" | "medium" | "tall",
      superpowers: [],
      passions: [],
      challenges: [],
      family: {
        selectedRelatives: [],
        relatives: [],
      },
      pets: {
        hasPets: false,
        pets: [],
      },
      toys: {
        hasToys: false,
        toys: [],
      },
      worlds: {
        favoriteWorlds: [],
        discoveries: [],
        customWorlds: {},
        customDiscoveries: {},
      }
    },
  });

  useEffect(() => {
    if (familyCode) {
      toast.info(`Code famille utilisé: ${familyCode}`);
      form.setValue("firstName", "Enfant pré-rempli");
    } else {
      const savedState = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          
          if (parsedState.formStep !== undefined) {
            setFormStep(parsedState.formStep);
          }
          
          if (parsedState.selectedNickname) setSelectedNickname(parsedState.selectedNickname);
          if (parsedState.selectedSkinColor) setSelectedSkinColor(parsedState.selectedSkinColor);
          if (parsedState.selectedEyeColor) setSelectedEyeColor(parsedState.selectedEyeColor);
          if (parsedState.selectedHairColor) setSelectedHairColor(parsedState.selectedHairColor);
          
          if (parsedState.formValues) {
            if (parsedState.formValues.birthDate) {
              parsedState.formValues.birthDate = new Date(parsedState.formValues.birthDate);
            }
            form.reset(parsedState.formValues);
          }
        } catch (error) {
          console.error("Erreur lors de la restauration de l'état du formulaire:", error);
        }
      }
    }
  }, [form, familyCode]);

  useEffect(() => {
    const saveFormState = () => {
      const formValues = form.getValues();
      const stateToSave = {
        formStep,
        selectedNickname,
        selectedSkinColor,
        selectedEyeColor,
        selectedHairColor,
        formValues
      };
      
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(stateToSave));
    };

    const timeoutId = setTimeout(saveFormState, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formStep, form, selectedNickname, selectedSkinColor, selectedEyeColor, selectedHairColor]);

  const onSubmit = (data: ChildProfileFormData) => {
    console.log(data);
    toast.success("Profil créé avec succès !");
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    if (isGiftMode && nextPath) {
      navigate(nextPath, { state: { childProfile: data } });
    } else {
      navigate('/pret-a-demarrer');
    }
  };

  const handleSubmitForm = () => {
    const formData = form.getValues();
    onSubmit(formData);
  };

  const handleNextStep = () => {
    const isValid = form.formState.isValid;
    
    if (isValid) {
      setFormStep(prev => prev + 1);
      toast.success("Section complétée !");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Veuillez compléter tous les champs requis");
    }
  };

  const handlePreviousStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStep = (step: number) => {
    setFormStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <FormProvider {...form}>
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
              handleSubmit={handleSubmitForm}
              isGiftMode={isGiftMode}
              nextButtonText={isGiftMode ? "Continuer vers le choix du thème →" : undefined}
            />
          )}
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateChildProfile;
