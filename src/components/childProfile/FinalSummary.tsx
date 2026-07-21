// FinalSummary v1.5
// Changelog v1.5 : retrait du ResetAvatarButton caché en pied de résumé — la régénération d'avatar
// enfant passe désormais par EditAvatarHeader monté en tête de CreateChildProfile (mode édition).
// Changelog v1.4 : 3ᵉ endroit trouvé où les lieux "destination_libre" (Koh Tao, créés à la volée
// pour une seule histoire via le wizard) fuitaient — le résumé en mode ÉDITION d'un enfant les
// chargeait sans filtre. Même règle que useFamilyData.ts et PlacesForm.tsx : exclus.
// Changelog v1.3 : fix clignotement visuel (ex: 2 animaux qui semblent s'inverser plusieurs fois
// avant de se stabiliser) — cause réelle : .in('id', [...]) ne garantit aucun ordre de retour
// côté Postgres pour les 3 fetches d'enrichissement (proches/animaux/lieux existants). Résultats
// désormais re-triés selon l'ordre des IDs d'origine, déterministe à chaque appel.
// Changelog v1.2 : bug 5B — en mode création, le résumé n'affichait que les proches/animaux/
// lieux nouvellement créés dans la session, jamais les sélections parmi l'existant
// (existingRelativesData/existingPetsData/existingPlacesData n'ont qu'un ID). Nouvelle branche
// qui va chercher leurs données complètes (family_members/pets/places) et les fusionne avec les
// nouveaux pour un récap global. Aucun changement nécessaire dans FamilySummary/PetsSummary/
// PlacesSummary.tsx — ils affichaient déjà correctement ce qu'on leur donnait.
// Changelog v1.1 : (a) fix typo handleGoToStep(7)→(5) sur le bloc Univers, qui ramenait au
// résumé lui-même au lieu d'aller à l'étape Univers ; (b) bouton "Modifier" masqué en mode
// édition pour Famille/Animaux/Doudous/Lieux (étapes 2/3/4/6, exclues de la navigation d'édition
// — cliquer menait à une page blanche) ; SummaryBlock.onEdit rendu optionnel en conséquence.
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Baby, BookOpen, Brain, Cat, Users, Rabbit, Sparkles, Globe, Pencil, Gift, Loader2, MapPin } from 'lucide-react';
import type { ChildProfileFormData, RelativeData, PetData } from '@/types/childProfile';
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
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Charger toutes les données existantes (édition) OU enrichir les sélections "existant" (création)
  useEffect(() => {
    const loadCompleteData = async () => {
      if (editMode && editChildId) {

      try {
        // Charger les données de famille (relatives)
        const { data: familyMembersLinks } = await supabase
          .from('child_family_members')
          .select('family_member_id, is_active, family_members(*)')
          .eq('child_id', editChildId);

        const relatives = familyMembersLinks?.map((link: any) => {
          // Le surnom est déjà stocké tel quel (objet {type, custom} ou chaîne).
          // On ne le ré-emballe PLUS (sinon getNickname affiche « [objet] »).
          const nicknameRaw = link.family_members.details?.nickname;
          const nicknameObj = (nicknameRaw && typeof nicknameRaw === 'object')
            ? nicknameRaw
            : { type: (nicknameRaw ? 'custom' : 'none') as 'custom' | 'none', custom: nicknameRaw || '' };
          return {
            id: link.family_member_id,
            type: link.family_members.role,
            firstName: link.family_members.name,
            nickname: nicknameObj,
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
          physicalDetails: link.family_members.details?.physicalDetails || [],
          // Statuts (lecture seule) : décès = entité ; brouille = lien enfant
          is_deceased: link.family_members.is_deceased ?? false,
          link_is_active: link.is_active
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
          gender: link.pets.gender,
          breed: link.pets.breed,
          physicalDetails: link.pets.physical_details || [],
          traits: [], // Champ requis par le type PetData
          // Statuts (lecture seule) : décès / donné-perdu
          is_deceased: link.pets.is_deceased ?? false,
          is_active: link.pets.is_active,
          inactive_reason: link.pets.inactive_reason ?? null
        })) || [];

        // Charger les lieux (places)
        const { data: childPlacesLinks } = await supabase
          .from('child_places')
          .select('place_id, label, places(*)')
          .eq('child_id', editChildId);

        const places = childPlacesLinks
          ?.filter((link: any) => link.places?.type !== 'destination_libre')
          .map((link: any) => ({
          id: link.place_id,
          label: link.label || link.places.label,
          type: link.places.type,
          emoji: link.places.emoji,
          address: link.places.address,
          city: link.places.city,
          country: link.places.country,
          description: link.places.description,
          details: link.places.details,
          // Statut (lecture seule) : lieu quitté
          is_active: link.places.is_active,
          inactive_reason: link.places.inactive_reason ?? null
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
        setIsLoadingData(false);
        return;
      } catch (error) {
        console.error('Error loading complete child data:', error);
        setCompleteData(formData);
        setIsLoadingData(false);
        return;
      }
      }

      // Mode création : les proches/animaux/lieux nouvellement créés sont déjà complets dans
      // formData, mais les SÉLECTIONS PARMI L'EXISTANT (existingRelativesData/existingPetsData/
      // existingPlacesData) n'ont que l'ID + un résumé minimal. On va chercher leurs données
      // complètes pour que le résumé montre le récap global (ajoutés + existants), pas juste
      // les ajoutés.
      try {
        const existingRelativeIds = (formData.family?.existingRelativesData || [])
          .map((r: any) => r.id).filter(Boolean);
        const existingPetIds = (formData.pets?.existingPetsData || [])
          .map((p: any) => p.id).filter(Boolean);
        const existingPlaceIds = (formData.places?.existingPlacesData || [])
          .map((p: any) => p.id).filter(Boolean);

        if (existingRelativeIds.length === 0 && existingPetIds.length === 0 && existingPlaceIds.length === 0) {
          setCompleteData(formData);
          setIsLoadingData(false);
          return;
        }

        const [relativesRes, petsRes, placesRes] = await Promise.all([
          existingRelativeIds.length > 0
            ? supabase.from('family_members').select('*').in('id', existingRelativeIds)
            : Promise.resolve({ data: [] as any[] }),
          existingPetIds.length > 0
            ? supabase.from('pets').select('*').in('id', existingPetIds)
            : Promise.resolve({ data: [] as any[] }),
          existingPlaceIds.length > 0
            ? supabase.from('places').select('*').in('id', existingPlaceIds)
            : Promise.resolve({ data: [] as any[] }),
        ]);

        // IMPORTANT : .in('id', [...]) ne garantit AUCUN ordre de retour côté Postgres — sans
        // ce re-tri, l'ordre peut varier d'un appel à l'autre et provoquer un clignotement
        // visuel (éléments qui semblent s'inverser) le temps que le composant se stabilise.
        const reorderById = <T extends { id: string }>(rows: T[], ids: string[]): T[] => {
          const byId = new Map(rows.map((r) => [r.id, r]));
          return ids.map((id) => byId.get(id)).filter((r): r is T => !!r);
        };

        const relativesRows = reorderById(relativesRes.data || [], existingRelativeIds);
        const petsRows = reorderById(petsRes.data || [], existingPetIds);
        const placesRows = reorderById(placesRes.data || [], existingPlaceIds);

        // Même mapping que la branche édition ci-dessus, pour un rendu identique dans les
        // *Summary.tsx (qui n'ont besoin d'aucune modification).
        const existingRelativesFull = relativesRows.map((fm: any) => {
          const nicknameRaw = fm.details?.nickname;
          const nicknameObj = (nicknameRaw && typeof nicknameRaw === 'object')
            ? nicknameRaw
            : { type: (nicknameRaw ? 'custom' : 'none') as 'custom' | 'none', custom: nicknameRaw || '' };
          return {
            id: fm.id,
            type: fm.role,
            gender: fm.details?.gender || 'neutral',
            firstName: fm.name,
            nickname: nicknameObj,
            age: fm.details?.age || '',
            job: fm.details?.job || '',
            skinColor: fm.details?.skinColor || { type: 'medium' },
            eyeColor: fm.details?.eyeColor || undefined,
            hairColor: fm.details?.hairColor || { type: 'brown' },
            hairType: fm.details?.hairType || 'straight',
            hairLength: fm.details?.hairLength || undefined,
            glasses: fm.details?.glasses ?? false,
            traits: fm.details?.traits || [],
            otherTypeName: fm.details?.otherTypeName || '',
            is_deceased: fm.is_deceased ?? false,
          };
        });

        const existingPetsFull = petsRows.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          gender: p.gender,
          breed: p.breed,
          physicalDetails: p.physical_details || [],
          traits: [],
          is_deceased: p.is_deceased ?? false,
          is_active: p.is_active,
        }));

        const existingPlacesFull = placesRows.map((p: any) => ({
          id: p.id,
          label: p.label,
          type: p.type,
          emoji: p.emoji,
          address: p.address,
          city: p.city,
          country: p.country,
          details: p.details,
          is_active: p.is_active,
        }));

        setCompleteData({
          ...formData,
          family: {
            ...formData.family,
            relatives: [...(formData.family?.relatives || []), ...(existingRelativesFull as RelativeData[])]
          },
          pets: {
            hasPets: formData.pets?.hasPets || existingPetsFull.length > 0,
            pets: [...(formData.pets?.pets || []), ...existingPetsFull]
          },
          places: {
            places: [...(formData.places?.places || []), ...existingPlacesFull],
            existingPlacesData: formData.places?.existingPlacesData || [],
            placeChildLinks: formData.places?.placeChildLinks || {}
          }
        });
      } catch (error) {
        console.error('Error enriching existing selections for summary:', error);
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
            ? "Parfait ! Le profil est prêt"
            : "C'est prêt ! Voici le profil de votre enfant"
          }
        </h2>
        <p className="text-gray-600">
          {isGiftMode
            ? "Vérifiez les informations avant de choisir le thème de l'histoire"
            : "Vous pouvez encore modifier un détail si besoin, sinon… place à l'imaginaire !"
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
          onEdit={editMode ? undefined : () => handleGoToStep(2)}
          className="lg:col-span-1"
        >
          <FamilySummary data={completeData} />
        </SummaryBlock>

        {completeData.pets && completeData.pets.hasPets && (
          <SummaryBlock 
            title="Animaux de compagnie" 
            icon={<Cat className="h-5 w-5 text-mcf-primary" />}
            onEdit={editMode ? undefined : () => handleGoToStep(3)}
            className="lg:col-span-1"
          >
            <PetsSummary data={completeData} />
          </SummaryBlock>
        )}

        {completeData.toys && completeData.toys.hasToys && (
          <SummaryBlock 
            title="Doudous & objets magiques" 
            icon={<Sparkles className="h-5 w-5 text-mcf-primary" />}
            onEdit={editMode ? undefined : () => handleGoToStep(4)}
            className="lg:col-span-1"
          >
            <ToysSummary data={completeData} />
          </SummaryBlock>
        )}

        {completeData.places && completeData.places.places && completeData.places.places.length > 0 && (
          <SummaryBlock 
            title="Lieux de vie" 
            icon={<MapPin className="h-5 w-5 text-mcf-primary" />}
            onEdit={editMode ? undefined : () => handleGoToStep(6)}
            className="lg:col-span-1"
          >
            <PlacesSummary data={completeData} />
          </SummaryBlock>
        )}

        <SummaryBlock 
          title="Univers préféré & culture" 
          icon={<Globe className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(5)}
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
          className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:w-auto md:min-w-64 text-lg flex items-center justify-center gap-2 h-auto whitespace-normal md:whitespace-nowrap leading-tight text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
  onEdit?: () => void;
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
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-mcf-primary hover:bg-mcf-amber/10 h-7 px-2 rounded-md transition-colors"
          >
            <Pencil className="h-3 w-3" /> 
            Modifier
          </Button>
        )}
      </div>
      <div className="p-3">
        {children}
      </div>
    </Card>
  );
};

export default FinalSummary;
