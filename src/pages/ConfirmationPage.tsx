
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Home, Mail, Package, Sparkles, Star, TruckIcon, User } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';
import { useToast } from '@/hooks/use-toast';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  // Simuler les données d'un abonnement réussi (dans un cas réel, ces données viendraient du contexte ou du localStorage)
  const orderData = {
    childName: "Thomas", // À remplacer par des données réelles
    planType: "Mensuel",
    address: "123 Rue de la Magie, 75001 Paris",
    estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
    childAge: "7 ans"
  };

  useEffect(() => {
    // Simuler une notification toast à l'arrivée sur la page
    toast({
      title: "Paiement confirmé !",
      description: "Votre abonnement a été activé avec succès.",
      variant: "success"
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-mcf-cream via-mcf-cream to-white py-12">
      {/* Animation de confettis */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        colors={['#FF8F6B', '#FFD56B', '#6BC6FF', '#FF6BED', '#6BFFB8']}
      />

      <div className="container px-4 mx-auto max-w-3xl">
        {/* En-tête */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-mcf-amber/20 p-5 inline-flex">
              <Star className="h-12 w-12 text-mcf-orange" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-mcf-orange-dark mb-4">
            Bienvenue dans l'aventure My Crazy Family ! 🧡
          </h1>
          <div className="text-xl text-gray-700 space-y-2 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            <p>L'abonnement est confirmé, et le premier livre de <span className="font-semibold">{orderData.childName}</span> est en route 📦</p>
            <p>Vous allez recevoir chaque mois une nouvelle histoire personnalisée, magique et inoubliable.</p>
            <p>Merci de faire partie de notre famille 💫</p>
          </div>
        </div>

        {/* Résumé de la commande */}
        <Card className="border-2 border-mcf-amber/30 mb-8 overflow-hidden animate-fade-in animation-delay-300">
          <div className="bg-mcf-amber/10 border-b border-mcf-amber/20 py-4 px-6">
            <h2 className="text-xl font-semibold text-mcf-orange-dark">Résumé de votre abonnement</h2>
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <OrderDetailItem 
                icon={<Package className="h-5 w-5" />} 
                label="Abonnement" 
                value={orderData.planType} 
              />
              <OrderDetailItem 
                icon={<User className="h-5 w-5" />} 
                label="Enfant" 
                value={`${orderData.childName}, ${orderData.childAge}`} 
              />
              <OrderDetailItem 
                icon={<TruckIcon className="h-5 w-5" />} 
                label="Livraison à" 
                value={orderData.address} 
              />
              <OrderDetailItem 
                icon={<CalendarCheck className="h-5 w-5" />} 
                label="Premier envoi prévu" 
                value={`autour du ${orderData.estimatedDelivery}`} 
              />
            </div>
          </CardContent>
        </Card>

        {/* CTA Bouton */}
        <div className="flex flex-col items-center space-y-6 animate-fade-in animation-delay-400">
          <Button
            onClick={() => navigate('/espace-famille')}
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" /> Accéder à mon espace famille
          </Button>

          <div className="text-center text-gray-600 mt-6 space-y-2">
            <p>Un email de confirmation vous a été envoyé.</p>
            <p className="flex items-center justify-center gap-1">
              <Mail className="h-4 w-4" /> 
              N'hésitez pas à nous écrire si besoin : 
              <a href="mailto:support@mycrazyfamily.com" className="text-mcf-orange hover:underline font-medium">
                support@mycrazyfamily.com
              </a>
            </p>
          </div>
        </div>

        {/* Animation de livre volant */}
        <div className="fixed bottom-6 right-6 animate-bounce">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-mcf-orange-dark absolute -top-4 -left-4" />
            <div className="bg-mcf-orange-dark text-white p-3 rounded-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
            </div>
            <Sparkles className="h-6 w-6 text-mcf-amber absolute -bottom-2 -right-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant d'item de détail de commande
const OrderDetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start gap-3">
    <div className="text-mcf-orange shrink-0 mt-1">
      {icon}
    </div>
    <div>
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  </div>
);

export default ConfirmationPage;
