import { useAuth } from './use-auth';

export function useRoleAccess() {
  const { user } = useAuth();

  const isOwner = () => {
    return user?.role === 'owner';
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const canAccessDashboard = () => {
    return isOwner() || isAdmin();
  };

  const canAccessCompactSidebar = () => {
    return isOwner();
  };

  return {
    isOwner,
    isAdmin,
    canAccessDashboard,
    canAccessCompactSidebar
  };
} 