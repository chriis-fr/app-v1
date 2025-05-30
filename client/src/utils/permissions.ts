import { useAuth } from '@/hooks/use-auth';

// Role hierarchy (higher number = more permissions)
const roleHierarchy = {
  'owner': 4,
  'admin': 3,
  'manager': 2,
  'employee': 1
};

export function usePermissions() {
  const { user } = useAuth();
  
  const canAccessModule = (moduleName: string) => {
    if (!user) return false;
    // Owners always have access
    if (user.role === 'owner' || user.isOwner) return true;
    // Check if user has explicit access to the module
    if (user.moduleAccess && user.moduleAccess.includes(moduleName)) {
      return true;
    }
    // Check permissions array for the module
    if (user.permissions && user.permissions.some((p) => p.module === moduleName && p.actions.length > 0)) {
      return true;
    }
    // Fallback to role-based access
    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    // Admin and above can access everything
    if (userRoleLevel >= 3) return true;
    // Example of restricted modules for lower roles
    const restrictedModules = ['security', 'settings'];
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