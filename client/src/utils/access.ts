// Utility for access control
export function hasFullAccess(user: any): boolean {
  return (
    user &&
    ((typeof user.role === 'string' && user.role.toLowerCase() === 'owner') || user.isOwner === true)
  );
}

export function hasModuleAccess(user: any, module: string): boolean {
  if (hasFullAccess(user)) return true;
  if (!user) return false;
  // Admin for this module
  if (user.role && user.role.toLowerCase() === 'admin' && user.department && user.department.toLowerCase() === module) return true;
  // Explicit module access
  if (user.moduleAccess && Array.isArray(user.moduleAccess) && user.moduleAccess.includes(module)) return true;
  // Permissions array
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.some((p: any) => p.module === module && p.actions && p.actions.length > 0);
  }
  return false;
} 