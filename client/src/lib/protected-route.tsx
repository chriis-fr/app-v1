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

  if (!isAuthenticated) {
    setLocation('/auth');
    return null;
  }

  // Check if user is activated - if not, redirect to activate page
  if (user && (user.isActive === false || user.emailVerified === false)) {
    setLocation('/activate');
    return null;
  }

  // Always allow owners
  if (user?.isOwner) {
    return <Route {...rest} component={Component} />;
  }

  if (requiredModule) {
    const moduleAccess = Array.isArray(user?.moduleAccess) ? user.moduleAccess : [];
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasModuleAccess = moduleAccess.includes(requiredModule);
    const hasModulePermission = permissions.some((p: any) => p.module === requiredModule);
    const isHRAdmin = user?.role === 'admin' && user?.department === 'HR' && requiredModule === 'hr';
    if (user?.role === 'admin' && (hasModuleAccess || hasModulePermission || isHRAdmin)) {
      return <Route {...rest} component={Component} />;
    }
    // Otherwise, block
    setLocation('/dashboard');
    return null;
  }

  return <Route {...rest} component={Component} />;
}