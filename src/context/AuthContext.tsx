import React, { createContext, useContext, useEffect, useState } from 'react';
import { neonAuth, UserSession } from '../lib/auth';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nome: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Carregar sessão existente
    const session = neonAuth.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await neonAuth.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Erro ao realizar login.' };
  };

  const register = async (nome: string, email: string, password: string) => {
    const result = await neonAuth.signUp(nome, email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Erro ao criar conta.' };
  };

  const logout = () => {
    neonAuth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
