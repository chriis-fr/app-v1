import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import GeneralLedger from './general-ledger';
import { hasFullAccess, hasModuleAccess } from '@/utils/access';

export default function AccountingModulePage() {
  const { module } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user has access to accounting module
  if (!user || !(hasFullAccess(user) || hasModuleAccess(user, 'accounting'))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You don't have access to the accounting module.
        </p>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Render the appropriate module based on the route parameter
  switch (module) {
    case 'general-ledger':
      return <GeneralLedger />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested accounting module does not exist.
          </p>
          <Button onClick={() => setLocation('/dashboard/accounting')}>
            Return to Accounting
          </Button>
        </div>
      );
  }
} 