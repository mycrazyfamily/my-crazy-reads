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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoadingCallback from '@/components/auth/LoadingCallback';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

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
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [resetTokens, setResetTokens] = useState<{ accessToken: string | null; refreshToken: string | null }>({
    accessToken: null,
    refreshToken: null
  });

  useEffect(() => {
    // Don't run auth logic if we already detected a password reset
    if (isPasswordReset) {
      return;
    }

    document.title = "Bienvenue - MyCrazyFamily";

    const handleCallback = async () => {
      try {
        // Check both query string and hash fragment for parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        let accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        let refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        let type = urlParams.get('type') || hashParams.get('type');

        // Check if this is a password reset callback
        if (type === 'recovery' && accessToken && refreshToken) {
          // Store tokens to prevent losing them when URL changes
          setResetTokens({ accessToken, refreshToken });
          setIsPasswordReset(true);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          // v1.1 (a) et (b) : on ne cherche la cause qu'ici, une fois établi
          // qu'aucune session n'est récupérable. Un parent déjà connecté n'atteint
          // jamais cette branche et poursuit vers son espace famille.
          const paramErreur = urlParams.get('error') || hashParams.get('error');
          const codeErreur = urlParams.get('error_code') || hashParams.get('error_code');
          const descriptionErreur = urlParams.get('error_description') || hashParams.get('error_description');

          throw new Error(messageDepuisErreur(paramErreur, codeErreur, descriptionErreur));
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
  }, [login, navigate, isPasswordReset]);

  if (error) {
    return null;
  }

  if (isPasswordReset) {
    return <ResetPasswordForm accessToken={resetTokens.accessToken} refreshToken={resetTokens.refreshToken} />;
  }

  return <LoadingCallback />;
};

export default Callback;
