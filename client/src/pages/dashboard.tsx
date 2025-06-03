import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staticData } from '@/data/static';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
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

export default function Dashboard() {
  const { user } = useAuth();
  const { canAccessDashboard } = useRoleAccess();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!canAccessDashboard()) {
      setLocation('/');
      return;
    }
  }, [canAccessDashboard, setLocation]);

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