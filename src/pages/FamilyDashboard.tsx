import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Home, HelpCircle, BookHeart, Users2 } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { supabase } from '@/integrations/supabase/client';
import { getRelativeAvatarAlert } from '@/utils/avatarAgeAlert';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickActionsSection from '@/components/familyDashboard/QuickActionsSection';
import MyFamilyTab from '@/components/familyDashboard/MyFamilyTab';
import MyStoriesTab from '@/components/familyDashboard/MyStoriesTab';
import ManageSubscription from '@/components/familyDashboard/ManageSubscription';

const FamilyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user, supabaseSession } = useAuth();
  
  useFamilyIdSync();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [isLoading, setIsLoading] = useState(true);
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
    birthDate?: string | null;
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

        const baseSelect = `
          id,
          first_name,
          birth_date,
          gender,
          created_at,
          family_id,
          user_id,
          avatar_url
        `;

        const qByUser = supabase.from('child_profiles').select(baseSelect).eq('user_id', userId);
        const qByFamily = userProfile?.family_id
          ? supabase.from('child_profiles').select(baseSelect).eq('family_id', userProfile.family_id)
          : null;

        const [{ data: byUser, error: errUser }, famRes] = await Promise.all([
          qByUser.order('created_at', { ascending: false }),
          qByFamily ? qByFamily.order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null })
        ] as const);

        if (errUser) console.error('❌ FamilyDashboard: child_profiles by user error', errUser);
        const byFamily = famRes?.data as any[] | undefined;
        if ((famRes as any)?.error) console.error('❌ FamilyDashboard: child_profiles by family error', (famRes as any).error);

        const rows = [...(byFamily || []), ...(byUser || [])];
        const seen = new Set<string>();
        const uniqueRows = rows.filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true)));

        console.log('▶︎ FamilyDashboard: children rows fetched', {
          byUser: byUser?.length || 0,
          byFamily: byFamily?.length || 0,
          totalUnique: uniqueRows.length,
        });

        const minimal = (uniqueRows || []).map((profile: any) => ({
          id: profile.id,
          firstName: profile.first_name || 'Enfant',
          age: profile.birth_date ? calculateExactAge(profile.birth_date) : '',
          avatar: profile.avatar_url || null as string | null,
          personalityEmoji: '🧒',
          relatives: [],
          pets: [],
          places: [],
          toysCount: 0,
          preferencesCount: 0,
          hasPets: 0,
          birthDate: profile.birth_date || null,
        }));
        setChildren(minimal);
        console.log('▶︎ FamilyDashboard: children set (minimal)', minimal.length);

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
                      emoji,
                      avatar_url
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
                      avatar,
                      avatar_url,
                      details
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
                supabase.from('child_superpowers').select('superpowers(label, emoji)').eq('child_id', profile.id),
                supabase.from('child_likes').select('likes(label, emoji)').eq('child_id', profile.id),
                supabase.from('child_challenges').select('challenges(label, emoji)').eq('child_id', profile.id),
                supabase.from('child_universes').select('universes(label, emoji)').eq('child_id', profile.id),
                supabase.from('child_discoveries').select('discoveries(label, emoji)').eq('child_id', profile.id),
              ]);

              const superpowers = superpowersRes.data || [];
              const likes = likesRes.data || [];
              const challenges = challengesRes.data || [];
              const universes = universesRes.data || [];
              const discoveries = discoveriesRes.data || [];

              const prefsTotal = superpowers.length + likes.length + challenges.length + universes.length + discoveries.length;

              const petsEnriched = (childPets || [])
                .map((cp: any) => {
                  const petInfo = cp.pets;
                  if (!petInfo) return null;
                  return {
                    id: petInfo.id,
                    name: cp.name || petInfo.name,
                    type: petInfo.type,
                    breed: petInfo.breed,
                    traits: cp.traits,
                    relationLabel: cp.relation_label,
                    emoji: petInfo.emoji,
                    avatar_url: petInfo.avatar_url,
                  };
                })
                .filter(Boolean);

              const relativesEnriched = (childFamilyMembers || [])
                .map((cfm: any) => {
                  const fm = cfm.family_members;
                  if (!fm) return null;
                  return {
                    id: fm.id,
                    firstName: fm.name,
                    type: fm.role,
                    nickname: cfm.relation_label,
                    avatar: fm.avatar,
                    avatar_url: fm.avatar_url,
                    details: fm.details,
                  };
                })
                .filter(Boolean);

              const placesEnriched = (childPlaces || [])
                .map((cp: any) => {
                  const placeInfo = cp.places;
                  if (!placeInfo) return null;
                  return {
                    id: placeInfo.id,
                    label: placeInfo.label,
                    type: placeInfo.type,
                    emoji: placeInfo.emoji,
                    address: placeInfo.address,
                    city: placeInfo.city,
                    country: placeInfo.country,
                    description: placeInfo.description,
                    details: placeInfo.details,
                  };
                })
                .filter(Boolean);

              setChildren((prev) =>
                prev.map((c) =>
                  c.id === profile.id
                    ? {
                        ...c,
                        relatives: relativesEnriched,
                        pets: petsEnriched,
                        places: placesEnriched,
                        toysCount: 0,
                        preferencesCount: prefsTotal,
                        hasPets: petsEnriched.length,
                      }
                    : c
                )
              );
            } catch (enrichmentError) {
              console.error('❌ FamilyDashboard: enrichment error for child', profile.id, enrichmentError);
            }
          })
        );
      } catch (error) {
        console.error('❌ FamilyDashboard: loadChildren error', error);
        toast.error("Erreur lors du chargement des profils enfants");
      } finally {
        setIsLoading(false);
      }
    };

    loadChildren();
  }, [supabaseSession]);

  // --- Age threshold notifications for relatives ---
  useEffect(() => {
    if (!supabaseSession?.user?.id || children.length === 0) return;

    const checkRelativeAgeThresholds = async () => {
      const session = supabaseSession;
      const allRelatives: Array<{ id: string; firstName: string; birthDate?: string | null; avatar_url?: string | null }> = [];
      for (const child of children) {
        if (!child.relatives) continue;
        for (const rel of child.relatives as any[]) {
          allRelatives.push({
            id: rel.id,
            firstName: rel.firstName || rel.name,
            birthDate: rel.details?.birthDate || null,
            avatar_url: rel.avatar_url || null,
          });
        }
      }

      if (allRelatives.length === 0) return;

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('family_id')
        .eq('id', session.user.id)
        .maybeSingle();
      const familyId = userProfile?.family_id || null;

      for (const relative of allRelatives) {
        const alert = getRelativeAvatarAlert(relative.firstName, relative.birthDate, relative.avatar_url);
        if (!alert.hasAlert) continue;

        await supabase.from('notifications').upsert(
          {
            user_id: session.user.id,
            title: `⏳ Le temps passe ! Actualise l'avatar de ${relative.firstName}.`,
            content: `Clique sur Modifier puis enregistre pour régénérer son avatar.`,
            type: 'age_threshold',
            link: '/family-dashboard',
            family_id: familyId,
            read: false,
          },
          { onConflict: 'user_id,type,title', ignoreDuplicates: true }
        );
      }
    };

    checkRelativeAgeThresholds();
  }, [children, supabaseSession?.user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-mcf-cream/20 to-white flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-7xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-14 w-96 mx-auto" />
              <Skeleton className="h-8 w-[600px] mx-auto" />
            </div>
            <Skeleton className="h-14 w-[400px] mx-auto" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-mcf-cream/20 to-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-mcf-orange-dark mb-4">
            Mon Espace Famille
          </h1>
          <p className="text-gray-700 text-xl font-medium">
            Gérez vos profils et suivez vos histoires personnalisées
          </p>
        </div>

        {/* Système d'onglets */}
        <Tabs defaultValue="family" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 bg-white border-2 border-mcf-mint/30 p-1 rounded-xl shadow-sm mb-12">
            <TabsTrigger 
              value="family" 
              className="rounded-lg data-[state=active]:bg-mcf-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-semibold flex items-center gap-2 text-base"
            >
              <Users2 className="h-5 w-5" strokeWidth={2.5} />
              Ma famille
            </TabsTrigger>
            <TabsTrigger 
              value="stories" 
              className="rounded-lg data-[state=active]:bg-mcf-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-semibold flex items-center gap-2 text-base"
            >
              <BookHeart className="h-5 w-5" strokeWidth={2.5} />
              Mes histoires
            </TabsTrigger>
          </TabsList>

          <TabsContent value="family" className="space-y-8 animate-fade-in">
            {/* Actions rapides */}
            <QuickActionsSection 
              childrenCount={children.length}
              firstChildId={children.length === 1 ? children[0].id : undefined}
            />
            
            <MyFamilyTab children={children} />
          </TabsContent>

          <TabsContent value="stories" className="space-y-8 animate-fade-in">
            <MyStoriesTab children={children} />
          </TabsContent>
        </Tabs>

        {/* Gestion abonnement */}
        <div className="mt-12 pt-8 border-t-2 border-mcf-mint/30">
          <ManageSubscription />
        </div>

        {/* Actions du footer */}
        <div className="mt-12 pb-8 border-t-2 border-mcf-mint/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-2 border-mcf-primary/30 text-mcf-primary hover:bg-mcf-primary/5 gap-2 font-semibold rounded-xl hover:scale-105 transition-all"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" /> Retour à l'accueil
            </Button>
            
            <Button 
              variant="outline" 
              className="border-2 border-mcf-orange/30 text-white hover:bg-mcf-orange/5 gap-2 font-semibold rounded-xl hover:scale-105 transition-all"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 text-white" /> Déconnexion
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-mcf-primary hover:bg-mcf-mint/20 gap-2 font-semibold rounded-xl"
            onClick={() => navigate('/contact')}
          >
            <HelpCircle className="h-4 w-4" /> Besoin d'aide ?
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FamilyDashboard;
