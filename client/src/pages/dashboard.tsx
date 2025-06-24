import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staticData } from '@/data/static';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { BusinessHealth } from '@/components/dashboard/BusinessHealth';
import { AIAnalytics } from '@/components/dashboard/AIAnalytics';
import { AssetsAtWork } from '@/components/dashboard/AssetsAtWork';
import { OngoingOperations } from '@/components/dashboard/OngoingOperations';
import { Web3Features } from '@/components/dashboard/Web3Features';
import POSMain from '@/components/modules/pos/POSMain';
import HRMain from '@/components/modules/hr/HRMain';
import AccountingMain from '@/components/modules/accounting/AccountingMain';
import BlockchainMain from '@/components/modules/blockchain/BlockchainMain';
import CRMMain from '@/components/modules/crm/CRMMain';
import { BarChart3, Users, DollarSign, Package, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Map module IDs to their main components
const moduleComponentMap: Record<string, React.ComponentType<any>> = {
  accounting: AccountingMain,
  hr: HRMain,
  pos: POSMain,
  blockchain: BlockchainMain,
  crm: CRMMain,
};

export default function Dashboard() {
  const { user } = useAuth();
  const { canAccessDashboard } = useRoleAccess();
  const [, setLocation] = useLocation();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const orgModules: string[] = (user?.organization && (user.organization as any).enabledModules)
    ? (user.organization as any).enabledModules
    : user?.organization?.activeModules || [];

  useEffect(() => {
    if (!canAccessDashboard()) {
      setLocation('/');
      return;
    }
  }, [canAccessDashboard, setLocation]);

  // Fetch organization analytics and stats
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['org-analytics'],
    queryFn: () => api.get('/analytics/organization/metrics'),
  });

  // Fetch HR stats (employees)
  const { data: employees = [] } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: () => api.get('/hr/employees'),
    enabled: orgModules.includes('hr'),
  });

  // Fetch POS stats (sales/orders)
  const { data: posOrders = [] } = useQuery({
    queryKey: ['pos-orders'],
    queryFn: () => api.get('/pos/orders'),
    enabled: orgModules.includes('pos'),
  });

  // Fetch inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ['pos-inventory'],
    queryFn: () => api.get('/pos/inventory'),
    enabled: orgModules.includes('pos'),
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: () => api.get('/pos/customers'),
    enabled: orgModules.includes('pos'),
  });

  if (!canAccessDashboard()) {
    return null;
  }

  // Show module dashboard for module managers/employees
  if (user?.department) {
    switch(user.department.toLowerCase()) {
    case 'pos':
      return <POSMain />;
    case 'hr':
      return <HRMain />;
    case 'accounting':
      return <AccountingMain />;
    case 'blockchain':
      return <BlockchainMain />;
    case 'crm':
      return <CRMMain />;
    default:
        break;
    }
  }

  // Show HR dashboard for HR admins
  if (user?.role === 'hr_admin') {
    return <HRMain />;
  }

  // Show company overview/analytics for owners/admins (no department or executive roles)
  // (Do NOT render module dashboards here)
      return (
        <DashboardLayout>
          <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-black">
                Company Overview
              </h2>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
        {/* High-level analytics and company stats only. No module dashboards. */}
        {['pos','hr','accounting','blockchain'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <BusinessHealth />
              </div>
            )}
        {['pos','hr','accounting','blockchain'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <AIAnalytics />
              </div>
            )}
        {['hr','pos','accounting'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <AssetsAtWork />
              </div>
            )}
        {['pos','hr','accounting','blockchain'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <OngoingOperations />
              </div>
            )}
        {orgModules.includes('blockchain') && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <Web3Features />
              </div>
            )}
        {/* ...other company-wide analytics sections... */}
          </div>
        </DashboardLayout>
      );
}