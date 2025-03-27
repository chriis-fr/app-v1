import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useMutation, UseMutationResult } from '@tanstack/react-query';

// Define types
interface Organization {
  id: string;
  name: string;
  plan?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  organization?: Organization;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  name: string;
  type: string;
  industry: string;
  address?: string;
  country?: string;
  website?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  selectedModules: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginMutation: UseMutationResult<void, Error, LoginData>;
  registerMutation: UseMutationResult<void, Error, RegisterData>;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  loginMutation: {} as UseMutationResult<void, Error, LoginData>,
  registerMutation: {} as UseMutationResult<void, Error, RegisterData>,
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation<void, Error, LoginData>({
    mutationFn: async (data) => {
      // In a real app, you would make an API call here
      const mockUser: User = {
        id: 'user123',
        name: 'John Doe',
        email: data.username,
        role: 'Organization Admin',
        organization: {
          id: 'org456',
          name: 'TechCorp Solutions',
          plan: 'Enterprise'
        }
      };
      
      localStorage.setItem('erp_user_session', JSON.stringify(mockUser));
      setUser(mockUser);
    },
  });

  const registerMutation = useMutation<void, Error, RegisterData>({
    mutationFn: async (data) => {
      // Implement registration logic here
      console.log('Registering:', data);
    },
  });

  useEffect(() => {
    // Check if user session exists
    const checkSession = async () => {
      try {
        // This would typically be a fetch to your backend to check session
        // For now, let's check localStorage for demo purposes
        const sessionData = localStorage.getItem('erp_user_session');
        
        if (sessionData) {
          const userData = JSON.parse(sessionData);
          setUser(userData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Session check failed', err);
        setError('Failed to authenticate');
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, you would make an API call here
      // Example: const response = await fetch('/api/auth/login', {...})
      
      // For demo purposes, let's simulate a successful login with mock data
      const mockUser: User = {
        id: 'user123',
        name: 'John Doe',
        email: email,
        role: 'Organization Admin',
        organization: {
          id: 'org456',
          name: 'TechCorp Solutions',
          plan: 'Enterprise'
        }
      };
      
      // Save to localStorage for demo
      localStorage.setItem('erp_user_session', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setError(null);
    } catch (err) {
      console.error('Login failed', err);
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // In a real app: await fetch('/api/auth/logout', {...})
      localStorage.removeItem('erp_user_session');
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    loginMutation,
    registerMutation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
} 