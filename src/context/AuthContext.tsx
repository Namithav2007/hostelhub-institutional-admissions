import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, RoomAllocation } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  allocation: RoomAllocation | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allocation, setAllocation] = useState<RoomAllocation | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hostel_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('hostel_token')) {
        setUser(null);
        setAllocation(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setAllocation(data.allocation || null);
    } catch (err) {
      console.error('Failed to load current user:', err);
      localStorage.removeItem('hostel_token');
      setUser(null);
      setAllocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleExpired = () => {
      setUser(null);
      setAllocation(null);
      setToken(null);
    };

    window.addEventListener('auth_token_expired', handleExpired);
    return () => window.removeEventListener('auth_token_expired', handleExpired);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('hostel_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(userData);
      localStorage.setItem('hostel_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hostel_token');
    setToken(null);
    setUser(null);
    setAllocation(null);
  };

  const switchDemoUser = async (role: UserRole) => {
    const demoCredentials: Record<UserRole, { email: string; pass: string }> = {
      admin: { email: 'admin@campus.edu', pass: 'admin123' },
      warden: { email: 'warden@campus.edu', pass: 'warden123' },
      finance: { email: 'finance@campus.edu', pass: 'finance123' },
      student: { email: 'student@campus.edu', pass: 'student123' },
    };

    const creds = demoCredentials[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allocation,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
