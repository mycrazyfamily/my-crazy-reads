
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

type SubscriptionStatus = 'none' | 'active' | 'expired' | 'pending';

type Subscription = {
  status: SubscriptionStatus;
  type?: 'monthly' | 'yearly';
  startDate?: string;
  nextPaymentDate?: string;
  priceId?: string;
  productId?: string;
};

type User = {
  email: string;
  firstName?: string;
  lastName?: string;
  isAuthenticated: boolean;
  isTemporary?: boolean;
  subscription?: Subscription;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isTemporaryUser: boolean;
  hasActiveSubscription: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUserSubscription: (subscription: Subscription) => void;
  updateUserProfile: (userData: Partial<User>) => void;
  refreshSubscription: () => Promise<void>;
  supabaseSession: Session | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);

  const checkSubscription = async (session: Session | null) => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data?.subscribed) {
        const subscription: Subscription = {
          status: 'active',
          type: data.price_id === 'price_1SLPaABm2xG2OMOvaDzDSB2s' ? 'monthly' : 'yearly',
          nextPaymentDate: data.subscription_end,
          priceId: data.price_id,
          productId: data.product_id,
        };
        
        setUser(prev => prev ? { ...prev, subscription } : null);
        
        const storedUser = localStorage.getItem('mcf_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem('mcf_user', JSON.stringify({ ...parsedUser, subscription }));
        }
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    }
  };
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSupabaseSession(session);
        
        if (session?.user) {
          const email = session.user.email || '';
          setUser(prev => ({
            ...(prev || {}),
            email,
            isAuthenticated: true
          }));
          
          const storedUser = localStorage.getItem('mcf_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              localStorage.setItem('mcf_user', JSON.stringify({
                ...parsedUser,
                email,
                isAuthenticated: true
              }));
            } catch (error) {
              console.error('Failed to parse stored user:', error);
              localStorage.setItem('mcf_user', JSON.stringify({
                email,
                isAuthenticated: true
              }));
            }
          } else {
            localStorage.setItem('mcf_user', JSON.stringify({
              email,
              isAuthenticated: true
            }));
          }

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await checkSubscription(session);
          }
        }
      }
    );
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSupabaseSession(session);
      
      if (session?.user) {
        const email = session.user.email || '';
        setUser(prev => ({
          ...(prev || {}),
          email,
          isAuthenticated: true
        }));
        
        await checkSubscription(session);
      } else {
        const storedUser = localStorage.getItem('mcf_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('mcf_user');
          }
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('mcf_user', JSON.stringify(userData));
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      // Réinitialiser l'état local et le stockage local
      setUser(null);
      setSupabaseSession(null);
      try { localStorage.removeItem('mcf_user'); } catch {}
      // Nettoyage explicite du token Supabase (par précaution)
      try { localStorage.removeItem('sb-rjbmhcoctpwmlqndzybm-auth-token'); } catch {}
      // Forcer un rafraîchissement pour éviter tout état rémanent
      window.location.href = '/';
    }
  };

  const updateUserSubscription = (subscription: Subscription) => {
    if (user) {
      const updatedUser = { ...user, subscription };
      setUser(updatedUser);
      localStorage.setItem('mcf_user', JSON.stringify(updatedUser));
    }
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('mcf_user', JSON.stringify(updatedUser));
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription(supabaseSession);
  };

  const hasActiveSubscription = user?.subscription?.status === 'active' || false;
  
  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user?.isAuthenticated,
        isTemporaryUser: !!user?.isTemporary,
        hasActiveSubscription,
        login,
        logout,
        updateUserSubscription,
        updateUserProfile,
        refreshSubscription,
        supabaseSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
