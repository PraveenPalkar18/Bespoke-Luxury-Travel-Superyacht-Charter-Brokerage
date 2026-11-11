'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import { loginApi, fetchMe } from './api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isBroker: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('aurelia_auth_token');
    const storedUser = localStorage.getItem('aurelia_auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token in background
        fetchMe(storedToken)
          .then((verified) => {
            setUser(verified);
            localStorage.setItem('aurelia_auth_user', JSON.stringify(verified));
          })
          .catch(() => {
            // Token expired or invalid
            logout();
          })
          .finally(() => setIsLoading(false));
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
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

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aurelia_auth_token');
    localStorage.removeItem('aurelia_auth_user');
  };

  const isAdmin = user?.role === 'admin';
  const isBroker = user?.role === 'broker' || isAdmin;

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

