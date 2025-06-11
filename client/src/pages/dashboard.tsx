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

export default function Dashboard() {
  const { user } = useAuth();
  const { canAccessDashboard } = useRoleAccess();
  const [, setLocation] = useLocation();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const modules = user?.organization?.activeModules || [];

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
    enabled: modules.includes('hr'),
  });

  // Fetch POS stats (sales/orders)
  const { data: posOrders = [] } = useQuery({
    queryKey: ['pos-orders'],
    queryFn: () => api.get('/pos/orders'),
    enabled: modules.includes('pos'),
  });

  // Fetch inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ['pos-inventory'],
    queryFn: () => api.get('/pos/inventory'),
    enabled: modules.includes('pos'),
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: () => api.get('/pos/customers'),
    enabled: modules.includes('pos'),
  });

  if (!canAccessDashboard()) {
    return null;
  }

  if (user?.role === 'hr_admin') {
    return <HRMain />;
  }

  // Return department-specific dashboard based on user's department
  switch(user?.department?.toLowerCase()) {
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
      // Executive/Super Admin view with company-wide metrics
      const company = staticData.companies[0];
      const { businessMetrics } = company;
      const modules = company.modules.map(m => m.toLowerCase());

      // Company Overview Section
      const companyOverview = (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            {companyLogo && <img src={companyLogo} alt="Logo" className="h-12 w-12 rounded-full border" />}
            <div>
              <CardTitle className="text-2xl font-bold">{user?.organization?.name || 'Your Organization'}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Industry: {user?.organization?.industry || 'N/A'} | Founded: {user?.organization?.createdAt ? new Date(user.organization.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Modules: {modules.join(', ')}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex gap-8 flex-wrap">
            <div className="flex flex-col items-center">
              <Users className="text-blue-600 mb-1" />
              <span className="font-bold text-lg">{employees.length}</span>
              <span className="text-xs text-muted-foreground">Employees</span>
            </div>
            <div className="flex flex-col items-center">
              <Package className="text-green-600 mb-1" />
              <span className="font-bold text-lg">{inventory.length}</span>
              <span className="text-xs text-muted-foreground">Products</span>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign className="text-yellow-600 mb-1" />
              <span className="font-bold text-lg">{posOrders.length}</span>
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
            <div className="flex flex-col items-center">
              <BarChart3 className="text-purple-600 mb-1" />
              <span className="font-bold text-lg">{customers.length}</span>
              <span className="text-xs text-muted-foreground">Customers</span>
            </div>
          </CardContent>
        </Card>
      );

      // Quick Stats Section
      const quickStats = (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <TrendingUp className="text-green-600 mb-1" />
              <span className="font-bold text-lg">{analytics?.systemMetrics?.activity?.transactions ?? '--'}</span>
              <span className="text-xs text-muted-foreground">Transactions</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <CheckCircle className="text-blue-600 mb-1" />
              <span className="font-bold text-lg">{analytics?.systemMetrics?.users?.active ?? '--'}</span>
              <span className="text-xs text-muted-foreground">Active Users</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <AlertTriangle className="text-red-600 mb-1" />
              <span className="font-bold text-lg">{inventory.filter((item: any) => item.quantity <= (item.reorderPoint || 10)).length}</span>
              <span className="text-xs text-muted-foreground">Low Stock</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <TrendingDown className="text-orange-600 mb-1" />
              <span className="font-bold text-lg">{analytics?.systemMetrics?.users?.inactive ?? '--'}</span>
              <span className="text-xs text-muted-foreground">Inactive Users</span>
            </CardContent>
          </Card>
        </div>
      );

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
            {companyOverview}
            {quickStats}

            {/* Business Health Section */}
            {['pos','hr','accounting','blockchain'].some(m => modules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <BusinessHealth />
              </div>
            )}

            {/* AI-Powered Analytics Section */}
            {['pos','hr','accounting','blockchain'].some(m => modules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <AIAnalytics />
              </div>
            )}

            {/* Assets at Work Section */}
            {['hr','pos','accounting'].some(m => modules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <AssetsAtWork />
              </div>
            )}

            {/* Ongoing Operations Section */}
            {['pos','hr','accounting','blockchain'].some(m => modules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <OngoingOperations />
              </div>
            )}

            {/* Web3 and Governance Features Section */}
            {modules.includes('blockchain') && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <Web3Features />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {modules.includes('pos') && (
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-black">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-black">${businessMetrics.revenue.toLocaleString()}</div>
                    <p className="text-xs text-primary/70">
                    +{businessMetrics.growthRate}% from last month
                  </p>
                </CardContent>
              </Card>
              )}
              {modules.includes('accounting') && (
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-black">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-black">${businessMetrics.profit.toLocaleString()}</div>
                    <p className="text-xs text-emerald-600/70">
                    {((businessMetrics.profit / businessMetrics.revenue) * 100).toFixed(1)}% margin
                  </p>
                </CardContent>
              </Card>
              )}
              {modules.includes('accounting') && (
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-black">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-black">${businessMetrics.cashFlow.toLocaleString()}</div>
                    <p className="text-xs text-blue-600/70">
                    Current month
                  </p>
                </CardContent>
              </Card>
              )}
              {modules.includes('accounting') && (
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-black">Total Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-black">${businessMetrics.assetsValue.toLocaleString()}</div>
                    <p className="text-xs text-purple-600/70">
                    ${businessMetrics.equity.toLocaleString()} equity
                  </p>
                </CardContent>
              </Card>
              )}
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <AIInsights />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2 bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-black">Departmental Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules.includes('pos') && (
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="font-medium">POS</span>
                        <span className="text-primary font-semibold">${staticData.pos.analytics.dailySales.toLocaleString()} daily sales</span>
                    </div>
                    )}
                    {modules.includes('hr') && (
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="font-medium">HR</span>
                        <span className="text-primary font-semibold">{staticData.hr.analytics.headcount} employees</span>
                    </div>
                    )}
                    {modules.includes('accounting') && (
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="font-medium">Accounting</span>
                        <span className="text-primary font-semibold">{staticData.accounting.analytics.profitMargin}% margin</span>
                    </div>
                    )}
                    {modules.includes('blockchain') && (
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="font-medium">Blockchain</span>
                        <span className="text-primary font-semibold">{staticData.blockchain.analytics.totalTransactions} transactions</span>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-black">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors">
                      <span className="font-medium">Growth Rate</span>
                      <span className="font-semibold text-emerald-600">+{businessMetrics.growthRate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors">
                      <span className="font-medium">Assets/Liabilities</span>
                      <span className="font-semibold text-primary">
                        {(businessMetrics.assetsValue / businessMetrics.liabilities).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-colors">
                      <span className="font-medium">Employee Satisfaction</span>
                      <span className="font-semibold text-primary">{staticData.hr.analytics.satisfactionScore}/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      );
  }
}