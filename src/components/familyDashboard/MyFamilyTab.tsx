// MyFamilyTab v1.2
// Changelog v1.2 (chantier icones IA, lot 2) : section « Doudous et objets magiques »,
//   Sparkles -> Moon, aux DEUX endroits (en-tete de section et etat vide). Meme raisonnement que
//   QuickActionsSection v1.4 : Heart est deja pris par la section « Nos animaux de compagnie »
//   juste au-dessus.
// MyFamilyTab v1.1
// Changelog v1.1 : ajout de la section "Doudous et objets magiques" (entre Animaux et Lieux,
// même ordre que QuickActionsSection et le wizard) — extraction allToys + ToyProfileCard.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Baby, Users, Heart, MapPin, Moon } from 'lucide-react';
import ChildProfileCard from './ChildProfileCard';
import RelativeProfileCard from './RelativeProfileCard';
import PetProfileCard from './PetProfileCard';
import PlaceProfileCard from './PlaceProfileCard';
import ToyProfileCard from './ToyProfileCard';

interface Child {
  id: string;
  firstName: string;
  age: string;
  avatar: string | null;
  personalityEmoji: string;
  relatives?: any[];
  pets?: any[];
  places?: any[];
  toys?: any[];
  toysCount?: number;
  preferencesCount?: number;
  hasPets?: number;
  birthDate?: string | null;
  isDeceased?: boolean;
}

interface MyFamilyTabProps {
  children: Child[];
}

const MyFamilyTab: React.FC<MyFamilyTabProps> = ({ children }) => {
  const navigate = useNavigate();

  // Extraire tous les proches uniques
  const allRelatives = React.useMemo(() => {
    const relativesMap = new Map<string, { relative: any; childrenNames: string[]; childrenIds: string[] }>();
    
    children.forEach((child) => {
      if (!child.relatives || child.relatives.length === 0) return;
      
      child.relatives.forEach((relative: any) => {
        const relKey = relative.id;
        if (relativesMap.has(relKey)) {
          const entry = relativesMap.get(relKey)!;
          entry.childrenNames.push(child.firstName);
          entry.childrenIds.push(child.id);
        } else {
          relativesMap.set(relKey, {
            relative,
            childrenNames: [child.firstName],
            childrenIds: [child.id]
          });
        }
      });
    });
    
    return Array.from(relativesMap.values())
      .sort((a, b) => (a.relative.firstName || '').localeCompare(b.relative.firstName || '', 'fr'));
  }, [children]);

  // Extraire tous les animaux uniques
  const allPets = React.useMemo(() => {
    const petsMap = new Map<string, { pet: any; childrenNames: string[]; childrenIds: string[] }>();
    
    children.forEach((child) => {
      if (!child.pets || child.pets.length === 0) return;
      
      child.pets.forEach((pet: any) => {
        const petKey = pet.id || pet.name;
        if (petsMap.has(petKey)) {
          const entry = petsMap.get(petKey)!;
          entry.childrenNames.push(child.firstName);
          entry.childrenIds.push(child.id);
        } else {
          petsMap.set(petKey, {
            pet,
            childrenNames: [child.firstName],
            childrenIds: [child.id]
          });
        }
      });
    });
    
    return Array.from(petsMap.values())
      .sort((a, b) => (a.pet.name || '').localeCompare(b.pet.name || '', 'fr'));
  }, [children]);

  // Extraire tous les doudous uniques
  const allToys = React.useMemo(() => {
    const toysMap = new Map<string, { toy: any; childrenNames: string[]; childrenIds: string[] }>();

    children.forEach((child) => {
      if (!child.toys || child.toys.length === 0) return;

      child.toys.forEach((toy: any) => {
        const toyKey = toy.id || toy.name;
        if (toysMap.has(toyKey)) {
          const entry = toysMap.get(toyKey)!;
          entry.childrenNames.push(child.firstName);
          entry.childrenIds.push(child.id);
        } else {
          toysMap.set(toyKey, {
            toy,
            childrenNames: [child.firstName],
            childrenIds: [child.id]
          });
        }
      });
    });

    return Array.from(toysMap.values())
      .sort((a, b) => (a.toy.name || '').localeCompare(b.toy.name || '', 'fr'));
  }, [children]);

  // Extraire tous les lieux uniques
  const allPlaces = React.useMemo(() => {
    const placesMap = new Map<string, { place: any; childrenNames: string[]; childrenIds: string[] }>();
    
    children.forEach((child) => {
      if (!child.places || child.places.length === 0) return;
      
      child.places.forEach((place: any) => {
        if (placesMap.has(place.id)) {
          const entry = placesMap.get(place.id)!;
          entry.childrenNames.push(child.firstName);
          entry.childrenIds.push(child.id);
        } else {
          placesMap.set(place.id, {
            place,
            childrenNames: [child.firstName],
            childrenIds: [child.id]
          });
        }
      });
    });
    
    return Array.from(placesMap.values())
      .sort((a, b) => (a.place.label || '').localeCompare(b.place.label || '', 'fr'));
  }, [children]);

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-500" strokeWidth={2} />
      </div>
      <h2 className="text-2xl font-bold text-[#2574EA]">{title}</h2>
    </div>
  );

  const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    buttonText, 
    onClick,
    gradient 
  }: { 
    icon: any; 
    title: string; 
    description: string; 
    buttonText: string; 
    onClick: () => void;
    gradient: string;
  }) => (
    <Card className={`p-10 text-center border-2 border-dashed bg-gradient-to-br ${gradient} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex flex-col items-center gap-5">
        <div className="p-5 rounded-full bg-white/80 shadow-sm">
          <Icon className="h-12 w-12 text-mcf-orange" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-bold text-mcf-orange-dark">{title}</p>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{description}</p>
        </div>
        <Button
          onClick={onClick}
          className="bg-mcf-primary hover:bg-mcf-primary/90 shadow-md hover:shadow-lg hover:scale-105 transition-all gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {buttonText}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* Section Enfants */}
      <section className="animate-fade-in">
        <SectionHeader 
          icon={Baby} 
          title="Mes enfants"
        />
        
        {children.length === 0 ? (
          <EmptyState
            icon={Baby}
            title="Commencez votre aventure"
            description="Créez le profil de votre premier enfant pour découvrir ses histoires personnalisées"
            buttonText="Ajouter mon premier enfant"
            onClick={() => navigate('/creer-profil-enfant')}
            gradient="from-mcf-primary/5 to-mcf-mint/10"
          />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {children.map((child) => (
                <ChildProfileCard key={child.id} child={child} />
              ))}
            </div>
            
              <Button
                onClick={() => navigate('/creer-profil-enfant')}
                variant="ghost"
                className="w-full text-[#4A90E2] hover:text-[#2E6BB8] hover:bg-[#F8FBFF] font-medium h-12 rounded-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Ajouter un autre enfant
              </Button>
          </>
        )}
      </section>

      {/* Section Proches */}
      {children.length > 0 && (
        <section className="animate-fade-in animation-delay-100">
          <SectionHeader 
            icon={Users} 
            title="Ma famille et mes proches"
          />
          
          {allRelatives.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Ajoutez vos proches"
              description="Grands-parents, oncles, tantes, amis... Ils feront partie des histoires !"
              buttonText="Ajouter un proche"
              onClick={() => navigate(children.length === 1 ? `/ajouter-proche/${children[0].id}` : '/ajouter-proche')}
              gradient="from-mcf-secondary/5 to-mcf-mint/10"
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {allRelatives.map(({ relative, childrenNames, childrenIds }) => (
                  <RelativeProfileCard 
                    key={relative.id}
                    relative={relative}
                    childrenNames={childrenNames}
                    primaryChildId={childrenIds[0]}
                  />
                ))}
              </div>
              
              <Button
                onClick={() => navigate(children.length === 1 ? `/ajouter-proche/${children[0].id}` : '/ajouter-proche')}
                variant="ghost"
                className="w-full text-[#4A90E2] hover:text-[#2E6BB8] hover:bg-[#F8FBFF] font-medium h-12 rounded-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Ajouter un autre proche
              </Button>
            </>
          )}
        </section>
      )}

      {/* Section Animaux */}
      {children.length > 0 && (
        <section className="animate-fade-in animation-delay-200">
          <SectionHeader 
            icon={Heart} 
            title="Nos animaux de compagnie"
          />
          
          {allPets.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Ajoutez vos compagnons"
              description="Chat, chien, lapin... Vos animaux peuvent aussi être les héros des histoires !"
              buttonText="Ajouter un animal"
              onClick={() => navigate(children.length === 1 ? `/ajouter-animal/${children[0].id}` : '/ajouter-animal')}
              gradient="from-mcf-orange/5 to-mcf-amber/10"
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {allPets.map(({ pet, childrenNames, childrenIds }) => (
                  <PetProfileCard 
                    key={pet.id || pet.name}
                    pet={pet}
                    childrenNames={childrenNames}
                    primaryChildId={childrenIds[0]}
                  />
                ))}
              </div>
              
              <Button
                onClick={() => navigate(children.length === 1 ? `/ajouter-animal/${children[0].id}` : '/ajouter-animal')}
                variant="ghost"
                className="w-full text-[#4A90E2] hover:text-[#2E6BB8] hover:bg-[#F8FBFF] font-medium h-12 rounded-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Ajouter un autre animal
              </Button>
            </>
          )}
        </section>
      )}

      {/* Section Doudous */}
      {children.length > 0 && (
        <section className="animate-fade-in animation-delay-250">
          <SectionHeader
            icon={Moon}
            title="Doudous et objets magiques"
          />

          {allToys.length === 0 ? (
            <EmptyState
              icon={Moon}
              title="Ajoutez ses doudous"
              description="Peluche, couverture, figurine... Ils peuvent aussi devenir des personnages de l'histoire !"
              buttonText="Ajouter un doudou"
              onClick={() => navigate(children.length === 1 ? `/ajouter-doudou/${children[0].id}` : '/ajouter-doudou')}
              gradient="from-mcf-amber/5 to-mcf-mint/10"
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {allToys.map(({ toy, childrenNames, childrenIds }) => (
                  <ToyProfileCard
                    key={toy.id || toy.name}
                    toy={toy}
                    childrenNames={childrenNames}
                    primaryChildId={childrenIds[0]}
                  />
                ))}
              </div>

              <Button
                onClick={() => navigate(children.length === 1 ? `/ajouter-doudou/${children[0].id}` : '/ajouter-doudou')}
                variant="ghost"
                className="w-full text-[#4A90E2] hover:text-[#2E6BB8] hover:bg-[#F8FBFF] font-medium h-12 rounded-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Ajouter un autre doudou
              </Button>
            </>
          )}
        </section>
      )}

      {/* Section Lieux */}
      {children.length > 0 && (
        <section className="animate-fade-in animation-delay-300">
          <SectionHeader 
            icon={MapPin} 
            title="Mes lieux de vie"
          />
          
          {allPlaces.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Ajoutez vos lieux"
              description="Maison, école, parc, lieu de vacances... Créez l'univers de vos histoires"
              buttonText="Ajouter un lieu"
              onClick={() => navigate(children.length === 1 ? `/ajouter-lieu/${children[0].id}` : '/ajouter-lieu')}
              gradient="from-mcf-amber/5 to-mcf-cream/20"
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {allPlaces.map(({ place, childrenNames, childrenIds }) => (
                  <PlaceProfileCard 
                    key={place.id}
                    place={place}
                    childrenNames={childrenNames}
                    primaryChildId={childrenIds[0]}
                  />
                ))}
              </div>
              
              <Button
                onClick={() => navigate(children.length === 1 ? `/ajouter-lieu/${children[0].id}` : '/ajouter-lieu')}
                variant="ghost"
                className="w-full text-[#4A90E2] hover:text-[#2E6BB8] hover:bg-[#F8FBFF] font-medium h-12 rounded-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Ajouter un autre lieu
              </Button>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default MyFamilyTab;
