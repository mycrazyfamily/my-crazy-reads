import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { RelativeData, RelativeType, RelativeGender } from '@/types/childProfile';
import RelativeBasicInfoSection from './relatives/RelativeBasicInfoSection';
import RelativeNicknameSection from './relatives/RelativeNicknameSection';
import RelativeAppearanceSection from './relatives/RelativeAppearanceSection';
import RelativeTraitsSection from './relatives/RelativeTraitsSection';

type RelativeFormProps = {
  relative: RelativeData;
  onSave: (relative: RelativeData) => void;
  onCancel: () => void;
};

// Helper function to determine gender based on relative type
const getRelativeGender = (type: RelativeType): RelativeGender => {
  const femaleTypes = ["mother", "sister", "grandmother", "femaleCousin", "femaleFriend"];
  const maleTypes = ["father", "brother", "grandfather", "maleCousin", "maleFriend"];
  
  if (femaleTypes.includes(type)) return "female";
  if (maleTypes.includes(type)) return "male";
  return "neutral";
};

const RelativeForm: React.FC<RelativeFormProps> = ({
  relative,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<RelativeData>({
    ...relative,
    gender: relative.gender || getRelativeGender(relative.type)
  });
  const [selectedNickname, setSelectedNickname] = useState<string>(relative.nickname.type);
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>(relative.skinColor.type);
  const [selectedHairColor, setSelectedHairColor] = useState<string>(relative.hairColor.type);
  const [customTraits, setCustomTraits] = useState<Record<string, string>>(
    relative.customTraits || {}
  );
  
  const updateFormData = <K extends keyof RelativeData>(field: K, value: RelativeData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTraitToggle = (trait: string) => {
    const currentTraits = [...formData.traits];
    
    if (currentTraits.includes(trait)) {
      // Remove trait
      const updatedTraits = currentTraits.filter(t => t !== trait);
      updateFormData('traits', updatedTraits);
    } else {
      // Add trait if less than 3 selected
      if (currentTraits.length < 3) {
        updateFormData('traits', [...currentTraits, trait]);
      }
    }
  };

  const handleSaveClick = () => {
    // Update all custom fields before saving
    const updatedRelative = {
      ...formData,
      nickname: {
        type: selectedNickname as "none" | "mamoune" | "papou" | "custom",
        custom: selectedNickname === 'custom' ? formData.nickname.custom : undefined
      },
      skinColor: {
        type: selectedSkinColor as "light" | "medium" | "dark" | "custom",
        custom: selectedSkinColor === 'custom' ? formData.skinColor.custom : undefined
      },
      hairColor: {
        type: selectedHairColor as "blonde" | "chestnut" | "brown" | "red" | "black" | "custom",
        custom: selectedHairColor === 'custom' ? formData.hairColor.custom : undefined
      },
      customTraits: customTraits
    };
    
    onSave(updatedRelative);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-bold text-mcf-primary">
          {formData.id ? 'Modifier un proche' : 'Ajouter un proche'}
        </h3>
      </div>
      
      <div className="space-y-6">
        <RelativeBasicInfoSection 
          type={formData.type}
          setType={(value) => updateFormData('type', value)}
          firstName={formData.firstName}
          setFirstName={(value) => updateFormData('firstName', value)}
          otherTypeName={formData.otherTypeName}
          setOtherTypeName={(value) => updateFormData('otherTypeName', value)}
          age={formData.age}
          setAge={(value) => updateFormData('age', value)}
          birthDate={formData.birthDate}
          setBirthDate={(value) => updateFormData('birthDate', value)}
          job={formData.job}
          setJob={(value) => updateFormData('job', value)}
          gender={formData.gender}
          setGender={(value) => updateFormData('gender', value)}
        />
        
        <RelativeNicknameSection 
          selectedNickname={selectedNickname}
          setSelectedNickname={setSelectedNickname}
          nicknameCustomValue={formData.nickname.custom}
          setNicknameCustomValue={(value) => setFormData(prev => ({
            ...prev,
            nickname: {
              ...prev.nickname,
              custom: value
            }
          }))}
          relativeType={formData.type}
        />
        
        <RelativeAppearanceSection 
          selectedSkinColor={selectedSkinColor}
          setSelectedSkinColor={setSelectedSkinColor}
          skinColorCustomValue={formData.skinColor.custom}
          setSkinColorCustomValue={(value) => setFormData(prev => ({
            ...prev,
            skinColor: {
              ...prev.skinColor,
              custom: value
            }
          }))}
          selectedHairColor={selectedHairColor}
          setSelectedHairColor={setSelectedHairColor}
          hairColorCustomValue={formData.hairColor.custom}
          setHairColorCustomValue={(value) => setFormData(prev => ({
            ...prev,
            hairColor: {
              ...prev.hairColor,
              custom: value
            }
          }))}
          hairType={formData.hairType}
          setHairType={(value) => updateFormData('hairType', value as "straight" | "wavy" | "curly" | "coily")}
          glasses={formData.glasses}
          setGlasses={(value) => updateFormData('glasses', value)}
          gender={formData.gender}
        />
        
        <RelativeTraitsSection 
          traits={formData.traits}
          handleTraitToggle={handleTraitToggle}
          customTraits={customTraits}
          setCustomTraits={setCustomTraits}
          gender={formData.gender}
        />
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button 
          className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
          onClick={handleSaveClick}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

export default RelativeForm;
