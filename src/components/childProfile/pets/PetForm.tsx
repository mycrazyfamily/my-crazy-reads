
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PET_TYPE_OPTIONS, PET_TRAIT_OPTIONS } from '@/constants/petOptions';
import type { PetData, PetType, PetTrait } from '@/types/childProfile';
import { Dog, Cat, Rabbit, Bird, Fish } from 'lucide-react';
import ChildrenSelector from '../ChildrenSelector';
import { supabase } from "@/integrations/supabase/client";

type PetFormProps = {
  pet?: PetData;
  onSave: (pet: PetData, selectedChildrenIds?: string[]) => void;
  onCancel: () => void;
  isCreatingNewChild?: boolean;
  showButtons?: boolean;
  onDataChange?: (pet: PetData) => void;
};

const PetForm: React.FC<PetFormProps> = ({ pet, onSave, onCancel, isCreatingNewChild = false, showButtons = true, onDataChange }) => {
  const [name, setName] = useState(pet?.name || '');
  const [type, setType] = useState<PetType>(pet?.type || 'dog');
  const [otherType, setOtherType] = useState(pet?.otherType || '');
  const [breed, setBreed] = useState(pet?.breed || '');
  const [physicalDetails, setPhysicalDetails] = useState(pet?.physicalDetails || '');
  const [selectedTraits, setSelectedTraits] = useState<PetTrait[]>(pet?.traits || []);
  const [customTraits, setCustomTraits] = useState<Record<string, string>>(pet?.customTraits || {});
  
  const MAX_TRAITS = 2;
  const hasReachedMaxTraits = selectedTraits.length >= MAX_TRAITS;

  // Pour la sélection d'enfants existants
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

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

  const handleToggleChild = (childId: string) => {
    setSelectedChildrenIds(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  const getIconComponent = (petType: PetType) => {
    switch (petType) {
      case 'dog':
        return <Dog className="h-6 w-6" />;
      case 'cat':
        return <Cat className="h-6 w-6" />;
      case 'rabbit':
        return <Rabbit className="h-6 w-6" />;
      case 'bird':
        return <Bird className="h-6 w-6" />;
      case 'fish':
        return <Fish className="h-6 w-6" />;
      default:
        return <span className="text-2xl">{PET_TYPE_OPTIONS.find(option => option.value === petType)?.icon}</span>;
    }
  };

  const handleTraitToggle = (trait: PetTrait) => {
    if (selectedTraits.includes(trait)) {
      // Si le trait est déjà sélectionné, on le retire
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
      
      // Si c'était un trait custom, on retire aussi sa valeur
      if (trait === 'other' || trait === 'other2') {
        const newCustomTraits = { ...customTraits };
        delete newCustomTraits[trait];
        setCustomTraits(newCustomTraits);
      }
    } else {
      // Si le maximum n'est pas atteint, on peut ajouter le trait
      if (selectedTraits.length < MAX_TRAITS) {
        setSelectedTraits([...selectedTraits, trait]);
      } else {
        toast.error(`Vous pouvez sélectionner ${MAX_TRAITS} traits maximum`);
      }
    }
  };

  const handleCustomTraitChange = (trait: PetTrait, value: string) => {
    setCustomTraits({
      ...customTraits,
      [trait]: value
    });
  };

  const getPetData = (): PetData => {
    return {
      id: pet?.id || Date.now().toString(),
      name: name.trim(),
      type,
      otherType: type === 'other' ? otherType.trim() : undefined,
      breed: breed.trim() || undefined,
      physicalDetails: physicalDetails.trim() || undefined,
      traits: selectedTraits,
      customTraits: Object.keys(customTraits).length > 0 ? customTraits : undefined,
    };
  };

  const validatePetData = (): boolean => {
    if (!name.trim()) {
      toast.error("Le prénom de l'animal est requis");
      return false;
    }

    if (type === 'other' && !otherType.trim()) {
      toast.error("Veuillez préciser le type d'animal");
      return false;
    }

    if (!breed.trim()) {
      toast.error("La race de l'animal est requise");
      return false;
    }

    // Vérifier que les traits personnalisés sont remplis
    const hasEmptyCustomTrait = selectedTraits.some(trait => 
      (trait === 'other' || trait === 'other2') && (!customTraits[trait] || !customTraits[trait].trim())
    );

    if (hasEmptyCustomTrait) {
      toast.error("Veuillez préciser tous les traits personnalisés");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validatePetData()) return;
    const newPet = getPetData();
    onSave(newPet, isCreatingNewChild ? selectedChildrenIds : undefined);
  };

  // Notifier le parent des changements de données
  useEffect(() => {
    if (onDataChange) {
      const petData = getPetData();
      onDataChange(petData);
    }
  }, [name, type, otherType, breed, physicalDetails, selectedTraits, customTraits]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-center mb-4 text-mcf-primary">
        {pet ? 'Modifier' : 'Ajouter'} un animal de compagnie
      </h3>

      {/* Nom de l'animal */}
      <div className="space-y-2">
        <Label htmlFor="pet-name" className="text-base font-medium">
          Prénom de l'animal
        </Label>
        <Input
          id="pet-name"
          placeholder="Comment s'appelle cet animal ?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-base"
        />
      </div>

      {/* Type d'animal */}
      <div className="space-y-3">
        <Label className="text-base font-medium block">
          Type d'animal
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {PET_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value as PetType)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                 type === option.value 
                  ? 'bg-mcf-secondary-light/50 border-mcf-primary shadow-sm' 
                  : 'border-gray-200 hover:border-mcf-primary/50'
              }`}
            >
              <span className="text-2xl mb-1">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>

        {type === 'other' && (
          <div className="mt-3">
            <Label htmlFor="other-pet-type" className="text-sm font-medium">
              Précisez le type d'animal
            </Label>
            <Input
              id="other-pet-type"
              placeholder="Ex: Hamster, Tortue, etc."
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Race de l'animal */}
      <div className="space-y-2">
        <Label htmlFor="pet-breed" className="text-base font-medium">
          Quelle est sa race ?
        </Label>
        <Input
          id="pet-breed"
          placeholder="Ex: Labrador, Persan, Bélier, etc."
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          className="text-base"
        />
      </div>

      {/* Détails physiques de l'animal */}
      <div className="space-y-2">
        <Label htmlFor="pet-physical-details" className="text-base font-medium">
          Détails physiques <span className="text-xs text-gray-500">(facultatif)</span>
        </Label>
        <Input
          id="pet-physical-details"
          placeholder="Ex: Poils longs blancs, tache noire sur l'œil droit, etc."
          value={physicalDetails}
          onChange={(e) => setPhysicalDetails(e.target.value)}
          className="text-base"
        />
      </div>

      {/* Traits de caractère */}
      <div className="space-y-3">
        <Label className="text-base font-medium block">
          Traits de caractère <span className="text-xs text-gray-500">({MAX_TRAITS} maximum)</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {PET_TRAIT_OPTIONS.map((trait) => {
            const isTraitSelected = selectedTraits.includes(trait.value as PetTrait);
            const isDisabled = !isTraitSelected && hasReachedMaxTraits;
            
            return (
              <div key={trait.value} className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleTraitToggle(trait.value as PetTrait)}
                  disabled={isDisabled}
                  className={`flex items-center justify-start p-2 rounded-lg border gap-2 transition-all w-full
                    ${isTraitSelected 
                      ? 'bg-mcf-secondary-light/50 border-mcf-primary shadow-sm' 
                      : isDisabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-mcf-primary/50'
                    }`}
                >
                  <span className="text-xl">{trait.icon}</span>
                  <span className="text-sm">{trait.label}</span>
                </button>
                
                {/* Champ pour préciser un trait personnalisé */}
                {isTraitSelected && (trait.value === 'other' || trait.value === 'other2') && (
                  <Input
                    placeholder="Précisez le trait de caractère"
                    value={customTraits[trait.value] || ''}
                    onChange={(e) => handleCustomTraitChange(trait.value as PetTrait, e.target.value)}
                    className="mt-1 text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sélection des enfants existants (uniquement lors de la création d'un nouvel enfant) */}
      {isCreatingNewChild && existingChildren.length > 0 && (
        <ChildrenSelector
          children={existingChildren}
          selectedChildrenIds={selectedChildrenIds}
          onToggleChild={handleToggleChild}
          label="Cet animal est aussi l'animal de :"
        />
      )}

      {/* Boutons d'action */}
      {showButtons && (
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            onClick={onCancel}
            variant="outline"
          >
            Annuler
          </Button>
          
          <Button 
            type="button"
            onClick={handleSubmit}
            className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
          >
            {pet ? 'Enregistrer les modifications' : 'Ajouter cet animal'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PetForm;
