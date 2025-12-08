import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'institution' | 'government' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { id: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');

      if (storedToken && storedUser) {
        try {
          // Validate token with backend
          await authService.validateToken();
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('isAuthenticated');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { id: string; password: string; role: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);

      // Store in localStorage
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refresh();
      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem('authToken', newToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};