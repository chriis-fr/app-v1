import { useAuth } from './use-auth';

export function useRoleAccess() {
  const { user } = useAuth();

  const isOwner = () => {
    return user?.role === 'owner';
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isHR = () => {
    return user?.role === 'hr_admin' || user?.department === 'HR';
  };

  const canAccessDashboard = () => {
    return isOwner() || isAdmin();
  };

  const canAccessCompactSidebar = () => {
    return isOwner();
  };

  const canAccessDepartment = (department: string) => {
    if (isOwner()) return true;
    if (isAdmin()) return user?.department === department;
    return user?.department === department;
  };

  const canManageUsers = () => {
    if (isOwner()) return true;
    if (isAdmin()) return true;
    if (isHR()) return true;
    return false;
  };

  const canCreateUser = (targetDepartment: string) => {
    if (isOwner()) return true;
    if (isAdmin()) return user?.department === targetDepartment;
    if (isHR()) return targetDepartment === 'HR';
    return false;
  };

  const canAccessModule = (module: string) => {
    if (isOwner()) return true;
    if (!user?.moduleAccess) return false;
    return user.moduleAccess.includes(module);
  };

  return {
    isOwner,
    isAdmin,
    isHR,
    canAccessDashboard,
    canAccessCompactSidebar,
    canAccessDepartment,
    canManageUsers,
    canCreateUser,
    canAccessModule
  };
} 