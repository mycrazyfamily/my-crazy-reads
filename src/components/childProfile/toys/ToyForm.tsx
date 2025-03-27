
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { toyTypeOptions, toyRoleOptions } from '@/constants/toyOptions';
import { v4 as uuidv4 } from 'uuid';
import type { ToyData, ToyType, ToyRole } from '@/types/childProfile';

type ToyFormProps = {
  toy?: ToyData;
  onSave: (toy: ToyData) => void;
  onCancel: () => void;
};

const ToyForm: React.FC<ToyFormProps> = ({ toy, onSave, onCancel }) => {
  const form = useFormContext();
  const [toyName, setToyName] = useState(toy?.name || '');
  const [toyType, setToyType] = useState<ToyType>(toy?.type || 'plush');
  const [otherType, setOtherType] = useState(toy?.otherType || '');
  const [appearance, setAppearance] = useState(toy?.appearance || '');
  const [selectedRoles, setSelectedRoles] = useState<ToyRole[]>(toy?.roles || []);

  const isEditing = !!toy;

  const handleTypeChange = (value: ToyType) => {
    setToyType(value);
    if (value !== 'other') {
      setOtherType('');
    }
  };

  const handleRoleToggle = (role: ToyRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        // Limiter à 2 rôles maximum
        if (prev.length < 2) {
          return [...prev, role];
        }
        return prev;
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!toyName.trim()) {
      return;
    }

    const newToy: ToyData = {
      id: toy?.id || uuidv4(),
      name: toyName.trim(),
      type: toyType,
      otherType: toyType === 'other' ? otherType.trim() : undefined,
      appearance: appearance.trim(),
      roles: selectedRoles,
    };

    onSave(newToy);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="bg-mcf-amber/10 p-6 rounded-lg border border-mcf-amber/30">
        <h3 className="text-xl font-bold text-center mb-6 text-mcf-orange-dark">
          {isEditing ? "Modifier le doudou" : "Ajouter un doudou"}
        </h3>

        {/* Prénom du doudou */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="toy-name" className="text-base font-medium">
              Quel est son prénom ? 📛
            </Label>
            <Input
              id="toy-name"
              value={toyName}
              onChange={e => setToyName(e.target.value)}
              placeholder="Exemple: Doudou, Lapinou, Câlin..."
              required
              className="bg-white"
            />
          </div>

          {/* Type d'objet */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Quel type d'objet est-ce ? 🧸
            </Label>
            
            <RadioGroup
              value={toyType}
              onValueChange={(value) => handleTypeChange(value as ToyType)}
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              {toyTypeOptions.map(option => (
                <div 
                  key={option.value}
                  className={`flex items-center justify-start space-x-2 p-3 rounded-md border border-mcf-amber/30 hover:bg-mcf-amber/5 cursor-pointer ${
                    toyType === option.value ? 'bg-mcf-amber/20 border-mcf-amber' : 'bg-white'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`toy-type-${option.value}`} />
                  <Label 
                    htmlFor={`toy-type-${option.value}`} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {toyType === 'other' && (
              <div className="pt-2">
                <Label htmlFor="other-type" className="text-sm font-medium">
                  Précisez le type:
                </Label>
                <Input
                  id="other-type"
                  value={otherType}
                  onChange={e => setOtherType(e.target.value)}
                  placeholder="Ex: Mouchoir, Capuche, etc."
                  className="mt-1 bg-white"
                  required={toyType === 'other'}
                />
              </div>
            )}
          </div>

          {/* Apparence */}
          <div className="space-y-2">
            <Label htmlFor="appearance" className="text-base font-medium">
              À quoi ressemble-t-il ? 👀
            </Label>
            <Textarea
              id="appearance"
              value={appearance}
              onChange={e => setAppearance(e.target.value)}
              placeholder="Ex: bleu, usé, très doux, un œil en moins, rayé..."
              className="h-20 bg-white"
            />
          </div>

          {/* Rôle dans l'imaginaire */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Quel rôle a-t-il dans son imaginaire ? 🪄 <span className="text-sm text-gray-500 font-normal">(2 max)</span>
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {toyRoleOptions.map(role => (
                <div 
                  key={role.value}
                  className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer ${
                    selectedRoles.includes(role.value)
                      ? 'bg-mcf-amber/20 border-mcf-amber'
                      : 'bg-white border-mcf-amber/30 hover:bg-mcf-amber/5'
                  }`}
                  onClick={() => handleRoleToggle(role.value)}
                >
                  <Checkbox
                    id={`role-${role.value}`}
                    checked={selectedRoles.includes(role.value)}
                    onCheckedChange={() => handleRoleToggle(role.value)}
                    className="h-4 w-4"
                  />
                  <Label 
                    htmlFor={`role-${role.value}`} 
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <span className="text-xl">{role.emoji}</span>
                    <span>{role.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button 
          type="button" 
          onClick={onCancel}
          variant="outline"
          className="font-semibold"
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold"
          disabled={!toyName.trim() || (toyType === 'other' && !otherType.trim())}
        >
          {isEditing ? "Enregistrer les modifications" : "Ajouter le doudou"}
        </Button>
      </div>
    </form>
  );
};

export default ToyForm;
