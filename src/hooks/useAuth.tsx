
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

type SubscriptionStatus = 'none' | 'active' | 'expired' | 'pending';

type Subscription = {
  status: SubscriptionStatus;
  type?: 'monthly' | 'yearly';
  startDate?: string;
  nextPaymentDate?: string;
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
  supabaseSession: Session | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  
  useEffect(() => {
    // Configurer l'écouteur d'événements d'authentification Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSupabaseSession(session);
        
        // Ne pas appeler d'autres fonctions Supabase directement ici pour éviter les deadlocks
        // Si une session est active, mettre à jour l'état utilisateur
        if (session?.user) {
          const email = session.user.email || '';
          // Mise à jour de l'état utilisateur local
          setUser(prev => ({
            ...(prev || {}),
            email,
            isAuthenticated: true
          }));
          
          // Enregistrer l'utilisateur dans localStorage
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
        }
      }
    );
    
    // Vérifier s'il existe une session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSupabaseSession(session);
      
      if (session?.user) {
        // Si l'utilisateur est déjà connecté via Supabase
        const email = session.user.email || '';
        setUser(prev => ({
          ...(prev || {}),
          email,
          isAuthenticated: true
        }));
      } else {
        // Sinon, vérifier si l'utilisateur existe dans localStorage
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
    // Déconnexion de Supabase
    await supabase.auth.signOut();
    
    // Réinitialiser l'état local
    setUser(null);
    setSupabaseSession(null);
    localStorage.removeItem('mcf_user');
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
