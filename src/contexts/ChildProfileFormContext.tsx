
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from "sonner";
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
};

const ChildProfileFormContext = createContext<ChildProfileFormContextType | undefined>(undefined);

export type ChildProfileFormProviderProps = {
  children: React.ReactNode;
  familyCode?: string;
  onSubmit: (data: ChildProfileFormData) => void;
};

export const ChildProfileFormProvider: React.FC<ChildProfileFormProviderProps> = ({ 
  children, 
  familyCode,
  onSubmit
}) => {
  const [formStep, setFormStep] = useState(0);
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

  const handleSubmitForm = () => {
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
        {children}
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
