// Cadeau.tsx v1.0
// v1.0: page cadeau-abonnement (3/6/12 mois) + prénom de l'offreur + petit mot ; appelle create-gift-checkout (achat invité)
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gift, Check, Sparkles, Star } from 'lucide-react';

const MAX_MESSAGE = 120;

type Offer = {
  months: number;
  price: string;
  perMonth: string;
  highlight?: boolean;
};

const OFFERS: Offer[] = [
  { months: 3, price: '89,97 €', perMonth: 'soit 29,99 €/mois' },
  { months: 6, price: '149,99 €', perMonth: 'soit 25,00 €/mois', highlight: true },
  { months: 12, price: '299,99 €', perMonth: 'soit 25,00 €/mois' },
];

const Cadeau: React.FC = () => {
  const [purchaserName, setPurchaserName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [loadingMonths, setLoadingMonths] = useState<number | null>(null);

  const handleGift = async (months: number) => {
    if (!purchaserName.trim()) {
      toast.info('Indiquez votre prénom pour personnaliser la carte cadeau.');
      return;
    }
    if (loadingMonths !== null) return;

    setLoadingMonths(months);
    try {
      const { data, error } = await supabase.functions.invoke('create-gift-checkout', {
        body: {
          durationMonths: months,
          purchaserName: purchaserName.trim(),
          giftMessage: giftMessage.trim(),
        },
      });

      if (error) {
        toast.error('Une erreur est survenue lors de la création du paiement. Réessayez.');
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Impossible d'ouvrir le paiement. Réessayez.");
      }
    } catch (e) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoadingMonths(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Titre */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-mcf-secondary/20 rounded-2xl mb-4">
                <Gift className="w-8 h-8 text-mcf-secondary" strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-mcf-primary mb-4">
                Offrir My Crazy Family
              </h1>
              <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
                Offrez à un enfant plusieurs mois d'histoires personnalisées. Vous recevez un code
                à transmettre à la personne de votre choix.
              </p>
            </div>

            {/* Personnalisation */}
            <div className="bg-card border-2 border-mcf-mint/30 rounded-2xl p-6 md:p-8 mb-10 card-shadow">
              <h2 className="text-xl font-bold text-mcf-primary mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mcf-secondary" />
                Personnalisez votre cadeau
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="purchaser-name" className="block text-sm font-medium text-foreground mb-2">
                    Votre prénom
                  </label>
                  <input
                    id="purchaser-name"
                    type="text"
                    maxLength={40}
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    placeholder="Ex : Paul"
                    className="w-full px-4 py-3 rounded-xl border-2 border-mcf-mint/40 focus:border-mcf-secondary outline-none transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Apparaîtra sur la carte cadeau.</p>
                </div>
                <div>
                  <label htmlFor="gift-message" className="block text-sm font-medium text-foreground mb-2">
                    Petit mot <span className="text-muted-foreground font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    id="gift-message"
                    maxLength={MAX_MESSAGE}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Ex : Joyeux anniversaire ! Régale-toi avec tes histoires."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-mcf-mint/40 focus:border-mcf-secondary outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 text-right">
                    {giftMessage.length}/{MAX_MESSAGE}
                  </p>
                </div>
              </div>
            </div>

            {/* Offres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {OFFERS.map((offer) => (
                <div
                  key={offer.months}
                  className={`relative overflow-hidden rounded-2xl border-2 bg-card p-8 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    offer.highlight ? 'border-mcf-secondary' : 'border-mcf-mint/30'
                  }`}
                >
                  {offer.highlight && (
                    <div className="absolute top-0 right-0 bg-mcf-secondary text-white text-xs font-bold py-1.5 px-4 rounded-bl-xl flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" strokeWidth={3} />
                      Le plus offert
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-mcf-primary mb-1">{offer.months} mois</h3>
                  <p className="text-4xl font-bold text-mcf-secondary mb-1">{offer.price}</p>
                  <p className="text-sm text-muted-foreground mb-6">{offer.perMonth}</p>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-sm">{offer.months} mois d'abonnement offerts</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-sm">Un livre personnalisé chaque mois</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-mcf-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-mcf-secondary" strokeWidth={3} />
                      </div>
                      <span className="text-sm">Livraison incluse</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleGift(offer.months)}
                    disabled={loadingMonths !== null}
                    className={`w-full bg-mcf-primary hover:bg-mcf-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-base mt-auto flex items-center justify-center gap-2 ${
                      loadingMonths !== null ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Gift className="w-5 h-5" />
                    {loadingMonths === offer.months ? 'Chargement...' : 'Offrir ce cadeau'}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
              Après le paiement, vous recevez un code unique à transmettre. La personne l'utilisera au
              moment de s'abonner : ses premiers mois seront offerts.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cadeau;
