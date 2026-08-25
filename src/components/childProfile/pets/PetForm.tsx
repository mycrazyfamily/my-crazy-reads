// PetForm  (chantier C3)
// Changelog C3 :
//   [1] LE PRENOM PASSE APRES LE TYPE. Les cartes d'especes portent des emojis et captent le
//       regard : les testeurs cliquaient dessus en premier et repartaient sans avoir nomme
//       l'animal. Le champ prenom vient donc apres le choix de l'espece, la ou l'attention
//       revient. Aucun changement de donnee ni de validation, seul l'ordre d'affichage bouge.
//   [2] AIDE SUR LA RACE. Un parent qui ne connait pas la race laissait le champ vide, et la
//       description de l'animal partait sans indication d'espece precise. Une ligne indique
//       desormais de reecrire l'espece a defaut de race.
// PetForm  (chantier C1b)
// Changelog C1b : retrait de la validation « au moins un detail physique OU case cochee ».
//   La case a disparu de PetPhysicalDetailsInput v3.0 : elle ne servait qu'a debloquer ce
//   test. Les details physiques de l'animal deviennent facultatifs, champ vide = aucun detail.
//   Meme correction que BasicInfoForm v1.3 cote humain.
// PetForm v1.8
// Changelog v1.8 :
//   LOT F4 — SOURCE UNIQUE DES DETAILS PHYSIQUES DES ANIMAUX.
//   Les details physiques d'un animal vivaient a DEUX endroits : pets.physical_details (sur
//   l'animal) et child_pets.traits_custom -> physicalDetails (sur la RELATION enfant-animal).
//   Trois chemins d'ecriture divergents : le wizard ecrivait dans les DEUX, AjouterAnimal et
//   ModifierAnimal dans child_pets SEULEMENT. Un animal cree par le wizard voyait donc sa valeur
//   sur pets figee a jamais, pendant que child_pets evoluait. C'est ce qui a produit le
//   « Poil blanc » invisible dans le formulaire mais actif dans tous les prompts d'edition.
//   Second defaut : stockees sur la relation, ces donnees etaient DUPLIQUEES autant de fois que
//   l'animal avait d'enfants lies, sans rien pour garantir qu'elles restent egales.
//   CIBLE : pets.physical_details devient la source unique, comme family_members.physical_details
//   l'est deja pour les proches et child_profiles.physical_details pour les enfants.
//   child_pets.traits_custom ne garde que les traits de CARACTERE, son role legitime.
//   CONVENTION : le flag noPhysicalDetails n'est plus persiste. Un tableau VIDE veut dire
//   « aucun detail ». La case du formulaire reste, elle est simplement deduite a l'affichage.
//   Les anciennes cles physicalDetails / noPhysicalDetails restent en base, inertes : elles ne
//   sont plus ni lues ni ecrites. Nettoyage decide separement.
//   CORRIGE AUSSI UN BUG DE CONTRADICTION INTERNE. L'initialisation du state ne retirait que
//   physicalDetails de customTraits (const { physicalDetails, ...rest }), alors que la
//   restauration ulterieure retirait bien les DEUX cles. Le flag noPhysicalDetails survivait
//   donc dans le state initial et repartait en base a cote du detail fraichement saisi : un
//   meme objet contenait physicalDetails ET noPhysicalDetails: true. Mesure du 20/08 :
//   2 animaux (L'idiot, Perro) dans cet etat. Le probleme disparait par construction ici,
//   puisque les details ne transitent plus par customTraits.
// Changelog v1.7 : nouveau champ « Porte-t-il un accessoire ou un vêtement ? » (lot E1).
//   Texte libre facultatif, placé entre les détails physiques et les traits de caractère.
//   Motif : la colonne pets.clothing_style existe et le back sait l'exploiter (il adapte
//   même la pose de l'animal quand il est habillé), mais AUCUN écran ne permettait de la
//   remplir. Les parents mettaient donc « tshirt blanc » dans les détails physiques, ce qui
//   produisait un prompt contradictoire : « NO CLOTHING: This animal wears NO clothes »
//   d'un côté, un t-shirt réclamé de l'autre.
//   Le champ alimente PetData.clothingStyle, qui existait déjà dans les types.
//   Ajouté aussi à la blocklist des champs libres et aux dépendances du useEffect
//   onDataChange, sans quoi une saisie ne remonterait pas au parent.
//   Facultatif par choix : un champ vide veut dire un animal sans accessoire, cas normal.
// PetForm v1.6
// Changelog v1.6 : blocklist sur le nom et les champs libres (race, type d'animal,
//   détails physiques, traits) au moment de valider la fiche. Posée ICI plutôt que
//   dans les écrans appelants : ce formulaire sert au wizard de création, à
//   AjouterAnimal et à ModifierAnimal.
// PetForm v1.5
// Changelog v1.5 : l'ESPÈCE est transmise à PetPhysicalDetailsInput (prop petType),
//   pour que les suggestions et le sous-titre correspondent à l'animal décrit.
//   Auparavant un chien se voyait proposer « fossettes » et « boucles d'oreilles ».
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
  // v1.8 : les details viennent desormais de PetData.physicalDetails (alimente par
  // pets.physical_details), plus de customTraits.
  const [petPhysicalDetails, setPetPhysicalDetails] = useState<string[]>(() => {
    const details = pet?.physicalDetails;
    if (Array.isArray(details)) return details.filter((d) => d && d.trim() !== '');
    return [];
  });
  // v1.8 : le flag n'est plus persiste, il est DEDUIT. Une fiche existante sans aucun detail
  // ne peut avoir ete enregistree que via la case « aucun detail », la validation l'exige.
  // Une NOUVELLE fiche (pet undefined) demarre au contraire case decochee.
  const [noPhysicalDetails, setNoPhysicalDetails] = useState<boolean>(() => {
    if (!pet) return false;
    const details = pet?.physicalDetails;
    return !Array.isArray(details) || details.filter((d) => d && d.trim() !== '').length === 0;
  });
  // v1.7 : accessoire ou vêtement de l'animal, texte libre facultatif
  const [clothingStyle, setClothingStyle] = useState(pet?.clothingStyle || '');
  const [selectedTraits, setSelectedTraits] = useState<PetTrait[]>(pet?.traits || []);
  const [customTraits, setCustomTraits] = useState<Record<string, string | string[] | boolean>>(() => {
    if (!pet?.customTraits) return {};
    // v1.8 : on retire les DEUX cles heritees. L'ancienne version ne retirait que
    // physicalDetails, laissant noPhysicalDetails repartir en base a cote d'un detail saisi.
    const { physicalDetails, noPhysicalDetails, ...rest } = pet.customTraits as any;
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
      setClothingStyle(pet.clothingStyle || ''); // v1.7
      setSelectedTraits(pet.traits || []);
      
      // v1.8 : restauration depuis PetData.physicalDetails, et flag deduit du vide.
      const details = Array.isArray(pet.physicalDetails)
        ? pet.physicalDetails.filter((d) => d && d.trim() !== '')
        : [];
      setPetPhysicalDetails(details);
      setNoPhysicalDetails(details.length === 0);
      
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
    // v1.8 : customTraits ne porte plus QUE les traits de caractere personnalises.
    // Les details physiques sortent dans PetData.physicalDetails, vers pets.physical_details.
    const mergedCustomTraits = { ...customTraits };

    // Tableau vide = aucun detail. La case du formulaire n'est plus persistee.
    const physicalDetailsFinal = noPhysicalDetails
      ? []
      : petPhysicalDetails.filter((d) => d && d.trim() !== '');

    const petData = {
      id: pet?.id || Date.now().toString(),
      name: name.trim(),
      type,
      gender: gender as PetGender,
      otherType: type === 'other' ? otherType.trim() : undefined,
      birthMonthYear: birthMonthYear || undefined,
      breed: breed.trim() || undefined,
      clothingStyle: clothingStyle.trim() || undefined, // v1.7
      physicalDetails: physicalDetailsFinal, // v1.8 — toujours un tableau, jamais undefined
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

    // v(C1b) : détails physiques facultatifs, voir PetPhysicalDetailsInput v3.0.

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
      'les détails physiques': (newPet.physicalDetails ?? []) as string[], // v1.8
      "l'accessoire ou le vêtement": newPet.clothingStyle,
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
  }, [name, type, gender, otherType, birthMonthYear, breed, clothingStyle, petPhysicalDetails, noPhysicalDetails, selectedTraits, customTraits]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-center mb-4 text-mcf-primary">
        {pet ? 'Modifier' : 'Ajouter'} un animal de compagnie
      </h3>

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
        <p className="text-sm text-muted-foreground leading-snug">
          Si vous ne la connaissez pas ou s'il n'en a pas, réécrivez simplement l'espèce.
        </p>
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

      {/* v1.7 — Accessoire ou vêtement de l'animal (facultatif) */}
      <div className="space-y-3">
        <Label htmlFor="petClothingStyle" className="text-base font-medium block">
          Porte-t-il un accessoire ou un vêtement ?{' '}
          <span className="text-xs text-gray-500">(facultatif)</span>
        </Label>
        <Input
          id="petClothingStyle"
          value={clothingStyle}
          onChange={(e) => setClothingStyle(e.target.value)}
          placeholder="collier rouge"
          className="text-base"
        />
      </div>

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
