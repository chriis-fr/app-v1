import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for our organization and user data
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
};

type Organization = {
  id: string;
  name: string;
  plan: string;
  industry: string;
  tier: string;
  enabledModules: string[];
  settings?: Record<string, any>;
  aiEnabled?: boolean;
  logo?: string;
  createdAt: string;
};

interface OrganizationContextType {
  organization: Organization | null;
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  refreshOrganization: () => Promise<void>;
}

// Create the context with default values
const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  currentUser: null,
  isLoading: true,
  error: null,
  refreshOrganization: async () => {},
});

// Hook for easy consumption of the context
export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationData = async () => {
    console.log('fetching organization data');
    try {
      setIsLoading(true);
      // Fetch the current user data
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      setCurrentUser(userData);
      // Fetch the organization data
      const orgResponse = await fetch(`/api/organization/${userData.organizationId}`);
      if (!orgResponse.ok) {
        throw new Error('Failed to fetch organization');
      }
      const orgData = await orgResponse.json();
      setOrganization({
        ...orgData,
        industry: orgData.industry,
        tier: orgData.tier || orgData.plan || 'free',
        enabledModules: orgData.enabledModules || orgData.activeModules || [],
        settings: orgData.settings || {},
        aiEnabled: orgData.settings?.aiEnabled ?? true,
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch organization data');
      setIsLoading(false);
      console.error('Error fetching organization data:', err);
    }
  };

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const refreshOrganization = async () => {
    await fetchOrganizationData();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        currentUser,
        isLoading,
        error,
        refreshOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}; 