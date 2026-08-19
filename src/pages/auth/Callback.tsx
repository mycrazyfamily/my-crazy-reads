// Callback v1.3
// Changelog v1.3 : cette page n'affiche plus le formulaire de réinitialisation,
//   elle redirige vers /reset-password. Deux écrans faisaient la même chose avec
//   des règles différentes : ResetPasswordForm imposait 6 caractères sans
//   contrainte de composition, alors que ResetPassword applique les règles
//   partagées de passwordRules. Un parent passant par le mauvais chemin pouvait
//   se fixer un mot de passe que l'inscription aurait refusé.
//   Vérifié avant de trancher, le 19/08 : ResetPasswordForm n'est importé que
//   par ce fichier, `resetPasswordForEmail` n'existe qu'une fois dans le dépôt
//   et vise /reset-password, et le gabarit Supabase reprend ce redirectTo. Aucun
//   lien émis ne peut donc atterrir ici. Les liens de réinitialisation expirant
//   au bout d'une heure, il n'y a pas non plus d'ancien lien en circulation.
//   La redirection reste comme filet : un lien égaré est rattrapé au lieu d'être
//   perdu. Le fragment est conservé dans l'URL, ResetPassword sait le lire si le
//   client Supabase ne l'a pas encore consommé.
//   ResetPasswordForm.tsx peut désormais être supprimé du dépôt.
// Callback v1.2
// Changelog v1.2 :
//   (a) PAGE DÉDIÉE AU LIEN INVALIDE, à la place de la notification suivie d'une
//       redirection. Une notification disparaît au bout de quelques secondes et
//       n'offre aucune action, or dans ce cas précis le parent est bloqué : il ne
//       peut pas continuer sans agir. C'est ce que font GitHub, Slack ou Stripe,
//       une page qui nomme le problème et propose une sortie.
//   (b) COMPORTEMENT UNIFIÉ, connecté ou non. Un seul écran, prévisible. Si une
//       session existe le parent part vers son espace famille comme avant ; sinon
//       il voit la page, quel que soit l'état de son navigateur.
//   (c) LES DEUX CAUSES SONT COUVERTES PAR UNE SEULE FORMULATION. Supabase renvoie
//       le même `otp_expired` pour un lien expiré et pour un lien déjà consommé,
//       il est impossible de les distinguer côté client.
//   (d) Les erreurs qui ne viennent PAS du lien (session illisible, insertion de
//       profil refusée) gardent l'ancien traitement, notification puis renvoi vers
//       la page de connexion. Elles relèvent d'un incident, pas d'une impasse.
// Callback v1.1
// Première version numérotée, le fichier n'en portait pas.
// Changelog v1.1 :
//   (a) LE FRAGMENT D'ERREUR EST LU. Quand un lien est périmé ou déjà consommé,
//       Supabase renvoie `error`, `error_code` et `error_description` dans le
//       fragment. Le code les ignorait, tombait dans la branche « pas de session »
//       et affichait « Utilisateur non connecté. », exact mais inutile : le parent
//       ne comprenait ni que son lien avait expiré, ni qu'il devait en redemander
//       un. Messages explicites désormais, en français.
//   (b) L'ORDRE EST VOLONTAIRE. La session est vérifiée AVANT les paramètres
//       d'erreur. Un parent déjà connecté qui reclique un vieux lien continue
//       donc d'atterrir sur son espace famille, comportement constaté le 19/08
//       et jugé correct. Le message d'erreur ne s'affiche que s'il n'y a
//       réellement aucune session à récupérer.
//   (c) LES CONSOLE.LOG SONT RETIRÉS, dix-neuf au total. Deux d'entre eux
//       fuyaient des secrets en production : `window.location.href` expose les
//       jetons du fragment sur le parcours de réinitialisation, et l'objet
//       session expose le JWT d'accès. Une extension de navigateur lit la
//       console. Les `console.error` sont conservés, ils ne tracent que des
//       messages d'erreur.
//   (d) Deux logs de mise au point au niveau module sont supprimés, dont
//       « Forcing push of Callback.tsx ».
//   (e) Le `console.log` placé dans le JSX est retiré, le fragment qui
//       l'enveloppait devient inutile.
// Callback v1.0

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoadingCallback from '@/components/auth/LoadingCallback';

// v1.1 (a) : traduit les paramètres d'erreur de Supabase en une phrase que le
// parent peut comprendre et sur laquelle il peut agir. Les valeurs arrivent déjà
// décodées, URLSearchParams s'en charge.
const messageDepuisErreur = (
  error: string | null,
  errorCode: string | null,
  errorDescription: string | null
): string => {
  const description = (errorDescription || '').toLowerCase();

  if (errorCode === 'otp_expired' || description.includes('expired')) {
    return "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau depuis la page de connexion.";
  }

  if (error === 'access_denied') {
    return "Ce lien n'est plus valide. Demandez-en un nouveau depuis la page de connexion.";
  }

  if (errorDescription) {
    return errorDescription;
  }

  return "Nous n'avons pas pu finaliser la connexion. Le lien est peut-être incomplet, réessayez depuis le message d'origine.";
};

const Callback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // v1.2 (a) : distinct de `error`, qui reste réservé aux incidents techniques.
  const [lienInvalide, setLienInvalide] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Bienvenue - MyCrazyFamily";

    const handleCallback = async () => {
      try {
        // Check both query string and hash fragment for parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        // v1.3 : accessToken et refreshToken ne sont plus lus ici, /reset-password
        // s'en charge. Seul le type sert encore, à l'aiguillage.
        let type = urlParams.get('type') || hashParams.get('type');

        // v1.3 : un lien de réinitialisation ne s'affiche plus ici, il part vers
        // /reset-password, seul écran de réinitialisation du site. Le fragment
        // est conservé : si le client Supabase ne l'a pas encore consommé,
        // ResetPassword saura y lire les jetons. La condition ne teste plus la
        // présence des jetons, pour qu'un lien de récupération en erreur arrive
        // lui aussi sur l'écran qui sait l'expliquer.
        if (type === 'recovery') {
          navigate('/reset-password' + window.location.hash, { replace: true });
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          // v1.1 (b) puis v1.2 (a) : on ne cherche la cause qu'ici, une fois établi
          // qu'aucune session n'est récupérable. Un parent déjà connecté n'atteint
          // jamais cette branche et poursuit vers son espace famille.
          // On affiche la page plutôt que de lever une exception : ce n'est pas un
          // incident, c'est une impasse dont le parent doit pouvoir sortir.
          const paramErreur = urlParams.get('error') || hashParams.get('error');
          const codeErreur = urlParams.get('error_code') || hashParams.get('error_code');
          const descriptionErreur = urlParams.get('error_description') || hashParams.get('error_description');

          setLienInvalide(messageDepuisErreur(paramErreur, codeErreur, descriptionErreur));
          return;
        }

        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select()
          .eq('id', session.user.id)
          .single();

        // Only create profile if it doesn't exist
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: session.user.id,
                family_id: null,
                role: 'Parent',
                created_at: new Date().toISOString()
              }
            ]);

          if (insertError) {
            throw new Error(insertError.message);
          }
        }

        // Update auth context
        login({
          email: session.user.email || '',
          isAuthenticated: true,
        });

        // Petite delay pour s'assurer que l'état d'auth est mis à jour
        setTimeout(() => {
          navigate('/espace-famille');
        }, 100);
      } catch (error) {
        console.error('Error in auth callback:', error);
        const message = error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.";
        setError(message);
        toast.error(message);
        navigate('/authentification');
      }
    };

    handleCallback();
  }, [login, navigate]);

  // v1.2 (a) : la page passe avant le reste, c'est le seul écran que le parent
  // doit voir dans ce cas. Aucune redirection, il choisit lui-même sa sortie.
  if (lienInvalide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl border-none px-6 pt-8 pb-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600" strokeWidth={2.5} />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-mcf-primary">
                Ce lien n'est plus valide
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {lienInvalide}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Les liens de confirmation sont valables 24 heures et ne servent qu'une fois.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Button
                onClick={() => navigate('/authentification')}
                className="bg-mcf-primary hover:bg-mcf-primary/90 text-white"
              >
                Aller à la page de connexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return <LoadingCallback />;
};

export default Callback;
