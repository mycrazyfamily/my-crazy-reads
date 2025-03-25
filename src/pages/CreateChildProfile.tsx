
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
};

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
    } else {
      toast.error("Veuillez compléter tous les champs requis");
    }
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
            <span className="text-2xl">👶</span> L'enfant, le héros de l'histoire <span className="text-2xl">🌟</span>
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Prénom */}
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: "Le prénom est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-xl">✨</span> Quel est le prénom de votre enfant ?
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Prénom" 
                        className="focus-visible:ring-mcf-orange" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Surnom */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">❤️</span> A-t-il/elle un surnom ?
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedNickname === "none" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedNickname("none");
                      form.setValue("nickname", { type: "none" });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedNickname === "none" ? "border-mcf-orange" : "border-gray-300"}`}>
                        {selectedNickname === "none" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                      </div>
                      <span className="font-medium">Aucun</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedNickname === "petitChou" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedNickname("petitChou");
                      form.setValue("nickname", { type: "petitChou" });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedNickname === "petitChou" ? "border-mcf-orange" : "border-gray-300"}`}>
                        {selectedNickname === "petitChou" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                      </div>
                      <span className="font-medium">Petit(e) chou</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedNickname === "tresor" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedNickname("tresor");
                      form.setValue("nickname", { type: "tresor" });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedNickname === "tresor" ? "border-mcf-orange" : "border-gray-300"}`}>
                        {selectedNickname === "tresor" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                      </div>
                      <span className="font-medium">Mon trésor</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedNickname === "boubou" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedNickname("boubou");
                      form.setValue("nickname", { type: "boubou" });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedNickname === "boubou" ? "border-mcf-orange" : "border-gray-300"}`}>
                        {selectedNickname === "boubou" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                      </div>
                      <span className="font-medium">Boubou</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all sm:col-span-2 ${selectedNickname === "custom" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedNickname("custom");
                      form.setValue("nickname", { type: "custom", custom: form.getValues().nickname.custom || "" });
                    }}
                  >
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedNickname === "custom" ? "border-mcf-orange" : "border-gray-300"}`}>
                          {selectedNickname === "custom" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                        </div>
                        <span className="font-medium">Autre : </span>
                      </div>
                      
                      <Input 
                        className={`flex-1 min-w-[200px] focus-visible:ring-mcf-orange ${selectedNickname !== "custom" && "bg-gray-100"}`}
                        placeholder="Précisez le surnom"
                        disabled={selectedNickname !== "custom"}
                        value={form.getValues().nickname.custom || ""}
                        onChange={(e) => form.setValue("nickname", { type: "custom", custom: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Âge */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-xl">🎂</span> Quel âge a-t-il/elle ?
                    </FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: "0-2", label: "0-2 ans" },
                        { value: "3-5", label: "3-5 ans" },
                        { value: "6-7", label: "6-7 ans" },
                        { value: "8-10", label: "8-10 ans" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                            field.value === option.value
                              ? "border-mcf-orange bg-mcf-amber/10"
                              : "border-gray-200 hover:border-mcf-amber"
                          }`}
                          onClick={() => form.setValue("age", option.value as any)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
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
                    <FormLabel className="text-lg font-semibold">
                      Quel est son genre ?
                    </FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: "girl", label: "👧 Fille" },
                        { value: "boy", label: "👦 Garçon" },
                        { value: "neutral", label: "🧑 Neutre" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                            field.value === option.value
                              ? "border-mcf-orange bg-mcf-amber/10"
                              : "border-gray-200 hover:border-mcf-amber"
                          }`}
                          onClick={() => form.setValue("gender", option.value as any)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Couleur de peau */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Quelle est sa couleur de peau ?
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSkinColor === "light" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedSkinColor("light");
                      form.setValue("skinColor", { type: "light" });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSkinColor === "light" ? "border-mcf-orange" : "border-gray-300"}`}>
                        {selectedSkinColor === "light" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                      </div>
                      <span className="font-medium">Claire</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSkinColor === "medium" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedSkinColor("medium");
                      form.setValue("skinColor", { type: "medium" });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSkinColor === "medium" ? "border-mcf-orange" : "border-gray-300"}`}>
                        {selectedSkinColor === "medium" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                      </div>
                      <span className="font-medium">Mate</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSkinColor === "dark" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedSkinColor("dark");
                      form.setValue("skinColor", { type: "dark" });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSkinColor === "dark" ? "border-mcf-orange" : "border-gray-300"}`}>
                        {selectedSkinColor === "dark" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                      </div>
                      <span className="font-medium">Foncée</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSkinColor === "custom" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedSkinColor("custom");
                      form.setValue("skinColor", { type: "custom", custom: form.getValues().skinColor.custom || "" });
                    }}
                  >
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSkinColor === "custom" ? "border-mcf-orange" : "border-gray-300"}`}>
                          {selectedSkinColor === "custom" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                        </div>
                        <span className="font-medium">Autre : </span>
                      </div>
                      
                      <Input 
                        className={`flex-1 min-w-[100px] focus-visible:ring-mcf-orange ${selectedSkinColor !== "custom" && "bg-gray-100"}`}
                        placeholder="Précisez"
                        disabled={selectedSkinColor !== "custom"}
                        value={form.getValues().skinColor.custom || ""}
                        onChange={(e) => form.setValue("skinColor", { type: "custom", custom: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Couleur des yeux */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">👀</span> Couleur de ses yeux ?
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: "blue", label: "Bleu" },
                    { value: "green", label: "Vert" },
                    { value: "brown", label: "Marron" },
                    { value: "black", label: "Noir" },
                  ].map((option) => (
                    <div 
                      key={option.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedEyeColor === option.value ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                      onClick={() => {
                        setSelectedEyeColor(option.value);
                        form.setValue("eyeColor", { type: option.value as any });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedEyeColor === option.value ? "border-mcf-orange" : "border-gray-300"}`}>
                          {selectedEyeColor === option.value && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all md:col-span-3 ${selectedEyeColor === "custom" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedEyeColor("custom");
                      form.setValue("eyeColor", { type: "custom", custom: form.getValues().eyeColor.custom || "" });
                    }}
                  >
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedEyeColor === "custom" ? "border-mcf-orange" : "border-gray-300"}`}>
                          {selectedEyeColor === "custom" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                        </div>
                        <span className="font-medium">Autre : </span>
                      </div>
                      
                      <Input 
                        className={`flex-1 min-w-[100px] focus-visible:ring-mcf-orange ${selectedEyeColor !== "custom" && "bg-gray-100"}`}
                        placeholder="Précisez"
                        disabled={selectedEyeColor !== "custom"}
                        value={form.getValues().eyeColor.custom || ""}
                        onChange={(e) => form.setValue("eyeColor", { type: "custom", custom: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Couleur des cheveux */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✂️</span> Couleur de ses cheveux ?
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: "blonde", label: "Blond" },
                    { value: "chestnut", label: "Châtain" },
                    { value: "brown", label: "Brun" },
                    { value: "red", label: "Roux" },
                    { value: "black", label: "Noir" },
                  ].map((option) => (
                    <div 
                      key={option.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedHairColor === option.value ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                      onClick={() => {
                        setSelectedHairColor(option.value);
                        form.setValue("hairColor", { type: option.value as any });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedHairColor === option.value ? "border-mcf-orange" : "border-gray-300"}`}>
                          {selectedHairColor === option.value && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all md:col-span-3 ${selectedHairColor === "custom" ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"}`}
                    onClick={() => {
                      setSelectedHairColor("custom");
                      form.setValue("hairColor", { type: "custom", custom: form.getValues().hairColor.custom || "" });
                    }}
                  >
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedHairColor === "custom" ? "border-mcf-orange" : "border-gray-300"}`}>
                          {selectedHairColor === "custom" && <div className="w-3 h-3 rounded-full bg-mcf-orange"></div>}
                        </div>
                        <span className="font-medium">Autre : </span>
                      </div>
                      
                      <Input 
                        className={`flex-1 min-w-[100px] focus-visible:ring-mcf-orange ${selectedHairColor !== "custom" && "bg-gray-100"}`}
                        placeholder="Précisez"
                        disabled={selectedHairColor !== "custom"}
                        value={form.getValues().hairColor.custom || ""}
                        onChange={(e) => form.setValue("hairColor", { type: "custom", custom: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Type de cheveux */}
              <FormField
                control={form.control}
                name="hairType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-xl">💇</span> Type de cheveux ?
                    </FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: "straight", label: "Raides" },
                        { value: "wavy", label: "Ondulés" },
                        { value: "curly", label: "Bouclés" },
                        { value: "coily", label: "Crépus" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                            field.value === option.value
                              ? "border-mcf-orange bg-mcf-amber/10"
                              : "border-gray-200 hover:border-mcf-amber"
                          }`}
                          onClick={() => form.setValue("hairType", option.value as any)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lunettes */}
              <FormField
                control={form.control}
                name="glasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-xl">👓</span> Porte-t-il/elle des lunettes ?
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                          field.value === true
                            ? "border-mcf-orange bg-mcf-amber/10"
                            : "border-gray-200 hover:border-mcf-amber"
                        }`}
                        onClick={() => form.setValue("glasses", true)}
                      >
                        Oui
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                          field.value === false
                            ? "border-mcf-orange bg-mcf-amber/10"
                            : "border-gray-200 hover:border-mcf-amber"
                        }`}
                        onClick={() => form.setValue("glasses", false)}
                      >
                        Non
                      </div>
                    </div>
                    <FormMessage />
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
      </div>
    </div>
  );
};

export default CreateChildProfile;
