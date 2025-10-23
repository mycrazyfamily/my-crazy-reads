
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Baby, Book, Gift, User, Clock, Truck, Edit, Plus, Settings, 
  LogOut, Home, Heart, HelpCircle, Copy, ExternalLink, MessageSquarePlus,
  ShoppingBag
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChildProfileCard from '@/components/familyDashboard/ChildProfileCard';
import BookTimeline from '@/components/familyDashboard/BookTimeline';
import FamilyCodeShare from '@/components/familyDashboard/FamilyCodeShare';
import StoryCustomizationForm from '@/components/familyDashboard/StoryCustomizationForm';
import ManageSubscription from '@/components/familyDashboard/ManageSubscription';
import RelativeProfileCard from '@/components/familyDashboard/RelativeProfileCard';
import PetProfileCard from '@/components/familyDashboard/PetProfileCard';

const FamilyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Synchroniser automatiquement le family_id
  useFamilyIdSync();
  
  // Scroll vers le haut au montage du composant
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // État de chargement
  const [isLoading, setIsLoading] = useState(true);
  
  // Données chargées depuis child_profiles
  const [children, setChildren] = useState<Array<{
    id: string;
    firstName: string;
    age: string;
    avatar: string | null;
    personalityEmoji: string;
    relatives?: any[];
    pets?: any[];
    toysCount?: number;
    preferencesCount?: number;
    hasPets?: number;
  }>>([]);
  const books: any[] = []; // Empty for new users
  const familyCode = null; // Will be generated when first child is added
  const subscription = null; // Will be set when user subscribes

  useEffect(() => {
    const calculateExactAge = (birthDate: string | Date) => {
      if (!birthDate) return '';
      
      const today = new Date();
      const birth = new Date(birthDate);
      
      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      const days = today.getDate() - birth.getDate();
      
      // Si le jour du mois actuel est avant le jour de naissance, soustraire un mois
      if (days < 0) {
        months--;
      }
      
      // Si le mois est négatif, soustraire une année et ajuster les mois
      if (months < 0) {
        years--;
        months += 12;
      }
      
      let ageString = "";
      if (years > 0) {
        ageString += `${years} an${years > 1 ? 's' : ''}`;
        if (months > 0) {
          ageString += ` et ${months} mois`;
        }
      } else if (months > 0) {
        ageString = `${months} mois`;
      } else {
        ageString = "moins d'un mois";
      }
      
      return ageString;
    };

    const loadChildren = async () => {
      setIsLoading(true);
      try {
        // Charger directement depuis child_profiles avec toutes les relations
        const { data: childProfiles, error } = await supabase
          .from('child_profiles')
          .select(`
            id,
            first_name,
            birth_date,
            gender,
            created_at
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Failed to load child profiles:', error);
          return;
        }
        
        const mapped = await Promise.all((childProfiles || []).map(async (profile: any) => {
          // Charger les animaux depuis child_pets
          const { data: childPets } = await supabase
            .from('child_pets')
            .select(`
              name,
              traits,
              relation_label,
              pets:pet_id (
                id,
                name,
                type,
                breed,
                physical_details,
                emoji
              )
            `)
            .eq('child_id', profile.id);
          
          const petsFromDb = (childPets || []).map((cp: any) => ({
            id: cp.pets?.id,
            name: cp.name || cp.pets?.name,
            type: cp.relation_label || cp.pets?.type,
            breed: cp.pets?.breed,
            physicalDetails: cp.pets?.physical_details,
            traits: cp.traits?.split(', ') || [],
            emoji: cp.pets?.emoji
          }));
          
          // Charger les proches depuis child_family_members
          const { data: childFamilyMembers } = await supabase
            .from('child_family_members')
            .select(`
              relation_label,
              family_members:family_member_id (
                id,
                name,
                role,
                avatar
              )
            `)
            .eq('child_id', profile.id);
          
          const relativesFromDb = (childFamilyMembers || []).map((cfm: any) => ({
            id: cfm.family_members?.id,
            firstName: cfm.family_members?.name,
            type: cfm.family_members?.role,
            avatar: cfm.family_members?.avatar || '👤',
            relationToChild: cfm.relation_label
          }));
          
          // Charger les doudous depuis child_comforters
          const { data: childComforters } = await supabase
            .from('child_comforters')
            .select('*')
            .eq('child_id', profile.id);
          
          // Charger toutes les préférences pour calculer le total
          const [
            { data: superpowers },
            { data: likes },
            { data: challenges },
            { data: universes },
            { data: discoveries }
          ] = await Promise.all([
            supabase.from('child_superpowers').select('*').eq('child_id', profile.id),
            supabase.from('child_likes').select('*').eq('child_id', profile.id),
            supabase.from('child_challenges').select('*').eq('child_id', profile.id),
            supabase.from('child_universes').select('*').eq('child_id', profile.id),
            supabase.from('child_discoveries').select('*').eq('child_id', profile.id)
          ]);
          
          const toysCount = childComforters?.length || 0;
          const preferencesCount = (superpowers?.length || 0) + 
                                   (likes?.length || 0) + 
                                   (challenges?.length || 0) + 
                                   (universes?.length || 0) + 
                                   (discoveries?.length || 0);
          
          return {
            id: profile.id,
            firstName: profile.first_name || 'Enfant',
            age: profile.birth_date ? calculateExactAge(profile.birth_date) : '',
            avatar: null,
            personalityEmoji: '🧒',
            relatives: relativesFromDb,
            pets: petsFromDb,
            toysCount: toysCount,
            preferencesCount: preferencesCount,
            hasPets: petsFromDb.length,
          };
        }));
        
        setChildren(mapped);
      } catch (e) {
        console.error('Unexpected error loading children:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadChildren();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  console.log('🏠 FamilyDashboard: Composant chargé pour user:', user);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="flex items-center justify-between mb-8 mt-10">
          <div className="flex items-center gap-3">
            <div className="bg-mcf-amber/20 p-2.5 rounded-full">
              <Home className="h-7 w-7 text-mcf-orange" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark">Mon Espace Famille</h1>
          </div>
          
          {/* Menu Paramètres */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-mcf-orange-dark">Paramètres</SheetTitle>
                <SheetDescription>
                  Gérez votre compte et vos préférences
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-mcf-cream/50 rounded-lg">
                  <div className="text-sm font-medium text-mcf-orange-dark mb-1">Adresse email</div>
                  <div className="text-sm text-gray-600 select-text">{user?.email || "Ma famille"}</div>
                </div>
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="grid gap-8">
          {/* Quick action buttons */}
          <section className="animate-fade-in">
            <TooltipProvider delayDuration={0}>
              <div className="flex flex-wrap gap-3 mb-6">
                {/* 1. Ajouter un nouvel enfant - toujours visible */}
                <Button 
                  className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                  onClick={() => navigate('/creer-profil-enfant')}
                >
                  <Plus className="h-4 w-4" /> Ajouter un enfant
                </Button>
                
                {/* 2. Ajouter un proche - désactivé si pas d'enfant */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        className={`gap-2 ${children.length === 0 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300' 
                          : 'bg-mcf-primary hover:bg-mcf-primary/90 text-white'
                        }`}
                        onClick={children.length > 0 ? () => navigate('/ajouter-proche') : undefined}
                        disabled={children.length === 0}
                      >
                        <Plus className="h-4 w-4" /> Ajouter un proche
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {children.length === 0 && (
                    <TooltipContent>
                      <p>Ajoutez d'abord un enfant pour pouvoir renseigner ses proches.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                
                {/* 2.5 Ajouter un animal - désactivé si pas d'enfant */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        className={`gap-2 ${children.length === 0 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300' 
                          : 'bg-mcf-primary hover:bg-mcf-primary/90 text-white'
                        }`}
                        onClick={children.length > 0 ? () => {
                          if (children.length === 1) {
                            navigate(`/ajouter-animal/${children[0].id}`);
                          } else {
                            navigate('/ajouter-animal');
                          }
                        } : undefined}
                        disabled={children.length === 0}
                      >
                        <Plus className="h-4 w-4" /> Ajouter un animal
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {children.length === 0 && (
                    <TooltipContent>
                      <p>Ajoutez d'abord un enfant pour pouvoir renseigner ses animaux de compagnie.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                
                {/* 3. Offrir un nouveau livre - désactivé si pas d'enfant */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        className={`gap-2 ${children.length === 0 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300' 
                          : 'bg-mcf-secondary hover:bg-mcf-secondary/90 text-white'
                        }`}
                        onClick={children.length > 0 ? () => navigate('/offrir/profil-enfant') : undefined}
                        disabled={children.length === 0}
                      >
                        <ShoppingBag className="h-4 w-4" /> Offrir un nouveau livre
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {children.length === 0 && (
                    <TooltipContent>
                      <p>Créez d'abord le profil d'un enfant pour lui offrir un livre personnalisé.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </TooltipProvider>
          </section>
          
          {/* Section 1: Children Profiles */}
          <section className="animate-fade-in">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Baby className="h-6 w-6" /> Mes enfants
            </h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              </div>
            ) : children.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {children.map((child) => (
                    <ChildProfileCard key={child.id} child={child} />
                  ))}
                </div>
                
                <Button 
                  className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2 mt-2"
                  onClick={() => navigate('/creer-profil-enfant')}
                >
                  <Plus className="h-4 w-4" /> Ajouter un enfant
                </Button>
              </>
            ) : (
              <Card className="p-8 text-center bg-gradient-to-br from-mcf-mint/10 to-mcf-cream/50 border-mcf-mint">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-mcf-mint/20 p-4 rounded-full">
                    <Baby className="h-8 w-8 text-mcf-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-mcf-orange-dark">
                      Vous n'avez encore ajouté aucun enfant.
                    </p>
                    <p className="text-gray-600">
                      Cliquez sur le bouton ci-dessous pour commencer.
                    </p>
                  </div>
                  <Button 
                    className="bg-mcf-primary hover:bg-mcf-primary/90 text-white gap-2 text-lg px-6 py-3 mt-2"
                    onClick={() => navigate('/creer-profil-enfant')}
                  >
                    <Plus className="h-5 w-5" /> Ajouter mon premier enfant
                  </Button>
                </div>
              </Card>
            )}
          </section>

          {/* Section: Ma famille - Affichage des proches */}
          {children.length > 0 && children.some(child => child.relatives && child.relatives.length > 0) && (
            <section className="animate-fade-in animation-delay-50">
              <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
                <Heart className="h-6 w-6" /> Ma famille et mes proches
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  // Grouper les proches par leur ID pour éviter les doublons
                  const relativesMap = new Map<string, { relative: any; childrenNames: string[]; childrenIds: string[] }>();
                  
                  children.forEach((child) => {
                    if (!child.relatives || child.relatives.length === 0) return;
                    
                    child.relatives.forEach((relative: any) => {
                      if (relativesMap.has(relative.id)) {
                        const entry = relativesMap.get(relative.id)!;
                        entry.childrenNames.push(child.firstName);
                        entry.childrenIds.push(child.id);
                      } else {
                        relativesMap.set(relative.id, {
                          relative,
                          childrenNames: [child.firstName],
                          childrenIds: [child.id]
                        });
                      }
                    });
                  });
                  
                  return Array.from(relativesMap.values()).map(({ relative, childrenNames, childrenIds }) => (
                    <RelativeProfileCard 
                      key={relative.id}
                      relative={relative}
                      childrenNames={childrenNames}
                      primaryChildId={childrenIds[0]}
                    />
                  ));
                })()}
              </div>
              
              <Button 
                className="bg-mcf-primary hover:bg-mcf-primary/90 text-white gap-2 mt-4"
                onClick={() => navigate('/ajouter-proche')}
              >
                <Plus className="h-4 w-4" /> Ajouter un proche
              </Button>
            </section>
          )}

          {/* Section: Animaux de compagnie */}
          {children.length > 0 && children.some(child => child.pets && child.pets.length > 0) && (
            <section className="animate-fade-in animation-delay-75">
              <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
                <span className="text-2xl">🐾</span> Nos animaux de compagnie
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  // Grouper les animaux par leur nom pour éviter les doublons
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
                  
                  return Array.from(petsMap.values()).map(({ pet, childrenNames, childrenIds }) => (
                    <PetProfileCard 
                      key={pet.id || pet.name}
                      pet={pet}
                      childrenNames={childrenNames}
                      primaryChildId={childrenIds[0]}
                    />
                  ));
                })()}
              </div>
              
              {/* Bouton pour ajouter un animal */}
              <Button 
                className="bg-mcf-primary hover:bg-mcf-primary/90 text-white gap-2 mt-4"
                onClick={() => {
                  if (children.length === 1) {
                    navigate(`/ajouter-animal/${children[0].id}`);
                  } else {
                    navigate('/ajouter-animal');
                  }
                }}
              >
                <Plus className="h-4 w-4" /> Ajouter un animal
              </Button>
            </section>
          )}
          
          {/* Section 2: Books */}
          <section className="animate-fade-in animation-delay-100">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Book className="h-6 w-6" /> Mes livres MCF
            </h2>
            
            {books.length > 0 ? (
              <BookTimeline />
            ) : (
              <Card className="p-8 text-center bg-gradient-to-br from-mcf-secondary/10 to-mcf-cream/50 border-mcf-secondary">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-mcf-secondary/20 p-4 rounded-full">
                    <Book className="h-8 w-8 text-mcf-secondary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-mcf-orange-dark">
                      Aucune histoire n'a encore été créée pour vos enfants.
                    </p>
                    <p className="text-gray-600">
                      Les histoires que vous lirez avec vos enfants apparaîtront ici.
                    </p>
                  </div>
                  {children.length > 0 && (
                    <Button 
                      className="bg-mcf-secondary hover:bg-mcf-secondary/90 text-white gap-2 text-lg px-6 py-3 mt-2"
                      onClick={() => navigate('/personnaliser-histoire')}
                    >
                      <MessageSquarePlus className="h-5 w-5" /> Créer ma première histoire
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </section>
          
          {/* Section 3: Family Code Sharing */}
          <section className="animate-fade-in animation-delay-200">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Gift className="h-6 w-6" /> Offrir un livre avec mon code famille
            </h2>
            
            {familyCode ? (
              <FamilyCodeShare familyCode={familyCode} />
            ) : (
              <Card className={`p-8 text-center bg-gradient-to-br from-mcf-amber/10 to-mcf-cream/50 border-mcf-mint ${children.length === 0 ? 'opacity-60' : ''}`}>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-mcf-amber/20 p-4 rounded-full">
                    <Gift className="h-8 w-8 text-mcf-orange" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-mcf-orange-dark">
                      {children.length === 0 
                        ? "Ajoutez un enfant pour générer votre code famille et offrir un livre à vos proches."
                        : "Votre code famille sera généré automatiquement."
                      }
                    </p>
                    <p className="text-gray-600">
                      Partagez la magie des histoires personnalisées avec votre famille.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </section>
          
          {/* Section 4: Story Customization - Only show if user has children */}
          {children.length > 0 && (
            <section className="animate-fade-in animation-delay-300">
              <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
                <MessageSquarePlus className="h-6 w-6" /> Personnaliser encore plus les prochaines histoires
              </h2>
              
              <StoryCustomizationForm />
            </section>
          )}
          
          {/* Section 5: Subscription Management */}
          <section className="animate-fade-in animation-delay-400">
            <ManageSubscription />
          </section>
        </div>
        
        {/* Footer Actions */}
        <div className="mt-12 pb-8 border-t border-mcf-amber/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" /> Retour à l'accueil
            </Button>
            
            <Button 
              variant="outline" 
              className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2"
            onClick={() => navigate('/contact')}
          >
            <HelpCircle className="h-4 w-4" /> Besoin d'aide ? Contactez-nous
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FamilyDashboard;
