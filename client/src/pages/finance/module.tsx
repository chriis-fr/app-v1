import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function FinanceModulePage() {
  const { module } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is an owner
  if (!user?.role?.includes('owner')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          This page is only accessible to organization owners.
        </p>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Render the appropriate module based on the route parameter
  switch (module) {
    case 'financial-overview':
    case 'budgeting':
    case 'investment':
    case 'treasury':
    case 'asset-management':
    case 'financial-planning':
    case 'compliance':
    case 'international':
      return (
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
          <p className="text-muted-foreground mb-4">
            This finance module is under development.
          </p>
          <Button onClick={() => setLocation('/dashboard/finance')}>
            Return to Finance
          </Button>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested finance module does not exist.
          </p>
          <Button onClick={() => setLocation('/dashboard/finance')}>
            Return to Finance
          </Button>
        </div>
      );
  }
} 