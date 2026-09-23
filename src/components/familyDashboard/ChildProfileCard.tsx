// ChildProfileCard v2.4
// Changelog v2.4 (chantier K, impayes) : bandeau « Paiement en attente » sur la carte.
//   Quand le dernier prelevement a echoue, la carte n'affiche plus « Abonne » mais un
//   bandeau orange avec un bouton « Mettre a jour ma carte », qui ouvre le portail Stripe
//   via l'Edge Function customer-portal (meme geste que ManageSubscription).
//   REGLE D'IMPAYE : payment_failed_at renseigne, OU stripe_status past_due, unpaid ou
//   incomplete. Identique au dashboard admin (Dashboard v1.6) : le parent et Robin voient
//   toujours le meme etat.
//   CLE DE CACHE : passe de ['subscription', id] a ['subscription-carte', id]. La cle
//   etait partagee avec MyStoriesTab qui lit moins de colonnes ; voir le commentaire au
//   niveau de la requete.
//   HORS PERIMETRE, VOLONTAIREMENT : la pastille « Abonne » et l'icone du bouton
//   « S'abonner » ne bougent pas. Ils font partie des retours du chantier F, reportes.
// ChildProfileCard v2.3
// Changelog v2.3 (chantier F) : la carte porte l'ABONNEMENT DE CET ENFANT.
//   Un bouton « S'abonner » quand l'enfant n'a pas d'abonnement actif, une pastille
//   « Abonné » quand il en a un. L'abonnement etant par enfant, une famille voit
//   immediatement lequel de ses enfants reste a abonner.
//   POURQUOI ICI. Jusqu'ici, valider la creation d'un enfant propulsait le parent sur la
//   page tarifs. Le detour etait abrupt et coupait l'elan : le parent venait de creer un
//   profil, il voulait le voir, pas lire une grille de prix. La redirection est desormais
//   l'espace famille (useChildProfileSubmit, chantier F), et c'est ce bouton qui porte la
//   conversion. Il doit donc rester visible sans etre agressif : couleur primaire pleine,
//   au-dessus de « Modifier » qui passe en second.
// ChildProfileCard v2.2
// Changelog v2.2 — CORRECTIF : l'enfant lisait des champs inexistants.
//   useFamilyData expose l'enfant en camelCase (contrat de l'interface
//   FamilyChild : avatarStatus, avatarErrorCode, avatarErrorFields), alors que
//   les proches, animaux et doudous sont enrichis en snake_case. La v2.1 lisait
//   child.avatar_status pour les quatre : undefined pour l'enfant seulement.
//   La carte croyait donc que tout allait bien et affichait l'ancien avatar,
//   alors que la base disait 'failed' et que la fiche affichait bien l'erreur.
//   Non détecté par esbuild, qui retire les types sans les vérifier.
// ChildProfileCard v2.1
// Changelog v2.1 — un avatar en échec est CLIQUABLE et mène à l'écran de modification.
//   Les infobulles ne s'ouvrent pas au toucher : sans ce clic, un parent sur mobile
//   voyait la pastille rouge sans aucun moyen de lire le message ni de corriger.
// ChildProfileCard v2.0
// Changelog v2.0 — transmet le statut de génération à AvatarDisplay.
//   Les trois colonnes viennent de useFamilyData v3.0 : le hook n'a plus besoin
//   de sa lecture individuelle au montage (une requête par carte en moins).
//   La carte affiche l'état d'échec sans dépendre du realtime : le refetch de
//   useFamilyData suffit.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Edit, Users, Palette, Cat, Gamepad2, MapPin, Heart, Sparkles, CheckCircle2, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import AvatarDisplay from '@/components/familyDashboard/AvatarDisplay';
import { getChildAvatarAlert } from '@/utils/avatarAgeAlert';

interface Child {
  id: string;
  firstName: string;
  age: string;
  avatar: string | null;
  personalityEmoji: string;
  relatives?: any[];
  places?: any[];
  toysCount?: number;
  preferencesCount?: number;
  hasPets?: number;
  birthDate?: string | null;
  isDeceased?: boolean;
  /** v2.2 — camelCase, comme le reste de FamilyChild. Voir useFamilyData v3.0. */
  avatarStatus?: string | null;
  avatarErrorCode?: string | null;
  avatarErrorFields?: string | null;
}

interface ChildProfileCardProps {
  child: Child;
}

const ChildProfileCard: React.FC<ChildProfileCardProps> = ({ child }) => {

  // v2.3 (chantier F) : STATUT D'ABONNEMENT DE CET ENFANT.
  // L'abonnement est PAR ENFANT, pas par famille : la meme famille peut avoir un enfant
  // abonne et un autre non. Le statut est donc lu ici, carte par carte. Meme requete que
  // MyStoriesTab (table subscriptions, child_id, is_active), meme cle de cache
  // ['subscription', id] : react-query mutualise, aucune requete supplementaire quand les
  // deux onglets ont deja ete ouverts.
  // v2.4 : cle de cache PROPRE a la carte, ['subscription-carte', id].
  // Elle partageait jusqu'ici ['subscription', id] avec MyStoriesTab, qui ne lit que
  // cancel_at, end_date et status. React Query sert la premiere reponse mise en cache :
  // un parent passe d'abord par « Mes histoires » aurait recu un objet SANS les colonnes
  // de paiement, et le bandeau d'impaye ne se serait jamais affiche. Une cle distincte
  // coute une requete de plus, elle evite une panne silencieuse.
  const { data: abonnement, isLoading: abonnementEnCours } = useQuery({
    queryKey: ['subscription-carte', child.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('cancel_at, end_date, status, payment_failed_at, stripe_status')
        .eq('child_id', child.id)
        .eq('is_active', true)
        .maybeSingle();
      return data;
    },
    enabled: !!child.id,
  });
  const estAbonne = !!abonnement;

  // v2.4 : un abonnement peut etre ACTIF et IMPAYE. Meme regle que le dashboard admin
  // (Dashboard v1.6), pour que le parent et Robin voient toujours le meme etat.
  const estImpaye = estAbonne && (
    !!abonnement?.payment_failed_at ||
    ['past_due', 'unpaid', 'incomplete'].includes(abonnement?.stripe_status ?? '')
  );

  // v2.4 : ouverture du portail Stripe pour mettre la carte a jour. Meme geste que
  // ManageSubscription : Edge Function customer-portal, qui renvoie { url }.
  const { supabaseSession } = useAuth();
  const [ouverturePortail, setOuverturePortail] = useState(false);
  const ouvrirPortailPaiement = async () => {
    if (!supabaseSession) {
      toast.error("Session expirée. Reconnectez-vous pour mettre votre carte à jour.");
      return;
    }
    setOuverturePortail(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${supabaseSession.access_token}` },
      });
      if (error || !data?.url) {
        toast.error("Impossible d'ouvrir la page de paiement. Écrivez-nous à hello@mycrazyfamily.com.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Impossible d'ouvrir la page de paiement. Écrivez-nous à hello@mycrazyfamily.com.");
    } finally {
      setOuverturePortail(false);
    }
  };
  const navigate = useNavigate();
  const { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc,
          avatarStatus, avatarErrorCode, avatarErrorFields } =
    useRealtimeAvatar({
      table: 'child_profiles',
      id: child.id,
      initialAvatarUrl: child.avatar,
      initialAvatarStatus: (child?.avatarStatus ?? null) as any,
      initialAvatarErrorCode: child?.avatarErrorCode ?? null,
      initialAvatarErrorFields: child?.avatarErrorFields ?? null,
    });

  const ageAlert = getChildAvatarAlert(child.firstName, child.birthDate, avatarUrl);

  const fallback = (
    <span className="text-2xl flex items-center justify-center h-full w-full bg-mcf-amber/20 text-mcf-orange-dark">
      {child.personalityEmoji || child.firstName.charAt(0).toUpperCase()}
    </span>
  );

  const isBirthdayToday = React.useMemo(() => {
    if (!child.birthDate) return false;
    const today = new Date();
    const birth = new Date(child.birthDate);
    return birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate();
  }, [child.birthDate]);

  return (
    <Card className="overflow-hidden border-mcf-mint animate-fade-in">
      <CardHeader className="relative bg-gradient-to-br from-mcf-amber/20 to-transparent p-4 flex flex-row items-center gap-4">
        {isBirthdayToday && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 animate-bounce">
            🎂 Anniversaire !
          </div>
        )}
        <AvatarDisplay
          imgSrc={imgSrc}
          avatarUrl={avatarUrl}
          isLoading={isLoading}
          isNew={isNew}
          hasError={hasError}
          isRegenerating={isRegenerating}
          avatarStatus={avatarStatus}
          avatarErrorCode={avatarErrorCode}
          avatarErrorFields={avatarErrorFields}
          profileName={child.firstName}
          onErrorClick={() => navigate(`/creer-profil-enfant?edit=${child.id}`)}
          onImageLoad={onImageLoad}
          onImageError={onImageError}
          fallback={fallback}
          alt={child.firstName}
          size="h-16 w-16"
          ageAlert={ageAlert}
        />
        <div>
          <h3 className="text-xl font-bold text-mcf-orange-dark">{child.firstName}</h3>
          {child.isDeceased ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-mcf-orange-dark/70 mt-0.5">
              <Heart className="h-3.5 w-3.5" />
              En mémoire
            </span>
          ) : (
            <p className="text-muted-foreground">{child.age}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-mcf-orange" />
            <span>Proches {child.relatives ? child.relatives.length : 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Cat className="h-4 w-4 text-mcf-orange" />
            <span>Animaux {child.hasPets || 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-mcf-orange" />
            <span>Lieux {child.places ? child.places.length : 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-mcf-orange" />
            <span>Jouets préférés {child.toysCount || 0}</span>
          </div>
          
          <div className="flex items-center gap-2 col-span-2">
            <Palette className="h-4 w-4 text-mcf-orange" />
            <span>Préférences {child.preferencesCount || 0}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex flex-col gap-2">
        {/* v2.3 (chantier F) : l'abonnement se pilote depuis la carte de l'enfant.
            Avant, la creation d'un profil propulsait le parent sur la page tarifs. Ce
            detour brutal est supprime (useChildProfileSubmit) : c'est ce bouton qui porte
            desormais la conversion. Il doit donc etre lisible d'un coup d'oeil, et dire
            de QUEL enfant il s'agit, puisque l'abonnement est par enfant.
            Pendant le chargement on n'affiche ni l'un ni l'autre : faire clignoter
            « S'abonner » sur un enfant deja abonne serait pire que d'attendre. */}
        {/* v2.4 : etat IMPAYE, prioritaire sur « Abonne ». Les deux autres etats sont
            strictement inchanges (chantier F en attente, a ne pas toucher). */}
        {!abonnementEnCours && estImpaye && (
          <div className="w-full rounded-xl border border-amber-300 bg-amber-50 p-3 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Paiement en attente</span>
            </div>
            <p className="mt-1 text-xs leading-snug text-amber-900/80">
              Le dernier prélèvement n'a pas abouti. Mettez votre carte à jour pour
              recevoir le prochain livre de {child.firstName}.
            </p>
            <Button
              size="sm"
              onClick={ouvrirPortailPaiement}
              disabled={ouverturePortail}
              className="mt-2 w-full rounded-full bg-amber-600 font-bold text-white hover:bg-amber-700"
            >
              {ouverturePortail ? "Ouverture..." : "Mettre à jour ma carte"}
            </Button>
          </div>
        )}

        {!abonnementEnCours && !estImpaye && (
          estAbonne ? (
            <div className="w-full flex items-center justify-center gap-2 rounded-full bg-mcf-mint/20 border border-mcf-secondary/40 py-1.5 text-sm font-semibold text-mcf-secondary">
              <CheckCircle2 className="h-4 w-4" />
              <span>Abonné</span>
            </div>
          ) : (
            <Link to="/abonnement" className="w-full">
              <Button
                size="sm"
                className="w-full flex items-center justify-center gap-2 bg-mcf-primary hover:bg-mcf-primary-dark text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Sparkles className="h-4 w-4" />
                <span>S'abonner</span>
              </Button>
            </Link>
          )
        )}

        <Link 
          to={`/creer-profil-enfant?edit=${child.id}`}
          className="w-full"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2 border-[#B3D4F5] text-[#4A90E2] hover:bg-[#F8FBFF] hover:border-[#4A90E2] rounded-full font-semibold transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ChildProfileCard;
