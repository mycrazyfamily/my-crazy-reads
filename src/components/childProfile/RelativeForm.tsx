
import React, { useState } from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { RELATIVE_TYPE_OPTIONS, CHARACTER_TRAITS_OPTIONS } from '@/constants/childProfileOptions';
import type { RelativeData, RelativeType } from '@/types/childProfile';

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
  
  const handleInputChange = (field: keyof RelativeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTraitToggle = (trait: string) => {
    const currentTraits = [...formData.traits];
    
    if (currentTraits.includes(trait)) {
      // Remove trait
      const updatedTraits = currentTraits.filter(t => t !== trait);
      setFormData(prev => ({ ...prev, traits: updatedTraits }));
    } else {
      // Add trait if less than 3 selected
      if (currentTraits.length < 3) {
        setFormData(prev => ({ ...prev, traits: [...currentTraits, trait] }));
      }
    }
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
          {/* Type de proche */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">👤</span> Qui est ce proche ?
            </label>
            <Select 
              value={formData.type} 
              onValueChange={(value: RelativeType) => handleInputChange('type', value)}
            >
              <SelectTrigger className="border-mcf-amber">
                <SelectValue placeholder="Type de proche" />
              </SelectTrigger>
              <SelectContent>
                {RELATIVE_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Nom personnalisé pour "autre" */}
          {formData.type === 'other' && (
            <div className="form-group">
              <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span> Précisez
              </label>
              <Input 
                value={formData.otherTypeName || ''} 
                onChange={(e) => handleInputChange('otherTypeName', e.target.value)}
                placeholder="Ex: ami de la famille, nounou..." 
                className="border-mcf-amber"
              />
            </div>
          )}
          
          {/* Prénom */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">👤</span> Prénom
            </label>
            <Input 
              value={formData.firstName} 
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Son prénom" 
              className="border-mcf-amber"
            />
          </div>
          
          {/* Surnom */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">💖</span> Surnom (facultatif)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {[
                { value: "none", label: "Aucun" },
                { value: "mamoune", label: "Mamoune" },
                { value: "papou", label: "Papou" },
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
                    setFormData(prev => ({
                      ...prev,
                      nickname: {
                        ...prev.nickname,
                        type: option.value as any
                      }
                    }));
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Surnom personnalisé */}
          {selectedNickname === "custom" && (
            <div className="form-group">
              <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span> Surnom personnalisé
              </label>
              <Input 
                value={formData.nickname.custom || ''} 
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nickname: {
                    ...prev.nickname,
                    custom: e.target.value
                  }
                }))}
                placeholder="Son surnom personnalisé" 
                className="border-mcf-amber"
              />
            </div>
          )}
          
          {/* Âge */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">🎂</span> Âge (facultatif)
            </label>
            <Input 
              value={formData.age} 
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Ex: 35" 
              className="border-mcf-amber"
            />
          </div>
          
          {/* Métier */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">💼</span> Métier/Activité (facultatif)
            </label>
            <Input 
              value={formData.job} 
              onChange={(e) => handleInputChange('job', e.target.value)}
              placeholder="Ex: Professeur, écolier..." 
              className="border-mcf-amber"
            />
          </div>
          
          {/* Couleur de peau */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">🖐️</span> Couleur de peau
            </label>
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
                    setFormData(prev => ({
                      ...prev,
                      skinColor: {
                        ...prev.skinColor,
                        type: option.value as any
                      }
                    }));
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Couleur de peau personnalisée */}
          {selectedSkinColor === "custom" && (
            <div className="form-group">
              <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span> Couleur de peau personnalisée
              </label>
              <Input 
                value={formData.skinColor.custom || ''} 
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  skinColor: {
                    ...prev.skinColor,
                    custom: e.target.value
                  }
                }))}
                placeholder="Description de la couleur de peau" 
                className="border-mcf-amber"
              />
            </div>
          )}
          
          {/* Couleur des cheveux */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">💇</span> Couleur des cheveux
            </label>
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
                    setFormData(prev => ({
                      ...prev,
                      hairColor: {
                        ...prev.hairColor,
                        type: option.value as any
                      }
                    }));
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Couleur des cheveux personnalisée */}
          {selectedHairColor === "custom" && (
            <div className="form-group">
              <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span> Couleur des cheveux personnalisée
              </label>
              <Input 
                value={formData.hairColor.custom || ''} 
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  hairColor: {
                    ...prev.hairColor,
                    custom: e.target.value
                  }
                }))}
                placeholder="Description de la couleur des cheveux" 
                className="border-mcf-amber"
              />
            </div>
          )}
          
          {/* Type de cheveux */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">〰️</span> Type de cheveux
            </label>
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
                    formData.hairType === option.value
                      ? "border-mcf-orange bg-mcf-amber/10"
                      : "border-gray-200 hover:border-mcf-amber"
                  }`}
                  onClick={() => handleInputChange('hairType', option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Lunettes ? */}
          <div className="form-group flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <label className="block text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">👓</span> Porte-t-il/elle des lunettes ?
              </label>
              <p className="text-sm text-gray-500">
                Cochez la case si cette personne porte des lunettes.
              </p>
            </div>
            <Checkbox 
              checked={formData.glasses} 
              onCheckedChange={(checked) => handleInputChange('glasses', !!checked)}
            />
          </div>
          
          {/* Traits de caractère */}
          <div className="form-group">
            <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
              <span className="text-xl">💪</span> Traits de caractère (3 max)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {CHARACTER_TRAITS_OPTIONS.map((option) => {
                const isChecked = formData.traits.includes(option.value);
                return (
                  <div 
                    key={option.value}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      isChecked 
                        ? "border-mcf-orange bg-mcf-amber/10" 
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => handleTraitToggle(option.value)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        <Checkbox 
                          checked={isChecked}
                          disabled={!isChecked && formData.traits.length >= 3}
                          className="pointer-events-none"
                        />
                      </div>
                      <div>
                        <div className="text-xl mb-1">{option.icon}</div>
                        <div>{option.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
            onClick={() => onSave(formData)}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelativeForm;
