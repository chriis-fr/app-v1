import { useOrganization } from '@/contexts/OrganizationContext';

// Roles hierarchy
const roleHierarchy = {
  'Owner': 4,
  'Organization Admin': 3,
  'Manager': 2,
  'User': 1
};

export function usePermissions() {
  const { currentUser } = useOrganization();
  
  const hasPermission = (requiredRole: string) => {
    if (!currentUser) return false;
    
    const userRoleValue = roleHierarchy[currentUser.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleValue = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    return userRoleValue >= requiredRoleValue;
  };
  
  const isAdmin = () => {
    return hasPermission('Organization Admin');
  };
  
  const isOwner = () => {
    return hasPermission('Owner');
  };
  
  return {
    hasPermission,
    isAdmin,
    isOwner
  };
} 