
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import BasicInfoForm from '@/components/childProfile/BasicInfoForm';
import PersonalityForm from '@/components/childProfile/PersonalityForm';
import FamilyForm from '@/components/childProfile/FamilyForm';
import type { ChildProfileFormData } from '@/types/childProfile';

const FORM_STORAGE_KEY = 'child-profile-form-state';

const CreateChildProfile = () => {
  const [formStep, setFormStep] = useState(0);
  const [selectedNickname, setSelectedNickname] = useState<string>("");
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>("");
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>("");
  const [selectedHairColor, setSelectedHairColor] = useState<string>("");
  
  // Initialiser le formulaire avec les valeurs par défaut ou les valeurs sauvegardées
  const form = useForm<ChildProfileFormData>({
    defaultValues: {
      firstName: '',
      nickname: { type: "" },
      age: "",
      gender: "",
      skinColor: { type: "" },
      eyeColor: { type: "" },
      hairColor: { type: "" },
      hairType: "",
      glasses: undefined,
      height: "",
      superpowers: [],
      passions: [],
      challenges: [],
      family: {
        selectedRelatives: [],
        relatives: [],
      }
    },
  });

  // Charger l'état du formulaire depuis localStorage au chargement initial
  useEffect(() => {
    const savedState = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Restaurer l'étape du formulaire
        if (parsedState.formStep !== undefined) {
          setFormStep(parsedState.formStep);
        }
        
        // Restaurer les sélections d'apparence
        if (parsedState.selectedNickname) setSelectedNickname(parsedState.selectedNickname);
        if (parsedState.selectedSkinColor) setSelectedSkinColor(parsedState.selectedSkinColor);
        if (parsedState.selectedEyeColor) setSelectedEyeColor(parsedState.selectedEyeColor);
        if (parsedState.selectedHairColor) setSelectedHairColor(parsedState.selectedHairColor);
        
        // Restaurer les valeurs du formulaire
        if (parsedState.formValues) {
          form.reset(parsedState.formValues);
        }
      } catch (error) {
        console.error("Erreur lors de la restauration de l'état du formulaire:", error);
        // En cas d'erreur, on continue avec les valeurs par défaut
      }
    }
  }, []);

  // Sauvegarder l'état du formulaire à chaque changement
  useEffect(() => {
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
  }, [formStep, form.watch(), selectedNickname, selectedSkinColor, selectedEyeColor, selectedHairColor]);

  const onSubmit = (data: ChildProfileFormData) => {
    console.log(data);
    toast.success("Profil créé avec succès !");
    // Effacer le localStorage après soumission réussie
    localStorage.removeItem(FORM_STORAGE_KEY);
    // Plus tard, on pourra ajouter ici la navigation vers l'étape suivante
  };

  const handleNextStep = () => {
    form.trigger();
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

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-mcf-orange-dark">
        Créer le profil de l'enfant
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Personnalisez l'aventure magique de votre enfant en nous parlant de lui/elle
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
              onSubmit={onSubmit}
            />
          )}
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateChildProfile;
