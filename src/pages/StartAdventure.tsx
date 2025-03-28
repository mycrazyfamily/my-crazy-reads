import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Cela simule la page StartAdventure existante
// Dans un vrai projet, vous devriez adapter le code existant pour inclure la redirection
const StartAdventure = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'monthly' | 'yearly'>('monthly');
  
  const handleContinue = () => {
    // Stocker l'option sélectionnée (mensuel ou annuel) dans localStorage
    localStorage.setItem('mcf_subscription_option', selectedOption);
    
    // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
    if (!isAuthenticated) {
      toast.info("Veuillez vous connecter ou créer un compte pour continuer");
      navigate('/authentification', { 
        state: { from: { pathname: '/finaliser-abonnement' } } 
      });
    } else {
      // Sinon, continuer vers la page de finalisation de l'abonnement
      navigate('/finaliser-abonnement');
    }
  };
  
  // Le reste de la page StartAdventure existante...
  return (
    <div className="min-h-screen bg-mcf-cream">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Prêt à démarrer l'aventure</h1>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div 
              className={`flex-1 border rounded-lg p-6 cursor-pointer transition-all ${
                selectedOption === 'monthly' 
                  ? 'border-mcf-orange bg-mcf-orange/10' 
                  : 'border-gray-200 hover:border-mcf-amber'
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
              className={`flex-1 border rounded-lg p-6 cursor-pointer transition-all ${
                selectedOption === 'yearly' 
                  ? 'border-mcf-orange bg-mcf-orange/10' 
                  : 'border-gray-200 hover:border-mcf-amber'
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
      </div>
    </div>
  );
};

export default StartAdventure;
