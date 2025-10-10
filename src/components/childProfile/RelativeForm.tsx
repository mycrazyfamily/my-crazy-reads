import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import type { RelativeData, RelativeType, RelativeGender } from '@/types/childProfile';
import RelativeBasicInfoSection from './relatives/RelativeBasicInfoSection';
import RelativeNicknameSection from './relatives/RelativeNicknameSection';
import RelativeAppearanceSection from './relatives/RelativeAppearanceSection';
import RelativeTraitsSection from './relatives/RelativeTraitsSection';
import ChildrenSelector from './ChildrenSelector';
import { supabase } from "@/integrations/supabase/client";

type RelativeFormProps = {
  relative: RelativeData;
  onSave: (relative: RelativeData, selectedChildrenIds?: string[]) => void;
  onCancel: () => void;
  isCreatingNewChild?: boolean;
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
  onCancel,
  isCreatingNewChild = false
}) => {
  const [formData, setFormData] = useState<RelativeData>({
    ...relative,
    gender: relative.gender || getRelativeGender(relative.type)
  });

  const [typeUI, setTypeUI] = useState<string>(relative.id ? relative.type : '');
  const [selectedNickname, setSelectedNickname] = useState<string>(relative.id ? relative.nickname.type : '');
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>(relative.id ? relative.skinColor.type : '');
  const [selectedHairColor, setSelectedHairColor] = useState<string>(relative.id ? relative.hairColor.type : '');
  const [hairTypeUI, setHairTypeUI] = useState<string>(relative.id ? relative.hairType : '');
  const [glassesUI, setGlassesUI] = useState<boolean | null>(relative.id ? relative.glasses : null);
  const [customTraits, setCustomTraits] = useState<Record<string, string>>(
    relative.customTraits || {}
  );

  // Pour la sélection d'enfants existants
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

  // Charger les enfants existants
  useEffect(() => {
    const loadExistingChildren = async () => {
      if (!isCreatingNewChild) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profiles, error } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading children:', error);
        } else if (profiles) {
          setExistingChildren(profiles);
        }
      } catch (error) {
        console.error('Error loading existing children:', error);
      }
    };

    loadExistingChildren();
  }, [isCreatingNewChild]);

  // Réinitialiser le formulaire quand on change de proche (nouveau vs édition)
  useEffect(() => {
    setFormData({
      ...relative,
      gender: relative.gender || getRelativeGender(relative.type)
    });

    if (relative.id) {
      setTypeUI(relative.type);
      setSelectedNickname(relative.nickname.type);
      setSelectedSkinColor(relative.skinColor.type);
      setSelectedHairColor(relative.hairColor.type);
      setHairTypeUI(relative.hairType);
      setGlassesUI(relative.glasses);
      setCustomTraits(relative.customTraits || {});
    } else {
      setTypeUI('');
      setSelectedNickname('');
      setSelectedSkinColor('');
      setSelectedHairColor('');
      setHairTypeUI('');
      setGlassesUI(null);
      setCustomTraits({});
    }
  }, [relative.id]);
  
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

  const handleToggleChild = (childId: string) => {
    setSelectedChildrenIds(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
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
        type: selectedHairColor as "blonde" | "chestnut" | "brown" | "red" | "black" | "white" | "custom",
        custom: selectedHairColor === 'custom' ? formData.hairColor.custom : undefined
      },
      customTraits: customTraits
    };
    
    onSave(updatedRelative, isCreatingNewChild ? selectedChildrenIds : undefined);
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-mcf-primary">
          {relative.id ? 'Modifier un proche' : 'Ajouter un proche'}
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
          hairType={hairTypeUI}
          setHairType={(value) => { setHairTypeUI(value); updateFormData('hairType', value as "straight" | "wavy" | "curly" | "coily" | "bald" | "ponytail" | "custom"); }}
          hairTypeCustom={formData.hairTypeCustom}
          setHairTypeCustom={(value) => updateFormData('hairTypeCustom', value)}
          glasses={glassesUI}
          setGlasses={(value) => { setGlassesUI(value); updateFormData('glasses', value); }}
          gender={formData.gender}
        />
        
        <RelativeTraitsSection 
          traits={formData.traits}
          handleTraitToggle={handleTraitToggle}
          customTraits={customTraits}
          setCustomTraits={setCustomTraits}
          gender={formData.gender}
        />

        {/* Sélection des enfants existants (uniquement lors de la création d'un nouvel enfant) */}
        {isCreatingNewChild && existingChildren.length > 0 && (
          <ChildrenSelector
            children={existingChildren}
            selectedChildrenIds={selectedChildrenIds}
            onToggleChild={handleToggleChild}
            label="Ce proche est aussi proche de :"
          />
        )}
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
