
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
};

const RouteGuard = ({ 
  children, 
  requireAuth = true, 
  requireSubscription = false,
  redirectTo = '/authentification',
  notSubscribedRedirectTo = '/abonnement'
}: RouteGuardProps) => {
  const { isAuthenticated, hasActiveSubscription, user } = useAuth();
  const location = useLocation();
  
  // Protection de base pour l'authentification
  if (requireAuth && !isAuthenticated) {
    toast.info("Vous devez être connecté pour accéder à cette page");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // Protection pour les pages nécessitant un abonnement
  if (requireAuth && isAuthenticated && requireSubscription && !hasActiveSubscription) {
    toast.info("Cette fonctionnalité nécessite un abonnement actif");
    return <Navigate to={notSubscribedRedirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default RouteGuard;
