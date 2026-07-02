import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { Calendar, CreditCard, FileText, Trash2, Loader2, RefreshCw, PauseCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [subs, setSubs] = useState<StripeSubscriptionItem[] | null>(null);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<StripeSubscriptionItem | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [cancelStep, setCancelStep] = useState<'pause' | 'reasons'>('pause');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelComment, setCancelComment] = useState<string>('');

  const CANCEL_REASONS = [
    { value: 'price_too_high', label: 'Le tarif est trop élevé' },
    { value: 'child_grew_up', label: 'Mon enfant a grandi' },
    { value: 'too_many_books', label: 'Nous avons trop de livres' },
    { value: 'temporary_pause', label: 'Pause temporaire' },
    { value: 'delivery_quality_issue', label: 'Problème de livraison ou qualité' },
    { value: 'other', label: 'Autre raison' },
  ];

  const openCancelModal = (sub: StripeSubscriptionItem) => {
    setCancelTarget(sub);
    setCancelStep('pause');
    setCancelReason('');
    setCancelComment('');
  };

  const closeCancelModal = () => {
    if (cancelingId) return;
    setCancelTarget(null);
    setCancelStep('pause');
    setCancelReason('');
    setCancelComment('');
  };

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

  const formatDate = (iso: string | null | undefined) =>
    iso
      ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !supabaseSession) return;
    const sub = cancelTarget;
    setCancelingId(sub.subscription_id);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: sub.subscription_id,
          reason: cancelReason || null,
          comment: cancelComment || null,
        },
        headers: { Authorization: `Bearer ${supabaseSession.access_token}` },
      });
      if (error || (data as any)?.error) {
        console.error('cancel-subscription error:', error || (data as any)?.error);
        toast.error("Une erreur est survenue lors de la résiliation.");
        return;
      }
      const cancelAt = (data as any)?.cancel_at as string | null;
      setSubs((prev) =>
        prev
          ? prev.map((s) =>
              s.subscription_id === sub.subscription_id
                ? { ...s, cancel_at: cancelAt, status: s.status }
                : s
            )
          : prev
      );
      queryClient.invalidateQueries({ queryKey: ['book-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      if (sub.child_id) {
        queryClient.invalidateQueries({ queryKey: ['book-timeline', sub.child_id] });
        queryClient.invalidateQueries({ queryKey: ['subscription', sub.child_id] });
      }
      const childName = findChildName(sub.child_id);
      const dateStr = formatDate(cancelAt);
      toast.success(
        childName
          ? `L'abonnement de ${childName} prendra fin le ${dateStr}. Merci pour votre confiance.`
          : `L'abonnement prendra fin le ${dateStr}. Merci pour votre confiance.`
      );
      setCancelTarget(null);
      setCancelStep('pause');
      setCancelReason('');
      setCancelComment('');
    } catch (e) {
      console.error(e);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setCancelingId(null);
    }
  };

  const handleReactivate = async (sub: StripeSubscriptionItem) => {
    if (!supabaseSession) return;
    setReactivatingId(sub.subscription_id);
    try {
      const { data, error } = await supabase.functions.invoke('reactivate-subscription', {
        body: { subscription_id: sub.subscription_id },
        headers: { Authorization: `Bearer ${supabaseSession.access_token}` },
      });
      if (error || (data as any)?.error) {
        console.error('reactivate-subscription error:', error || (data as any)?.error);
        toast.error("Une erreur est survenue lors de la réactivation.");
        return;
      }
      setSubs((prev) =>
        prev
          ? prev.map((s) =>
              s.subscription_id === sub.subscription_id ? { ...s, cancel_at: null } : s
            )
          : prev
      );
      queryClient.invalidateQueries({ queryKey: ['book-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      if (sub.child_id) {
        queryClient.invalidateQueries({ queryKey: ['book-timeline', sub.child_id] });
        queryClient.invalidateQueries({ queryKey: ['subscription', sub.child_id] });
      }
      const childName = findChildName(sub.child_id);
      toast.success(
        childName ? `L'abonnement de ${childName} a été réactivé` : `L'abonnement a été réactivé`
      );
    } catch (e) {
      console.error(e);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setReactivatingId(null);
    }
  };

  const getPlanInfo = (priceId: string | null) => {
    if (priceId === SUBSCRIPTION_PLANS.yearly.priceId) {
      return { type: 'yearly' as const, label: 'Annuelle : 299,99€/an' };
    }
    return { type: 'monthly' as const, label: 'Mensuelle : 29,99€/mois' };
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
    <>
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
          const nextPaymentDate = sub.subscription_end ? formatDate(sub.subscription_end) : 'N/A';
          const title = childName ? `Abonnement de ${childName}` : 'Abonnement';
          const isCanceling = cancelingId === sub.subscription_id;
          const alreadyCanceled = !!sub.cancel_at;

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
                  {alreadyCanceled ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleReactivate(sub)}
                      disabled={reactivatingId === sub.subscription_id}
                      className="w-full text-mcf-primary hover:text-mcf-primary-dark hover:bg-blue-50 flex items-center justify-center gap-2"
                    >
                      {reactivatingId === sub.subscription_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Réactiver l'abonnement
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => openCancelModal(sub)}
                      disabled={isCanceling}
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      {isCanceling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Résilier l'abonnement
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>

    <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && closeCancelModal()}>
      <DialogContent className="max-w-lg">
        {cancelTarget && (() => {
          const name = findChildName(cancelTarget.child_id) || 'cet enfant';
          const isBusy = cancelingId === cancelTarget.subscription_id;

          if (cancelStep === 'pause') {
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">Nous sommes tristes de vous voir partir 🥺</DialogTitle>
                  <DialogDescription className="pt-3 text-base">
                    Saviez-vous que vous pouvez mettre l'abonnement de {name} en pause ?
                    Vous pourrez le réactiver à tout moment.
                  </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-block w-full">
                          <Button
                            disabled
                            className="w-full bg-mcf-primary/60 text-white cursor-not-allowed flex items-center gap-2"
                          >
                            <PauseCircle className="h-4 w-4" />
                            Mettre en pause
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Bientôt disponible</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-muted-foreground text-center mt-2 italic">
                    Bientôt disponible
                  </p>
                </div>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between sm:items-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCancelStep('reasons')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Je veux quand même résilier
                  </Button>
                  <Button
                    onClick={closeCancelModal}
                    size="lg"
                    className="bg-mcf-primary hover:bg-mcf-primary-dark text-white text-base px-8"
                  >
                    Non, je reste
                  </Button>
                </DialogFooter>
              </>
            );
          }

          return (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Pouvez-vous nous dire pourquoi ?</DialogTitle>
                <DialogDescription className="pt-2 text-base">
                  Votre retour nous aide à améliorer l'expérience de {name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="gap-2">
                  {CANCEL_REASONS.map((r) => (
                    <div key={r.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                      <Label htmlFor={`reason-${r.value}`} className="cursor-pointer font-normal">
                        {r.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {cancelReason && (
                  <div className="space-y-2">
                    <Label htmlFor="cancel-comment" className="text-sm text-gray-600">
                      Précisez (optionnel)
                    </Label>
                    <Textarea
                      id="cancel-comment"
                      value={cancelComment}
                      onChange={(e) => setCancelComment(e.target.value)}
                      placeholder={cancelReason === 'other' ? 'Dites-nous en plus…' : 'Un commentaire ?'}
                      maxLength={1000}
                    />
                  </div>
                )}
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between sm:items-center pt-4">
                <Button
                  variant="ghost"
                  onClick={handleConfirmCancel}
                  disabled={isBusy || !cancelReason}
                  className="text-white bg-red-500 hover:bg-red-600 hover:text-white flex items-center gap-2"
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirmer la résiliation
                </Button>
                <Button
                  onClick={closeCancelModal}
                  disabled={isBusy}
                  size="lg"
                  className="bg-mcf-primary hover:bg-mcf-primary-dark text-white text-base px-8"
                >
                  Non, je reste
                </Button>
              </DialogFooter>
            </>
          );
        })()}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ManageSubscription;
