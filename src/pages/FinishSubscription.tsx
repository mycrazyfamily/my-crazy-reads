
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FinishSubscription = () => {
  const navigate = useNavigate();
  const { user, updateUserSubscription } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const subscriptionOption = localStorage.getItem('mcf_subscription_option') || 'monthly';
  
  const handlePaymentSuccess = () => {
    setIsProcessing(true);
    
    // Simulation de traitement de paiement
    setTimeout(() => {
      // Mise à jour de l'état d'abonnement de l'utilisateur
      updateUserSubscription({
        status: 'active',
        type: subscriptionOption as 'monthly' | 'yearly',
        startDate: new Date().toISOString(),
        nextPaymentDate: getNextPaymentDate(subscriptionOption)
      });
      
      setIsProcessing(false);
      navigate('/confirmation');
    }, 1500);
  };
  
  // Fonction pour calculer la prochaine date de paiement
  const getNextPaymentDate = (option: string) => {
    const date = new Date();
    if (option === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString();
  };
  
  // Ici, vous intégreriez normalement un formulaire de paiement avec Stripe ou un autre processeur de paiement
  // Pour cette démo, nous utilisons simplement un bouton qui simule un paiement réussi
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-center mb-8 text-mcf-orange-dark mt-10">
          Finaliser votre abonnement
        </h1>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-mcf-orange-dark">Récapitulatif de votre abonnement</h2>
          
          <div className="mb-8 p-4 bg-mcf-amber/10 rounded-lg">
            <h3 className="font-bold text-lg mb-2">
              {subscriptionOption === 'monthly' ? 'Abonnement mensuel' : 'Abonnement annuel'}
            </h3>
            <p className="text-2xl font-bold text-mcf-orange-dark">
              {subscriptionOption === 'monthly' ? '9,90€/mois' : '99€/an'}
            </p>
            <p className="text-gray-600 mt-2">
              {subscriptionOption === 'monthly' 
                ? 'Facturation mensuelle, sans engagement' 
                : 'Facturation annuelle (2 mois gratuits inclus)'}
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <p className="font-medium">Votre abonnement inclut :</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>1 livre personnalisé chaque mois</li>
              <li>Livraison gratuite à votre domicile</li>
              <li>Accès complet à votre espace famille</li>
              <li>Possibilité de modifier les préférences de votre enfant</li>
              {subscriptionOption === 'yearly' && (
                <li>Un cadeau de bienvenue avec votre premier livre</li>
              )}
            </ul>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <p className="font-bold mb-4">Informations de paiement</p>
            
            {/* Simulation d'un formulaire de paiement */}
            <div className="grid gap-4 mb-6">
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  id="cardName"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="MM/AA"
                  />
                </div>
                
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button 
            className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-colors ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-mcf-orange hover:bg-mcf-orange-dark'
            }`}
            onClick={handlePaymentSuccess}
            disabled={isProcessing}
          >
            {isProcessing ? 'Traitement en cours...' : 'Finaliser le paiement'}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            En finalisant votre paiement, vous acceptez nos conditions générales d'utilisation et notre politique de confidentialité.
            {subscriptionOption === 'monthly' && " Vous pouvez annuler votre abonnement à tout moment depuis votre espace client."}
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FinishSubscription;
