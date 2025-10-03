import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { ChildProfileFormData } from '@/types/childProfile';

type ExistingPet = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  family_id: string;
};

type ExistingPetsListProps = {
  disabled?: boolean;
};

const ExistingPetsList: React.FC<ExistingPetsListProps> = ({ disabled = false }) => {
  const form = useFormContext<ChildProfileFormData>();
  const { supabaseSession } = useAuth();
  const [existingPets, setExistingPets] = useState<ExistingPet[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExistingPets = async () => {
      if (!supabaseSession?.user?.id) return;

      try {
        // 1) Récupérer le family_id depuis user_profiles
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', supabaseSession.user.id)
          .maybeSingle();

        let familyId = userProfile?.family_id as string | undefined;

        // 2) Fallback: si family_id manquant, chercher la famille créée par l'utilisateur
        if (!familyId) {
          const { data: families, error: familiesError } = await supabase
            .from('families')
            .select('id')
            .eq('created_by', supabaseSession.user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (familiesError) {
            console.error('Error loading families:', familiesError);
          }

          familyId = families?.[0]?.id;

          // Optionnel: mémoriser sur le profil pour la suite
          if (familyId) {
            await supabase
              .from('user_profiles')
              .update({ family_id: familyId })
              .eq('id', supabaseSession.user.id);
          }
        }

        if (!familyId) {
          console.info('No family found for user');
          setExistingPets([]);
          setIsLoading(false);
          return;
        }

        // 3) Charger tous les animaux de cette famille
        const { data: pets, error: petsError } = await supabase
          .from('pets')
          .select('id,name,type,emoji,family_id')
          .eq('family_id', familyId);

        if (petsError) {
          console.error('Error loading existing pets:', petsError);
          toast.error("Erreur lors du chargement des animaux existants");
          setIsLoading(false);
          return;
        }

        setExistingPets(pets || []);

        // 4) Pré-sélection depuis le formulaire (si l'utilisateur a déjà coché des animaux)
        const existingPetsData = form.getValues().pets?.existingPetsData || [];
        setSelectedPetIds(existingPetsData.map((p: ExistingPet) => p.id));
      } catch (error) {
        console.error('Error in loadExistingPets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseSession?.user?.id]);

  const handlePetToggle = (pet: ExistingPet, checked: boolean) => {
    let newSelectedIds: string[];

    if (checked) {
      newSelectedIds = [...selectedPetIds, pet.id];
    } else {
      newSelectedIds = selectedPetIds.filter((id) => id !== pet.id);
    }

    setSelectedPetIds(newSelectedIds);

    // Mettre à jour le formulaire avec les données complètes des animaux sélectionnés
    const selectedPetsData = existingPets.filter((p) => newSelectedIds.includes(p.id));
    form.setValue('pets.existingPetsData', selectedPetsData, { shouldDirty: true });
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Chargement des animaux existants...
      </div>
    );
  }

  if (existingPets.length === 0) {
    return null; // Pas d'animaux à afficher
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🐾</span>
        <h3 className="text-lg font-semibold text-mcf-primary">
          Associer un animal déjà existant à cet enfant
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Sélectionnez les animaux de la famille qui appartiennent aussi à cet enfant :
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {existingPets.map((pet) => (
          <Card
            key={pet.id}
            className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
              selectedPetIds.includes(pet.id)
                ? 'border-mcf-primary bg-mcf-mint/10'
                : 'border-border hover:border-mcf-primary/50'
            }`}
            onClick={() => !disabled && handlePetToggle(pet, !selectedPetIds.includes(pet.id))}
          >
            <Checkbox
              id={`pet-${pet.id}`}
              checked={selectedPetIds.includes(pet.id)}
              onCheckedChange={(checked) => handlePetToggle(pet, checked as boolean)}
              disabled={disabled}
              className="border-2 border-mcf-primary bg-white data-[state=checked]:bg-mcf-primary data-[state=checked]:border-mcf-primary data-[state=checked]:text-white"
            />
            <Label htmlFor={`pet-${pet.id}`} className="flex-1 flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">{pet.emoji || '🐾'}</span>
              <div>
                <div className="font-medium">{pet.name}</div>
                {pet.type && (
                  <div className="text-xs text-muted-foreground capitalize">
                    {pet.type}
                  </div>
                )}
              </div>
            </Label>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExistingPetsList;
