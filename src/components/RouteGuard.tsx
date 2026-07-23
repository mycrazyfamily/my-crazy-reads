// RouteGuard v1.3
// Changelog v1.3 (C7) : le message d'abonnement passe lui aussi à l'impératif, en miroir de celui
//   de connexion : « Cette fonctionnalité nécessite un abonnement actif » (50 car.) →
//   « Abonnez-vous pour accéder à cette page » (37). Les deux notifications ont désormais la même
//   structure — « <Verbe à l'impératif> pour accéder à cette page » — ce qui les rend lisibles
//   d'un coup d'œil et cohérentes entre elles.
// RouteGuard v1.2
// Changelog v1.2 (C7) : durée d'affichage des notifications de redirection réduite sur mobile.
//   Sonner affiche 4 s par défaut ; sur mobile le toast occupe le haut de l'écran pendant que
//   l'utilisateur découvre la page vers laquelle il vient d'être redirigé, ce qui est long et
//   intrusif. 2,5 s suffisent à lire un message court, d'autant que la page d'arrivée (formulaire
//   de connexion, page d'abonnement) porte déjà l'information. Desktop inchangé à 4 s.
//   Wording : « Vous devez être connecté pour accéder à cette page » → « Connectez-vous pour
//   accéder à cette page » (impératif, plus court, mais garde le « pourquoi »). Le message
//   d'abonnement revient à sa formulation d'origine, plus claire (« cette fonctionnalité » désigne
//   explicitement ce qui est bloqué). Aucune logique de redirection modifiée.
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/** Durée d'affichage des toasts de redirection : 2,5 s sous 768px (le point de rupture `md` de
    Tailwind, celui utilisé partout ailleurs dans le projet), 4 s au-delà — c'est-à-dire la valeur
    par défaut de Sonner. Évalué au moment de l'appel, donc toujours à jour après rotation ou
    redimensionnement de la fenêtre. */
const redirectToastDuration = () =>
  typeof window !== 'undefined' && window.innerWidth < 768 ? 2500 : 4000;

type RouteGuardProps = {
  children: ReactNode;
  requireAuth?: boolean;
  requireSubscription?: boolean;
  redirectTo?: string;
  notSubscribedRedirectTo?: string;
  bypassProtection?: boolean;
};
const RouteGuard = ({ 
  children, 
  requireAuth = true, 
  requireSubscription = false,
  redirectTo = '/authentification',
  notSubscribedRedirectTo = '/abonnement',
  bypassProtection = false
}: RouteGuardProps) => {
  const { isAuthenticated, isLoading, hasActiveSubscription } = useAuth();
  const location = useLocation();
  
  const isDev = import.meta.env.DEV;
  const bypassDevMode = isDev && bypassProtection;
  // Wait for auth to be ready before any redirect decision
  if (requireAuth && isLoading && !bypassDevMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (requireAuth && !isAuthenticated && !bypassDevMode) {
    // Variantes possibles, au choix :
    //   "Vous devez être connecté pour accéder à cette page"  (formulation d'origine)
    //   "Connectez-vous pour continuer"                        (la plus courte)
    toast.info("Connectez-vous pour accéder à cette page", { duration: redirectToastDuration() });
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  if (requireAuth && isAuthenticated && requireSubscription && !hasActiveSubscription && !bypassDevMode) {
    // Variantes possibles, au choix :
    //   "Cette fonctionnalité nécessite un abonnement actif"  (formulation d'origine)
    //   "Abonnez-vous pour continuer"                          (la plus courte)
    toast.info("Abonnez-vous pour accéder à cette page", { duration: redirectToastDuration() });
    return <Navigate to={notSubscribedRedirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
export default RouteGuard;
