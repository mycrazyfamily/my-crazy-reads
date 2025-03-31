
import React from 'react';
import RouteGuard from './RouteGuard';

type SubscriptionGuardProps = {
  children: React.ReactNode;
};

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true} requireSubscription={true} notSubscribedRedirectTo="/abonnement">
      {children}
    </RouteGuard>
  );
};

export default SubscriptionGuard;
