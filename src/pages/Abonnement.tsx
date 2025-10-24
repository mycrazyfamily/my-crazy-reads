import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';

const Abonnement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, hasActiveSubscription, supabaseSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [subscribedChildIds, setSubscribedChildIds] = useState<string[]>([]);
  
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

    setIsLoading(true);
    console.log('▶︎ Abonnement.checkout: initiation', { plan, childId: selectedChildId });
    
    try {
      const priceId = SUBSCRIPTION_PLANS[plan].priceId;

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
          // Fallback si le bloqueur de popups empêche l'ouverture
          toast.info("Le paiement s'ouvre dans un nouvel onglet. Si rien ne s'ouvre, autorisez les popups et réessayez.");
          window.location.assign(data.url);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-mcf-primary animate-fade-in">
            {isFromAdventure ? "Prêt à démarrer l'aventure" : "Nos formules d'abonnement"}
          </h1>
          
          <div className="max-w-5xl mx-auto mt-8">
            {/* Sélection de l'enfant à abonner */}
            {isAuthenticated && (
              <div className="mb-8 p-4 border rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-3 text-mcf-primary">Sélectionnez l'enfant à abonner</h2>
                {children.length === 0 ? (
                  <p className="text-muted-foreground">Vous n'avez pas encore ajouté d'enfant.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {children.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChildId(c.id)}
                        className={`px-4 py-2 rounded-full border transition ${
                          selectedChildId === c.id ? 'bg-mcf-primary text-white border-mcf-primary' : 'bg-white hover:bg-mcf-mint border-mcf-mint'
                        }`}
                      >
                        <span>{c.first_name}</span>
                        {subscribedChildIds.includes(c.id) && (
                          <span className="ml-2 text-xs font-semibold text-mcf-secondary">Déjà abonné</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">L'abonnement est lié à l'enfant sélectionné.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Formule mensuelle */}
              <div 
                className="border rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-all duration-300 animate-fade-in animation-delay-100 border-mcf-mint hover:border-mcf-primary/50 flex flex-col"
              >
                <h2 className="text-2xl font-bold mb-3 text-mcf-primary">Abonnement mensuel</h2>
                <p className="text-3xl font-bold mb-4 text-mcf-secondary">19,99€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Sans engagement de durée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Livraison incluse</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPlan('monthly')}
                  disabled={isLoading}
                  className={`w-full bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg text-base mt-auto ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Chargement...' : 'Choisir cette formule'}
                </button>
              </div>
              
              {/* Formule annuelle */}
              <div 
                className="border rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-all duration-300 animate-fade-in animation-delay-200 border-mcf-secondary hover:border-mcf-secondary/70 flex flex-col"
              >
                <div className="text-sm font-bold py-1 px-3 rounded-full inline-block mb-3 bg-mcf-mint text-mcf-primary">
                  ÉCONOMIE DE 20%
                </div>
                <h2 className="text-2xl font-bold mb-3 text-mcf-primary">Abonnement annuel</h2>
                <p className="text-3xl font-bold mb-4 text-mcf-secondary">219,99€<span className="text-base font-normal text-muted-foreground">/an</span></p>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Cadeau de bienvenue offert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>1 mois gratuit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Livraison incluse</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPlan('yearly')}
                  disabled={isLoading}
                  className={`w-full bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg text-base mt-auto ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Chargement...' : 'Choisir cette formule'}
                </button>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-3 text-mcf-primary">Vous souhaitez offrir un livre unique ?</h3>
              <button 
                onClick={() => navigate('/offrir-livre')}
                className="inline-flex items-center bg-white border-2 border-mcf-secondary hover:bg-mcf-mint text-mcf-primary font-bold py-2 px-6 rounded-full transition-all duration-300 hover:scale-105"
              >
                Découvrir nos livres cadeaux
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Abonnement;