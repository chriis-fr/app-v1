import { Route, RouteProps } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  requiredModule?: string;
}

export function ProtectedRoute({ component: Component, requiredModule, ...rest }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  console.log('ProtectedRoute rendered', { user, requiredModule });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to /auth');
    setLocation('/auth');
    return null;
  }

  // Always allow owners
  if (user?.isOwner) {
    console.log('Is owner, allow');
    return <Route {...rest} component={Component} />;
  }

  if (requiredModule) {
    const moduleAccess = Array.isArray(user?.moduleAccess) ? user.moduleAccess : [];
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasModuleAccess = moduleAccess.includes(requiredModule);
    const hasModulePermission = permissions.some((p: any) => p.module === requiredModule);
    const isHRAdmin = user?.role === 'admin' && user?.department === 'HR' && requiredModule === 'hr';
    console.log('Module check', { hasModuleAccess, hasModulePermission, role: user?.role, moduleAccess: user?.moduleAccess, permissions: user?.permissions });
    if (user?.role === 'admin' && (hasModuleAccess || hasModulePermission || isHRAdmin)) {
      console.log('Is admin with access, allow');
      return <Route {...rest} component={Component} />;
    }
    // Otherwise, block
    console.log('Redirecting to /dashboard');
    setLocation('/dashboard');
    return null;
  }

  return <Route {...rest} component={Component} />;
}