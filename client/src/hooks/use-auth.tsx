import * as React from 'react';
import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { User as SchemaUser, OrganizationSettings, Role } from '@shared/schema';
import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Define types
interface Organization {
  id: string;
  name: string;
  type: string;
  industry: string;
  size?: string;
  walletAddress?: string;
  activeModules: string[];
  maxModules: number;
  address?: string;
  country?: string;
  taxId?: string;
  website?: string;
  settings?: OrganizationSettings;
  roles?: Role[];
}

export type User = SchemaUser & {
  organization?: Organization;
  moduleAccess?: string[];
  permissions?: { module: string; actions: string[] }[];
  avatarUrl?: string | null;
};

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  organization: {
    name: string;
    type: string;
    industry: string;
    settings?: OrganizationSettings & { tier?: string };
  };
  owner: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  waitlistedModules?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  loginMutation: UseMutationResult<void, Error, LoginData>;
  registerMutation: UseMutationResult<void, Error, RegisterData>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  getToken: () => string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect to /activate if user is not active or not email verified
  useEffect(() => {
    if (user && (user.isActive === false || user.emailVerified === false)) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/activate')) {
        setLocation('/activate');
      }
    }
  }, [user, setLocation]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginMutation = useMutation<void, Error, LoginData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user: userData, token } = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Set the user state with the complete user data including organization
      setUser({
        ...userData,
        isOwner: userData.role === 'owner',
        organization: userData.organization,
        moduleAccess: userData.moduleAccess || [],
        permissions: userData.permissions || []
      });
      setError(null);

      // Wait a moment to ensure the token is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the session is active and get fresh data
      const meResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!meResponse.ok) {
        throw new Error('Failed to fetch user data after login');
      }
      
      const fullUserData = await meResponse.json();
      setUser({
        ...fullUserData,
        isOwner: fullUserData.role === 'owner',
        organization: fullUserData.organization,
        moduleAccess: fullUserData.moduleAccess || [],
        permissions: fullUserData.permissions || []
      });
    },
  });

  const registerMutation = useMutation<void, Error, RegisterData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const { owner, organization, token } = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Set the user state with organization data
      setUser({
        ...owner,
        isOwner: owner.role === 'owner',
        organization,
        moduleAccess: [],
        permissions: []
      });
      setError(null);

      // Wait a moment to ensure the token is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the session is active
      const meResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!meResponse.ok) {
        throw new Error('Failed to verify session after registration');
      }
    },
  });

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      setLocation('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Clear any other auth-related data
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    // Clear user state
    setUser(null);
    // Clear any error state
    setError(null);
    // Redirect to auth page
    setLocation('/auth');
  };

  // Add a function to get the current token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        setUser,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 