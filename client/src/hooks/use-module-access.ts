import { useAuth } from './use-auth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { staticData } from '@/data/static';

export function useModuleAccess() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const checkModuleAccess = (moduleName: string) => {
    if (!user?.organizationId) return false;

    // Get company modules from staticData (will be replaced with API call later)
    const company = staticData.companies.find(c => c.id === user.organizationId);
    if (!company) return false;

    const modules = company.modules.map(m => m.toLowerCase());
    return modules.includes(moduleName.toLowerCase());
  };

  const requireModuleAccess = (moduleName: string) => {
    if (!checkModuleAccess(moduleName)) {
      setLocation('/dashboard');
      return false;
    }
    return true;
  };

  return {
    checkModuleAccess,
    requireModuleAccess
  };
} 