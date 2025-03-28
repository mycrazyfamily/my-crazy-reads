
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, MapPin, Calendar, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionSummaryProps {
  subscription: {
    type: string;
    price: string;
    nextPayment: string;
    address: string;
  };
}

const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({ subscription }) => {
  const { toast } = useToast();
  
  const handleModifySubscription = () => {
    // In a real app, this would open a modification form or redirect to a modification page
    toast({
      title: "Modification d'abonnement",
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
  };
  
  const handleChangeAddress = () => {
    // In a real app, this would open an address form
    toast({
      title: "Modification d'adresse",
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
  };
  
  const handleCancelSubscription = () => {
    // In a real app, this would open a confirmation dialog
    toast({
      title: "Annulation d'abonnement",
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
  };
  
  return (
    <Card className="border-mcf-amber/30 shadow-md">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-mcf-orange" />
              <h3 className="font-semibold text-mcf-orange-dark">Formule</h3>
            </div>
            <div className="bg-mcf-amber/10 p-3 rounded-md">
              <p className="font-bold text-mcf-orange-dark">{subscription.type}</p>
              <p className="text-gray-600">{subscription.price}</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-mcf-orange" />
              <h3 className="font-semibold text-mcf-orange-dark">Prochain prélèvement</h3>
            </div>
            <div className="bg-mcf-amber/10 p-3 rounded-md">
              <p className="font-bold text-mcf-orange-dark">{subscription.nextPayment}</p>
              <p className="text-gray-600">Renouvelable automatiquement</p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-mcf-orange" />
              <h3 className="font-semibold text-mcf-orange-dark">Adresse de livraison</h3>
            </div>
            <div className="bg-mcf-amber/10 p-3 rounded-md mb-4">
              <p className="text-gray-700">{subscription.address}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            variant="outline"
            className="border-mcf-amber text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2 flex-1"
            onClick={handleModifySubscription}
          >
            <Settings className="h-4 w-4" /> Modifier l'abonnement
          </Button>
          
          <Button 
            variant="outline"
            className="border-mcf-amber text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2 flex-1"
            onClick={handleChangeAddress}
          >
            <MapPin className="h-4 w-4" /> Changer l'adresse
          </Button>
          
          <Button 
            variant="ghost"
            className="text-gray-500 hover:text-red-500 hover:bg-red-50 gap-2"
            onClick={handleCancelSubscription}
          >
            Résilier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSummary;
