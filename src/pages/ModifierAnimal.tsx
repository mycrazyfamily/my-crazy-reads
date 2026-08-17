// ModifierAnimal v3.3
// Changelog v3.3 : envoie previous_type + previous_breed au webhook edit-avatar-mcf (à côté du
//   previous_birth_date déjà présent). Objectif : permettre au back (3_Build_Edit_Prompt v4.1)
//   de détecter un changement d'espèce (lapin→chat) OU de race (chat siamois→chat bengal) et de
//   forcer le rebuild du corps de l'avatar — sans ça, changer le type/la race laissait l'ancienne
//   image inchangée. Les deux valeurs sont dérivées de petData (snapshot d'origine, jamais muté
//   dans handleSave) ; 'other' est résolu en otherType comme finalType à l'enregistrement.
//   Aucune autre logique modifiée.
// ModifierAnimal v3.2
// Changelog v3.2 : charge avatar_url + family_id avec le profil et les passe en props à
// EditAvatarHeader → l'avatar est présent dès l'affichage (fin du skeleton), plus de reflow.
// Changelog v3.1 : squelette de chargement (EditProfileSkeleton) au lieu du texte « Chargement... »
// — la carte s'affiche remplie d'un coup, plus d'effet « champs vides qui se peuplent ».
// Changelog v3.0 : EditAvatarHeader monté en tête (avatar + « Générer une autre proposition ») ;
//                  ancien ResetAvatarButton du pied de page retiré (désormais porté par le header).
// Changelog v2.9 : ajout gender (select pets, chargement, sauvegarde, validation obligatoire)
//                  + fix validation manquante birthMonthYear dans handleSubmitClick (existait déjà
//                  côté PetForm/AjouterAnimal mais pas ici, showButtons=false contourne PetForm.validatePetData)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Heart, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { splitCamelCase } from '@/utils/nameFormatter';
import { FORBIDDEN_NAME_ERROR, checkFreeTextFields, containsForbiddenWord, forbiddenFieldsError } from '@/utils/nameBlocklist';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PetForm from '@/components/childProfile/pets/PetForm';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { PetData, PetType, PetGender, PetTrait } from '@/types/childProfile';
import EditAvatarHeader from '@/components/familyDashboard/EditAvatarHeader';
import EditProfileSkeleton from '@/components/familyDashboard/EditProfileSkeleton';

// Statut « entité inactive » de l'animal (mutuellement exclusif)
type PetStatus = 'active' | 'deceased' | 'gone';

/**
 * Signature des champs qui influencent l'AVATAR (apparence physique).
 * Sert à n'appeler MCF_Avatar_Factory que si l'apparence a réellement changé —
 * pas pour un simple changement de statut (décès / donné-perdu) ou de liens enfants.
 * Le nom est volontairement EXCLU (non visuel, absent du payload avatar).
 */
function petAvatarSignature(p: PetData | null): string {
  const cd: any = p?.customTraits || {};
  const phys = Array.isArray(cd.physicalDetails)
    ? cd.physicalDetails.filter((d: string) => d && d.trim()).map((d: string) => d.trim())
    : [];
  const noPhys = cd.noPhysicalDetails === true || cd.noPhysicalDetails === 'true';
  const finalType = p?.type === 'other' && p?.otherType ? p.otherType : (p?.type || '');
  return JSON.stringify({
    type: finalType,
    breed: (p?.breed || '').trim(),
    birth: p?.birthMonthYear || '',
    traits: [...(p?.traits || [])].sort(),
    phys,
    noPhys,
  });
}

/**
 * Safely parse traits_custom from DB — handles double-encoded strings
 * and spread-of-string bugs that produce {"0":"a","1":"b",...}
 */
function sanitizeTraitsCustom(raw: any): Record<string, any> | undefined {
  if (!raw) return undefined;
  // If it's a string, try to parse it
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return sanitizeTraitsCustom(parsed); // recurse in case of double-encoding
      }
    } catch {
      return undefined;
    }
  }
  // If it's an object, check for spread-of-string pattern (numeric keys starting with "{")
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    const keys = Object.keys(raw);
    const hasNumericKeys = keys.some(k => /^\d+$/.test(k));
    const hasStringKeys = keys.some(k => !/^\d+$/.test(k));
    if (hasNumericKeys) {
      if (!hasStringKeys) {
        // All keys are numeric — this is a spread string, try to reconstruct
        try {
          const reconstructed = keys.sort((a, b) => Number(a) - Number(b)).map(k => raw[k]).join('');
          const parsed = JSON.parse(reconstructed);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
        } catch {
          return undefined;
        }
      } else {
        // Mixed: keep only non-numeric keys (the valid ones)
        const cleaned: Record<string, any> = {};
        for (const k of keys) {
          if (!/^\d+$/.test(k)) cleaned[k] = raw[k];
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
    }
    return raw;
  }
  return undefined;
}

const ModifierAnimal: React.FC = () => {
  const { childId, petId } = useParams<{ childId: string; petId: string }>();
  const navigate = useNavigate();
  const invalidateFamilyData = useInvalidateFamilyData();
  const [loading, setLoading] = useState(true);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [currentPetData, setCurrentPetData] = useState<PetData | null>(null);
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  const [originalBirthMonthYear, setOriginalBirthMonthYear] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [petStatus, setPetStatus] = useState<PetStatus>('active');
  const [pendingDeceased, setPendingDeceased] = useState(false);
  // Avatar + family_id chargés ici (avec le profil) → passés en props à EditAvatarHeader
  // pour éviter un 2ᵉ fetch et le reflow « l'avatar arrive après coup ».
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => {
    loadPetData();
  }, [childId, petId]);

  const loadPetData = async () => {
    if (!childId || !petId) return;

    try {
      setLoading(true);

      // Charger l'animal par pet_id (échelle FAMILLE, pas enfant).
      // v2.8: un animal appartient à la famille et peut être lié à d'AUTRES enfants
      // que celui du contexte courant (childId de l'URL). L'ancien filtre .eq('child_id', childId)
      // + .maybeSingle() renvoyait null pour Réglisse/Stormy (pas de jonction avec l'enfant courant)
      // → « Animal non trouvé ». On récupère toutes les jonctions child_pets de ce pet, puis on
      // privilégie la ligne de l'enfant courant si elle existe, sinon la première disponible.
      // handleSave synchronise childPetUpdates sur toutes les jonctions → données identiques.
      const { data: petRows, error } = await supabase
        .from('child_pets')
        .select(`
          *,
          pets (
            id,
            name,
            type,
            gender,
            emoji,
            family_id,
            avatar_url,
            breed,
            physical_details,
            clothing_style,
            is_deceased,
            is_active,
            inactive_reason
          )
        `)
        .eq('pet_id', petId);

      if (error) throw error;

      const data =
        (petRows || []).find(r => r.child_id === childId) ||
        (petRows || [])[0] ||
        null;

      if (data && data.pets) {
        const storedType = data.relation_label || data.pets.type;
        const predefinedTypes = ['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other'];
        const isCustomType = storedType && !predefinedTypes.includes(storedType);
        
        // Nettoyer les customTraits pour éviter d'avoir à la fois physicalDetails et noPhysicalDetails
        let cleanedCustomTraits = sanitizeTraitsCustom((data as any).traits_custom);
        if (cleanedCustomTraits) {
          const hasPhysicalDetails = Array.isArray(cleanedCustomTraits.physicalDetails) && 
                                      cleanedCustomTraits.physicalDetails.length > 0 &&
                                      cleanedCustomTraits.physicalDetails.some((d: string) => d.trim() !== '');
          
          if (hasPhysicalDetails && cleanedCustomTraits.noPhysicalDetails) {
            // Si les deux sont présents, garder uniquement physicalDetails (dernière info saisie)
            const { noPhysicalDetails, ...rest } = cleanedCustomTraits;
            cleanedCustomTraits = rest;
            
          }
        }
        
        const pet: PetData = {
          id: data.pets.id,
          name: data.name || data.pets.name,
          type: isCustomType ? 'other' : (storedType as PetType),
          gender: data.pets.gender as PetGender,
          otherType: isCustomType ? storedType : undefined,
          birthMonthYear: data.birth_month_year || undefined,
          breed: data.race || (data.pets as any).breed || undefined,
          traits: (data.traits ? data.traits.split(', ') : []) as PetTrait[],
          customTraits: cleanedCustomTraits
        };
        setPetData(pet);
        setAvatarUrl((data.pets as any).avatar_url ?? null);
        setFamilyId(data.pets.family_id ?? null);
        setOriginalBirthMonthYear(data.birth_month_year || null);

        // Initialiser le statut « entité inactive » depuis la table pets
        const petRow: any = data.pets;
        setPetStatus(
          petRow.is_deceased ? 'deceased' : (petRow.is_active === false ? 'gone' : 'active')
        );

        // Charger tous les enfants de la famille
        const { data: childrenData, error: childrenError } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('family_id', data.pets.family_id)
          .order('first_name');

        if (childrenError) throw childrenError;
        setExistingChildren(childrenData || []);

        // Charger les enfants liés à cet animal
        const { data: linkedChildren, error: linkedError } = await supabase
          .from('child_pets')
          .select('child_id')
          .eq('pet_id', petId);

        if (linkedError) throw linkedError;
        setSelectedChildrenIds(linkedChildren?.map(c => c.child_id) || []);
      } else {
        toast.error("Animal non trouvé");
        navigate('/espace-famille');
      }
    } catch (error) {
      console.error('Error loading pet data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChild = (childIdToToggle: string) => {
    setSelectedChildrenIds(prev => 
      prev.includes(childIdToToggle)
        ? prev.filter(id => id !== childIdToToggle)
        : [...prev, childIdToToggle]
    );
  };

  const handleSave = async (updatedPet: PetData) => {
    if (!petId) return;

    // L'avatar n'est régénéré QUE si un champ visuel a changé (pas pour le statut ni les liens enfants).
    const avatarRelevantChanged = petAvatarSignature(petData) !== petAvatarSignature(updatedPet);

    try {
      // Mettre à jour le pet dans la table pets
      const finalType = updatedPet.type === 'other' && updatedPet.otherType 
        ? updatedPet.otherType 
        : updatedPet.type;

      // Statut « entité inactive » — états mutuellement exclusifs.
      // Les triggers DB horodatent deceased_recorded_at / inactive_at automatiquement.
      const statusFields =
        petStatus === 'deceased'
          ? { is_deceased: true, is_active: true, inactive_reason: null }
          : petStatus === 'gone'
          ? { is_deceased: false, is_active: false, inactive_reason: 'given_away' }
          : { is_deceased: false, is_active: true, inactive_reason: null };

      const { error: updatePetError } = await supabase
        .from('pets')
        .update({
          name: splitCamelCase(updatedPet.name),
          type: finalType,
          gender: updatedPet.gender || null,
          breed: updatedPet.breed || null,
          ...statusFields,
        })
        .eq('id', petId);

      if (updatePetError) throw updatePetError;

      // Charger les relations existantes pour cet animal
      const { data: existingRelations, error: fetchError } = await supabase
        .from('child_pets')
        .select('id, child_id')
        .eq('pet_id', petId);

      if (fetchError) throw fetchError;

      const existingChildIds = existingRelations?.map(r => r.child_id) || [];
      const childPetUpdates = {
        name: splitCamelCase(updatedPet.name),
        birth_month_year: updatedPet.birthMonthYear || null,
        traits: updatedPet.traits?.join(', ') || null,
        traits_custom: updatedPet.customTraits && typeof updatedPet.customTraits === 'object' ? updatedPet.customTraits : null,
        relation_label: finalType,
        race: updatedPet.breed || null
      };

      // Identifier les enfants à supprimer (qui ne sont plus sélectionnés)
      const childIdsToRemove = existingChildIds.filter(id => !selectedChildrenIds.includes(id));
      
      // Identifier les enfants à mettre à jour (qui existaient déjà)
      const childIdsToUpdate = selectedChildrenIds.filter(id => existingChildIds.includes(id));
      
      // Identifier les enfants à créer (nouveaux)
      const childIdsToCreate = selectedChildrenIds.filter(id => !existingChildIds.includes(id));

      // Supprimer les relations qui ne sont plus nécessaires
      if (childIdsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('child_pets')
          .delete()
          .eq('pet_id', petId)
          .in('child_id', childIdsToRemove);

        if (deleteError) throw deleteError;
      }

      // Mettre à jour les relations existantes
      if (childIdsToUpdate.length > 0) {
        for (const childId of childIdsToUpdate) {
          const { error: updateError } = await supabase
            .from('child_pets')
            .update(childPetUpdates)
            .eq('pet_id', petId)
            .eq('child_id', childId);

          if (updateError) throw updateError;
        }
      }

      // Créer les nouvelles relations
      if (childIdsToCreate.length > 0) {
        const childPetsData = childIdsToCreate.map(childId => ({
          child_id: childId,
          pet_id: petId,
          ...childPetUpdates
        }));

        const { error: insertError } = await supabase
          .from('child_pets')
          .insert(childPetsData);

        if (insertError) throw insertError;
      }
      
      // L'avatar n'est régénéré QUE si l'apparence a changé.
      // Un changement de statut (décès / donné-perdu) ou de liens enfants ne doit PAS
      // déclencher MCF_Avatar_Factory (coût de génération + risque d'altération non voulue).
      if (avatarRelevantChanged) {
        // Récupérer l'avatar_url actuel avant de déclencher la regénération
        const { data: petRow } = await supabase
          .from('pets')
          .select('avatar_url')
          .eq('id', petId)
          .maybeSingle();

        // Appel webhook pour regénérer l'avatar
        try {
          await fetch('https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/edit-avatar-mcf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: petId,
              type: 'pet',
              current_avatar_url: petRow?.avatar_url || null,
              previous_birth_date: originalBirthMonthYear,
              // v1.1 : espèce (type) et race d'AVANT l'édition, pour que le back détecte un
              // changement (lapin→chat ou siamois→bengal) et force un rebuild du corps.
              // petData est le snapshot d'origine (chargé une fois, jamais muté dans handleSave) ;
              // on résout 'other' → otherType comme le fait finalType à l'enregistrement.
              previous_type: petData?.type === 'other' && petData?.otherType
                ? petData.otherType
                : (petData?.type || null),
              previous_breed: petData?.breed || null
            })
          });
        } catch (webhookErr) {
          console.error('Webhook avatar error:', webhookErr);
        }

        if (petId) signalAvatarRegeneration(petId);
      }
      invalidateFamilyData();
      toast.success('Animal modifié avec succès !');
      setTimeout(() => {
        navigate('/espace-famille');
      }, 500);
    } catch (error) {
      console.error('Error saving pet:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleCancel = () => {
    navigate('/espace-famille');
  };

  const handleSubmitClick = () => {
    if (!currentPetData) {
      toast.error("Aucune donnée à enregistrer");
      return;
    }

    // Validation avant sauvegarde
    const errors: string[] = [];

    if (!currentPetData.name?.trim()) {
      errors.push("le nom de l'animal");
    }

    // Blocklist : nom de l'animal
    if (containsForbiddenWord(currentPetData.name)) {
      toast.error(FORBIDDEN_NAME_ERROR);
      return;
    }

    // v2.0 — blocklist étendue aux champs libres. Le nom était contrôlé, pas la
    // description : c'est pourtant elle qui a fait refuser un avatar par Gemini.
    const champsLibres = checkFreeTextFields({
      'les détails physiques': ((currentPetData.customTraits as any)?.physicalDetails ?? []) as string[],
      'la race': currentPetData.breed,
      "le type d'animal": currentPetData.otherType,
      'les traits de caractère': Object.values(currentPetData.customTraits || {})
        .filter((v) => typeof v === 'string') as string[],
    });
    if (!champsLibres.ok) {
      toast.error(forbiddenFieldsError(champsLibres));
      return;
    }

    if (!currentPetData.type) {
      errors.push("le type d'animal");
    }

    if (currentPetData.type === 'other' && !currentPetData.otherType?.trim()) {
      errors.push("le type d'animal personnalisé");
    }

    if (!currentPetData.gender) {
      errors.push("le sexe de l'animal");
    }

    if (!currentPetData.birthMonthYear) {
      errors.push("la date de naissance de l'animal");
    }

    if (!currentPetData.breed?.trim()) {
      errors.push("la race de l'animal");
    }

    if (!currentPetData.traits || currentPetData.traits.length === 0) {
      errors.push("au moins un trait de caractère");
    }

    // Vérifier que les traits personnalisés sont remplis
    const hasEmptyCustomTrait = currentPetData.traits?.some(trait => {
      if (trait === 'other' || trait === 'other2') {
        const value = currentPetData.customTraits?.[trait];
        return !value || (typeof value === 'string' && !value.trim());
      }
      return false;
    });

    if (hasEmptyCustomTrait) {
      errors.push("tous les traits personnalisés");
    }

    // Vérifier les détails physiques : au moins un détail OU la case "aucun détail" cochée
    const petPhysicalDetails = currentPetData.customTraits?.physicalDetails;
    const hasPhysicalDetails = Array.isArray(petPhysicalDetails) && petPhysicalDetails.length > 0 && petPhysicalDetails.some((d: string) => d.trim() !== '');
    // Vérifier si noPhysicalDetails est présent et true (peut être boolean ou string selon la source)
    const customTraitsAny = currentPetData.customTraits as any;
    const noPhysicalDetails = customTraitsAny?.noPhysicalDetails === true || customTraitsAny?.noPhysicalDetails === 'true';
    if (!hasPhysicalDetails && !noPhysicalDetails) {
      errors.push("un détail physique marquant (ou cochez 'Aucun détail physique particulier')");
    }

    // Vérifier qu'au moins un enfant est associé
    if (selectedChildrenIds.length === 0) {
      errors.push("au moins un enfant associé à cet animal");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return;
    }

    handleSave(currentPetData);
  };

  const handlePetDataChange = (updatedPet: PetData) => {
    setCurrentPetData(updatedPet);
  };

  const handleStatusChange = (value: PetStatus) => {
    // Confirmation explicite pour le décès (action sensible)
    if (value === 'deceased' && petStatus !== 'deceased') {
      setPendingDeceased(true);
      return;
    }
    setPetStatus(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-20 max-w-3xl">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center gap-2 text-muted-foreground hover:text-mcf-primary hover:bg-mcf-mint/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'espace famille
          </Button>

          <h1 className="text-3xl font-bold text-mcf-orange-dark mb-6">
            Modifier l'animal
          </h1>

          <EditProfileSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!petData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-mcf-primary hover:bg-mcf-mint/10 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'espace famille
        </Button>

        <h1 className="text-3xl font-bold text-mcf-orange-dark mb-6">
          Modifier l'animal
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint space-y-6">
          <EditAvatarHeader profileId={petId!} profileType="pet" profileName={petData?.name} initialAvatarUrl={avatarUrl} familyId={familyId} />

          <PetForm 
            pet={petData}
            onSave={handleSave}
            onCancel={handleCancel}
            showButtons={false}
            onDataChange={handlePetDataChange}
          />

          {existingChildren.length > 0 && (
            <ChildrenSelector
              children={existingChildren}
              selectedChildrenIds={selectedChildrenIds}
              onToggleChild={handleToggleChild}
              label="Enfants associés à cet animal"
            />
          )}

          {/* Statut de l'animal */}
          <div className="space-y-3 pt-4 border-t border-mcf-mint/40">
            <Label className="text-base font-medium">Statut</Label>
            <RadioGroup
              value={petStatus}
              onValueChange={(v) => handleStatusChange(v as PetStatus)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="pet-status-active" />
                <Label htmlFor="pet-status-active" className="cursor-pointer font-normal">Avec nous</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deceased" id="pet-status-deceased" />
                <Label htmlFor="pet-status-deceased" className="cursor-pointer font-normal">Décédé</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gone" id="pet-status-gone" />
                <Label htmlFor="pet-status-gone" className="cursor-pointer font-normal">Donné ou perdu</Label>
              </div>
            </RadioGroup>
            {petStatus !== 'active' && (
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                {petStatus === 'deceased'
                  ? <Heart className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  : <LogOut className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />}
                <span>
                  {petData?.name} n'apparaîtra plus dans les histoires ni les suggestions d'anniversaire. Vous pourrez revenir en arrière à tout moment.
                </span>
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex justify-between">
              <Button 
                type="button" 
                onClick={handleCancel}
                variant="outline"
              >
                Annuler
              </Button>
              
              <Button 
                type="button"
                onClick={handleSubmitClick}
                className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
              >
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </div>

        {/* Confirmation décès (action sensible) */}
        <Dialog open={pendingDeceased} onOpenChange={(o) => { if (!o) setPendingDeceased(false); }}>
          <DialogContent className="bg-white max-w-sm">
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-mcf-mint/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-mcf-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-mcf-orange-dark">
                  Marquer « {petData?.name} » comme décédé ?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Il restera en mémoire dans vos données, mais n'apparaîtra plus dans les histoires ni les suggestions. Vous pourrez revenir en arrière à tout moment.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setPendingDeceased(false)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-mcf-primary hover:bg-mcf-primary-dark text-white"
                  onClick={() => { setPetStatus('deceased'); setPendingDeceased(false); }}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierAnimal;
