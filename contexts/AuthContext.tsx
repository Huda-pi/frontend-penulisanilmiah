

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: 'guru' | 'murid' | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get<{ authenticated: boolean, user: User }>('/api/check-auth');
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials: any) => {
    const data = await apiService.post<{ user: User }>('/api/auth/login', credentials);
    if (data.user) {
        setUser(data.user);
    }
  };

  const register = async (data: any) => {
    await apiService.post('/api/auth/register', data);
  };

  const logout = async () => {
    await apiService.post('/api/auth/logout', {});
    setUser(null);
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
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