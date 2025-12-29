import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, authApi, LoginData, SignupData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (datas: LoginData) => Promise<void>;
  signup: (datas: SignupData) => Promise<void>;
  logout: () => void;
  updateLanguage: (language: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (datas: LoginData) => {
    setIsLoading(true);
    const response = await authApi.login(datas);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setToken(response.data.token);
    setUser(response.data.user);
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (datas: SignupData) => {
    setIsLoading(true);
    const response = await authApi.signup(datas);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setToken(response.data.token);
    setUser(response.data.user);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateLanguage = useCallback((language: string) => {
    if (user) {
      const updatedUser = { ...user, language };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        updateLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
