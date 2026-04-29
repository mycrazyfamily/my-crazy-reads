import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { ExternalLink, Calendar, CreditCard, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FamilyChild } from '@/hooks/useFamilyData';

interface StripeSubscriptionItem {
  subscription_id: string;
  child_id: string | null;
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
  status?: string;
  cancel_at?: string | null;
}

interface ManageSubscriptionProps {
  familyChildren?: FamilyChild[];
}

const ManageSubscription: React.FC<ManageSubscriptionProps> = ({ familyChildren = [] }) => {
  const { supabaseSession } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subs, setSubs] = useState<StripeSubscriptionItem[] | null>(null);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!supabaseSession) { setLoadingSubs(false); return; }
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: { Authorization: `Bearer ${supabaseSession.access_token}` },
        });
        if (error) {
          console.error('check-subscription error:', error);
          setSubs([]);
        } else {
          setSubs((data?.subscriptions as StripeSubscriptionItem[]) || []);
        }
      } catch (e) {
        console.error(e);
        setSubs([]);
      } finally {
        setLoadingSubs(false);
      }
    };
    load();
  }, [supabaseSession]);

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

  const getPlanInfo = (priceId: string | null) => {
    if (priceId === SUBSCRIPTION_PLANS.yearly.priceId) {
      return { type: 'yearly' as const, label: 'Annuelle — 299,99€/an' };
    }
    return { type: 'monthly' as const, label: 'Mensuelle — 29,99€/mois' };
  };

  const getStatusBadge = (sub: StripeSubscriptionItem) => {
    const cancelAt = sub.cancel_at;
    if (cancelAt) {
      const endDate = new Date(cancelAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      return { label: `Se termine le ${endDate}`, className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-100' };
    }
    if (sub.status === 'paused') {
      return { label: 'En pause', className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100' };
    }
    return { label: 'Actif', className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100' };
  };

  const findChildName = (childId: string | null) => {
    if (!childId) return null;
    const child = familyChildren.find((c) => c.id === childId);
    return child?.firstName || null;
  };

  if (loadingSubs) return null;

  if (!subs || subs.length === 0) {
    return (
      <Card className="border-mcf-mint shadow-lg">
        <CardHeader>
          <CardTitle className="text-mcf-primary flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gérer mes abonnements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center py-6">
          <p className="text-gray-600">Aucun abonnement actif</p>
          <Button
            onClick={() => navigate('/abonnement')}
            className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
          >
            S'abonner
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-mcf-primary flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        Gérer mes abonnements
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {subs.map((sub) => {
          const childName = findChildName(sub.child_id);
          const plan = getPlanInfo(sub.price_id);
          const statusBadge = getStatusBadge(sub);
          const nextPaymentDate = sub.subscription_end
            ? new Date(sub.subscription_end).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
            : 'N/A';
          const title = childName ? `Abonnement de ${childName}` : 'Abonnement';

          return (
            <Card key={sub.subscription_id} className="border-mcf-mint shadow-lg">
              <CardHeader>
                <CardTitle className="text-mcf-primary text-lg">{title}</CardTitle>
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
                    <span className="font-semibold text-mcf-primary">{plan.label}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Prochain prélèvement
                    </span>
                    <span className="font-semibold">{nextPaymentDate}</span>
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
                    {isLoading ? 'Chargement...' : 'Gérer cet abonnement'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ManageSubscription;
