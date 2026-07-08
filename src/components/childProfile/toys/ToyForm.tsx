// ToyForm v1.1
// Changelog v1.1 : (a) emojis retirés des 4 libellés de question (prénom/type/apparence/rôle) —
// les emojis des OPTIONS elles-mêmes (types, rôles) restent, ils servent de repère visuel comme
// pour PET_TYPE_OPTIONS ; (b) ajout showButtons/isDisabled/onDataChange (même pattern que
// PetForm.tsx) pour permettre à ModifierDoudou de piloter son propre bouton en bas de page.
import React, { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toyTypeOptions, toyRoleOptions } from '@/constants/toyOptions';
import { v4 as uuidv4 } from 'uuid';
import type { ToyData, ToyType, ToyRole } from '@/types/childProfile';

type ToyFormProps = {
  toy?: ToyData;
  onSave: (toy: ToyData) => void;
  onCancel: () => void;
  showButtons?: boolean;
  isDisabled?: boolean;
  onDataChange?: (toy: ToyData) => void;
};

const ToyForm: React.FC<ToyFormProps> = ({ toy, onSave, onCancel, showButtons = true, isDisabled = false, onDataChange }) => {
  const form = useFormContext();
  const [toyName, setToyName] = useState(toy?.name || '');
  const [toyType, setToyType] = useState<ToyType>(toy?.type || 'plush');
  const [otherType, setOtherType] = useState(toy?.otherType || '');
  const [appearance, setAppearance] = useState(toy?.appearance || '');
  const [selectedRoles, setSelectedRoles] = useState<ToyRole[]>(toy?.roles || []);
  const [customRole1, setCustomRole1] = useState(toy?.customRoles?.otherRole1 || '');
  const [customRole2, setCustomRole2] = useState(toy?.customRoles?.otherRole2 || '');

  const isEditing = !!toy;

  const handleTypeChange = (value: ToyType) => {
    setToyType(value);
    if (value !== 'other') {
      setOtherType('');
    }
  };

  // Memoized handler to prevent infinite updates
  const handleRoleToggle = useCallback((role: ToyRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Si on désélectionne, simplement retirer le rôle
        return prev.filter(r => r !== role);
      } else {
        // Si on sélectionne "Aucun rôle particulier", vider toute la sélection et ne garder que celui-ci
        if (role === 'noSpecificRole') {
          return [role];
        }
        
        // Si on sélectionne un autre rôle alors que "Aucun rôle particulier" était sélectionné, le retirer
        const filteredPrev = prev.filter(r => r !== 'noSpecificRole');
        
        // Limiter à 2 rôles maximum (hors "Aucun rôle particulier")
        if (filteredPrev.length < 2) {
          return [...filteredPrev, role];
        }
        return filteredPrev;
      }
    });
  }, []);

  const getToyData = (): ToyData => ({
    id: toy?.id || uuidv4(),
    name: toyName.trim(),
    type: toyType,
    otherType: toyType === 'other' ? otherType.trim() : undefined,
    appearance: appearance.trim(),
    roles: selectedRoles,
    customRoles: {
      ...(selectedRoles.includes('otherRole1') ? { otherRole1: customRole1.trim() } : {}),
      ...(selectedRoles.includes('otherRole2') ? { otherRole2: customRole2.trim() } : {})
    },
    // Préserver le lien BD et le statut lors d'une édition
    comforterId: toy?.comforterId,
    isActive: toy?.isActive !== false
  });

  const handleSubmit = () => {
    if (!toyName.trim()) {
      return;
    }
    onSave(getToyData());
  };

  // Notifier le parent des changements (utilisé par ModifierDoudou pour piloter Statut + save
  // depuis un bouton externe, comme ModifierAnimal/ModifierProche)
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange(getToyData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toyName, toyType, otherType, appearance, selectedRoles, customRole1, customRole2]);

  // Vérifie si un rôle a déjà été sélectionné
  const isRoleSelected = (role: ToyRole) => selectedRoles.includes(role);
  
  // Vérifie si on a atteint la limite de sélection (2 rôles max, sauf pour "noSpecificRole")
  const isMaxRolesReached = selectedRoles.length >= 2 && !selectedRoles.includes('noSpecificRole');
  
  // Détermine si un rôle est désactivé
  const isRoleDisabled = (role: ToyRole) => {
    // Si "Aucun rôle particulier" est sélectionné, désactiver tous les autres rôles
    if (selectedRoles.includes('noSpecificRole') && role !== 'noSpecificRole') {
      return true;
    }
    // Sinon, désactiver si le max est atteint et le rôle n'est pas déjà sélectionné
    return isMaxRolesReached && !isRoleSelected(role);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-mcf-amber/10 p-6 rounded-lg border border-mcf-amber/30">
        <h3 className="text-xl font-bold text-center mb-6 text-mcf-orange-dark">
          {isEditing ? "Modifier le doudou" : "Ajouter un doudou"}
        </h3>

        {/* Prénom du doudou */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="toy-name" className="text-base font-medium">
              Quel est son prénom ?
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
              Quel type d'objet est-ce ?
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
              À quoi ressemble-t-il ?
            </Label>
            <Textarea
              id="appearance"
              value={appearance}
              onChange={e => setAppearance(e.target.value)}
              placeholder="Ex: bleu, usé, très doux, un œil en moins, rayé..."
              className="h-20 bg-white"
            />
          </div>

          {/* Rôle dans l'imaginaire - RESTRUCTURATION POUR ÉVITER LES BOUCLES INFINIES */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Quel rôle a-t-il dans son imaginaire ? <span className="text-sm text-gray-500 font-normal">(2 max)</span>
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {toyRoleOptions.map(role => (
                <div 
                  key={role.value}
                  onClick={() => {
                    if (!isRoleDisabled(role.value)) {
                      handleRoleToggle(role.value);
                    }
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${
                    isRoleSelected(role.value)
                      ? 'bg-mcf-amber/20 border-mcf-amber'
                      : isRoleDisabled(role.value)
                        ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                        : 'bg-white border-mcf-amber/30 hover:bg-mcf-amber/5'
                  }`}
                >
                  <div className="h-4 w-4 border border-primary rounded flex items-center justify-center">
                    {isRoleSelected(role.value) && (
                      <div className="h-2 w-2 bg-primary rounded-sm" />
                    )}
                  </div>
                  <Label 
                    className={`flex items-center gap-2 cursor-pointer flex-1 ${
                      isRoleDisabled(role.value) ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="text-xl">{role.emoji}</span>
                    <span>{role.label}</span>
                  </Label>
                </div>
              ))}
            </div>

            {/* Champs pour les rôles personnalisés */}
            {selectedRoles.includes('otherRole1') && (
              <div className="pt-2">
                <Label htmlFor="custom-role-1" className="text-sm font-medium">
                  Précisez le premier rôle personnalisé:
                </Label>
                <Input
                  id="custom-role-1"
                  value={customRole1}
                  onChange={e => setCustomRole1(e.target.value)}
                  placeholder="Ex: Confident, Compagnon de voyage..."
                  className="mt-1 bg-white"
                  required={selectedRoles.includes('otherRole1')}
                />
              </div>
            )}

            {selectedRoles.includes('otherRole2') && (
              <div className="pt-2">
                <Label htmlFor="custom-role-2" className="text-sm font-medium">
                  Précisez le second rôle personnalisé:
                </Label>
                <Input
                  id="custom-role-2"
                  value={customRole2}
                  onChange={e => setCustomRole2(e.target.value)}
                  placeholder="Ex: Gardien des secrets, Source de courage..."
                  className="mt-1 bg-white"
                  required={selectedRoles.includes('otherRole2')}
                />
              </div>
            )}
            
            {isMaxRolesReached && (
              <p className="text-sm text-amber-600 italic">
                Vous avez atteint le nombre maximum de rôles (2)
              </p>
            )}
          </div>
        </div>
      </div>

      {showButtons && (
        <div className="flex justify-between pt-2">
          <Button 
            type="button" 
            onClick={onCancel}
            variant="outline"
            className="font-semibold"
            disabled={isDisabled}
          >
            Annuler
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled || !toyName.trim() || (toyType === 'other' && !otherType.trim()) || 
              (selectedRoles.includes('otherRole1') && !customRole1.trim()) || 
              (selectedRoles.includes('otherRole2') && !customRole2.trim())}
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold"
          >
            {isDisabled ? 'Enregistrement...' : (isEditing ? "Enregistrer les modifications" : "Ajouter le doudou")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ToyForm;
