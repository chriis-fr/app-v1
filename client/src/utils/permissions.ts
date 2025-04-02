import { useAuth } from '@/hooks/use-auth';

// Role hierarchy (higher number = more permissions)
const roleHierarchy = {
  'Owner': 4,
  'Organization Admin': 3,
  'Manager': 2,
  'User': 1
};

export function usePermissions() {
  const { user } = useAuth();
  
  const canAccessModule = (moduleName: string) => {
    if (!user) return false;
    
    // In a real implementation, you would check module permissions
    // based on the user's role and assigned permissions
    
    // For demo purposes, we'll use the role hierarchy
    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    
    // Admin and above can access everything
    if (userRoleLevel >= 3) return true;
    
    // Example of restricted modules for lower roles
    const restrictedModules = ['Security', 'Settings'];
    if (userRoleLevel < 3 && restrictedModules.includes(moduleName)) {
      return false;
    }
    
    return true;
  };
  
  return {
    canAccessModule,
    isAdmin: !!user && roleHierarchy[user.role as keyof typeof roleHierarchy] >= 3,
    isOwner: !!user && user.role === 'owner'
  };
} 