import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { Sparkles, Gift, Check, Star, Heart, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Abonnement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, hasActiveSubscription, supabaseSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [subscribedChildIds, setSubscribedChildIds] = useState<string[]>([]);
  
  const checkoutOpeningRef = useRef(false);
  
  const isFromAdventure = searchParams.get('context') === 'adventure';
  
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
        return;
      }

      const userId = supabaseSession.user.id;
      console.log('▶︎ Abonnement.load: fetch user_profile and children for', userId);

      // 1) Charger les enfants (par user_id ET par family_id si dispo)
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
      }

      // 2) Vérifier les abonnements actifs (enfant par enfant, si renvoyé)
      try {
        const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription', {
          headers: { Authorization: `Bearer ${supabaseSession.access_token}` },
        });
        if (subError) {
          console.error('❌ Abonnement.load: check-subscription error', subError);
          setSubscribedChildIds([]);
        } else {
          const ids = Array.isArray(subData?.subscriptions)
            ? subData.subscriptions.map((s: any) => s?.child_id).filter(Boolean)
            : [];
          console.log('▶︎ Abonnement.load: subscriptions child_ids', ids);
          setSubscribedChildIds(ids);
        }
      } catch (e) {
        console.error('❌ Abonnement.load: subscription check error', e);
        setSubscribedChildIds([]);
      }
    };
    load();
  }, [isAuthenticated, supabaseSession?.access_token]);
  
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
        // Ouvrir Stripe dans un nouvel onglet pour éviter de bloquer l'app en cas d'échec
        const win = window.open(data.url, '_blank', 'noopener,noreferrer');
        if (!win) {
          // Ne pas forcer la redirection de l'onglet courant pour éviter de "casser" l'état global
          toast.info("Le paiement n'a pas pu s'ouvrir (popup bloquée). Autorisez les popups, puis réessayez.");
        } else {
          toast.success('Redirection vers Stripe ouverte dans un nouvel onglet');
        }
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
                  {children.length === 0 ? (
                    <p className="text-muted-foreground">Vous n'avez pas encore ajouté d'enfant.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {children.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedChildId(c.id)}
                          className={`px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105 font-semibold ${
                            selectedChildId === c.id 
                              ? 'bg-mcf-primary text-white border-mcf-primary shadow-lg' 
                              : 'bg-white hover:bg-mcf-mint/20 border-mcf-mint text-mcf-primary'
                          }`}
                        >
                          <span>{c.first_name}</span>
                          {subscribedChildIds.includes(c.id) && (
                            <span className="ml-2 text-xs font-semibold">✓ Déjà abonné</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    L'abonnement est lié à l'enfant sélectionné.
                  </p>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Formule mensuelle */}
              <Card className="relative overflow-hidden border-2 border-mcf-mint/30 hover:border-mcf-mint transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group animate-fade-in animation-delay-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-mint/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="pt-10 pb-8 flex flex-col h-full relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-mint/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-mcf-secondary" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-mcf-primary">Abonnement mensuel</h2>
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
                        <span className="text-mcf-secondary text-lg">•</span>
                        <span>Au bout de 3 ans : un livre magique retraçant les 3 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-mcf-secondary text-lg">•</span>
                        <span>Au bout de 6 ans : un livre magique retraçant les 6 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-mcf-secondary text-lg">•</span>
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
                    <Sparkles className="w-5 h-5" />
                    {isLoading ? 'Chargement...' : 'Choisir cette formule'}
                  </button>
                </CardContent>
              </Card>
              
              {/* Formule annuelle */}
              <Card className="relative overflow-hidden border-2 border-mcf-secondary/30 hover:border-mcf-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group animate-fade-in animation-delay-200">
                <div className="absolute top-0 left-0 bg-gradient-to-r from-mcf-mint to-mcf-secondary text-white font-bold py-2 px-6 rounded-br-xl shadow-lg flex items-center gap-2 z-20">
                  <Star className="w-4 h-4" strokeWidth={3} />
                  2 MOIS OFFERTS
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-secondary/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="pt-16 pb-8 flex flex-col h-full relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-secondary/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Gift className="w-8 h-8 text-mcf-secondary" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-mcf-primary">Abonnement annuel</h2>
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
                      <span className="text-base">2 mois gratuit</span>
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
                        <span className="text-mcf-secondary text-lg">•</span>
                        <span>Au bout de 3 ans : un livre magique retraçant les 3 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-mcf-secondary text-lg">•</span>
                        <span>Au bout de 6 ans : un livre magique retraçant les 6 ans d'aventure de votre enfant offert</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-mcf-secondary text-lg">•</span>
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
                    <Sparkles className="w-5 h-5" />
                    {isLoading ? 'Chargement...' : 'Choisir cette formule'}
                  </button>
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