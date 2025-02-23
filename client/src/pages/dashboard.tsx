import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staticData } from '@/data/static';
import { useAuth } from '@/hooks/use-auth';
import { AIInsights } from '@/components/dashboard/AIInsights';
import POSMain from '@/components/modules/pos/POSMain';
import HRMain from '@/components/modules/hr/HRMain';
import AccountingMain from '@/components/modules/accounting/AccountingMain';
import BlockchainMain from '@/components/modules/blockchain/BlockchainMain';
import CRMMain from '@/components/modules/crm/CRMMain';

export default function Dashboard() {
  const { user } = useAuth();

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

      return (
        <DashboardLayout>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Company Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${businessMetrics.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{businessMetrics.growthRate}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${businessMetrics.profit.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {((businessMetrics.profit / businessMetrics.revenue) * 100).toFixed(1)}% margin
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${businessMetrics.cashFlow.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Current month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${businessMetrics.assetsValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    ${businessMetrics.equity.toLocaleString()} equity
                  </p>
                </CardContent>
              </Card>
            </div>

            <AIInsights />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Departmental Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>POS</span>
                      <span className="font-medium">${staticData.pos.analytics.dailySales.toLocaleString()} daily sales</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>HR</span>
                      <span className="font-medium">{staticData.hr.analytics.headcount} employees</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Accounting</span>
                      <span className="font-medium">{staticData.accounting.analytics.profitMargin}% margin</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Blockchain</span>
                      <span className="font-medium">{staticData.blockchain.analytics.totalTransactions} transactions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Growth Rate</span>
                      <span className="font-medium text-emerald-600">+{businessMetrics.growthRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Assets/Liabilities</span>
                      <span className="font-medium">
                        {(businessMetrics.assetsValue / businessMetrics.liabilities).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Employee Satisfaction</span>
                      <span className="font-medium">{staticData.hr.analytics.satisfactionScore}/5.0</span>
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