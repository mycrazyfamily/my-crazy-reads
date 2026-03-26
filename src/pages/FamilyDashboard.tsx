import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Home, HelpCircle, BookHeart, Users2 } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { useFamilyData } from '@/hooks/useFamilyData';
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
  const { logout, supabaseSession } = useAuth();
  
  useFamilyIdSync();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: children = [], isLoading } = useFamilyData();

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
            link: '/espace-famille',
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

        <div className="mt-12 pt-8 border-t-2 border-mcf-mint/30">
          <ManageSubscription />
        </div>

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
