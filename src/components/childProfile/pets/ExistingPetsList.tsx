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
        // 1. Récupérer le family_id de l'utilisateur
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', supabaseSession.user.id)
          .single();

        if (profileError || !userProfile?.family_id) {
          console.log('No family found for user');
          setIsLoading(false);
          return;
        }

        // 2. Charger tous les animaux de la famille
        const { data: pets, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .eq('family_id', userProfile.family_id);

        if (petsError) {
          console.error('Error loading existing pets:', petsError);
          toast.error("Erreur lors du chargement des animaux existants");
          setIsLoading(false);
          return;
        }

        setExistingPets(pets || []);
        
        // 3. Charger les animaux déjà sélectionnés depuis le formulaire
        const existingPetsData = form.getValues().pets?.existingPetsData || [];
        setSelectedPetIds(existingPetsData.map(p => p.id));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in loadExistingPets:', error);
        setIsLoading(false);
      }
    };

    loadExistingPets();
  }, [supabaseSession?.user?.id]);

  const handlePetToggle = (pet: ExistingPet, checked: boolean) => {
    let newSelectedIds: string[];
    
    if (checked) {
      newSelectedIds = [...selectedPetIds, pet.id];
    } else {
      newSelectedIds = selectedPetIds.filter(id => id !== pet.id);
    }
    
    setSelectedPetIds(newSelectedIds);
    
    // Mettre à jour le formulaire avec les données complètes des animaux sélectionnés
    const selectedPetsData = existingPets.filter(p => newSelectedIds.includes(p.id));
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
    return null;
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
            />
            <Label
              htmlFor={`pet-${pet.id}`}
              className="flex-1 flex items-center gap-2 cursor-pointer"
            >
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
