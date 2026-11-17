'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import { loginApi, logoutApi, fetchMe } from './api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isBroker: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initializeAuth() {
      const storedToken = localStorage.getItem('aurelia_auth_token');
      const storedUser = localStorage.getItem('aurelia_auth_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {}
      }

      // Verify session via cookie or token
      try {
        const verified = await fetchMe(storedToken || undefined);
        setUser(verified);
        if (storedToken) {
          localStorage.setItem('aurelia_auth_user', JSON.stringify(verified));
        }
      } catch (err) {
        // If verification fails, clear any invalid session
        setUser(null);
        setToken(null);
        localStorage.removeItem('aurelia_auth_token');
        localStorage.removeItem('aurelia_auth_user');
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: receivedToken, user: receivedUser } = await loginApi(email, password);
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('aurelia_auth_token', receivedToken);
      localStorage.setItem('aurelia_auth_user', JSON.stringify(receivedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi(token || undefined);
    } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('aurelia_auth_token');
    localStorage.removeItem('aurelia_auth_user');
  };

  const isAdmin = user?.role === 'admin';
  const isBroker = user?.role === 'broker' || isAdmin;

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin,
        isBroker,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
