import React, { createContext, useContext, useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from "sonner";
import { useLocation } from 'react-router-dom';
import type { ChildProfileFormData } from '@/types/childProfile';
import { CHALLENGES_OPTIONS } from '@/constants/childProfileOptions';
import { FAVORITE_WORLDS_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';

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
  editMode: boolean;
};

const ChildProfileFormContext = createContext<ChildProfileFormContextType | undefined>(undefined);

export type ChildProfileFormProviderProps = {
  children: React.ReactNode;
  familyCode?: string;
  onSubmit: (data: ChildProfileFormData) => void;
  initialStep?: number;
  editMode?: boolean;
  editChildId?: string;
  useSavedDraft?: boolean; // contrôle l'utilisation du localStorage pour pré-remplir
};

export const ChildProfileFormProvider: React.FC<ChildProfileFormProviderProps> = ({ 
  children, 
  familyCode,
  onSubmit,
  initialStep,
  editMode = false,
  editChildId,
  useSavedDraft = true,
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
      hairType: undefined as unknown as "straight" | "wavy" | "curly" | "coily" | "bald" | "ponytail" | "custom",
      hairTypeCustom: undefined,
      glasses: undefined,
      height: undefined as unknown as "small" | "medium" | "tall",
      superpowers: [],
      passions: [],
      challenges: [],
      family: {
        selectedRelatives: [],
        relatives: [],
        existingRelativeIds: [],
        existingRelativesData: [], // Données complètes des proches existants sélectionnés
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
    const loadEditData = async () => {
      console.log('🔍 loadEditData called with:', { editMode, editChildId });
      if (editMode && editChildId) {
        console.log('✅ Loading data for child:', editChildId);
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          
          // Charger le profil enfant (table principale)
          const { data: childProfile, error: childError } = await supabase
            .from('child_profiles')
            .select('*')
            .eq('id', editChildId)
            .maybeSingle();

          if (childError) throw childError;
          if (!childProfile) {
            toast.error("Aucune donnée trouvée pour cet enfant");
            return;
          }

          // Charger les relations (IDs) en parallèle
          const [superpowersRes, likesRes, challengesRes, universesRes, discoveriesRes] = await Promise.all([
            supabase.from('child_superpowers').select('superpower_id').eq('child_id', editChildId),
            supabase.from('child_likes').select('like_id').eq('child_id', editChildId),
            supabase.from('child_challenges').select('challenge_id').eq('child_id', editChildId),
            supabase.from('child_universes').select('universe_id').eq('child_id', editChildId),
            supabase.from('child_discoveries').select('discovery_id').eq('child_id', editChildId),
          ]);

          // Récupérer les valeurs/labels correspondants
          const [spVals, likeVals, chalVals, uniVals, discVals] = await Promise.all([
            (async () => {
              const ids = (superpowersRes.data || []).map((r: any) => r.superpower_id).filter(Boolean);
              if (!ids.length) return [] as string[];
              const { data } = await supabase.from('superpowers').select('id, value').in('id', ids);
              console.log('Loaded superpowers:', data);
              return (data || []).map((x: any) => x.value);
            })(),
            (async () => {
              const ids = (likesRes.data || []).map((r: any) => r.like_id).filter(Boolean);
              if (!ids.length) return [] as string[];
              const { data } = await supabase.from('likes').select('id, value').in('id', ids);
              console.log('Loaded likes:', data);
              return (data || []).map((x: any) => x.value);
            })(),
            (async () => {
              const ids = (challengesRes.data || []).map((r: any) => r.challenge_id).filter(Boolean);
              console.log('Challenge IDs from child_challenges:', ids);
              if (!ids.length) return [] as string[];
              const { data } = await supabase.from('challenges').select('id, label').in('id', ids);
              console.log('Loaded challenges from DB:', data);
              // Map label from DB to value in form options
              const mapped = (data || []).map((x: any) => {
                const option = CHALLENGES_OPTIONS.find(o => o.label === x.label);
                console.log(`Mapping challenge "${x.label}" to value "${option?.value}"`);
                return option ? option.value : x.label;
              });
              console.log('Final challenges values:', mapped);
              return mapped;
            })(),
            (async () => {
              const ids = (universesRes.data || []).map((r: any) => r.universe_id).filter(Boolean);
              if (!ids.length) return [] as string[];
              const { data } = await supabase.from('universes').select('id, label').in('id', ids);
              return (data || []).map((x: any) => FAVORITE_WORLDS_OPTIONS.find(o => o.label === x.label)?.value || x.label);
            })(),
            (async () => {
              const ids = (discoveriesRes.data || []).map((r: any) => r.discovery_id).filter(Boolean);
              if (!ids.length) return [] as string[];
              const { data } = await supabase.from('discoveries').select('id, label').in('id', ids);
              return (data || []).map((x: any) => DISCOVERY_OPTIONS.find(o => o.label === x.label)?.value || x.label);
            })(),
          ]);

          const uniq = <T,>(arr: T[]) => Array.from(new Set(arr.filter(Boolean)));
          const limit = (arr: string[], max: number) => uniq(arr).slice(0, max);

          const superpowers = limit(spVals, 3);
          const passions = limit(likeVals, 3);
          const challenges = limit(chalVals, 3);
          const favoriteWorlds = limit(uniVals, 3);
          const discoveries = uniq(discVals);

          // Mapper le surnom depuis la colonne text nickname
          const mapNickname = (raw: string | null | undefined) => {
            const preset = ['petitChou', 'tresor', 'boubou', 'none'];
            if (!raw || raw === 'none') return { type: 'none' } as const;
            if (preset.includes(raw)) return { type: raw as 'petitChou' | 'tresor' | 'boubou' | 'none' } as const;
            return { type: 'custom', custom: raw } as const;
          };

          const appearance = (childProfile.appearance as any) || {};

          const formData: any = {
            firstName: childProfile.first_name,
            nickname: mapNickname(childProfile.nickname),
            birthDate: childProfile.birth_date ? new Date(childProfile.birth_date) : undefined,
            gender: childProfile.gender,
            height: childProfile.height,
            skinColor: appearance.skinColor || { type: 'light' },
            eyeColor: appearance.eyeColor || { type: 'blue' },
            hairColor: appearance.hairColor || { type: 'blonde' },
            hairType: appearance.hairType || 'straight',
            hairTypeCustom: appearance.hairTypeCustom,
            glasses: appearance.glasses ?? false,
            superpowers,
            passions,
            challenges,
            worlds: {
              favoriteWorlds,
              discoveries,
              customWorlds: {},
              customDiscoveries: {}
            },
            family: { selectedRelatives: [], relatives: [], existingRelativeIds: [], existingRelativesData: [] },
            pets: { hasPets: childProfile.has_pet, pets: [] },
            toys: { hasToys: false, toys: [] }
          };

          form.reset(formData);

          // Restaurer les états UI
          if (formData.nickname?.type) setSelectedNickname(formData.nickname.type);
          if (formData.skinColor?.type) setSelectedSkinColor(formData.skinColor.type);
          if (formData.eyeColor?.type) setSelectedEyeColor(formData.eyeColor.type);
          if (formData.hairColor?.type) setSelectedHairColor(formData.hairColor.type);
        } catch (error) {
          console.error('Error loading child data for editing:', error);
          toast.error("Erreur lors du chargement des données");
        }
      }
    };

    loadEditData();
  }, [editMode, editChildId, form]);

  useEffect(() => {
    if (editMode) {
      // En mode édition, on ne touche PAS au localStorage
      return;
    }
    
    if (familyCode) {
      toast.info(`Code famille utilisé: ${familyCode}`);
      form.setValue("firstName", "Enfant pré-rempli");
    } else if (useSavedDraft) {
      // En mode création normale (pas d'édition), charger le localStorage si demandé
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
  }, [form, familyCode, initialStep, locationState, editMode, useSavedDraft]);

  useEffect(() => {
    // Ne sauvegarder dans le localStorage QUE si on n'est pas en mode édition et si on souhaite utiliser le brouillon
    if (editMode || !useSavedDraft) {
      return;
    }
    
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
  }, [formStep, form, selectedNickname, selectedSkinColor, selectedEyeColor, selectedHairColor, editMode, useSavedDraft]);

  const handleNextStep = async () => {
    // Ensure latest values are validated before moving to next step
    const isValidNow = await form.trigger();
    if (isValidNow) {
      let nextStep = formStep + 1;
      
      // En mode édition, skip les étapes 2 (famille) et 3 (pets)
      if (editMode) {
        if (formStep === 1) {
          nextStep = 4; // De Personalité (1) à Toys (4)
        }
      }
      
      setFormStep(nextStep);
      toast.success("Section complétée !");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Veuillez compléter tous les champs requis");
    }
  };
  
  const handlePreviousStep = () => {
    let prevStep = formStep - 1;
    
    // En mode édition, skip les étapes 2 (famille) et 3 (pets)
    if (editMode) {
      if (formStep === 4) {
        prevStep = 1; // De Toys (4) à Personalité (1)
      }
    }
    
    setFormStep(prevStep);
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
    handleSubmitForm,
    editMode
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
