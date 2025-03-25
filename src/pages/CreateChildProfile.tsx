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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Trash, X } from "lucide-react";

type RelativeType = 
  | "mother" | "father" | "otherParent" 
  | "sister" | "brother" 
  | "grandmother" | "grandfather" 
  | "femaleCousin" | "maleCousin" 
  | "femaleFriend" | "maleFriend" 
  | "other";

type RelativeData = {
  id: string;
  type: RelativeType;
  firstName: string;
  nickname: {
    type: "none" | "mamoune" | "papou" | "custom";
    custom?: string;
  };
  age: string;
  job: string;
  skinColor: {
    type: "light" | "medium" | "dark" | "custom";
    custom?: string;
  };
  hairColor: {
    type: "blonde" | "chestnut" | "brown" | "red" | "black" | "custom";
    custom?: string;
  };
  hairType: "straight" | "wavy" | "curly" | "coily";
  glasses: boolean;
  traits: string[];
  otherTypeName?: string;
};

type FamilyData = {
  selectedRelatives: RelativeType[];
  relatives: RelativeData[];
  otherRelativeType?: string;
};

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

  family: FamilyData;
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

const CHARACTER_TRAITS_OPTIONS = [
  { value: "funny", label: "Drôle", icon: "😆" },
  { value: "generous", label: "Généreux.se", icon: "❤️" },
  { value: "calm", label: "Calme", icon: "🌿" },
  { value: "dynamic", label: "Dynamique", icon: "⚡" },
  { value: "creative", label: "Créatif.ve", icon: "🎨" },
  { value: "talkative", label: "Bavard.e", icon: "💬" },
  { value: "authoritative", label: "Autoritaire", icon: "👮" },
  { value: "adventurous", label: "Aventurier.e", icon: "🌍" },
  { value: "sensitive", label: "Sensible", icon: "💞" },
];

const RELATIVE_TYPE_OPTIONS = [
  { value: "mother", label: "Maman", icon: "👩" },
  { value: "father", label: "Papa", icon: "👨" },
  { value: "otherParent", label: "Autre figure parentale", icon: "🏡" },
  { value: "sister", label: "Sœur(s)", icon: "👧" },
  { value: "brother", label: "Frère(s)", icon: "👦" },
  { value: "grandmother", label: "Grand-mère(s)", icon: "👵" },
  { value: "grandfather", label: "Grand-père(s)", icon: "👴" },
  { value: "femaleCousin", label: "Cousine(s)", icon: "👧" },
  { value: "maleCousin", label: "Cousin(s)", icon: "👦" },
  { value: "femaleFriend", label: "Meilleure amie(s)", icon: "👭" },
  { value: "maleFriend", label: "Meilleur ami(s)", icon: "👬" },
  { value: "other", label: "Autre", icon: "➕" },
];

const CreateChildProfile = () => {
  const [formStep, setFormStep] = useState(0);
  const [selectedNickname, setSelectedNickname] = useState<string>("none");
  const [selectedSkinColor, setSelectedSkinColor] = useState<string>("light");
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>("blue");
  const [selectedHairColor, setSelectedHairColor] = useState<string>("blonde");
  const [currentRelative, setCurrentRelative] = useState<RelativeData | null>(null);
  const [isEditingRelative, setIsEditingRelative] = useState(false);
  
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

  const handleAddRelative = () => {
    // Vérifier si des types de proches ont été sélectionnés
    const selectedRelatives = form.getValues().family?.selectedRelatives || [];
    
    if (selectedRelatives.length === 0) {
      toast.error("Veuillez sélectionner au moins un type de proche");
      return;
    }

    // Créer un nouveau proche vide
    const newRelative: RelativeData = {
      id: Date.now().toString(),
      type: selectedRelatives[0], // Par défaut, utiliser le premier type sélectionné
      firstName: '',
      nickname: { type: "none" },
      age: '',
      job: '',
      skinColor: { type: "light" },
      hairColor: { type: "blonde" },
      hairType: "straight",
      glasses: false,
      traits: [],
    };

    setCurrentRelative(newRelative);
    setIsEditingRelative(true);
  };

  const handleSaveRelative = () => {
    if (!currentRelative) return;
    
    // Validation basique
    if (!currentRelative.firstName) {
      toast.error("Le prénom est requis");
      return;
    }

    if (currentRelative.traits.length > 3) {
      toast.error("Veuillez sélectionner au maximum 3 traits de caractère");
      return;
    }

    // Récupérer la liste actuelle des proches
    const currentRelatives = form.getValues().family?.relatives || [];
    
    // Ajouter ou mettre à jour le proche
    const updatedRelatives = currentRelatives.some(r => r.id === currentRelative.id)
      ? currentRelatives.map(r => r.id === currentRelative.id ? currentRelative : r)
      : [...currentRelatives, currentRelative];
    
    // Mettre à jour le formulaire
    form.setValue("family.relatives", updatedRelatives);
    
    // Réinitialiser l'état
    setCurrentRelative(null);
    setIsEditingRelative(false);
    
    toast.success(
      currentRelatives.some(r => r.id === currentRelative.id) 
        ? "Proche modifié avec succès !" 
        : "Proche ajouté avec succès !"
    );
  };

  const handleEditRelative = (relative: RelativeData) => {
    setCurrentRelative({...relative});
    setIsEditingRelative(true);
  };

  const handleDeleteRelative = (id: string) => {
    // Récupérer la liste actuelle des proches
    const currentRelatives = form.getValues().family?.relatives || [];
    
    // Filtrer pour retirer le proche à supprimer
    const updatedRelatives = currentRelatives.filter(r => r.id !== id);
    
    // Mettre à jour le formulaire
    form.setValue("family.relatives", updatedRelatives);
    
    toast.success("Proche supprimé avec succès !");
  };

  const handleCancelRelativeEdit = () => {
    setCurrentRelative(null);
    setIsEditingRelative(false);
  };

  const getRelativeTypeLabel = (type: RelativeType) => {
    const option = RELATIVE_TYPE_OPTIONS.find(opt => opt.value === type);
    return option ? option.label : "Autre";
  };

  const getRelativeTypeIcon = (type: RelativeType) => {
    const option = RELATIVE_TYPE_OPTIONS.find(opt => opt.value === type);
    return option ? option.icon : "👤";
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getHairColorForAvatar = (hairColor: string) => {
    switch(hairColor) {
      case "blonde": return "bg-yellow-300";
      case "chestnut": return "bg-amber-700";
      case "brown": return "bg-amber-950";
      case "red": return "bg-orange-600";
      case "black": return "bg-gray-900";
      default: return "bg-amber-700";
    }
  };

  const getSkinColorForAvatar = (skinColor: string) => {
    switch(skinColor) {
      case "light": return "text-rose-100";
      case "medium": return "text-amber-300";
      case "dark": return "text-amber-800";
      default: return "text-rose-100";
    }
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

    // Passer à l'étape suivante
    handleNextStep();
  };

  const handleFamilySectionContinue = () => {
    // Vérifier si au moins un proche a été ajouté
    const relatives = form.getValues().family?.relatives || [];
    
    if (relatives.length === 0) {
      toast.error("Veuillez ajouter au moins un proche");
      return;
    }

    // Soumission du formulaire pour l'instant, mais plus tard on passera à la section suivante
    form.handleSubmit(onSubmit)();
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

                {/* Surnom */}
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
                                ? "border-mcf-orange bg-mcf-amber/10"
                                : "border-gray-200 hover:border-mcf-amber"
                            }`}
                            onClick={() => {
                              setSelectedNickname(option.value);
                              form.setValue("nickname.type", option.value);
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

                {/* Champ texte pour le surnom personnalisé */}
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

                {/* Âge */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">🎂</span> Quel âge a-t-il/elle ?
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-mcf-amber">
                            <SelectValue placeholder="Sélectionner l'âge" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-2">0-2 ans</SelectItem>
                          <SelectItem value="3-5">3-5 ans</SelectItem>
                          <SelectItem value="6-7">6-7 ans</SelectItem>
                          <SelectItem value="8-10">8-10 ans</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Genre */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">⚧️</span> Quel est son genre ?
                      </FormLabel>
                      <RadioGroup defaultValue={field.value} onValueChange={field.onChange} className="flex flex-col space-y-1">
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

                {/* Couleur de peau */}
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
                                ? "border-mcf-orange bg-mcf-amber/10"
                                : "border-gray-200 hover:border-mcf-amber"
                            }`}
                            onClick={() => {
                              setSelectedSkinColor(option.value);
                              form.setValue("skinColor.type", option.value);
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

                {/* Champ texte pour la couleur de peau personnalisée */}
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

                {/* Couleur des yeux */}
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
                                ? "border-mcf-orange bg-mcf-amber/10"
                                : "border-gray-200 hover:border-mcf-amber"
                            }`}
                            onClick={() => {
                              setSelectedEyeColor(option.value);
                              form.setValue("eyeColor.type", option.value);
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

                {/* Champ texte pour la couleur des yeux personnalisée */}
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

                {/* Couleur des cheveux */}
                <FormField
                  control={form.control}
                  name="hairColor.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">💇</span> Quelle est la couleur de ses cheveux ?
                      </FormLabel>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
                        {[
                          { value: "blonde", label: "Blonds" },
                          { value: "chestnut", label: "Châtains" },
                          { value: "brown", label: "Bruns" },
                          { value: "red", label: "Roux" },
                          { value: "black", label: "Noirs" },
                          { value: "custom", label: "Autre" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                              selectedHairColor === option.value
                                ? "border-mcf-orange bg-mcf-amber/10"
                                : "border-gray-200 hover:border-mcf-amber"
                            }`}
                            onClick={() => {
                              setSelectedHairColor(option.value);
                              form.setValue("hairColor.type", option.value);
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

                {/* Champ texte pour la couleur des cheveux personnalisée */}
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

                {/* Type de cheveux */}
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
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                              field.value === option.value
                                ? "border-mcf-orange bg-mcf-amber/10"
                                : "border-gray-200 hover:border-mcf-amber"
                            }`}
                            onClick={() => form.setValue("hairType", option.value)}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Est-ce qu'il/elle porte des lunettes ? */}
                <FormField
                  control={form.control}
                  name="glasses"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <span className="text-xl">👓</span> Porte-t-il/elle des lunettes ?
                        </FormLabel>
                        <FormDescription>
                          Cochez la case si votre enfant porte des lunettes.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                            className={`p-4 rounded-
