import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { ExternalLink, Calendar, CreditCard, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        window.location.href = data.url;
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

  const status = user.subscription.status;
  const cancelAt = (user.subscription as any).cancelAt || (user.subscription as any).cancel_at;
  const isCanceling = Boolean(cancelAt);
  let statusBadge: { label: string; className: string };
  if (isCanceling) {
    const endDate = new Date(cancelAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    statusBadge = { label: `Se termine le ${endDate}`, className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-100' };
  } else if (status === 'paused') {
    statusBadge = { label: 'En pause', className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100' };
  } else {
    statusBadge = { label: 'Actif', className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100' };
  }

  const formuleLabel = subscriptionType === 'yearly'
    ? 'Annuelle — 299,99€/an'
    : 'Mensuelle — 29,99€/mois';

  return (
    <Card className="border-mcf-mint shadow-lg">
      <CardHeader>
        <CardTitle className="text-mcf-primary flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gérer mes abonnements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Statut</span>
            <Badge variant="outline" className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Formule</span>
            <span className="font-semibold text-mcf-primary">
              {formuleLabel}
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

          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="text-sm text-mcf-primary hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" />
            Voir mes factures →
          </button>
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
