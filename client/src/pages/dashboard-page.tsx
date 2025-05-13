import { useAuth } from '@/hooks/use-auth';
import CompactSidebar from '@/components/layout/CompactSidebar';
import BlockchainInsights from '@/components/modules/dashboard/BlockchainInsights';

export default function DashboardPage() {
  const { user } = useAuth();
  const activeModules = user?.organization?.activeModules || [];

  return (
    <div className="flex min-h-screen">
      <CompactSidebar />
      <div className="flex-1 p-8 ml-20">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
        
        {/* Display blockchain insights if the module is active */}
        {activeModules.includes('blockchain') && (
          <div className="mb-8">
            <BlockchainInsights />
          </div>
        )}

        {/* Other dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add your existing dashboard cards here */}
        </div>
      </div>
    </div>
  );
} 