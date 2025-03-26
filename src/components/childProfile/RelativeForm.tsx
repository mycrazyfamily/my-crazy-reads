
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { RelativeData, RelativeType } from '@/types/childProfile';
import RelativeBasicInfoSection from './relatives/RelativeBasicInfoSection';
import RelativeNicknameSection from './relatives/RelativeNicknameSection';
import RelativeAppearanceSection from './relatives/RelativeAppearanceSection';
import RelativeTraitsSection from './relatives/RelativeTraitsSection';

type RelativeFormProps = {
  relative: RelativeData;
  onSave: (relative: RelativeData) => void;
  onCancel: () => void;
};

const RelativeForm: React.FC<RelativeFormProps> = ({
  relative,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<RelativeData>(relative);
  const [selectedNickname, setSelectedNickname] = useState<string>(relative.nickname.type);
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>(relative.skinColor.type);
  const [selectedHairColor, setSelectedHairColor] = useState<string>(relative.hairColor.type);
  
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
      }
    };
    
    onSave(updatedRelative);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-mcf-orange">
            {formData.id ? 'Modifier un proche' : 'Ajouter un proche'}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
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
            job={formData.job}
            setJob={(value) => updateFormData('job', value)}
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
          />
          
          <RelativeTraitsSection 
            traits={formData.traits}
            handleTraitToggle={handleTraitToggle}
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
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white"
            onClick={handleSaveClick}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelativeForm;
