// RelativeForm v1.2
// Changelog v1.2 (FIX « Erreur dans la fiche proche ») : les proches créés AVANT l'ajout de certains
//   champs n'ont pas toujours les objets nickname / skinColor / hairColor (ni hairType / glasses /
//   type) en base. Le formulaire lisait `relative.nickname.type` sans garde-fou → TypeError au
//   montage → error boundary « Erreur dans la fiche proche », impossible d'éditer un ancien proche.
//   Fix : optional chaining + valeurs de repli partout (même traitement que eyeColor/hairLength, qui
//   étaient déjà protégés car ajoutés plus tard). Aucun changement de comportement pour les proches
//   récents (tous leurs champs sont remplis).
// RelativeForm v1.1
// Changelog v1.1 : ajout de la validation birthDate obligatoire dans handleSaveClick (jamais vérifiée jusqu'ici)
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import type { RelativeData, RelativeType, RelativeGender } from '@/types/childProfile';
import RelativeBasicInfoSection from './relatives/RelativeBasicInfoSection';
import RelativeNicknameSection from './relatives/RelativeNicknameSection';
import RelativeAppearanceSection from './relatives/RelativeAppearanceSection';
import RelativeTraitsSection from './relatives/RelativeTraitsSection';
import ChildrenSelector from './ChildrenSelector';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FORBIDDEN_NAME_ERROR, checkFreeTextFields, containsForbiddenWord, forbiddenFieldsError } from '@/utils/nameBlocklist';

type RelativeFormProps = {
  relative: RelativeData & { linkedChildrenIds?: string[] };
  onSave: (relative: RelativeData, selectedChildrenIds?: string[]) => void;
  onCancel: () => void;
  isCreatingNewChild?: boolean;
  isDisabled?: boolean;
};

// Helper function to determine gender based on relative type
const getRelativeGender = (type: RelativeType): RelativeGender => {
  const femaleTypes = ["mother", "sister", "grandmother", "aunt", "femaleCousin", "femaleFriend", "nanny"];
  const maleTypes = ["father", "brother", "grandfather", "uncle", "maleCousin", "maleFriend"];
  
  if (femaleTypes.includes(type)) return "female";
  if (maleTypes.includes(type)) return "male";
  return "male"; // Default to "male" instead of "neutral" - gender must always be male or female
};

const RelativeForm: React.FC<RelativeFormProps> = ({
  relative,
  onSave,
  onCancel,
  isCreatingNewChild = false,
  isDisabled = false
}) => {
  const [formData, setFormData] = useState<RelativeData>({
    ...relative,
    gender: relative.gender || getRelativeGender(relative.type)
  });

  const [typeUI, setTypeUI] = useState<string>(relative.id ? (relative.type || '') : '');
  const [selectedNickname, setSelectedNickname] = useState<string>(relative.id ? (relative.nickname?.type || '') : '');
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>(relative.id ? (relative.skinColor?.type || '') : '');
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>(relative.id ? (relative.eyeColor?.type || '') : '');
  const [selectedHairColor, setSelectedHairColor] = useState<string>(relative.id ? (relative.hairColor?.type || '') : '');
  const [hairTypeUI, setHairTypeUI] = useState<string>(relative.id ? (relative.hairType || '') : '');
  const [hairLengthUI, setHairLengthUI] = useState<string>(relative.id ? (relative.hairLength || '') : '');
  const [glassesUI, setGlassesUI] = useState<boolean | null>(relative.id ? (relative.glasses ?? null) : null);
  const [customTraits, setCustomTraits] = useState<Record<string, string>>(
    relative.customTraits || {}
  );
  const [physicalDetails, setPhysicalDetails] = useState<string[]>(relative.physicalDetails || []);
  const [noPhysicalDetails, setNoPhysicalDetails] = useState<boolean>(() => {
    if (relative.noPhysicalDetails === true) return true;
    if (Array.isArray(relative.physicalDetails) && relative.physicalDetails.length === 1 && relative.physicalDetails[0] === '') return true;
    return false;
  });
  const [clothingStyle, setClothingStyle] = useState<string>(relative.clothingStyle || '');

  // Pour la sélection d'enfants existants
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>(relative.linkedChildrenIds || []);

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
      setTypeUI(relative.type || '');
      setSelectedNickname(relative.nickname?.type || '');
      setSelectedSkinColor(relative.skinColor?.type || '');
      setSelectedEyeColor(relative.eyeColor?.type || '');
      setSelectedHairColor(relative.hairColor?.type || '');
      setHairTypeUI(relative.hairType || '');
      setHairLengthUI(relative.hairLength || '');
      setGlassesUI(relative.glasses ?? null);
      setCustomTraits(relative.customTraits || {});
      // Réinitialiser les enfants liés lors de l'édition
      setSelectedChildrenIds(relative.linkedChildrenIds || []);
      // Synchroniser les détails physiques et le flag "aucun détail"
      setPhysicalDetails(relative.physicalDetails || []);
      const computedNoDetails = (relative.noPhysicalDetails === true) || (Array.isArray(relative.physicalDetails) && relative.physicalDetails.length === 1 && relative.physicalDetails[0] === '');
      setNoPhysicalDetails(computedNoDetails);
      // Synchroniser le style vestimentaire
      setClothingStyle(relative.clothingStyle || '');
    } else {
      setTypeUI('');
      setSelectedNickname('');
      setSelectedSkinColor('');
      setSelectedEyeColor('');
      setSelectedHairColor('');
      setHairTypeUI('');
      setHairLengthUI('');
      setGlassesUI(null);
      setCustomTraits({});
      setSelectedChildrenIds([]);
      setPhysicalDetails([]);
      setNoPhysicalDetails(false);
      setClothingStyle('');
    }
  }, [relative.id, relative.linkedChildrenIds]);
  
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
    // Validation des champs obligatoires
    const errors: string[] = [];

    if (!formData.firstName?.trim()) errors.push("le prénom");

    // Blocklist : prénom et surnom personnalisé
    if (containsForbiddenWord(formData.firstName)) {
      toast.error(FORBIDDEN_NAME_ERROR);
      return;
    }
    if (selectedNickname === 'custom' && containsForbiddenWord(formData.nickname.custom)) {
      toast.error(FORBIDDEN_NAME_ERROR);
      return;
    }

    // v2.0 — blocklist sur TOUS les champs libres, ici plutôt que dans les écrans
    // appelants : ce formulaire sert à la fois au wizard de création, à
    // AjouterProche et à ModifierProche. Une garde ici couvre les trois, alors
    // que le wizard n'en avait aucune avant son tout dernier enregistrement.
    const champsLibres = checkFreeTextFields({
      'le métier': formData.job,
      'le type de relation': formData.otherTypeName,
      'le type de cheveux': formData.hairTypeCustom,
      'la couleur des cheveux': (formData.hairColor as any)?.custom,
      'la couleur de peau': (formData.skinColor as any)?.custom,
      'la couleur des yeux': (formData.eyeColor as any)?.custom,
      'les détails physiques': physicalDetails,
      'la tenue': clothingStyle,
      'les traits de caractère': Object.values(customTraits || {})
        .filter((v) => typeof v === 'string') as string[],
    });
    if (!champsLibres.ok) {
      toast.error(forbiddenFieldsError(champsLibres));
      return;
    }

    if (!formData.type) errors.push("le type de relation");
    if (formData.type === 'other' && !formData.otherTypeName?.trim()) {
      errors.push("la description du type de relation personnalisé");
    }
    
    // Gender must always be male or female
    if (formData.gender !== 'male' && formData.gender !== 'female') {
      errors.push("le genre (Homme / Femme)");
    }

    // Date de naissance
    if (!formData.birthDate) {
      errors.push("la date de naissance");
    }
    
    // Couleur de peau
    if (!selectedSkinColor) errors.push("la couleur de peau");
    if (selectedSkinColor === 'custom' && !formData.skinColor.custom?.trim()) {
      errors.push("la couleur de peau personnalisée");
    }

    // Couleur des yeux
    if (!selectedEyeColor) errors.push("la couleur des yeux");
    if (selectedEyeColor === 'custom' && !formData.eyeColor?.custom?.trim()) {
      errors.push("la couleur des yeux personnalisée");
    }
    
    // Couleur des cheveux
    if (!selectedHairColor) errors.push("la couleur des cheveux");
    if (selectedHairColor === 'custom' && !formData.hairColor.custom?.trim()) {
      errors.push("la couleur des cheveux personnalisée");
    }
    
    // Type de cheveux
    if (!hairTypeUI) errors.push("le type de cheveux");
    if (hairTypeUI === 'custom' && !formData.hairTypeCustom?.trim()) {
      errors.push("le type de cheveux personnalisé");
    }

    // Longueur des cheveux (obligatoire sauf si Chauve)
    if (hairTypeUI !== 'bald' && !hairLengthUI) {
      errors.push("la longueur des cheveux");
    }
    
    // Lunettes
    if (glassesUI === null) errors.push("si le proche porte des lunettes (Oui/Non)");
    
    // Surnom
    if (selectedNickname === 'custom' && !formData.nickname.custom?.trim()) {
      errors.push("le surnom personnalisé");
    }
    
    // Au moins un trait de caractère
    if (formData.traits.length === 0) {
      errors.push("au moins un trait de caractère");
    }

    // Validation des traits personnalisés
    for (const traitKey of Object.keys(customTraits)) {
      if (!customTraits[traitKey]?.trim()) {
        errors.push(`le trait personnalisé "${traitKey}"`);
      }
    }

    // Vérifier les détails physiques : au moins un détail OU la case "aucun détail" cochée
    const hasPhysicalDetails = physicalDetails.length > 0 && physicalDetails.some(d => d.trim() !== '');
    if (!hasPhysicalDetails && !noPhysicalDetails) {
      errors.push("un détail physique marquant (ou cochez 'Aucun détail physique particulier')");
    }
    
    // Pendant la création d'un nouvel enfant, l'association aux enfants existants est facultative.
    // La validation d'association est gérée par les pages dédiées (Ajouter/Modifier Proche).
    // => Pas de vérification ici.

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return;
    }

    // Longueur des cheveux : forcée à undefined si Chauve (cohérence donnée/avatar)
    const resolvedHairLength = hairTypeUI === 'bald'
      ? undefined
      : (hairLengthUI as "short" | "medium" | "long" | undefined);

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
      eyeColor: {
        type: selectedEyeColor as "blue" | "green" | "brown" | "black" | "custom",
        custom: selectedEyeColor === 'custom' ? formData.eyeColor?.custom : undefined
      },
      hairColor: {
        type: selectedHairColor as "blonde" | "chestnut" | "brown" | "red" | "black" | "white" | "custom",
        custom: selectedHairColor === 'custom' ? formData.hairColor.custom : undefined
      },
      hairLength: resolvedHairLength,
      customTraits: customTraits,
      physicalDetails: physicalDetails.length > 0 && !noPhysicalDetails ? physicalDetails : undefined,
      noPhysicalDetails: noPhysicalDetails,
      clothingStyle: clothingStyle ? clothingStyle : undefined
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
          selectedEyeColor={selectedEyeColor}
          setSelectedEyeColor={setSelectedEyeColor}
          eyeColorCustomValue={formData.eyeColor?.custom}
          setEyeColorCustomValue={(value) => setFormData(prev => ({
            ...prev,
            eyeColor: {
              ...(prev.eyeColor || { type: 'custom' }),
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
          hairLength={hairLengthUI}
          setHairLength={(value) => { setHairLengthUI(value); updateFormData('hairLength', value as "short" | "medium" | "long"); }}
          glasses={glassesUI}
          setGlasses={(value) => { setGlassesUI(value); updateFormData('glasses', value); }}
          gender={formData.gender}
          physicalDetails={physicalDetails}
          setPhysicalDetails={setPhysicalDetails}
          clothingStyle={clothingStyle}
          setClothingStyle={setClothingStyle}
          noPhysicalDetails={noPhysicalDetails}
          setNoPhysicalDetails={setNoPhysicalDetails}
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
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isDisabled}
        >
          Annuler
        </Button>
        <Button 
          type="button"
          className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
          onClick={handleSaveClick}
          disabled={isDisabled}
        >
          {isDisabled ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
};

export default RelativeForm;
