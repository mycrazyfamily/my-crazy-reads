import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Baby, BookOpen, Brain, Cat, Users, Rabbit, Sparkles, Globe, Pencil, Gift, Loader2, MapPin } from 'lucide-react';
import type { ChildProfileFormData } from '@/types/childProfile';
import BasicInfoSummary from '@/components/childProfile/summary/BasicInfoSummary';
import PersonalitySummary from '@/components/childProfile/summary/PersonalitySummary';
import FamilySummary from '@/components/childProfile/summary/FamilySummary';
import PetsSummary from '@/components/childProfile/summary/PetsSummary';
import ToysSummary from '@/components/childProfile/summary/ToysSummary';
import WorldsSummary from '@/components/childProfile/summary/WorldsSummary';
import PlacesSummary from '@/components/childProfile/summary/PlacesSummary';
import { supabase } from '@/integrations/supabase/client';

type FinalSummaryProps = {
  handlePreviousStep: () => void;
  handleGoToStep: (step: number) => void;
  handleSubmit: () => void;
  isGiftMode?: boolean;
  nextButtonText?: string;
  isSubmitting?: boolean;
  editMode?: boolean;
  editChildId?: string;
};

const FinalSummary: React.FC<FinalSummaryProps> = ({
  handlePreviousStep,
  handleGoToStep,
  handleSubmit,
  isGiftMode = false,
  nextButtonText,
  isSubmitting = false,
  editMode = false,
  editChildId
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const formData = form.getValues();
  const [completeData, setCompleteData] = useState<ChildProfileFormData>(formData);
  const [isLoadingData, setIsLoadingData] = useState(editMode);

  // En mode édition, charger toutes les données existantes
  useEffect(() => {
    const loadCompleteData = async () => {
      if (!editMode || !editChildId) {
        setCompleteData(formData);
        setIsLoadingData(false);
        return;
      }

      try {
        // Charger les données de famille (relatives)
        const { data: familyMembersLinks } = await supabase
          .from('child_family_members')
          .select('family_member_id, family_members(*)')
          .eq('child_id', editChildId);

        const relatives = familyMembersLinks?.map((link: any) => {
          const nicknameValue = link.family_members.details?.nickname;
          return {
            id: link.family_member_id,
            type: link.family_members.role,
            firstName: link.family_members.name,
            nickname: {
              type: (nicknameValue ? 'custom' : 'none') as 'custom' | 'none',
              custom: nicknameValue || ''
            },
          skinColor: link.family_members.details?.skinColor || '',
          hairColor: link.family_members.details?.hairColor || '',
          hairType: link.family_members.details?.hairType || '',
          hairTypeCustom: link.family_members.details?.hairTypeCustom || '',
          glasses: link.family_members.details?.glasses || false,
          traits: link.family_members.details?.traits || [],
          customTraits: link.family_members.details?.customTraits || {},
          age: link.family_members.details?.age || '',
          birthDate: link.family_members.details?.birthDate ? new Date(link.family_members.details.birthDate) : undefined,
          job: link.family_members.details?.job || '',
          gender: link.family_members.details?.gender || '',
          otherTypeName: link.family_members.details?.otherTypeName || '',
          physicalDetails: link.family_members.details?.physicalDetails || []
        };
        }) || [];

        // Charger les animaux (pets)
        const { data: childPetsLinks } = await supabase
          .from('child_pets')
          .select('pet_id, pets(*)')
          .eq('child_id', editChildId);

        const pets = childPetsLinks?.map((link: any) => ({
          id: link.pet_id,
          name: link.pets.name,
          type: link.pets.type,
          breed: link.pets.breed,
          physicalDetails: link.pets.physical_details || [],
          traits: [] // Champ requis par le type PetData
        })) || [];

        // Charger les lieux (places)
        const { data: childPlacesLinks } = await supabase
          .from('child_places')
          .select('place_id, label, places(*)')
          .eq('child_id', editChildId);

        const places = childPlacesLinks?.map((link: any) => ({
          id: link.place_id,
          label: link.label || link.places.label,
          type: link.places.type,
          emoji: link.places.emoji,
          address: link.places.address,
          city: link.places.city,
          country: link.places.country,
          description: link.places.description,
          details: link.places.details
        })) || [];

        // Fusionner les données chargées avec les données du formulaire
        setCompleteData({
          ...formData,
          family: {
            ...formData.family,
            relatives: relatives.length > 0 ? relatives : formData.family?.relatives || []
          },
          pets: {
            hasPets: pets.length > 0 || formData.pets?.hasPets || false,
            pets: pets.length > 0 ? pets : formData.pets?.pets || []
          },
          places: places.length > 0 ? {
            places: places,
            existingPlacesData: [],
            placeChildLinks: {}
          } : formData.places || {
            places: [],
            existingPlacesData: [],
            placeChildLinks: {}
          }
        });
      } catch (error) {
        console.error('Error loading complete child data:', error);
        setCompleteData(formData);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCompleteData();
  }, [editMode, editChildId, formData]);
  
  const handleStartAdventure = () => {
    console.log("Starting adventure button clicked");
    handleSubmit();
  };

  if (isLoadingData) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mcf-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-mcf-primary-dark mb-2">
          {isGiftMode 
            ? "Parfait ! Le profil est prêt ✨"
            : "C'est prêt ! Voici le profil de votre enfant ✨"
          }
        </h2>
        <p className="text-gray-600">
          {isGiftMode
            ? "Vérifiez les informations avant de choisir le thème de l'histoire"
            : "Vous pouvez encore modifier un détail si besoin, sinon… place à l'imaginaire ! 🧠📚"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <SummaryBlock 
          title="L'enfant"
          icon={<Baby className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(0)}
          className="lg:col-span-1"
        >
          <BasicInfoSummary data={completeData} />
        </SummaryBlock>

        <SummaryBlock 
          title="Personnalité & passions" 
          icon={<Brain className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(1)}
          className="lg:col-span-1"
        >
          <PersonalitySummary data={completeData} />
        </SummaryBlock>

        <SummaryBlock 
          title="Famille & entourage" 
          icon={<Users className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(2)}
          className="lg:col-span-1"
        >
          <FamilySummary data={completeData} />
        </SummaryBlock>

        {completeData.pets && completeData.pets.hasPets && (
          <SummaryBlock 
            title="Animaux de compagnie" 
            icon={<Cat className="h-5 w-5 text-mcf-primary" />}
            onEdit={() => handleGoToStep(3)}
            className="lg:col-span-1"
          >
            <PetsSummary data={completeData} />
          </SummaryBlock>
        )}

        {completeData.toys && completeData.toys.hasToys && (
          <SummaryBlock 
            title="Doudous & objets magiques" 
            icon={<Sparkles className="h-5 w-5 text-mcf-primary" />}
            onEdit={() => handleGoToStep(4)}
            className="lg:col-span-1"
          >
            <ToysSummary data={completeData} />
          </SummaryBlock>
        )}

        {completeData.places && completeData.places.places && completeData.places.places.length > 0 && (
          <SummaryBlock 
            title="Lieux de vie" 
            icon={<MapPin className="h-5 w-5 text-mcf-primary" />}
            onEdit={() => handleGoToStep(6)}
            className="lg:col-span-1"
          >
            <PlacesSummary data={completeData} />
          </SummaryBlock>
        )}

        <SummaryBlock 
          title="Univers préféré & culture" 
          icon={<Globe className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(7)}
          className={`${(!completeData.pets?.hasPets && !completeData.toys?.hasToys && (!completeData.places?.places || completeData.places.places.length === 0)) ? 'lg:col-span-1' : 'lg:col-span-2'}`}
        >
          <WorldsSummary data={completeData} />
        </SummaryBlock>
      </div>

      <div className="flex flex-col gap-4 mt-10 items-center">
        <Button 
          type="submit"
          onClick={handleStartAdventure}
          disabled={isSubmitting}
          className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:w-auto md:min-w-64 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enregistrement en cours...
            </>
          ) : (
            <>
              {isGiftMode ? <Gift className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              {nextButtonText || (isGiftMode 
                ? "Continuer vers le choix du thème →" 
                : "Tout est prêt, on démarre l'aventure !"
              )}
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          type="button"
          onClick={handlePreviousStep}
          disabled={isSubmitting}
          className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Revenir à l'étape précédente
        </Button>
      </div>
    </div>
  );
};

type SummaryBlockProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit: () => void;
  className?: string;
};

const SummaryBlock: React.FC<SummaryBlockProps> = ({ 
  title, 
  icon, 
  children, 
  onEdit,
  className 
}) => {
  return (
    <Card className={`overflow-hidden border border-mcf-amber/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in h-fit ${className || ''}`}>
      <div className="bg-gradient-to-r from-mcf-amber/10 to-mcf-amber/5 px-3 py-2.5 flex items-center justify-between border-b border-mcf-amber/20">
        <div className="flex items-center gap-2 font-semibold text-mcf-primary-dark">
          {icon}
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-mcf-primary hover:bg-mcf-amber/10 h-7 px-2 rounded-md transition-colors"
        >
          <Pencil className="h-3 w-3" /> 
          Modifier
        </Button>
      </div>
      <div className="p-3">
        {children}
      </div>
    </Card>
  );
};

export default FinalSummary;
