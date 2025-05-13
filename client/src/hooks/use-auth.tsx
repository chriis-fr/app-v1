import * as React from 'react';
import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { User as SchemaUser, OrganizationSettings, Role } from '@shared/schema';

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
  };
  owner: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginMutation: UseMutationResult<void, Error, LoginData>;
  registerMutation: UseMutationResult<void, Error, RegisterData>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create context
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  loginMutation: {} as UseMutationResult<void, Error, LoginData>,
  registerMutation: {} as UseMutationResult<void, Error, RegisterData>,
  setUser: () => {},
});

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Use React Query to fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update user state when data is fetched
  React.useEffect(() => {
    if (userData) {
      setUser(userData);
    }
    setIsLoading(isUserLoading);
  }, [userData, isUserLoading]);

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
        organization: userData.organization,
        moduleAccess: userData.moduleAccess || [],
        permissions: userData.permissions || []
      });
      setError(null);

      // Wait a moment to ensure the token is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the session is active and get fresh data
      const meResponse = await fetch('/api/auth/me');
      if (!meResponse.ok) {
        throw new Error('Failed to fetch user data after login');
      }
      
      const fullUserData = await meResponse.json();
      setUser({
        ...fullUserData,
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
        organization,
        moduleAccess: [],
        permissions: []
      });
      setError(null);

      // Wait a moment to ensure the token is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the session is active
      const meResponse = await fetch('/api/auth/me');
      if (!meResponse.ok) {
        throw new Error('Failed to verify session after registration');
      }
    },
  });

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear the user state
      setUser(null);
      
      // Clear any cached data in localStorage or sessionStorage
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Force a page reload to clear any cached state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        loginMutation,
        registerMutation,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 