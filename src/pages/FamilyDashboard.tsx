// FamilyDashboard v1.2
// Changelog v1.2 (chantier F, retour #1 du test du 26/08) : ONGLETS LISIBLES ET SANS CHEVAUCHEMENT.
//   Mesure des contrastes de la v1.1 sur fond blanc : texte de l'onglet inactif « Mes histoires »
//   (vert mcf-secondary a 70 %) 1,6:1 ; texte blanc sur l'onglet actif vert 2,0:1 ; texte de
//   l'onglet inactif « Ma famille » (bleu a 70 %) 2,3:1. Le seuil de lisibilite courant est
//   4,5:1. D'ou le retour : sur « Ma famille », on ne voyait pas « Mes histoires ».
//   Correctifs, valides sur maquette :
//   [1] conteneur en gris franc (bg-gray-100), sans bordure mint : les onglets blancs s'en
//       detachent nettement ;
//   [2] onglet INACTIF : fond blanc, bordure pleine, texte fonce (bleu #0A68DB 5,2:1, vert
//       #2A6F5A 6,0:1), survol teinte. Il a l'air d'un bouton ;
//   [3] onglet ACTIF vert : #358D72 au lieu de mcf-secondary, texte blanc a 4,0:1 au lieu de
//       2,0:1. Le bleu actif (mcf-primary) ne change pas ;
//   [4] suppression de l'agrandissement de l'onglet actif (scale 1.03), cause du
//       chevauchement : il debordait sur son voisin dans une grille sans ecart. Un ecart
//       gap-3 separe desormais les onglets.
//   Le survol ne s'applique qu'a l'onglet inactif (data-[state=inactive]:hover), pour ne pas
//   delaver l'onglet actif. Couleurs en valeurs arbitraires, comme ailleurs dans le projet
//   (ChildProfileCard) : aucun nouveau jeton dans tailwind.config.ts.
// FamilyDashboard v1.1
// Changelog v1.1 (chantier F) : DEUX CHANGEMENTS.
//   [1] ONGLET IMPOSABLE PAR L'URL. `?tab=stories` ouvre « Mes histoires ». Utilise au
//       retour de paiement pour que le parent tombe sur ses livres a venir. Par defaut,
//       « Ma famille » comme avant.
//   [2] ONGLETS RENDUS VISIBLES. Test utilisateur du 24/08 : la testeuse ne voyait pas
//       qu'il y avait deux onglets. Deux causes cumulees. Le bloc etait etroit, 448 px
//       centres sous un titre en 48 px, donc noye. Et l'onglet INACTIF etait blanc sur
//       fond blanc, sans bordure : rien n'indiquait qu'il etait cliquable.
//       Correctifs : bloc elargi a 672 px et epaissi (h-14 -> h-20), fond legerement
//       teinte pour le detacher, texte en text-lg gras, icones en 24 px, et surtout
//       l'onglet inactif recoit un fond blanc sur conteneur teinte, une bordure coloree
//       et une couleur de texte : il existe visuellement comme un bouton. L'onglet actif
//       gagne un leger agrandissement et une ombre portee pour rester distinct.
//       Pas de compteur sur l'onglet, ecarte explicitement.
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

  // v1.1 (chantier F) : l'onglet ouvert peut etre impose par l'URL, ?tab=stories.
  // Sert au retour de paiement : ConfirmationAbonnement v1.6 y renvoie pour que le parent
  // tombe directement sur ses livres a venir, et non sur la liste de ses profils.
  // Valeur par defaut inchangee, « Ma famille », qui reste le bon accueil apres la
  // creation d'un enfant (useChildProfileSubmit, chantier F).
  const [searchParams] = useSearchParams();
  const ongletInitial = searchParams.get('tab') === 'stories' ? 'stories' : 'family';
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

        <Tabs defaultValue={ongletInitial} className="space-y-8">
          {/* v1.2 [1] : conteneur gris franc, ecart entre les onglets. */}
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 gap-3 h-20 bg-gray-100 p-2 rounded-2xl mb-12">
            <TabsTrigger 
              value="family" 
              className="rounded-xl h-full bg-white border-2 border-mcf-primary text-[#0A68DB] shadow-sm data-[state=inactive]:hover:bg-mcf-primary/10 data-[state=active]:bg-mcf-primary data-[state=active]:text-white data-[state=active]:border-mcf-primary data-[state=active]:shadow-md transition-colors font-bold flex items-center gap-2 text-lg"
            >
              <Users2 className="h-6 w-6" strokeWidth={2.5} />
              Ma famille
            </TabsTrigger>
            <TabsTrigger 
              value="stories" 
              className="rounded-xl h-full bg-white border-2 border-[#358D72] text-[#2A6F5A] shadow-sm data-[state=inactive]:hover:bg-[#358D72]/10 data-[state=active]:bg-[#358D72] data-[state=active]:text-white data-[state=active]:border-[#358D72] data-[state=active]:shadow-md transition-colors font-bold flex items-center gap-2 text-lg"
            >
              <BookHeart className="h-6 w-6" strokeWidth={2.5} />
              Mes histoires
            </TabsTrigger>
          </TabsList>

          <TabsContent value="family" className="space-y-8 animate-fade-in">
            <QuickActionsSection 
              childrenCount={children.length}
              firstChildId={children.length === 1 ? children[0].id : undefined}
            />
            <MyFamilyTab children={children} />
            <div className="mt-12 pt-8 border-t-2 border-mcf-mint/30">
              <ManageSubscription familyChildren={children} />
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-8 animate-fade-in">
            <MyStoriesTab children={children} />
          </TabsContent>
        </Tabs>

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
