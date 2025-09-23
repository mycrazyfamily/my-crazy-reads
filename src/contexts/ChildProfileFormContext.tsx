import React, { createContext, useContext, useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from "sonner";
import { useLocation } from 'react-router-dom';
import type { ChildProfileFormData } from '@/types/childProfile';

const FORM_STORAGE_KEY = 'child-profile-form-state';

type ChildProfileFormContextType = {
  form: ReturnType<typeof useForm<ChildProfileFormData>>;
  formStep: number;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
  selectedNickname: string;
  setSelectedNickname: React.Dispatch<React.SetStateAction<string>>;
  selectedSkinColor: string;
  setSelectedSkinColor: React.Dispatch<React.SetStateAction<string>>;
  selectedEyeColor: string;
  setSelectedEyeColor: React.Dispatch<React.SetStateAction<string>>;
  selectedHairColor: string;
  setSelectedHairColor: React.Dispatch<React.SetStateAction<string>>;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleGoToStep: (step: number) => void;
  handleSubmitForm: () => void;
};

const ChildProfileFormContext = createContext<ChildProfileFormContextType | undefined>(undefined);

export type ChildProfileFormProviderProps = {
  children: React.ReactNode;
  familyCode?: string;
  onSubmit: (data: ChildProfileFormData) => void;
  initialStep?: number;
};

export const ChildProfileFormProvider: React.FC<ChildProfileFormProviderProps> = ({ 
  children, 
  familyCode,
  onSubmit,
  initialStep
}) => {
  const location = useLocation();
  const locationState = location.state as { targetStep?: number } | null;
  
  const [formStep, setFormStep] = useState(() => {
    if (initialStep !== undefined) {
      return initialStep;
    } else if (locationState?.targetStep !== undefined) {
      return locationState.targetStep;
    } else {
      return 0;
    }
  });
  
  const [selectedNickname, setSelectedNickname] = useState<string>("");
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>("");
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>("");
  const [selectedHairColor, setSelectedHairColor] = useState<string>("");
  
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
          
          if (initialStep === undefined && locationState?.targetStep === undefined && parsedState.formStep !== undefined) {
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
    
    if (initialStep !== undefined) {
      console.log(`Navigation vers l'étape ${initialStep + 1} via initialStep`);
      toast.success(`Navigation vers l'étape ${initialStep + 1}`);
    } else if (locationState?.targetStep !== undefined) {
      console.log(`Navigation vers l'étape ${locationState.targetStep + 1} via locationState`);
      toast.success(`Navigation vers l'étape ${locationState.targetStep + 1}`);
    }
  }, [form, familyCode, initialStep, locationState]);

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

  const handleNextStep = async () => {
    // Ensure latest values are validated before moving to next step
    const isValidNow = await form.trigger();
    if (isValidNow) {
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
    console.log(`Navigating to step ${step}`);
    setFormStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForm = () => {
    console.log("Direct submit in context triggered");
    const formData = form.getValues();
    onSubmit(formData);
  };

  const value = {
    form,
    formStep,
    setFormStep,
    selectedNickname,
    setSelectedNickname,
    selectedSkinColor,
    setSelectedSkinColor,
    selectedEyeColor,
    setSelectedEyeColor,
    selectedHairColor,
    setSelectedHairColor,
    handleNextStep,
    handlePreviousStep, 
    handleGoToStep,
    handleSubmitForm
  };

  return (
    <ChildProfileFormContext.Provider value={value}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitForm)} id="child-profile-form">
          {children}
        </form>
      </FormProvider>
    </ChildProfileFormContext.Provider>
  );
};

export const useChildProfileForm = () => {
  const context = useContext(ChildProfileFormContext);
  if (context === undefined) {
    throw new Error('useChildProfileForm must be used within a ChildProfileFormProvider');
  }
  return context;
};
