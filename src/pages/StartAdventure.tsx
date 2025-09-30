
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const StartAdventure = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasActiveSubscription } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'monthly' | 'yearly'>('monthly');
  
  useEffect(() => {
    // Si l'utilisateur est déjà abonné, le rediriger vers l'espace famille
    if (isAuthenticated && hasActiveSubscription) {
      toast.info("Vous êtes déjà abonné! Redirection vers votre espace famille.");
      navigate('/espace-famille');
    }
  }, [isAuthenticated, hasActiveSubscription, navigate]);
  
  const handleContinue = () => {
    // Stocker l'option sélectionnée (mensuel ou annuel) dans localStorage
    localStorage.setItem('mcf_subscription_option', selectedOption);
    
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-24 mt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-mcf-orange-dark">Prêt à démarrer l'aventure</h1>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div 
              className={`flex-1 rounded-lg p-6 cursor-pointer transition-all ${
                selectedOption === 'monthly' 
                  ? 'border-2 border-mcf-orange shadow-lg bg-white' 
                  : 'border border-gray-200 hover:border-mcf-amber hover:shadow-md bg-white'
              }`}
              onClick={() => setSelectedOption('monthly')}
            >
              <h3 className="text-xl font-bold mb-2">Abonnement mensuel</h3>
              <p className="text-3xl font-bold text-mcf-orange-dark mb-2">9,90€<span className="text-base font-normal text-gray-600">/mois</span></p>
              <ul className="space-y-2 text-gray-700">
                <li>• 1 livre personnalisé chaque mois</li>
                <li>• Sans engagement</li>
                <li>• Modifiable à tout moment</li>
              </ul>
            </div>
            
            <div className="text-center font-bold text-xl self-center">ou</div>
            
            <div 
              className={`flex-1 rounded-lg p-6 cursor-pointer transition-all ${
                selectedOption === 'yearly' 
                  ? 'border-2 border-mcf-orange shadow-lg bg-white' 
                  : 'border border-gray-200 hover:border-mcf-amber hover:shadow-md bg-white'
              }`}
              onClick={() => setSelectedOption('yearly')}
            >
              <h3 className="text-xl font-bold mb-2">Abonnement annuel</h3>
              <p className="text-3xl font-bold text-mcf-orange-dark mb-2">99€<span className="text-base font-normal text-gray-600">/an</span></p>
              <p className="text-sm bg-mcf-amber/20 text-mcf-orange-dark p-2 rounded mb-2">Économisez 2 mois gratuits!</p>
              <ul className="space-y-2 text-gray-700">
                <li>• 1 livre personnalisé chaque mois</li>
                <li>• Cadeau de bienvenue offert</li>
                <li>• 2 mois gratuits</li>
              </ul>
            </div>
          </div>
          
          <button 
            className="w-full bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
            onClick={handleContinue}
          >
            Continuer
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StartAdventure;
