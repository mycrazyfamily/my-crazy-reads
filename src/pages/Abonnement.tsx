import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Abonnement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, hasActiveSubscription } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'monthly' | 'yearly'>('monthly');
  
  // Déterminer si on vient du flux d'ajout d'enfant
  const isFromAdventure = searchParams.get('context') === 'adventure';
  
  useEffect(() => {
    // Si l'utilisateur est déjà abonné, le rediriger vers l'espace famille
    if (isAuthenticated && hasActiveSubscription) {
      toast.info("Vous êtes déjà abonné! Redirection vers votre espace famille.");
      navigate('/espace-famille');
    }
  }, [isAuthenticated, hasActiveSubscription, navigate]);
  
  const handleSelectPlan = (plan: 'monthly' | 'yearly') => {
    // Stocker l'option sélectionnée dans localStorage
    localStorage.setItem('mcf_subscription_option', plan);
    
    if (!isAuthenticated) {
      // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
      toast.info("Veuillez vous connecter ou créer un compte pour continuer");
      navigate('/authentification', { 
        state: { from: { pathname: '/finaliser-abonnement' } } 
      });
    } else if (!hasActiveSubscription) {
      // L'utilisateur est connecté mais n'a pas d'abonnement actif
      navigate('/finaliser-abonnement');
    } else {
      // L'utilisateur est déjà abonné, le rediriger vers l'espace famille
      navigate('/espace-famille');
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
                  className="w-full bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg text-base mt-auto"
                >
                  Choisir cette formule
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
                  className="w-full bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg text-base mt-auto"
                >
                  Choisir cette formule
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