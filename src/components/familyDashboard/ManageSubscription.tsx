import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { ExternalLink, Calendar, CreditCard } from 'lucide-react';

const ManageSubscription: React.FC = () => {
  const { user, supabaseSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!supabaseSession) {
      toast.error("Session invalide. Veuillez vous reconnecter.");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${supabaseSession.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating portal session:', error);
        toast.error("Une erreur est survenue lors de l'accès au portail de gestion.");
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error in handleManageSubscription:', error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.subscription || user.subscription.status !== 'active') {
    return null;
  }

  const subscriptionType = user.subscription.type;
  const plan = subscriptionType ? SUBSCRIPTION_PLANS[subscriptionType] : null;
  const nextPaymentDate = user.subscription.nextPaymentDate 
    ? new Date(user.subscription.nextPaymentDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'N/A';

  return (
    <Card className="border-mcf-mint shadow-lg">
      <CardHeader>
        <CardTitle className="text-mcf-primary flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mon abonnement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Formule</span>
            <span className="font-semibold text-mcf-primary">
              {plan?.name || 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Prix</span>
            <span className="font-semibold text-mcf-secondary">
              {plan ? `${plan.price}${plan.currency}/${plan.interval}` : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Prochain paiement
            </span>
            <span className="font-semibold">
              {nextPaymentDate}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="w-full bg-mcf-primary hover:bg-mcf-primary-dark text-white flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {isLoading ? 'Chargement...' : 'Gérer mon abonnement'}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Modifiez votre formule, changez votre moyen de paiement ou annulez votre abonnement
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageSubscription;
