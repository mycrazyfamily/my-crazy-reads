
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import BasicInfoForm from '@/components/childProfile/BasicInfoForm';
import PersonalityForm from '@/components/childProfile/PersonalityForm';
import FamilyForm from '@/components/childProfile/FamilyForm';
import type { ChildProfileFormData } from '@/types/childProfile';

const CreateChildProfile = () => {
  const [formStep, setFormStep] = useState(0);
  const [selectedNickname, setSelectedNickname] = useState<string>("none");
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>("light");
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>("blue");
  const [selectedHairColor, setSelectedHairColor] = useState<string>("blonde");
  
  const form = useForm<ChildProfileFormData>({
    defaultValues: {
      firstName: '',
      nickname: { type: "none" },
      age: "3-5",
      gender: "neutral",
      skinColor: { type: "light" },
      eyeColor: { type: "blue" },
      hairColor: { type: "blonde" },
      hairType: "straight",
      glasses: false,
      height: "medium",
      superpowers: [],
      passions: [],
      challenges: [],
      family: {
        selectedRelatives: [],
        relatives: [],
      }
    },
  });

  const onSubmit = (data: ChildProfileFormData) => {
    console.log(data);
    toast.success("Profil créé avec succès !");
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
