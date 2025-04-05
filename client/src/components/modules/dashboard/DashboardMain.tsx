import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import ActionCenter from '@/components/dashboard/ActionCenter';
import { Download, FileText, Plus, Users, ShoppingBag, Wallet, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staticData } from '@/data/static';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardMain() {
  // Gather data from various modules
  const orders = staticData.pos.orders;
  const transactions = staticData.blockchain.transactions;
  const invoices = staticData.accounting.invoices;
  
  const { user, isLoading } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {isLoading ? 'Loading...' : `Welcome back, ${user?.username || 'User'}`}
          </h1>
          <p className="text-gray-500">
            {user?.organization?.name ? 
              `${user.organization.name} ERP Dashboard` : 
              'Enterprise Resource Planning System'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5" />
            Reports
          </button>
          <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  ${orders.reduce((acc, order) => acc + order.totalAmount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">In current period</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {transactions.length} Transactions
                </div>
                <div className="text-sm text-gray-500">Total {transactions.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)} ETH</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accounting Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  ${invoices
                    .filter(inv => inv.status === 'Pending')
                    .reduce((acc, inv) => acc + inv.amount, 0)
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Outstanding invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights for {user?.organization?.name || 'Your Organization'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">Sales Trend Analysis</h4>
                  <p className="text-sm text-blue-700">
                    Your sales have increased by 15% compared to last month. The Point of Sale module 
                    is seeing the highest engagement across your organization.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-800 mb-2">Blockchain Integration Opportunity</h4>
                  <p className="text-sm text-purple-700">
                    Based on your transaction patterns, integrating blockchain payment options 
                    could reduce processing fees by approximately 8%.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-800 mb-2">Inventory Optimization</h4>
                  <p className="text-sm text-green-700">
                    10 items are below recommended stock levels. Automated reordering could 
                    prevent potential stockouts in the next 14 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <ActionCenter />
        </div>
      </div>
    </DashboardLayout>
  );
} 