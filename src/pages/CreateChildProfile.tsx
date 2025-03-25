import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

type ChildProfileFormData = {
  firstName: string;
  nickname: {
    type: "none" | "petitChou" | "tresor" | "boubou" | "custom";
    custom?: string;
  };
  age: "0-2" | "3-5" | "6-7" | "8-10";
  gender: "girl" | "boy" | "neutral";
  skinColor: {
    type: "light" | "medium" | "dark" | "custom";
    custom?: string;
  };
  eyeColor: {
    type: "blue" | "green" | "brown" | "black" | "custom";
    custom?: string;
  };
  hairColor: {
    type: "blonde" | "chestnut" | "brown" | "red" | "black" | "custom";
    custom?: string;
  };
  hairType: "straight" | "wavy" | "curly" | "coily";
  glasses: boolean;
  
  height: "small" | "medium" | "tall";
  superpowers: string[];
  passions: string[];
  challenges: string[];
};

const SUPERPOWERS_OPTIONS = [
  { value: "curious", label: "Curieux.se", icon: "🧐" },
  { value: "adventurous", label: "Aventurier.e", icon: "🌍" },
  { value: "dreamer", label: "Rêveur.se", icon: "💭" },
  { value: "funny", label: "Drôle", icon: "😆" },
  { value: "brave", label: "Courageux.se", icon: "🛡️" },
  { value: "emotional", label: "Émotif.ve", icon: "💖" },
  { value: "athletic", label: "Sportif.ve", icon: "⚽" },
  { value: "mischievous", label: "Malicieux.se", icon: "🐒" },
  { value: "calm", label: "Calme", icon: "🌿" },
];

const PASSIONS_OPTIONS = [
  { value: "dinosaurs", label: "Dinosaures", icon: "🦖" },
  { value: "animals", label: "Animaux", icon: "🐶" },
  { value: "space", label: "Espace", icon: "🚀" },
  { value: "pirates", label: "Pirates", icon: "🏴‍☠️" },
  { value: "magic", label: "Magie", icon: "✨" },
  { value: "fairytales", label: "Contes de fées", icon: "🏰" },
  { value: "nature", label: "Nature", icon: "🌳" },
  { value: "vehicles", label: "Véhicules", icon: "🚒" },
  { value: "robots", label: "Robots", icon: "🤖" },
  { value: "unicorns", label: "Licornes", icon: "🦄" },
  { value: "ghosts", label: "Fantômes", icon: "👻" },
  { value: "superheroes", label: "Super-héros", icon: "🦸‍♀️" },
  { value: "wizards", label: "Sorciers", icon: "🧙" },
  { value: "princesses", label: "Princesses", icon: "👑" },
  { value: "food", label: "Nourriture", icon: "🍔" },
  { value: "games", label: "Jeux", icon: "🎲" },
];

const CHALLENGES_OPTIONS = [
  { value: "darkness", label: "Braver l'obscurité", icon: "🌙" },
  { value: "monsters", label: "Affronter des monstres imaginaires", icon: "👹" },
  { value: "sleep", label: "S'endormir seul", icon: "🛏️" },
  { value: "focus", label: "Se concentrer", icon: "🧠" },
  { value: "energy", label: "Canaliser son énergie", icon: "⚡" },
  { value: "emotions", label: "Gérer ses émotions", icon: "💬" },
  { value: "confidence", label: "Prendre confiance en soi", icon: "🌟" },
  { value: "openness", label: "S'ouvrir aux autres", icon: "👫" },
  { value: "express", label: "Dire ce qu'il/elle ressent", icon: "🗣️" },
  { value: "perseverance", label: "Persévérer face à l'échec", icon: "🔁" },
  { value: "frustration", label: "Accepter la frustration", icon: "😤" },
];

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
      setFormStep(1); // Pour l'instant on ne va qu'à l'étape suivante
      toast.success("Première section complétée !");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Veuillez compléter tous les champs requis");
    }
  };

  const handlePreviousStep = () => {
    setFormStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    // Vérifier si les champs de la section 2 sont valides
    const superpowers = form.getValues().superpowers || [];
    const passions = form.getValues().passions || [];
    const challenges = form.getValues().challenges || [];

    // Validation des sélections maximales
    if (superpowers.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 super-pouvoirs");
      return;
    }
    if (passions.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 passions");
      return;
    }
    if (challenges.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 défis");
      return;
    }

    // Soumission du formulaire
    form.handleSubmit(onSubmit)();
    toast.success("Personnalité et passions enregistrées !");
    // Ici plus tard, on passera à la section suivante
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
        {formStep === 0 && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
              <span className="text-2xl">👶</span> L'enfant, le héros de l'histoire <span className="text-2xl">🌟</span>
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Section 1: L'enfant, le héros de l'histoire */}
                {/* ... keep existing code (all form fields for the first section) */

                <div className="pt-6 flex justify-center">
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Continuer l'aventure →
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {formStep === 1 && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
              <span className="text-2xl">🎭</span> Personnalité et passions <span className="text-2xl">🚀</span>
            </h2>
            
            <Form {...form}>
              <form className="space-y-8">
                {/* Taille par rapport à son âge */}
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">📏</span> Comment est sa taille par rapport à son âge ?
                      </FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                        {[
                          { value: "small", label: "Petit(e) pour son âge" },
                          { value: "medium", label: "Taille moyenne" },
                          { value: "tall", label: "Grand(e) pour son âge" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                              field.value === option.value
                                ? "border-mcf-orange bg-mcf-amber/10"
                                : "border-gray-200 hover:border-mcf-amber"
                            }`}
                            onClick={() => form.setValue("height", option.value as any)}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Super-pouvoirs */}
                <FormField
                  control={form.control}
                  name="superpowers"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">✨</span> Quels sont les 3 super-pouvoirs de votre enfant ?
                        <span className="text-sm font-normal text-mcf-orange-dark ml-2">(max 3)</span>
                      </FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {SUPERPOWERS_OPTIONS.map((option) => {
                          const superpowers = form.getValues().superpowers || [];
                          const isSelected = superpowers.includes(option.value);
                          const hasReachedLimit = superpowers.length >= 3 && !isSelected;
                          
                          return (
                            <Card 
                              key={option.value} 
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? "border-mcf-orange shadow-md bg-mcf-amber/10" 
                                  : hasReachedLimit 
                                    ? "border-gray-200 opacity-50" 
                                    : "border-gray-200 hover:border-mcf-amber hover:shadow-sm"
                              }`}
                              onClick={() => {
                                if (hasReachedLimit) {
                                  toast.error("Vous avez déjà sélectionné 3 super-pouvoirs");
                                  return;
                                }
                                
                                const currentValues = superpowers;
                                const updatedValues = isSelected
                                  ? currentValues.filter((value) => value !== option.value)
                                  : [...currentValues, option.value];
                                
                                form.setValue("superpowers", updatedValues);
                              }}
                            >
                              <CardContent className="p-4 flex items-center gap-3">
                                <div className="text-2xl">{option.icon}</div>
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-mcf-orange" : "border-gray-300"}`}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                                  </div>
                                  <span className="font-medium">{option.label}</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {(form.getValues().superpowers?.length || 0)}/3 super-pouvoirs sélectionnés
                      </p>
                    </FormItem>
                  )}
                />

                {/* Passions */}
                <FormField
                  control={form.control}
                  name="passions"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">❤️</span> Qu'aime le plus votre enfant ?
                        <span className="text-sm font-normal text-mcf-orange-dark ml-2">(max 3)</span>
                      </FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {PASSIONS_OPTIONS.map((option) => {
                          const passions = form.getValues().passions || [];
                          const isSelected = passions.includes(option.value);
                          const hasReachedLimit = passions.length >= 3 && !isSelected;
                          
                          return (
                            <Card 
                              key={option.value} 
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? "border-mcf-orange shadow-md bg-mcf-amber/10" 
                                  : hasReachedLimit 
                                    ? "border-gray-200 opacity-50" 
                                    : "border-gray-200 hover:border-mcf-amber hover:shadow-sm"
                              }`}
                              onClick={() => {
                                if (hasReachedLimit) {
                                  toast.error("Vous avez déjà sélectionné 3 passions");
                                  return;
                                }
                                
                                const currentValues = passions;
                                const updatedValues = isSelected
                                  ? currentValues.filter((value) => value !== option.value)
                                  : [...currentValues, option.value];
                                
                                form.setValue("passions", updatedValues);
                              }}
                            >
                              <CardContent className="p-4 flex items-center gap-3">
                                <div className="text-2xl">{option.icon}</div>
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-mcf-orange" : "border-gray-300"}`}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                                  </div>
                                  <span className="font-medium">{option.label}</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {(form.getValues().passions?.length || 0)}/3 passions sélectionnées
                      </p>
                    </FormItem>
                  )}
                />

                {/* Grands défis */}
                <FormField
                  control={form.control}
                  name="challenges"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">🏆</span> Quels sont les grands défis de votre enfant ?
                        <span className="text-sm font-normal text-mcf-orange-dark ml-2">(max 3)</span>
                      </FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {CHALLENGES_OPTIONS.map((option) => {
                          const challenges = form.getValues().challenges || [];
                          const isSelected = challenges.includes(option.value);
                          const hasReachedLimit = challenges.length >= 3 && !isSelected;
                          
                          return (
                            <Card 
                              key={option.value} 
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? "border-mcf-orange shadow-md bg-mcf-amber/10" 
                                  : hasReachedLimit 
                                    ? "border-gray-200 opacity-50" 
                                    : "border-gray-200 hover:border-mcf-amber hover:shadow-sm"
                              }`}
                              onClick={() => {
                                if (hasReachedLimit) {
                                  toast.error("Vous avez déjà sélectionné 3 défis");
                                  return;
                                }
                                
                                const currentValues = challenges;
                                const updatedValues = isSelected
                                  ? currentValues.filter((value) => value !== option.value)
                                  : [...currentValues, option.value];
                                
                                form.setValue("challenges", updatedValues);
                              }}
                            >
                              <CardContent className="p-4 flex items-center gap-3">
                                <div className="text-2xl">{option.icon}</div>
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-mcf-orange" : "border-gray-300"}`}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                                  </div>
                                  <span className="font-medium">{option.label}</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {(form.getValues().challenges?.length || 0)}/3 défis sélectionnés
                      </p>
                    </FormItem>
                  )}
                />

                <div className="pt-6 flex justify-between">
                  <Button 
                    type="button" 
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="text-mcf-orange border-mcf-orange hover:bg-mcf-amber/10 font-semibold py-2 px-6 rounded-full text-base"
                  >
                    ← Retour
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleContinue}
                    className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Continuer l'aventure →
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateChildProfile;
