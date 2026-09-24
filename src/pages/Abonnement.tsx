// Abonnement v1.3
// Changelog v1.3 (chantier F) : deux changements, pour que l'enfant suive le parent d'un bout
//   a l'autre du parcours d'abonnement.
//   [1] PRESELECTION PAR L'URL. `?child=<id>` presselectionne l'enfant, a condition qu'il
//       appartienne a la famille (present dans la liste chargee) et ne soit pas deja abonne.
//       Le bouton « S'abonner » de la carte enfant (ChildProfileCard v2.5) passe ce parametre :
//       le parent qui clique sous la carte de Lea n'a plus qu'a choisir mensuel ou annuel.
//       Un choix manuel n'est jamais ecrase (on ne presselectionne que si rien n'est choisi).
//       Pas de verrou « une seule fois » : au chargement, l'authentification peut arriver apres
//       un premier passage avec une liste vide, et un verrou aurait perdu la preselection.
//   [2] L'ENFANT EST MEMORISE AVANT LE DEPART VERS STRIPE. Juste avant la redirection, on
//       ecrit { id, prenom, at } dans le sessionStorage, cle CLE_ENFANT_PAIEMENT. Stripe ne
//       renvoie que session_id a la page de confirmation, et create-checkout, fonction
//       protegee, n'est pas modifiee. Le sessionStorage survit a l'aller-retour vers Stripe
//       dans le meme onglet. ConfirmationAbonnement v1.7 le relit pour nommer l'enfant sur
//       son bouton et ouvrir Mes histoires sur lui. Si le stockage est indisponible, rien ne
//       casse : la confirmation retombe sur son libelle generique.
//       La cle est ecrite en toutes lettres dans les deux fichiers, sans module partage, pour
//       que chacun puisse etre deploye seul. Toute modification doit toucher les deux.
// Abonnement v1.2
// Changelog v1.2 (chantier icones IA, lot 1) : retrait de l'icone Sparkles de lucide-react.
//   [1] ligne « L'abonnement est lie a l'enfant selectionne » -> Info. C'est une note
//       d'information, l'etoile n'y portait aucun sens.
//   [2] les DEUX boutons « Choisir cette formule » : icone SUPPRIMEE sans remplacement. Elle
//       etait decorative, et sur un bouton de paiement une etiquette « genere par IA » est
//       exactement ce qu'il ne faut pas montrer. Le `gap-2` du conteneur reste sans effet
//       visible avec un seul enfant.
// Abonnement v1.1
// Changelog v1.1 (C8 + C9, MOBILE) :
//   C8 — ALIGNEMENT. Le contenu des deux cartes héritait d'un centrage venant du composant Card
//     (même cause qu'en C6 sur NosHistoires). L'effet est trompeur : un texte court tient sur une
//     ligne et paraît aligné à gauche, un texte long passe à la ligne et se centre. D'où trois
//     alignements différents dans la même carte — titre centré, prix centré, liste à puces alignée
//     à gauche puis centrée sur les lignes suivantes. `text-left` est désormais forcé sur les deux
//     CardContent. Correction locale, plutôt que de modifier le composant Card partagé.
//     Le titre passe aussi en text-xl sur mobile (et l'icône à 56px) pour tenir sur UNE ligne à
//     côté de l'icône, au lieu de se casser en deux.
//     Les puces « • » en text-lg face à un texte en text-sm sont remplacées par de vraies
//     pastilles rondes, alignées sur la première ligne.
//   C9 — VISIBILITÉ DE LA CARTE MENSUELLE. Elle utilisait border-mcf-mint/30 : mcf-mint est un
//     vert très clair (#D7F5E9), à 30% d'opacité sur fond blanc la bordure était quasi invisible,
//     alors que la carte annuelle utilise mcf-secondary (#7BC5AE), nettement plus contrasté. Sur
//     une page de paiement, les deux offres doivent être lisibles comme deux encarts distincts.
//     Désormais : mensuel en mcf-secondary/40 + ombre marquée (clairement une carte), annuel en
//     mcf-secondary pleine opacité + ombre plus forte + son badge (clairement l'offre mise en
//     avant). La hiérarchie est conservée, mais les deux encarts existent visuellement.
//   Desktop : alignement et tailles d'origine restaurés dès md: ; les bordures changent aussi sur
//   desktop, c'est volontaire (le déséquilibre existait aussi, en moins gênant).
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { Info, Gift, Check, Star, Heart, Zap, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFirstDeliveryMonth } from '@/utils/deliveryMonth';

const SUBSCRIPTION_CACHE_KEY = 'mcf_subscription_status';

// v1.3 [2] : enfant en cours de paiement, relu par ConfirmationAbonnement v1.7.
// MEME CLE, ECRITE EN DUR, DANS LES DEUX FICHIERS : en changer une, changer l'autre.
const CLE_ENFANT_PAIEMENT = 'mcf_checkout_child';
const SUBSCRIPTION_CACHE_TTL_MS = 5 * 60 * 1000;

const readSubscriptionCache = (userId: string): string[] | null => {
  try {
    const raw = sessionStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId: string; ids: string[]; ts: number };
    if (parsed.userId !== userId) return null;
    if (Date.now() - parsed.ts > SUBSCRIPTION_CACHE_TTL_MS) return null;
    return Array.isArray(parsed.ids) ? parsed.ids : null;
  } catch {
    return null;
  }
};

const writeSubscriptionCache = (userId: string, ids: string[]) => {
  try {
    sessionStorage.setItem(
      SUBSCRIPTION_CACHE_KEY,
      JSON.stringify({ userId, ids, ts: Date.now() })
    );
  } catch {
    /* ignore */
  }
};

const Abonnement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, hasActiveSubscription, supabaseSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [children, setChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [subscribedChildIds, setSubscribedChildIds] = useState<string[]>([]);
  const [isCheckingSubscriptions, setIsCheckingSubscriptions] = useState(false);
  
  const checkoutOpeningRef = useRef(false);
  
  const isFromAdventure = searchParams.get('context') === 'adventure';

  const firstDeliveryMonth = getFirstDeliveryMonth();
  
  // Assure que le user_profile possède bien un family_id si possible
  useFamilyIdSync();
  
  useEffect(() => {
    if (isAuthenticated && hasActiveSubscription) {
      console.log("▶︎ Abonnement: user has at least one active subscription - UI remains accessible for per-enfant selection");
    }
  }, [isAuthenticated, hasActiveSubscription, navigate]);
  
  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !supabaseSession) {
        console.log('▶︎ Abonnement.load: not authenticated or no session');
        setIsLoadingChildren(false);
        return;
      }

      const userId = supabaseSession.user.id;
      console.log('▶︎ Abonnement.load: fetch user_profile and children for', userId);

      // 1) Charger les enfants (par user_id ET par family_id si dispo)
      setIsLoadingChildren(true);
      try {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', userId)
          .maybeSingle();
        if (userProfileError) {
          console.error('❌ Abonnement.load: user_profile error', userProfileError);
        } else {
          console.log('▶︎ Abonnement.load: user_profile', userProfile);
        }

        const baseSelect = 'id, first_name, created_at, family_id, user_id';
        const qByUser = supabase
          .from('child_profiles')
          .select(baseSelect)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        const qByFamily = userProfile?.family_id
          ? supabase
              .from('child_profiles')
              .select(baseSelect)
              .eq('family_id', userProfile.family_id)
              .order('created_at', { ascending: false })
          : null;

        const [{ data: byUser, error: errUser }, famRes] = await Promise.all([
          qByUser,
          qByFamily ? qByFamily : Promise.resolve({ data: [], error: null } as any),
        ] as const);

        if (errUser) console.error('❌ Abonnement.load: child_profiles by user error', errUser);
        const byFamily = (famRes as any)?.data as any[] | undefined;
        if ((famRes as any)?.error) console.error('❌ Abonnement.load: child_profiles by family error', (famRes as any).error);

        const rows = [...(byFamily || []), ...(byUser || [])];
        const seen = new Set<string>();
        const uniqueRows = rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
        console.log('▶︎ Abonnement.load: children rows fetched', {
          byUser: byUser?.length || 0,
          byFamily: byFamily?.length || 0,
          totalUnique: uniqueRows.length,
        });

        setChildren(uniqueRows.map((r) => ({ id: r.id, first_name: r.first_name })));
      } catch (e) {
        console.error('❌ Abonnement.load: children load error', e);
        // Ne pas vider les enfants si une autre étape échoue
      } finally {
        setIsLoadingChildren(false);
      }

      // 2) Vérifier les abonnements actifs (enfant par enfant, si renvoyé)
      const cached = readSubscriptionCache(userId);
      if (cached) {
        console.log('▶︎ Abonnement.load: using cached subscription status', cached);
        setSubscribedChildIds(cached);
        setIsCheckingSubscriptions(false);
      } else {
        setIsCheckingSubscriptions(true);
      }

      try {
        const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription', {
          headers: { Authorization: `Bearer ${supabaseSession.access_token}` },
        });
        if (subError) {
          console.error('❌ Abonnement.load: check-subscription error', subError);
          if (!cached) setSubscribedChildIds([]);
        } else {
          const ids = Array.isArray(subData?.subscriptions)
            ? subData.subscriptions.map((s: any) => s?.child_id).filter(Boolean)
            : [];
          console.log('▶︎ Abonnement.load: subscriptions child_ids', ids);
          writeSubscriptionCache(userId, ids);
          setSubscribedChildIds((prev) => {
            const same = prev.length === ids.length && prev.every((id) => ids.includes(id));
            return same ? prev : ids;
          });
        }
      } catch (e) {
        console.error('❌ Abonnement.load: subscription check error', e);
        if (!cached) setSubscribedChildIds([]);
      } finally {
        setIsCheckingSubscriptions(false);
      }
    };
    load();
  }, [isAuthenticated, supabaseSession?.access_token]);
  
  // v1.3 [1] : presselection de l'enfant transmis par la carte enfant (?child=<id>).
  // Place apres toutes les declarations d'etat qu'il lit (children, selectedChildId,
  // subscribedChildIds) : un hook qui lit un etat declare plus bas plante au montage.
  const enfantDemande = searchParams.get('child');
  useEffect(() => {
    if (!enfantDemande || selectedChildId) return;
    // Enfant inconnu (autre famille, supprime, liste pas encore chargee) : on attend ou on ignore.
    if (!children.some((c) => c.id === enfantDemande)) return;
    // Deja abonne : rien a presselectionner, la pastille verte le signale deja.
    if (subscribedChildIds.includes(enfantDemande)) return;
    setSelectedChildId(enfantDemande);
  }, [enfantDemande, children, subscribedChildIds, selectedChildId]);

  const handleSelectPlan = async (plan: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      localStorage.setItem('mcf_subscription_option', plan);
      toast.info("Veuillez vous connecter ou créer un compte pour continuer");
      navigate('/authentification', { 
        state: { from: { pathname: '/abonnement' } } 
      });
      return;
    }

    if (!supabaseSession) {
      toast.error("Session invalide. Veuillez vous reconnecter.");
      return;
    }

    if (!selectedChildId) {
      toast.info("Sélectionnez d'abord l'enfant à abonner.");
      return;
    }

    if (subscribedChildIds.includes(selectedChildId)) {
      toast.info("Cet enfant est déjà abonné.");
      return;
    }

    // Empêche les doubles déclenchements (double-clic, re-render)
    if (checkoutOpeningRef.current) {
      toast.info('Une redirection de paiement est déjà en cours.');
      return;
    }
    checkoutOpeningRef.current = true;

    setIsLoading(true);
    console.log('▶︎ Abonnement.checkout: initiation', { plan, childId: selectedChildId });
    
    try {
      const priceId = SUBSCRIPTION_PLANS[plan].priceId;
      const planDetails = SUBSCRIPTION_PLANS[plan];
      console.log('▶︎ Abonnement.checkout: priceId details', { 
        plan, 
        priceId, 
        expectedPrice: planDetails.price,
        expectedInterval: planDetails.interval 
      });

      const invokePromise = supabase.functions.invoke('create-checkout', {
        body: { priceId, childId: selectedChildId },
        headers: {
          Authorization: `Bearer ${supabaseSession.access_token}`,
        },
      });
      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('timeout') }), 15000)
      );

      const { data, error } = await Promise.race([invokePromise as any, timeoutPromise]);

      if (error) {
        console.error('❌ Abonnement.checkout: error', error);
        if ((error as Error).message === 'timeout') {
          toast.error("Le service de paiement met trop de temps à répondre. Réessayez dans un instant.");
        } else {
          toast.error("Une erreur est survenue lors de la création de la session de paiement.");
        }
        return;
      }

      console.log('▶︎ Abonnement.checkout: session created', data);
      if (data?.url) {
        // v1.3 [2] : memoriser l'enfant pour la page de confirmation (retour de Stripe).
        try {
          const enfant = children.find((c) => c.id === selectedChildId);
          sessionStorage.setItem(
            CLE_ENFANT_PAIEMENT,
            JSON.stringify({ id: selectedChildId, prenom: enfant?.first_name ?? null, at: Date.now() })
          );
        } catch {
          /* stockage indisponible : la confirmation affichera son libelle generique */
        }
        // Rediriger Stripe dans le même onglet
        window.location.href = data.url;
      } else {
        toast.error("Impossible d'ouvrir le paiement. Réessayez.");
      }
    } catch (error) {
      console.error('❌ Abonnement.checkout: unexpected error', error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      checkoutOpeningRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Titre principal */}
            <div className="mb-12 text-center">
              <h1 className="text-5xl font-bold text-mcf-orange-dark mb-4">
                Choisissez votre abonnement
              </h1>
              <p className="text-gray-700 text-xl font-medium">
                Recevez chaque mois une histoire personnalisée pour votre enfant
              </p>
            </div>

            {/* Sélection de l'enfant à abonner */}
            {isAuthenticated && (
              <Card className="mb-12 border-2 border-mcf-mint/30 shadow-lg animate-fade-in">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-mcf-mint/30 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-mcf-secondary" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-mcf-primary">Sélectionnez l'enfant à abonner</h2>
                  </div>
                  {isLoadingChildren ? (
                    <div className="flex flex-wrap gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-32 rounded-full" />
                      ))}
                    </div>
                  ) : children.length === 0 ? (
                    <p className="text-muted-foreground">Vous n'avez pas encore ajouté d'enfant.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {isCheckingSubscriptions && subscribedChildIds.length === 0
                        ? children.map((c) => (
                            <Skeleton
                              key={c.id}
                              className="h-12 w-32 rounded-full"
                            />
                          ))
                        : children.map((c) => {
                        const isSubscribed = subscribedChildIds.includes(c.id);
                        const isSelected = selectedChildId === c.id;
                        const baseClasses = isSubscribed
                          ? 'bg-green-100 border-green-400 text-green-700 hover:bg-green-100'
                          : isSelected
                            ? 'bg-mcf-primary text-white border-mcf-primary shadow-lg'
                            : 'bg-white hover:bg-mcf-mint/20 border-mcf-mint text-mcf-primary';
                        return (
                          <button
                            key={c.id}
                            onClick={() => setSelectedChildId(c.id)}
                            className={`px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105 font-semibold inline-flex items-center gap-2 ${baseClasses}`}
                          >
                            <span>{c.first_name}</span>
                            {isSubscribed && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    L'abonnement est lié à l'enfant sélectionné.
                  </p>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Formule mensuelle */}
              <Card className="relative overflow-hidden border-2 border-mcf-secondary/40 shadow-lg hover:border-mcf-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group animate-fade-in animation-delay-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-mint/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="pt-10 pb-8 flex flex-col h-full relative z-10 text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-mcf-mint/30 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7 md:w-8 md:h-8 text-mcf-secondary" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-xl md:text-3xl font-bold text-mcf-primary leading-tight">Abonnement mensuel</h2>
                  </div>
                  <p className="text-4xl font-bold mb-6 text-mcf-secondary">
                    29,99€<span className="text-lg font-normal text-muted-foreground">/mois</span>
                  </p>
                  <ul className="space-y-4 mb-8 flex-grow">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-base">Un livre personnalisé chaque mois</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-base">Sans engagement de durée</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-base">Livraison incluse</span>
                    </li>
                  </ul>
                  <div className="mb-8 p-6 bg-gradient-to-br from-mcf-mint/20 to-mcf-mint/10 rounded-xl border-2 border-mcf-mint/30">
                    <h3 className="font-bold text-mcf-primary mb-4 flex items-center gap-2 text-lg">
                      <Gift className="w-5 h-5" strokeWidth={2.5} />
                      Cadeaux de fidélité
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                        <span>Au bout de 3 ans : un livre magique retraçant les 3 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                        <span>Au bout de 6 ans : un livre magique retraçant les 6 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                        <span>Au bout de 10 ans : une BD magique retraçant les 10 ans d'aventure de votre enfant offerte</span>
                      </li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleSelectPlan('monthly')}
                    disabled={isLoading}
                    className={`w-full bg-mcf-primary hover:bg-mcf-primary/90 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl text-lg mt-auto flex items-center justify-center gap-2 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Chargement...' : 'Choisir cette formule'}
                  </button>
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Votre premier livre sera livré début {firstDeliveryMonth}
                  </p>
                </CardContent>
              </Card>
              
              {/* Formule annuelle */}
              <Card className="relative overflow-hidden border-2 border-mcf-secondary shadow-xl hover:border-mcf-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group animate-fade-in animation-delay-200">
                <div className="absolute top-0 left-0 bg-gradient-to-r from-mcf-mint to-mcf-secondary text-white font-bold py-2 px-6 rounded-br-xl shadow-lg flex items-center gap-2 z-20">
                  <Star className="w-4 h-4" strokeWidth={3} />
                  2 MOIS OFFERTS
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-secondary/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="pt-16 pb-8 flex flex-col h-full relative z-10 text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-mcf-secondary/30 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Gift className="w-7 h-7 md:w-8 md:h-8 text-mcf-secondary" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-xl md:text-3xl font-bold text-mcf-primary leading-tight">Abonnement annuel</h2>
                  </div>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-mcf-secondary">
                      299,99€<span className="text-lg font-normal text-muted-foreground">/an</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">soit 24,99€/mois</p>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-base">Un livre personnalisé chaque mois</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-base">Cadeau de bienvenue offert</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-base">2 mois offerts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-base">Livraison incluse</span>
                    </li>
                  </ul>
                  <div className="mb-8 p-6 bg-gradient-to-br from-mcf-mint/20 to-mcf-mint/10 rounded-xl border-2 border-mcf-mint/30">
                    <h3 className="font-bold text-mcf-primary mb-4 flex items-center gap-2 text-lg">
                      <Gift className="w-5 h-5" strokeWidth={2.5} />
                      Cadeaux de fidélité
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                        <span>Au bout de 3 ans : un livre magique retraçant les 3 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                        <span>Au bout de 6 ans : un livre magique retraçant les 6 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                        <span>Au bout de 10 ans : une BD magique retraçant les 10 ans d'aventure de votre enfant offerte</span>
                      </li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleSelectPlan('yearly')}
                    disabled={isLoading}
                    className={`w-full bg-mcf-primary hover:bg-mcf-primary/90 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl text-lg mt-auto flex items-center justify-center gap-2 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Chargement...' : 'Choisir cette formule'}
                  </button>
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Votre premier livre sera livré début {firstDeliveryMonth}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Abonnement;
