
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('mcf_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('mcf_user');
      }
    }
  }, []);
  
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('mcf_user', JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
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
        updateUserProfile
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
