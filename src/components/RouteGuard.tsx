
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type RouteGuardProps = {
  children: ReactNode;
  requireAuth?: boolean;
  requireSubscription?: boolean;
  redirectTo?: string;
  notSubscribedRedirectTo?: string;
  bypassProtection?: boolean; // Nouvelle prop pour le mode développement
};

const RouteGuard = ({ 
  children, 
  requireAuth = true, 
  requireSubscription = false,
  redirectTo = '/authentification',
  notSubscribedRedirectTo = '/abonnement',
  bypassProtection = false // Par défaut, les protections sont actives
}: RouteGuardProps) => {
  const { isAuthenticated, hasActiveSubscription, user } = useAuth();
  const location = useLocation();
  
  // Si le mode développement est activé ou si bypassProtection est à true, on désactive les protections
  const isDev = process.env.NODE_ENV === 'development';
  const bypassDevMode = isDev && bypassProtection;
  
  // Protection de base pour l'authentification
  if (requireAuth && !isAuthenticated && !bypassDevMode) {
    console.log('🔒 RouteGuard: Redirection vers auth - isAuthenticated:', isAuthenticated, 'user:', user);
    toast.info("Vous devez être connecté pour accéder à cette page");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // Protection pour les pages nécessitant un abonnement
  if (requireAuth && isAuthenticated && requireSubscription && !hasActiveSubscription && !bypassDevMode) {
    toast.info("Cette fonctionnalité nécessite un abonnement actif");
    return <Navigate to={notSubscribedRedirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default RouteGuard;
