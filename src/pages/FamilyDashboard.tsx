
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Baby, User, Clock, Truck, Edit, Plus, Settings, 
  LogOut, Home, Heart, HelpCircle, Copy, ExternalLink,
  ShoppingBag, Sparkles
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
import ManageSubscription from '@/components/familyDashboard/ManageSubscription';
import RelativeProfileCard from '@/components/familyDashboard/RelativeProfileCard';
import PetProfileCard from '@/components/familyDashboard/PetProfileCard';
import PlaceProfileCard from '@/components/familyDashboard/PlaceProfileCard';

const FamilyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user, supabaseSession } = useAuth();
  
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
    places?: any[];
    toysCount?: number;
    preferencesCount?: number;
    hasPets?: number;
  }>>([]);

  useEffect(() => {
    const calculateExactAge = (birthDate: string | Date) => {
      if (!birthDate) return '';
      const today = new Date();
      const birth = new Date(birthDate);
      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      const days = today.getDate() - birth.getDate();
      if (days < 0) months--;
      if (months < 0) { years--; months += 12; }
      let ageString = "";
      if (years > 0) {
        ageString += `${years} an${years > 1 ? 's' : ''}`;
        if (months > 0) ageString += ` et ${months} mois`;
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
        if (!supabaseSession?.user?.id) {
          console.log('▶︎ FamilyDashboard: no session yet, stop loading');
          setIsLoading(false);
          return;
        }
        const userId = supabaseSession.user.id;
        console.log('▶︎ FamilyDashboard: fetchChildren for user', userId);

        // 1) Récupérer le profil utilisateur (pour family_id)
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', userId)
          .maybeSingle();
        if (userProfileError) {
          console.error('❌ FamilyDashboard: user_profile error', userProfileError);
        } else {
          console.log('▶︎ FamilyDashboard: user_profile', userProfile);
        }

        // 2) Construire 2 requêtes: par family_id (si dispo) et par user_id
        const baseSelect = `
          id,
          first_name,
          birth_date,
          gender,
          created_at,
          family_id,
          user_id
        `;

        const qByUser = supabase.from('child_profiles').select(baseSelect).eq('user_id', userId);
        const qByFamily = userProfile?.family_id
          ? supabase.from('child_profiles').select(baseSelect).eq('family_id', userProfile.family_id)
          : null;

        // 3) Exécuter en parallèle et fusionner (évite les cas limites RLS / synchro)
        const [{ data: byUser, error: errUser }, famRes] = await Promise.all([
          qByUser.order('created_at', { ascending: false }),
          qByFamily ? qByFamily.order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null })
        ] as const);

        if (errUser) console.error('❌ FamilyDashboard: child_profiles by user error', errUser);
        const byFamily = famRes?.data as any[] | undefined;
        if ((famRes as any)?.error) console.error('❌ FamilyDashboard: child_profiles by family error', (famRes as any).error);

        const rows = [...(byFamily || []), ...(byUser || [])];
        // Uniq par id
        const seen = new Set<string>();
        const uniqueRows = rows.filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true)));

        console.log('▶︎ FamilyDashboard: children rows fetched', {
          byUser: byUser?.length || 0,
          byFamily: byFamily?.length || 0,
          totalUnique: uniqueRows.length,
        });

        // 4) Mapper minimal et afficher immédiatement (puis enrichir ensuite)
        const minimal = (uniqueRows || []).map((profile: any) => ({
          id: profile.id,
          firstName: profile.first_name || 'Enfant',
          age: profile.birth_date ? calculateExactAge(profile.birth_date) : '',
          avatar: null as string | null,
          personalityEmoji: '🧒',
          relatives: [],
          pets: [],
          places: [],
          toysCount: 0,
          preferencesCount: 0,
          hasPets: 0,
        }));
        setChildren(minimal);
        console.log('▶︎ FamilyDashboard: children set (minimal)', minimal.length);

        // 5) Enrichissement asynchrone non bloquant
        await Promise.all(
          uniqueRows.map(async (profile: any) => {
            try {
              const [{ data: childPets }, { data: childFamilyMembers }, { data: childPlaces }, superpowersRes, likesRes, challengesRes, universesRes, discoveriesRes] = await Promise.all([
                supabase
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
                  .eq('child_id', profile.id),
                supabase
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
                  .eq('child_id', profile.id),
                supabase
                  .from('child_places')
                  .select(`
                    label,
                    places:place_id (
                      id,
                      label,
                      type,
                      emoji,
                      address,
                      city,
                      country,
                      description,
                      details
                    )
                  `)
                  .eq('child_id', profile.id),
                supabase.from('child_superpowers').select('*').eq('child_id', profile.id),
                supabase.from('child_likes').select('*').eq('child_id', profile.id),
                supabase.from('child_challenges').select('*').eq('child_id', profile.id),
                supabase.from('child_universes').select('*').eq('child_id', profile.id),
                supabase.from('child_discoveries').select('*').eq('child_id', profile.id),
              ]);

              const petsFromDb = (childPets || []).map((cp: any) => ({
                id: cp.pets?.id,
                name: cp.name || cp.pets?.name,
                type: cp.relation_label || cp.pets?.type,
                breed: cp.pets?.breed,
                physicalDetails: cp.pets?.physical_details,
                traits: cp.traits?.split(', ') || [],
                emoji: cp.pets?.emoji,
              }));

              const relativesFromDb = (childFamilyMembers || []).map((cfm: any) => ({
                id: cfm.family_members?.id,
                firstName: cfm.family_members?.name,
                type: cfm.family_members?.role,
                avatar: cfm.family_members?.avatar || '👤',
                relationToChild: cfm.relation_label,
              }));

              const placesFromDb = (childPlaces || []).map((cp: any) => ({
                id: cp.places?.id,
                label: cp.places?.label,
                type: cp.places?.type,
                emoji: cp.places?.emoji,
                address: cp.places?.address,
                city: cp.places?.city,
                country: cp.places?.country,
                description: cp.places?.description,
                details: cp.places?.details,
                childLabel: cp.label,
              }));

              const toysCount = 0; // pas de table jouets distincte ici
              const preferencesCount =
                (superpowersRes.data?.length || 0) +
                (likesRes.data?.length || 0) +
                (challengesRes.data?.length || 0) +
                (universesRes.data?.length || 0) +
                (discoveriesRes.data?.length || 0);

              // Mettre à jour l'enfant enrichi
              setChildren(prev => prev.map(c => c.id === profile.id ? {
                ...c,
                relatives: relativesFromDb,
                pets: petsFromDb,
                places: placesFromDb,
                toysCount,
                preferencesCount,
                hasPets: petsFromDb.length,
              } : c));
            } catch (err) {
              console.error('❌ FamilyDashboard: enrich error for child', profile.id, err);
            }
          })
        );

        console.log('▶︎ FamilyDashboard: enrichment done');
      } catch (e) {
        console.error('Unexpected error loading children:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadChildren();
  }, [supabaseSession?.user?.id]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  console.log('🏠 FamilyDashboard: Composant chargé pour user:', user);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-mcf-mint/5 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="flex items-center justify-between mb-8 mt-10 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-mcf-mint/30 to-mcf-primary/20 p-3 rounded-2xl shadow-md">
              <Home className="h-8 w-8 text-mcf-primary drop-shadow-sm" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-mcf-orange-dark drop-shadow-sm">Mon Espace Famille</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-mcf-orange via-mcf-primary to-mcf-mint rounded-full mt-2" />
            </div>
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
          {/* Section "Actions rapides" */}
          <section className="mb-10 animate-fade-in">
            <div className="mb-6">
              <h2 className="flex items-center gap-3 text-3xl font-bold text-mcf-orange-dark">
                <div className="bg-gradient-to-br from-mcf-orange/20 to-mcf-primary/10 p-2.5 rounded-xl">
                  <Clock className="h-7 w-7 text-mcf-primary" strokeWidth={2.5} />
                </div>
                Actions rapides
              </h2>
              <div className="h-1 w-12 bg-gradient-to-r from-mcf-orange to-mcf-primary rounded-full mt-3 ml-1" />
            </div>
            
            <TooltipProvider delayDuration={0}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* 1. Ajouter un enfant - toujours actif */}
                <button
                  onClick={() => navigate('/creer-profil-enfant')}
                  className="group relative bg-white border-2 border-mcf-primary/30 hover:border-mcf-primary rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-mcf-primary/5 hover:to-mcf-mint/5"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="p-3 rounded-full bg-mcf-primary/20 group-hover:bg-mcf-primary/30 transition-colors">
                      <Baby className="h-6 w-6 text-mcf-primary" strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-mcf-orange-dark text-sm">Ajouter un enfant</span>
                  </div>
                </button>
                
                {/* 2. Ajouter un proche - désactivé si pas d'enfant */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={children.length > 0 ? () => navigate('/ajouter-proche') : undefined}
                      disabled={children.length === 0}
                      className={`group relative border-2 rounded-xl p-5 shadow-lg transition-all duration-300 ${
                        children.length === 0
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                          : 'bg-white border-mcf-mint/30 hover:border-mcf-mint hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-mcf-mint/5 hover:to-mcf-primary/5'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`p-3 rounded-full transition-colors ${
                          children.length === 0
                            ? 'bg-gray-300'
                            : 'bg-mcf-mint/20 group-hover:bg-mcf-mint/30'
                        }`}>
                          <User className={`h-6 w-6 ${children.length === 0 ? 'text-gray-500' : 'text-mcf-mint'}`} strokeWidth={2.5} />
                        </div>
                        <span className={`font-semibold text-sm ${children.length === 0 ? 'text-gray-500' : 'text-mcf-orange-dark'}`}>
                          Ajouter un proche
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  {children.length === 0 && (
                    <TooltipContent>
                      <p>Ajoutez d'abord un enfant pour pouvoir renseigner ses proches.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                
                {/* 3. Ajouter un animal - désactivé si pas d'enfant */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={children.length > 0 ? () => {
                        if (children.length === 1) {
                          navigate(`/ajouter-animal/${children[0].id}`);
                        } else {
                          navigate('/ajouter-animal');
                        }
                      } : undefined}
                      disabled={children.length === 0}
                      className={`group relative border-2 rounded-xl p-5 shadow-lg transition-all duration-300 ${
                        children.length === 0
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                          : 'bg-white border-mcf-secondary/30 hover:border-mcf-secondary hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-mcf-secondary/5 hover:to-mcf-cream/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`p-3 rounded-full transition-colors ${
                          children.length === 0
                            ? 'bg-gray-300'
                            : 'bg-mcf-secondary/20 group-hover:bg-mcf-secondary/30'
                        }`}>
                          <Heart className={`h-6 w-6 ${children.length === 0 ? 'text-gray-500' : 'text-mcf-secondary'}`} strokeWidth={2.5} />
                        </div>
                        <span className={`font-semibold text-sm ${children.length === 0 ? 'text-gray-500' : 'text-mcf-orange-dark'}`}>
                          Ajouter un animal
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  {children.length === 0 && (
                    <TooltipContent>
                      <p>Ajoutez d'abord un enfant pour pouvoir renseigner ses animaux de compagnie.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                
                {/* 4. Ajouter un lieu de vie - désactivé si pas d'enfant */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={children.length > 0 ? () => {
                        if (children.length === 1) {
                          navigate(`/ajouter-lieu/${children[0].id}`);
                        } else {
                          navigate('/ajouter-lieu');
                        }
                      } : undefined}
                      disabled={children.length === 0}
                      className={`group relative border-2 rounded-xl p-5 shadow-lg transition-all duration-300 ${
                        children.length === 0
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                          : 'bg-white border-mcf-orange/30 hover:border-mcf-orange hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-mcf-amber/5 hover:to-mcf-orange/5'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`p-3 rounded-full transition-colors ${
                          children.length === 0
                            ? 'bg-gray-300'
                            : 'bg-mcf-orange/20 group-hover:bg-mcf-orange/30'
                        }`}>
                          <Home className={`h-6 w-6 ${children.length === 0 ? 'text-gray-500' : 'text-mcf-orange'}`} strokeWidth={2.5} />
                        </div>
                        <span className={`font-semibold text-sm ${children.length === 0 ? 'text-gray-500' : 'text-mcf-orange-dark'}`}>
                          Ajouter un lieu
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  {children.length === 0 && (
                    <TooltipContent>
                      <p>Ajoutez d'abord un enfant pour pouvoir renseigner ses lieux de vie.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                
              </div>
            </TooltipProvider>
          </section>
          
          {/* Section 1: Children Profiles */}
          <section className="animate-fade-in">
            <div className="mb-6">
              <h2 className="flex items-center gap-3 text-3xl font-bold text-mcf-orange-dark">
                <div className="bg-gradient-to-br from-mcf-primary/20 to-mcf-mint/10 p-2.5 rounded-xl">
                  <Baby className="h-7 w-7 text-mcf-primary" strokeWidth={2.5} />
                </div>
                Mes enfants
              </h2>
              <div className="h-1 w-12 bg-gradient-to-r from-mcf-orange to-mcf-primary rounded-full mt-3 ml-1" />
            </div>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Card className="p-6 shadow-lg border-2">
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
                <Card className="p-6 shadow-lg border-2">
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
                  {children
                    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'fr'))
                    .map((child) => (
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
              <Card className="p-10 text-center bg-gradient-to-br from-mcf-primary/5 to-mcf-mint/10 border-2 border-dashed border-mcf-primary/40 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center gap-5">
                  <div className="p-6 rounded-full bg-mcf-primary/20">
                    <Baby className="h-16 w-16 text-mcf-primary" strokeWidth={2} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-mcf-orange-dark">
                      Vous n'avez pas encore ajouté de profil d'enfant
                    </p>
                    <p className="text-gray-600 text-base max-w-md mx-auto">
                      Créez le profil de votre enfant pour commencer à recevoir des histoires personnalisées.
                    </p>
                  </div>
                  <Button 
                    className="bg-mcf-primary hover:bg-mcf-primary/90 text-white gap-2 text-lg px-8 py-6 mt-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    onClick={() => navigate('/creer-profil-enfant')}
                  >
                    <Sparkles className="h-6 w-6" strokeWidth={2.5} /> Créer le profil de mon enfant
                  </Button>
                </div>
              </Card>
            )}
          </section>

          {/* Section: Ma famille - Affichage des proches */}
          {children.length > 0 && children.some(child => child.relatives && child.relatives.length > 0) && (
            <section className="animate-fade-in animation-delay-50">
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-3xl font-bold text-mcf-orange-dark">
                  <div className="bg-gradient-to-br from-mcf-mint/20 to-mcf-primary/10 p-2.5 rounded-xl">
                    <User className="h-7 w-7 text-mcf-mint" strokeWidth={2.5} />
                  </div>
                  Ma famille et mes proches
                </h2>
                <div className="h-1 w-12 bg-gradient-to-r from-mcf-mint to-mcf-primary rounded-full mt-3 ml-1" />
              </div>
              
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
                  
                  return Array.from(relativesMap.values())
                    .sort((a, b) => (a.relative.firstName || '').localeCompare(b.relative.firstName || '', 'fr'))
                    .map(({ relative, childrenNames, childrenIds }) => (
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
                className="gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all mt-4"
                onClick={() => navigate('/ajouter-proche')}
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} /> Ajouter un proche
              </Button>
            </section>
          )}

          {/* Section: Animaux de compagnie */}
          {children.length > 0 && children.some(child => child.pets && child.pets.length > 0) && (
            <section className="animate-fade-in animation-delay-75">
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-3xl font-bold text-mcf-orange-dark">
                  <div className="bg-gradient-to-br from-mcf-secondary/20 to-mcf-cream/20 p-2.5 rounded-xl">
                    <Heart className="h-7 w-7 text-mcf-secondary" strokeWidth={2.5} />
                  </div>
                  Nos animaux de compagnie
                </h2>
                <div className="h-1 w-12 bg-gradient-to-r from-mcf-secondary to-mcf-primary rounded-full mt-3 ml-1" />
              </div>
              
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
                  
                  return Array.from(petsMap.values())
                    .sort((a, b) => (a.pet.name || '').localeCompare(b.pet.name || '', 'fr'))
                    .map(({ pet, childrenNames, childrenIds }) => (
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
                className="gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all mt-4"
                onClick={() => {
                  if (children.length === 1) {
                    navigate(`/ajouter-animal/${children[0].id}`);
                  } else {
                    navigate('/ajouter-animal');
                  }
                }}
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} /> Ajouter un animal
              </Button>
            </section>
          )}

          {/* Section: Lieux de vie */}
          {children.length > 0 && children.some(child => child.places && child.places.length > 0) && (
            <section className="animate-fade-in animation-delay-85">
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-3xl font-bold text-mcf-orange-dark">
                  <div className="bg-gradient-to-br from-mcf-orange/20 to-mcf-amber/20 p-2.5 rounded-xl">
                    <Home className="h-7 w-7 text-mcf-orange" strokeWidth={2.5} />
                  </div>
                  Mes lieux de vie
                </h2>
                <div className="h-1 w-12 bg-gradient-to-r from-mcf-orange to-mcf-amber rounded-full mt-3 ml-1" />
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  // Grouper les lieux par leur ID pour éviter les doublons
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
                    .sort((a, b) => (a.place.label || '').localeCompare(b.place.label || '', 'fr'))
                    .map(({ place, childrenNames, childrenIds }) => (
                      <PlaceProfileCard 
                        key={place.id}
                        place={place}
                        childrenNames={childrenNames}
                        primaryChildId={childrenIds[0]}
                      />
                    ));
                })()}
              </div>
              
              {/* Bouton pour ajouter un lieu */}
              <Button 
                className="gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all mt-4"
                onClick={() => {
                  if (children.length === 1) {
                    navigate(`/ajouter-lieu/${children[0].id}`);
                  } else {
                    navigate('/ajouter-lieu');
                  }
                }}
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} /> Ajouter un lieu de vie
              </Button>
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
