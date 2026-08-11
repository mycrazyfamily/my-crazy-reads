// ConfirmationAbonnement.tsx v1.2
// v1.2: deadline de personnalisation 20 -> 10. Contrainte imprimeur : entre la
//       cloture, la generation des livres, la relecture, l'envoi a l'imprimeur,
//       l'impression et la poste, le 20 ne laissait pas assez de marge pour une
//       livraison en debut de mois suivant.
//       Le jour est desormais lu depuis PERSONALIZATION_DEADLINE_DAY plutot
//       qu'ecrit en dur : la meme constante alimente getFirstDeliveryMonth(),
//       les deux ne peuvent plus diverger.
// ConfirmationAbonnement.tsx v1.1
// v1.1: retrait des emojis (🎉 ✅ 📖 ✨) → pictogrammes lucide-react (Mail, BookOpen, Sparkles) en ronds colorés
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Mail, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getFirstDeliveryMonth, PERSONALIZATION_DEADLINE_DAY } from '@/utils/deliveryMonth';

const ConfirmationAbonnement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription, user } = useAuth();
  const deliveryMonth = getFirstDeliveryMonth();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const steps = [
    {
      icon: Mail,
      text: 'Vous allez recevoir un email de confirmation avec le récapitulatif de votre abonnement',
    },
    {
      icon: BookOpen,
      text: `Votre premier livre sera livré début ${deliveryMonth}`,
    },
    {
      icon: Sparkles,
      text: `Préparez vos personnages ! Rendez-vous dans l'espace famille pour configurer vos héros avant le ${PERSONALIZATION_DEADLINE_DAY} du mois`,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <CheckCircle className="h-24 w-24 text-mcf-secondary" />
          </div>

          <h1 className="text-4xl font-bold mb-4 text-mcf-primary">
            Félicitations !
          </h1>

          <p className="text-xl text-gray-700 mb-8">
            Votre premier livre sera livré début {deliveryMonth}
          </p>

          <div className="bg-mcf-mint/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-mcf-primary">
              Que se passe-t-il maintenant ?
            </h2>

            <ul className="text-left space-y-4 text-gray-700">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-mcf-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-mcf-primary" />
                    </div>
                    <span>{step.text}</span>
                  </li>
                );
              })}
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
