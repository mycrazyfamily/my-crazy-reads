
import React from 'react';
import RouteGuard from './RouteGuard';

type AuthGuardProps = {
  children: React.ReactNode;
};

// AuthGuard est maintenant un simple wrapper autour de RouteGuard
// pour maintenir la rétrocompatibilité
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true} requireSubscription={false}>
      {children}
    </RouteGuard>
  );
};

export default AuthGuard;
