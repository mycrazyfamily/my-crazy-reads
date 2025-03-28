
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Gift } from 'lucide-react';

const OffrirMessage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { childProfile, theme, customPlace } = location.state || {};
  
  const [giftMessage, setGiftMessage] = useState('');

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate('/offrir/livraison', { 
      state: { 
        childProfile,
        theme,
        customPlace,
        giftMessage
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mcf-cream to-white py-12">
      <div className="container px-4 mx-auto max-w-3xl">
        {/* En-tête */}
        <div className="mb-8">
          <button 
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-mcf-orange mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark mb-2">
            Ajoutez un message personnel 💌
          </h1>
          <p className="text-gray-700">
            Votre message sera imprimé dans le livre comme une dédicace pour {childProfile?.firstName || "l'enfant"}
          </p>
        </div>

        {/* Message de cadeau */}
        <Card className="mb-8 border border-mcf-amber/30">
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="gift-message" className="text-lg font-semibold">
                  <MessageSquare className="h-4 w-4 inline-block mr-2" />
                  Message personnel (facultatif)
                </Label>
                <Textarea
                  id="gift-message"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Pour Léo, que cette histoire t'accompagne dans tes rêves les plus fous – Tonton Maxime 💙"
                  className="mt-2 h-32 resize-none"
                />
                <p className="text-sm text-gray-500 italic mt-2">
                  Ce message sera imprimé en début de livre
                </p>
              </div>
              
              {/* Exemple d'aperçu */}
              {giftMessage && (
                <div className="bg-white p-4 border border-mcf-amber/20 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Aperçu de votre dédicace :</p>
                  <div className="bg-mcf-amber/10 p-4 rounded-md italic text-gray-700">
                    "{giftMessage}"
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bouton de continuation */}
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:w-auto md:min-w-64 text-lg flex items-center justify-center gap-2"
          >
            <Gift className="h-5 w-5" /> 
            Continuer vers la livraison →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OffrirMessage;
