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

  if (requiredModule && !user?.moduleAccess?.includes(requiredModule)) {
    setLocation('/dashboard');
    return null;
  }

  return <Route {...rest} component={Component} />;
}