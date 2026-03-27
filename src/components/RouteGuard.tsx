import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
    toast.info("Vous devez être connecté pour accéder à cette page");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  if (requireAuth && isAuthenticated && requireSubscription && !hasActiveSubscription && !bypassDevMode) {
    toast.info("Cette fonctionnalité nécessite un abonnement actif");
    return <Navigate to={notSubscribedRedirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default RouteGuard;
