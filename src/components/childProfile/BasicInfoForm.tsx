import React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChildProfileFormData } from '@/types/childProfile';

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

  return (
    <div className="mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-mcf-orange flex items-center justify-center gap-2">
        <span className="text-2xl">👶</span> L'enfant, le héros de l'histoire <span className="text-2xl">🌟</span>
      </h2>
      
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
              <RadioGroup 
                defaultValue={field.value} 
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
                      form.setValue("hairColor.type", option.value as "blonde" | "chestnut" | "brown" | "red" | "black" | "custom");
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

        {/* Lunettes - version avec boutons radio au lieu de checkbox */}
        <FormField
          control={form.control}
          name="glasses"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">👓</span> Porte-t-il/elle des lunettes ?
              </FormLabel>
              <FormDescription>
                Sélectionnez Oui ou Non.
              </FormDescription>
              <RadioGroup 
                onValueChange={(value) => field.onChange(value === "true")} 
                value={field.value ? "true" : "false"}
                className="flex gap-4 mt-2"
              >
                <div className={`px-6 py-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                  field.value ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"
                }`}>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" id="glasses-yes" className="peer h-5 w-5" />
                    </FormControl>
                    <FormLabel htmlFor="glasses-yes" className="cursor-pointer">Oui</FormLabel>
                  </FormItem>
                </div>
                
                <div className={`px-6 py-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                  !field.value ? "border-mcf-orange bg-mcf-amber/10" : "border-gray-200 hover:border-mcf-amber"
                }`}>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" id="glasses-no" className="peer h-5 w-5" />
                    </FormControl>
                    <FormLabel htmlFor="glasses-no" className="cursor-pointer">Non</FormLabel>
                  </FormItem>
                </div>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-6 flex justify-center">
          <button 
            type="button" 
            onClick={handleNextStep}
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Continuer l'aventure →
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoForm;
