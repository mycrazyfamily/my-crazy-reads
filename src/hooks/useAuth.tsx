
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type User = {
  email: string;
  isAuthenticated: boolean;
  isTemporary?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isTemporaryUser: boolean;
  login: (userData: User) => void;
  logout: () => void;
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
  
  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user?.isAuthenticated,
        isTemporaryUser: !!user?.isTemporary,
        login,
        logout
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
