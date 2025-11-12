import React, { useState, useEffect } from 'react';

import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { differenceInMonths, differenceInYears, format, isAfter, isBefore, parse } from "date-fns";
import { cn } from "@/lib/utils";
import type { ChildProfileFormData } from '@/types/childProfile';
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { StepDatePicker } from "@/components/ui/step-date-picker";
import { toast } from "sonner";
import ErrorBoundary from "@/components/util/ErrorBoundary";
import PhysicalDetailsInput from './PhysicalDetailsInput';
import ClothingStyleInput from './ClothingStyleInput';

type BasicInfoFormProps = {
  selectedNickname: string;
  setSelectedNickname: (value: string) => void;
  selectedSkinColor: string;
  setSelectedSkinColor: (value: string) => void;
  selectedEyeColor: string;
  setSelectedEyeColor: (value: string) => void;
  selectedHairColor: string;
  setSelectedHairColor: (value: string) => void;
  handleNextStep: () => void;
};

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  selectedNickname,
  setSelectedNickname,
  selectedSkinColor,
  setSelectedSkinColor,
  selectedEyeColor,
  setSelectedEyeColor,
  selectedHairColor,
  setSelectedHairColor,
  handleNextStep
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const [ageDisplay, setAgeDisplay] = useState<string>("");
  const [ageError, setAgeError] = useState<string>("");
  const [noPhysicalDetails, setNoPhysicalDetails] = useState<boolean>(false);
  const [isInitialMount, setIsInitialMount] = useState<boolean>(true);
  // Delay mounting of DatePicker/Calendar to avoid portal race conditions
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(id);
  }, []);
  
  // Synchroniser noPhysicalDetails avec physicalDetails du formulaire
  useEffect(() => {
    const physicalDetails = form.watch('physicalDetails');
    const formNoDetails = form.watch('noPhysicalDetails');
    
    console.info('🔍 Syncing noPhysicalDetails:', { physicalDetails, formNoDetails });
    
    // Si on a des détails physiques réels (non vides), forcer le décochage
    const hasRealDetails = Array.isArray(physicalDetails) && physicalDetails.some(d => d && d.trim() !== '');
    if (hasRealDetails) {
      if (formNoDetails === true) {
        form.setValue('noPhysicalDetails', false, { shouldValidate: false });
      }
      setNoPhysicalDetails(false);
    }
    // Important: si vide, ne pas cocher automatiquement; on laisse le choix utilisateur
  }, [form.watch('physicalDetails'), form.watch('noPhysicalDetails')]);
  
  useEffect(() => {
    const birthDate = form.watch("birthDate");
    if (birthDate) {
      const isValidAge = validateAge(birthDate);
      if (isValidAge) {
        calculateExactAge(birthDate);
        setAgeError("");
      }
    }
  }, [form.watch("birthDate")]);

  const validateAge = (birthDate: Date): boolean => {
    const today = new Date();
    const years = differenceInYears(today, birthDate);
    
    if (years > 10) {
      setAgeError("My Crazy Family est conçu pour les enfants de 0 à 10 ans. Cette date dépasse l'âge limite.");
      return false;
    }
    
    if (isAfter(birthDate, today)) {
      setAgeError("La date de naissance ne peut pas être dans le futur.");
      return false;
    }
    
    return true;
  };

  const calculateExactAge = (birthDate: Date) => {
    const today = new Date();
    const years = differenceInYears(today, birthDate);
    
    const monthDiff = differenceInMonths(today, birthDate) % 12;
    
    let ageString = "";
    
    if (years > 0) {
      ageString += `${years} an${years > 1 ? 's' : ''}`;
      
      if (monthDiff > 0) {
        ageString += ` et ${monthDiff} mois`;
      }
    } else if (monthDiff > 0) {
      ageString = `${monthDiff} mois`;
    } else {
      ageString = "moins d'un mois";
    }
    
    setAgeDisplay(ageString);
    
    let ageRange: "0-2" | "3-5" | "6-7" | "8-10";
    if (years < 3) {
      ageRange = "0-2";
    } else if (years < 6) {
      ageRange = "3-5";
    } else if (years < 8) {
      ageRange = "6-7";
    } else {
      ageRange = "8-10";
    }
    
    form.setValue("age", ageRange);
  };

  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10);
    return date;
  };

  const handleDateChange = (date: Date | null) => {
    try {
      if (date) {
        const isValid = validateAge(date);
        form.setValue("birthDate", date, { shouldValidate: true });
        
        if (isValid) {
          calculateExactAge(date);
        }
      } else {
        form.setValue("birthDate", undefined, { shouldValidate: true });
        setAgeDisplay("");
      }
    } catch (error) {
      console.error("Error handling date change:", error);
      toast.error("Erreur lors de la modification de la date");
    }
  };

  const validateAndContinue = () => {
    const errors: string[] = [];
    const formData = form.getValues();

    if (!formData.firstName?.trim()) errors.push("le prénom");
    if (!formData.gender) errors.push("le genre");
    if (!formData.birthDate) errors.push("la date de naissance");
    if (ageError) errors.push("une date de naissance valide");
    
    // Couleur de peau
    if (!formData.skinColor?.type || !selectedSkinColor) errors.push("la couleur de peau");
    if (formData.skinColor?.type === 'custom' && !formData.skinColor?.custom?.trim()) {
      errors.push("la couleur de peau personnalisée");
    }
    
    // Couleur des yeux
    if (!formData.eyeColor?.type || !selectedEyeColor) errors.push("la couleur des yeux");
    if (formData.eyeColor?.type === 'custom' && !formData.eyeColor?.custom?.trim()) {
      errors.push("la couleur des yeux personnalisée");
    }
    
    // Couleur des cheveux
    if (!formData.hairColor?.type || !selectedHairColor) errors.push("la couleur des cheveux");
    if (formData.hairColor?.type === 'custom' && !formData.hairColor?.custom?.trim()) {
      errors.push("la couleur des cheveux personnalisée");
    }
    
    // Type de cheveux
    if (!formData.hairType) errors.push("le type de cheveux (comment sont les cheveux)");
    if (formData.hairType === 'custom' && !formData.hairTypeCustom?.trim()) {
      errors.push("le type de cheveux personnalisé");
    }
    
    // Lunettes
    if (formData.glasses === undefined || formData.glasses === null) {
      errors.push("si l'enfant porte des lunettes (Oui/Non)");
    }
    
    // Surnom
    if (formData.nickname?.type === 'custom' && !formData.nickname?.custom?.trim()) {
      errors.push("le surnom personnalisé");
    }

    // Détails physiques (obligatoire)
    const hasPhysicalDetails = Array.isArray(formData.physicalDetails) && 
      formData.physicalDetails.some(detail => detail.trim() !== '');
    if (!formData.noPhysicalDetails && !hasPhysicalDetails) {
      errors.push("un détail physique marquant (ou cochez 'Aucun détail physique particulier')");
    }

    // Style vestimentaire favori (obligatoire)
    if (!formData.clothingStyle || (typeof formData.clothingStyle === 'string' && !formData.clothingStyle.trim())) {
      errors.push("le style vestimentaire favori");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return;
    }

    handleNextStep();
  };

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-primary flex items-center justify-center gap-2">
        <span className="text-2xl">👶</span> L'enfant, le héros de l'histoire <span className="text-2xl">🌟</span>
      </h2>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">👶</span> Quel est son prénom ?
              </FormLabel>
              <FormControl>
                <Input placeholder="Son prénom" {...field} className="border-mcf-amber" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">🧑‍🍼</span> Quel est son genre ?
              </FormLabel>
              <RadioGroup 
                value={field.value ?? ""} 
                onValueChange={field.onChange} 
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="girl" id="gender-girl" className="peer h-5 w-5" />
                  </FormControl>
                  <FormLabel htmlFor="gender-girl">Fille</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="boy" id="gender-boy" className="peer h-5 w-5" />
                  </FormControl>
                  <FormLabel htmlFor="gender-boy">Garçon</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="neutral" id="gender-neutral" className="peer h-5 w-5" />
                  </FormControl>
                  <FormLabel htmlFor="gender-neutral">Neutre</FormLabel>
                </FormItem>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">🎂</span> Quelle est la date de naissance de votre enfant ?
              </FormLabel>
              <FormControl>
                <div className="relative">
<ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Sélecteur de date indisponible</div>}>
  <div className="space-y-2">
    <Input
      value={field.value ? format(field.value, 'dd/MM/yyyy') : ''}
      readOnly
      placeholder="JJ/MM/AAAA"
      className={cn(
        "border-mcf-amber cursor-pointer",
        ageError ? "border-red-500 focus-visible:ring-red-500" : ""
      )}
      onClick={() => {}}
    />
    {ready ? (
      <StepDatePicker
        value={field.value}
        onChange={(date) => handleDateChange(date ?? null)}
        minYear={new Date().getFullYear() - 10}
        maxYear={new Date().getFullYear()}
        className="border-mcf-amber/50"
      />
    ) : null}
  </div>
</ErrorBoundary>
                </div>
              </FormControl>
              <FormDescription>
                Nous utilisons cette information pour adapter les histoires à son âge exact.
              </FormDescription>
              {ageError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Âge non valide</AlertTitle>
                  <AlertDescription>
                    {ageError}
                  </AlertDescription>
                </Alert>
              )}
              {ageDisplay && !ageError && (
                <div className="mt-2 p-2 bg-mcf-amber/10 rounded-md text-center">
                  <p className="text-sm font-medium text-mcf-primary-dark">
                    Votre enfant a {ageDisplay}
                  </p>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nickname.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">💖</span> Comment le surnommez-vous ?
              </FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {[
                  { value: "none", label: "Aucun" },
                  { value: "petitChou", label: "Petit chou" },
                  { value: "tresor", label: "Trésor" },
                  { value: "boubou", label: "Boubou" },
                  { value: "custom", label: "Autre" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      selectedNickname === option.value
                        ? "border-mcf-primary bg-mcf-secondary-light/50"
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => {
                      setSelectedNickname(option.value);
                      form.setValue("nickname.type", option.value as "none" | "petitChou" | "tresor" | "boubou" | "custom");
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedNickname === "custom" && (
          <FormField
            control={form.control}
            name="nickname.custom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✨</span> Surnom personnalisé
                </FormLabel>
                <FormControl>
                  <Input placeholder="Son surnom personnalisé" {...field} className="border-mcf-amber" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="skinColor.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">🖐️</span> Quelle est sa couleur de peau ?
              </FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {[
                  { value: "light", label: "Claire" },
                  { value: "medium", label: "Mate" },
                  { value: "dark", label: "Foncée" },
                  { value: "custom", label: "Autre" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      selectedSkinColor === option.value
                        ? "border-mcf-primary bg-mcf-secondary-light/50"
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => {
                      setSelectedSkinColor(option.value);
                      form.setValue("skinColor.type", option.value as "light" | "medium" | "dark" | "custom");
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSkinColor === "custom" && (
          <FormField
            control={form.control}
            name="skinColor.custom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✨</span> Couleur de peau personnalisée
                </FormLabel>
                <FormControl>
                  <Input placeholder="Sa couleur de peau personnalisée" {...field} className="border-mcf-amber" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="eyeColor.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">👁️</span> Quelle est la couleur de ses yeux ?
              </FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {[
                  { value: "blue", label: "Bleus" },
                  { value: "green", label: "Verts" },
                  { value: "brown", label: "Marrons" },
                  { value: "black", label: "Noirs" },
                  { value: "custom", label: "Autre" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      selectedEyeColor === option.value
                        ? "border-mcf-primary bg-mcf-secondary-light/50"
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => {
                      setSelectedEyeColor(option.value);
                      form.setValue("eyeColor.type", option.value as "blue" | "green" | "brown" | "black" | "custom");
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedEyeColor === "custom" && (
          <FormField
            control={form.control}
            name="eyeColor.custom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✨</span> Couleur des yeux personnalisée
                </FormLabel>
                <FormControl>
                  <Input placeholder="Sa couleur des yeux personnalisée" {...field} className="border-mcf-amber" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="hairColor.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">💇</span> Quelle est la couleur de ses cheveux ?
              </FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
                {[
                  { value: "blonde", label: "Blonds" },
                  { value: "chestnut", label: "Châtains" },
                  { value: "brown", label: "Bruns" },
                  { value: "red", label: "Roux" },
                  { value: "black", label: "Noirs" },
                  { value: "white", label: "Blancs" },
                  { value: "custom", label: "Autre" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      selectedHairColor === option.value
                        ? "border-mcf-primary bg-mcf-secondary-light/50"
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => {
                      setSelectedHairColor(option.value);
                      form.setValue("hairColor.type", option.value as "blonde" | "chestnut" | "brown" | "red" | "black" | "white" | "custom");
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedHairColor === "custom" && (
          <FormField
            control={form.control}
            name="hairColor.custom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✨</span> Couleur des cheveux personnalisée
                </FormLabel>
                <FormControl>
                  <Input placeholder="Sa couleur des cheveux personnalisée" {...field} className="border-mcf-amber" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="hairType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">〰️</span> Comment sont ses cheveux ?
              </FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {[
                  { value: "straight", label: "Raides" },
                  { value: "wavy", label: "Ondulés" },
                  { value: "curly", label: "Bouclés" },
                  { value: "coily", label: "Frisés" },
                  { value: "bald", label: "Chauve" },
                  { value: "ponytail", label: "Queue de cheval" },
                  { value: "custom", label: "Autre" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      field.value === option.value
                        ? "border-mcf-primary bg-mcf-secondary-light/50"
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => form.setValue("hairType", option.value as "straight" | "wavy" | "curly" | "coily" | "bald" | "ponytail" | "custom")}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("hairType") === "custom" && (
          <FormField
            control={form.control}
            name="hairTypeCustom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✨</span> Type de cheveux personnalisé
                </FormLabel>
                <FormControl>
                  <Input placeholder="Description personnalisée" {...field} className="border-mcf-amber" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="glasses"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">👓</span> Porte-t-il/elle des lunettes ?
              </FormLabel>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { value: true, label: "Oui" },
                  { value: false, label: "Non" },
                ].map((option) => (
                  <div
                    key={option.value.toString()}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      field.value === option.value
                        ? "border-mcf-primary bg-mcf-secondary-light/50"
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => form.setValue("glasses", option.value as boolean, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="physicalDetails"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PhysicalDetailsInput
                  value={field.value}
                  onChange={field.onChange}
                  noDetailsValue={noPhysicalDetails}
                  onNoDetailsChange={(checked) => {
                    setNoPhysicalDetails(checked);
                    form.setValue('noPhysicalDetails', checked);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clothingStyle"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ClothingStyleInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-6 flex justify-center">
          <button 
            type="button" 
            onClick={validateAndContinue}
            disabled={!!ageError}
            className={`bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
              ageError ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Continuer l'aventure →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
