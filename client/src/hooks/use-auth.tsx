import * as React from 'react';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { User as SchemaUser, OrganizationSettings, Role } from '@shared/schema';

// Define types
interface Organization {
  id: string;
  name: string;
  plan: string;
  settings: OrganizationSettings;
  roles: Role[];
}

export type User = SchemaUser & {
  organization?: Organization;
  avatarUrl?: string | null;
};

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  organizationName: string;
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

      const { user: userData } = await response.json();
      setUser(userData);
      setError(null);
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
      
      // Set the user state
      setUser(owner);
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

  React.useEffect(() => {
    // Check if user session exists
    const checkSession = async () => {
      try {
        // Only check session if we don't already have a user
        if (!user) {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ username: email, password });
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