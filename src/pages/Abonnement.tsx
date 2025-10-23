import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Abonnement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, hasActiveSubscription, supabaseSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFromAdventure = searchParams.get('context') === 'adventure';
  
  useEffect(() => {
    if (isAuthenticated && hasActiveSubscription) {
      toast.info("Vous êtes déjà abonné! Redirection vers votre espace famille.");
      navigate('/espace-famille');
    }
  }, [isAuthenticated, hasActiveSubscription, navigate]);
  
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

    setIsLoading(true);
    
    try {
      const priceId = SUBSCRIPTION_PLANS[plan].priceId;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${supabaseSession.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast.error("Une erreur est survenue lors de la création de la session de paiement.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error in handleSelectPlan:', error);
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