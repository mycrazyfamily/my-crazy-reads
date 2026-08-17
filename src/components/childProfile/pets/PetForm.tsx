// PetForm v1.4
// Changelog v1.4 : changer le TYPE d'animal (sélecteur de boutons) vide désormais le champ
//   « race », sauf retour au type d'origine où la race d'origine est restaurée (Option B).
//   Motif : une race incohérente avec le type (type=chien / race=chat siamois) faisait générer
//   un avatar de la mauvaise espèce, car côté back l'espèce = (breed || type), breed prioritaire.
//   Nouveau handler handleTypeChange branché sur le onClick du sélecteur (remplace setType direct).
//   Le useEffect [pet] de restauration n'est pas touché (il ne réagit qu'au changement de prop pet,
//   pas aux clics). Neutre en création (pet undefined → vidage simple à chaque changement).
//   Va de pair avec 3_Build_Edit_Prompt v4.1 + ModifierAnimal v3.3 (override sur changement d'espèce).
// PetForm v1.3
// Changelog v1.3 (B4) : placeholders raccourcis + « … » retirés.
// PetForm v1.2
// Changelog v1.2 (MOBILE) : (a) placeholders d'exemple raccourcis (B4) ; (b) [déjà présent] traits
//   en 2 colonnes sur mobile + chips qui ne débordent plus (min-w-0/break-words) + nav du
//   sous-formulaire qui s'empile sur mobile.
// PetForm v1.1
// Changelog v1.1 : ajout du champ Sexe (Mâle/Femelle), obligatoire — state + UI + getPetData + validatePetData
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { PET_TYPE_OPTIONS, PET_TRAIT_OPTIONS } from '@/constants/petOptions';
import type { PetData, PetType, PetGender, PetTrait } from '@/types/childProfile';
import { Dog, Cat, Rabbit, Bird, Fish } from 'lucide-react';
import ChildrenSelector from '../ChildrenSelector';
import { supabase } from "@/integrations/supabase/client";
import PetPhysicalDetailsInput from './PetPhysicalDetailsInput';
import { PetMonthYearPicker } from './PetMonthYearPicker';
import { FORBIDDEN_NAME_ERROR, checkFreeTextFields, containsForbiddenWord, forbiddenFieldsError } from '@/utils/nameBlocklist';

type PetFormProps = {
  pet?: PetData;
  onSave: (pet: PetData, selectedChildrenIds?: string[]) => void;
  onCancel: () => void;
  isCreatingNewChild?: boolean;
  showButtons?: boolean;
  onDataChange?: (pet: PetData) => void;
  linkedChildrenIds?: string[]; // IDs des enfants déjà liés à cet animal
  isDisabled?: boolean;
};

const PetForm: React.FC<PetFormProps> = ({ pet, onSave, onCancel, isCreatingNewChild = false, showButtons = true, onDataChange, linkedChildrenIds, isDisabled = false }) => {
  const [name, setName] = useState(pet?.name || '');
  const [type, setType] = useState<PetType>(pet?.type || 'dog');
  const [gender, setGender] = useState<PetGender | undefined>(pet?.gender);
  const [otherType, setOtherType] = useState(pet?.otherType || '');
  const [birthMonthYear, setBirthMonthYear] = useState(pet?.birthMonthYear || '');
  const [breed, setBreed] = useState(pet?.breed || '');
  const [petPhysicalDetails, setPetPhysicalDetails] = useState<string[]>(() => {
    const details = pet?.customTraits?.physicalDetails;
    if (Array.isArray(details)) return details;
    return [];
  });
  const [noPhysicalDetails, setNoPhysicalDetails] = useState<boolean>(() => {
    // Charger le flag depuis les customTraits si présent
    const customTraitsAny = pet?.customTraits as any;
    return customTraitsAny?.noPhysicalDetails === true || customTraitsAny?.noPhysicalDetails === 'true';
  });
  const [selectedTraits, setSelectedTraits] = useState<PetTrait[]>(pet?.traits || []);
  const [customTraits, setCustomTraits] = useState<Record<string, string | string[] | boolean>>(() => {
    if (!pet?.customTraits) return {};
    // Filtrer physicalDetails qui sera géré séparément
    const { physicalDetails, ...rest } = pet.customTraits;
    return rest;
  });
  
  const MAX_TRAITS = 2;
  const hasReachedMaxTraits = selectedTraits.length >= MAX_TRAITS;

  // Pour la sélection d'enfants existants
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>(pet?.linkedChildrenIds || linkedChildrenIds || []);

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

  // Synchroniser selectedChildrenIds avec les linkedChildrenIds de pet
  useEffect(() => {
    if (pet?.linkedChildrenIds) {
      setSelectedChildrenIds(pet.linkedChildrenIds);
    }
  }, [pet?.linkedChildrenIds]);

  // Synchroniser les détails physiques quand pet change
  useEffect(() => {
    if (pet) {
      // Restaurer name, type, etc.
      setName(pet.name || '');
      setType(pet.type || 'dog');
      setGender(pet.gender);
      setOtherType(pet.otherType || '');
      setBirthMonthYear(pet.birthMonthYear || '');
      setBreed(pet.breed || '');
      setSelectedTraits(pet.traits || []);
      
      // Restaurer petPhysicalDetails
      const details = pet.customTraits?.physicalDetails;
      if (Array.isArray(details)) {
        setPetPhysicalDetails(details);
      } else {
        setPetPhysicalDetails([]);
      }
      
      // Restaurer noPhysicalDetails
      const customTraitsAny = pet.customTraits as any;
      setNoPhysicalDetails(customTraitsAny?.noPhysicalDetails === true || customTraitsAny?.noPhysicalDetails === 'true');
      
      // Restaurer customTraits (sans physicalDetails)
      if (pet.customTraits) {
        const { physicalDetails, noPhysicalDetails: _, ...rest } = pet.customTraits;
        setCustomTraits(rest);
      } else {
        setCustomTraits({});
      }
    }
  }, [pet]);

  // v1.4 — Changement de type d'animal via le sélecteur : gère le champ « race » en même temps.
  // Objectif : ne pas garder une race incohérente avec le type (ex. type=chien / race=chat siamois),
  // ce qui, côté back, produisait un avatar de la mauvaise espèce (breed a la priorité sur type).
  // Option B (retour au type d'origine = restauration) :
  //   - si le nouveau type == le type d'origine du pet édité → on restaure la race d'origine
  //     (évite de perdre « chat siamois » sur un aller-retour Chat→Chien→Chat) ;
  //   - sinon (vrai changement d'espèce) → on vide la race.
  // En création, pet est undefined → pet?.type vaut undefined, jamais égal à un type réel :
  // la race se vide donc simplement à chaque changement, comportement neutre attendu.
  // Volontairement limité au sélecteur de boutons : taper dans « Précisez le type » (other)
  // ou dans le champ race ne doit rien réinitialiser.
  const handleTypeChange = (newType: PetType) => {
    if (newType === type) return; // pas de changement réel
    setType(newType);
    if (pet && newType === pet.type) {
      setBreed(pet.breed || '');
    } else {
      setBreed('');
    }
  };

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
    // Ne sauvegarder que l'un ou l'autre, jamais les deux
    const mergedCustomTraits = { ...customTraits };
    
    if (noPhysicalDetails) {
      mergedCustomTraits.noPhysicalDetails = true;
    } else if (petPhysicalDetails.length > 0 && petPhysicalDetails.some(d => d.trim() !== '')) {
      mergedCustomTraits.physicalDetails = petPhysicalDetails;
    }

    const petData = {
      id: pet?.id || Date.now().toString(),
      name: name.trim(),
      type,
      gender: gender as PetGender,
      otherType: type === 'other' ? otherType.trim() : undefined,
      birthMonthYear: birthMonthYear || undefined,
      breed: breed.trim() || undefined,
      traits: selectedTraits,
      customTraits: Object.keys(mergedCustomTraits).length > 0 ? mergedCustomTraits : undefined,
    };
    
    return petData;
  };

  const validatePetData = (): boolean => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push("le nom de l'animal");
    }

    // Blocklist : nom de l'animal
    if (containsForbiddenWord(name)) {
      toast.error(FORBIDDEN_NAME_ERROR);
      return false;
    }

    if (!type) {
      errors.push("le type d'animal");
    }

    if (type === 'other' && !otherType.trim()) {
      errors.push("le type d'animal personnalisé");
    }

    if (!gender) {
      errors.push("le sexe de l'animal");
    }

    if (!birthMonthYear) {
      errors.push("la date de naissance de l'animal");
    }

    if (!breed.trim()) {
      errors.push("la race de l'animal");
    }

    if (selectedTraits.length === 0) {
      errors.push("au moins un trait de caractère");
    }

    // Vérifier que les traits personnalisés sont remplis
    const hasEmptyCustomTrait = selectedTraits.some(trait => {
      if (trait === 'other' || trait === 'other2') {
        const value = customTraits[trait];
        return !value || (typeof value === 'string' && !value.trim());
      }
      return false;
    });

    if (hasEmptyCustomTrait) {
      errors.push("tous les traits personnalisés");
    }

    // Vérifier les détails physiques : au moins un détail OU la case "aucun détail" cochée
    const hasPhysicalDetails = petPhysicalDetails.length > 0 && petPhysicalDetails.some(d => d.trim() !== '');
    if (!hasPhysicalDetails && !noPhysicalDetails) {
      errors.push("un détail physique marquant (ou cochez 'Aucun détail physique particulier')");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validatePetData()) return;
    const newPet = getPetData();

    // v2.0 — blocklist ici plutôt que dans les écrans appelants : ce formulaire
    // sert au wizard de création, à AjouterAnimal et à ModifierAnimal.
    if (containsForbiddenWord(newPet.name)) {
      toast.error(FORBIDDEN_NAME_ERROR);
      return;
    }
    const champsLibres = checkFreeTextFields({
      'la race': newPet.breed,
      "le type d'animal": newPet.otherType,
      'les détails physiques': ((newPet.customTraits as any)?.physicalDetails ?? []) as string[],
      'les traits de caractère': Object.values(newPet.customTraits || {})
        .filter((v) => typeof v === 'string') as string[],
    });
    if (!champsLibres.ok) {
      toast.error(forbiddenFieldsError(champsLibres));
      return;
    }

    onSave(newPet, isCreatingNewChild ? selectedChildrenIds : undefined);
  };

  // Notifier le parent des changements de données
  useEffect(() => {
    if (onDataChange) {
      const petData = getPetData();
      onDataChange(petData);
    }
  }, [name, type, gender, otherType, birthMonthYear, breed, petPhysicalDetails, noPhysicalDetails, selectedTraits, customTraits]);

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
              onClick={() => handleTypeChange(option.value as PetType)}
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
              placeholder="Ex : Hamster, tortue"
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Sexe de l'animal */}
      <div className="space-y-3">
        <Label className="text-base font-medium block">
          Sexe
        </Label>
        <RadioGroup
          value={gender}
          onValueChange={(v) => setGender(v as PetGender)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="pet-gender-male" />
            <Label htmlFor="pet-gender-male" className="cursor-pointer">Mâle</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="pet-gender-female" />
            <Label htmlFor="pet-gender-female" className="cursor-pointer">Femelle</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Date de naissance de l'animal */}
      <div className="space-y-2">
        <Label htmlFor="pet-birth" className="text-base font-medium">
          Date de naissance
        </Label>
        <PetMonthYearPicker
          value={birthMonthYear}
          onChange={setBirthMonthYear}
        />
      </div>

      {/* Race de l'animal */}
      <div className="space-y-2">
        <Label htmlFor="pet-breed" className="text-base font-medium">
          Quelle est sa race ?
        </Label>
        <Input
          id="pet-breed"
          placeholder="Ex : Labrador, persan"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          className="text-base"
        />
      </div>

      {/* Détails physiques de l'animal */}
      {/* v2.0 — l'espèce pilote les suggestions : un chien ne se décrit pas comme un
          chat, et aucun des deux ne porte de boucles d'oreilles. */}
      <PetPhysicalDetailsInput
        value={petPhysicalDetails}
        onChange={setPetPhysicalDetails}
        onNoDetailsChange={setNoPhysicalDetails}
        noDetailsValue={noPhysicalDetails}
        petType={type}
      />

      {/* Traits de caractère */}
      <div className="space-y-3">
        <Label className="text-base font-medium block">
          Traits de caractère <span className="text-xs text-gray-500">({MAX_TRAITS} maximum)</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PET_TRAIT_OPTIONS.map((trait) => {
            const isTraitSelected = selectedTraits.includes(trait.value as PetTrait);
            const isDisabled = !isTraitSelected && hasReachedMaxTraits;
            
            return (
              <div key={trait.value} className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleTraitToggle(trait.value as PetTrait)}
                  disabled={isDisabled}
                  className={`flex items-center justify-start p-2 rounded-lg border gap-2 transition-all w-full min-w-0
                    ${isTraitSelected 
                      ? 'bg-mcf-secondary-light/50 border-mcf-primary shadow-sm' 
                      : isDisabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-mcf-primary/50'
                    }`}
                >
                  <span className="text-xl shrink-0">{trait.icon}</span>
                  <span className="text-sm min-w-0 break-words leading-tight text-left">{trait.label}</span>
                </button>
                
                {/* Champ pour préciser un trait personnalisé */}
                {isTraitSelected && (trait.value === 'other' || trait.value === 'other2') && (
                  <Input
                    placeholder="Précisez le trait de caractère"
                    value={(typeof customTraits[trait.value] === 'string' ? customTraits[trait.value] : '') as string}
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
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4">
          <Button 
            type="button" 
            onClick={onCancel}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className="bg-mcf-primary hover:bg-mcf-primary-dark text-white w-full sm:w-auto h-auto whitespace-normal sm:whitespace-nowrap leading-tight"
          >
            {isDisabled ? 'Enregistrement...' : (pet ? 'Enregistrer les modifications' : 'Ajouter cet animal')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PetForm;
