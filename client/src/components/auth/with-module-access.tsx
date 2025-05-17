import { useModuleAccess } from '@/hooks/use-module-access';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function withModuleAccess(WrappedComponent: React.ComponentType, moduleName: string) {
  return function WithModuleAccess(props: any) {
    const { requireModuleAccess } = useModuleAccess();
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!requireModuleAccess(moduleName)) {
        return;
      }
    }, [user, moduleName]);

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 