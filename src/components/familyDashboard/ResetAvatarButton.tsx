// ResetAvatarButton v2.7
// Changelog v2.7 (chantier icones IA, lot 2) : icone SUPPRIMEE du titre de la fenetre de
//   confirmation, sans remplacement. C'etait le seul endroit du site ou l'etoile disait
//   litteralement « une machine va generer ». Le bouton qui ouvre la fenetre porte deja un
//   RefreshCw, et le bouton de validation aussi : le sens est deja porte deux fois, l'etoile
//   n'ajoutait qu'une signature IA au moment le plus sensible.
// ResetAvatarButton v2.6
// Changelog v2.6 : la phrase d'orientation (« ⚠️ Attention : pour changer l'apparence, annulez… »)
// s'affiche désormais dans LES DEUX cas de la fenêtre (standard ET avertissement renforcé enfant).
// Changelog v2.5 : la fenêtre de confirmation oriente vers l'autre voie — pour changer l'apparence,
// annuler puis modifier les champs du formulaire et enregistrer.
// Changelog v2.4 : libellés « visage » → « avatar » dans la fenêtre de confirmation (on régénère
// tout l'avatar, pas seulement le visage).
// Changelog v2.3 : le flag persistant est désormais posé par signalAvatarRegeneration lui-même
// (centralisé) → on retire l'appel markAvatarRegenerating redondant + son import.
// Changelog v2.2 : pose un flag PERSISTANT (markAvatarRegenerating, localStorage) au clic pour que
// l'écran de modif affiche « en création » + verrouille le bouton même après navigation ; nouvelle
// prop `disabled` (le header la passe = isRegenerating) → pas de relance à l'aveugle pendant une régé.
// Changelog v2.1 : après un reset réussi, on NAVIGUE vers /espace-famille (même flux qu'une
// modification/création). Le nouveau visage apparaît sur la carte du dashboard via le signal
// signalAvatarRegeneration + useRealtimeAvatar (shimmer + polling). Retrait du shimmer in-place :
// plus de props isRegenerating/onRegenerate. On conserve familyId (payload) + l'avertissement enfant.
// Changelog v2.0 : (a) support du type 'comforter' ; (b) payload corrigé pour le circuit de CRÉATION
// via Webhook_Reset (path factory-avatar-mcf) : { profile_id, type, family_id } — on n'envoie PLUS
// current_avatar_url (n8n force previous_avatar_url:null + is_age_progression:false → nouveau tirage) ;
// (c) test res.ok (le succès n'est plus déclaré sur un simple retour de fetch) ; (d) désactivation
// pendant la régénération via les props isRegenerating/onRegenerate (anti-rafale) ; (e) avertissement
// RENFORCÉ côté enfant si un livre est déjà figé en production (status >= locked) — la ressemblance
// ne sera plus continue. Props isRegenerating/onRegenerate/familyId OPTIONNELLES (compat ascendante :
// si le bouton est monté hors EditAvatarHeader, il retombe sur signalAvatarRegeneration).
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';

type ProfileType = 'child' | 'relative' | 'pet' | 'comforter';

const FACTORY_WEBHOOK_URL =
  'https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/factory-avatar-mcf';

// Statuts à partir desquels un livre est figé en production → l'ancien visage restera dans le PDF.
const IN_PRODUCTION_STATUSES = ['locked', 'generating', 'printing', 'shipped', 'delivered'];

interface ResetAvatarButtonProps {
  profileId: string;
  profileType: ProfileType;
  profileName?: string;
  familyId?: string | null;
  disabled?: boolean;
}

const ResetAvatarButton: React.FC<ResetAvatarButtonProps> = ({
  profileId,
  profileType,
  profileName,
  familyId = null,
  disabled = false,
}) => {
  const appearanceExamples =
    profileType === 'pet'
      ? 'couleur, pelage, taille'
      : profileType === 'comforter'
        ? 'couleur, matière, accessoires'
        : 'couleur, coiffure, tenue';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasProducedBook, setHasProducedBook] = useState(false);

  // Avertissement renforcé UNIQUEMENT pour l'enfant : sa ressemblance porte la continuité du récap.
  // Dégrade proprement : toute erreur (ou colonne absente) → pas d'avertissement renforcé, jamais de blocage.
  useEffect(() => {
    if (profileType !== 'child') return;
    let cancelled = false;
    (async () => {
      try {
        const { count } = await supabase
          .from('book_requests')
          .select('id', { count: 'exact', head: true })
          .eq('child_id', profileId)
          .in('status', IN_PRODUCTION_STATUSES);
        if (!cancelled) setHasProducedBook((count ?? 0) > 0);
      } catch {
        if (!cancelled) setHasProducedBook(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profileType, profileId]);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch(FACTORY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          type: profileType,
          family_id: familyId,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Même flux qu'une modification : on signale la régénération (pose signal éphémère + flag
      // persistant, centralisé dans signalAvatarRegeneration), puis on renvoie le parent vers
      // l'espace famille où le nouvel avatar apparaîtra sur la carte (shimmer + polling/realtime).
      signalAvatarRegeneration(profileId);

      toast.success('Nouvelle proposition en cours de création…', {
        description: "Retour à l'espace famille — le nouvel avatar y apparaîtra dans quelques instants.",
        duration: 5000,
      });
      setTimeout(() => navigate('/espace-famille'), 500);
    } catch (err) {
      console.error('Reset avatar webhook error:', err);
      toast.error("La demande n'a pas pu être envoyée. Réessayez dans un instant.");
      setLoading(false);
    }
  };

  const busy = loading || disabled;
  const reinforced = profileType === 'child' && hasProducedBook;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          className="text-muted-foreground hover:text-mcf-orange gap-1.5 text-sm"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Générer une autre proposition
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            Générer une autre proposition{profileName ? ` pour ${profileName}` : ''} ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {reinforced ? (
              <>
                Un ou plusieurs livres ont déjà été créés pour {profileName || 'cet enfant'}. Ils
                garderont l'ancien avatar : la ressemblance ne sera plus continue d'un livre à l'autre.
                La nouvelle proposition ne s'appliquera qu'aux futurs livres.
              </>
            ) : (
              <>
                Une nouvelle proposition d'avatar sera générée à partir des mêmes caractéristiques.
                L'avatar actuel sera remplacé (l'ancien reste conservé dans l'historique).
              </>
            )}
            <br />
            <br />
            ⚠️ Attention : pour changer l'apparence ({appearanceExamples}), annulez puis modifiez les champs du formulaire et enregistrez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            className="bg-mcf-orange hover:bg-mcf-orange/90 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Générer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetAvatarButton;
