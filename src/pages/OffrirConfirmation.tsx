
import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Home, Gift, Calendar, Truck, BookOpen } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';
import { format, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

const OffrirConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { childProfile, theme, customPlace, giftMessage, delivery } = location.state || {};
  
  // Redirect if accessed directly without completing the flow
  useEffect(() => {
    if (!childProfile) {
      navigate('/offrir-livre');
    }
  }, [childProfile, navigate]);

  // Calculate estimated delivery date (2 weeks from now)
  const estimatedDeliveryDate = addWeeks(new Date(), 2);
  const formattedDeliveryDate = format(estimatedDeliveryDate, "d MMMM yyyy", { locale: fr });

  // Get theme label
  const getThemeLabel = (themeValue) => {
    switch(themeValue) {
      case "fairy-tale": return "Conte de fées";
      case "adventure": return "Aventure";
      case "travel": return "Voyage";
      case "school": return "École & émotions";
      case "magic": return "Magie & fantastique";
      default: return "Personnalisé";
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        tweenDuration={10000}
      />
      
      <div className="container px-4 mx-auto max-w-3xl">
        {/* En-tête */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark mb-4">
            Merci d'offrir un moment magique ! 🎁
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Le livre personnalisé de {childProfile?.firstName || "l'enfant"} est en préparation
          </p>
          <p className="text-gray-600">
            Nous allons créer une histoire unique, spécialement pour cet enfant ✨
          </p>
        </div>

        {/* Récapitulatif de commande */}
        <Card className="mb-8 border border-mcf-amber/30 animate-fade-in animation-delay-200">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-mcf-orange-dark mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5" /> Récapitulatif de votre cadeau
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Livre personnalisé pour</p>
                  <p className="font-semibold text-lg">{childProfile?.firstName || "L'enfant"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Thème choisi</p>
                  <p className="font-semibold">{getThemeLabel(theme)}</p>
                  {customPlace && <p className="text-sm text-gray-600">Lieu : {customPlace}</p>}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Adresse de livraison</p>
                  <p className="font-semibold">{delivery?.fullName}</p>
                  <p className="text-sm text-gray-600">{delivery?.address}, {delivery?.postalCode} {delivery?.city}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date de livraison estimée</p>
                  <p className="font-semibold">{formattedDeliveryDate}</p>
                </div>
              </div>
              
              {giftMessage && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Message personnel</p>
                  <div className="bg-mcf-amber/10 p-3 rounded-md italic text-gray-700">
                    "{giftMessage}"
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message de confirmation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 animate-fade-in animation-delay-300">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">Un email de confirmation a été envoyé</p>
              <p className="text-sm text-green-700">
                Vous recevrez un email à {delivery?.email} avec tous les détails de votre commande
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col items-center gap-4 animate-fade-in animation-delay-400">
          <Button 
            asChild
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:max-w-md"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" /> 
              Retourner à l'accueil
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            asChild
            className="font-semibold py-5 px-8 rounded-full w-full md:max-w-md"
          >
            <Link to="/offrir-livre">
              <BookOpen className="mr-2 h-5 w-5" /> 
              Offrir un autre livre
            </Link>
          </Button>
        </div>
        
        {/* Support info */}
        <div className="text-center mt-10 text-gray-600 text-sm animate-fade-in animation-delay-500">
          <p>
            Besoin d'aide ? <a href="mailto:support@mycrazyfamily.com" className="text-mcf-orange hover:underline">support@mycrazyfamily.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OffrirConfirmation;
