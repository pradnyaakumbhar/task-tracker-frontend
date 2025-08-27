import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from "react";
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

interface RegisterResponse {
  token: string;
  user: User;
  message: string;
}

interface ApiError {
  error: string;
  message?: string;
}

interface ProfileResponse {
  user: User;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/auth/login`,
        {email, password},
        { headers: {
            'Content-Type': 'application/json',
        }}
      )

      const data: LoginResponse | ApiError = await response.data;

      if (data) {
        const loginData = data as LoginResponse;
        localStorage.setItem('auth_token', loginData.token);
        setToken(loginData.token);
        setUser(loginData.user);
      } else {
        const errorData = data as ApiError;
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during login');
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/auth/register`,
        {name, email, password},
        { headers: {
            'Content-Type': 'application/json',
        }}
      )

      const data: RegisterResponse | ApiError = await response.data;

      if (data) {
        const registerData = data as RegisterResponse;
        localStorage.setItem('auth_token', registerData.token);
        setToken(registerData.token);
        setUser(registerData.user);
      } else {
        const errorData = data as ApiError;
        throw new Error(errorData.error || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during registration');
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const fetchProfile = async (authToken: string): Promise<void> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/user/profile`,
        { headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        }}
      )

      if (response) {
        const data: ProfileResponse = await response.data;
        setUser(data.user);
    
        
      } 
    } catch (error) {
      console.error('Profile fetch error:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Context value
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};