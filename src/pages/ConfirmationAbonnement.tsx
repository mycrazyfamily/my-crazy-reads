import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ConfirmationAbonnement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription, user } = useAuth();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <CheckCircle className="h-24 w-24 text-mcf-secondary" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-mcf-primary">
            Félicitations ! 🎉
          </h1>
          
          <p className="text-xl text-gray-700 mb-8">
            Votre abonnement a été activé avec succès !
          </p>
          
          <div className="bg-mcf-mint/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-mcf-primary">
              Que se passe-t-il maintenant ?
            </h2>
            
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-mcf-secondary font-bold mt-1">✓</span>
                <span>Vous recevrez un email de confirmation avec tous les détails de votre abonnement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-mcf-secondary font-bold mt-1">✓</span>
                <span>Votre premier livre personnalisé sera préparé et expédié sous peu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-mcf-secondary font-bold mt-1">✓</span>
                <span>Vous pouvez dès maintenant accéder à votre espace famille pour gérer vos préférences</span>
              </li>
              {user?.subscription?.type === 'yearly' && (
                <li className="flex items-start gap-2">
                  <span className="text-mcf-secondary font-bold mt-1">🎁</span>
                  <span>Votre cadeau de bienvenue sera inclus avec votre premier livre</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/espace-famille')}
              className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-lg"
            >
              Accéder à mon espace famille
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-mcf-primary text-mcf-primary hover:bg-mcf-mint font-bold py-3 px-8 rounded-lg"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ConfirmationAbonnement;
