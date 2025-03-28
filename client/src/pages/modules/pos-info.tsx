import { Card } from '@/components/ui/card';
import { ShoppingBag, TrendingUp, DollarSign, Users, CreditCard } from 'lucide-react';
import BaseModuleInfo from './base-module-info';

// Dummy data specific to POS
const posData = {
  dailySales: [
    { date: '2024-03-01', amount: 12500 },
    { date: '2024-03-02', amount: 14200 },
    { date: '2024-03-03', amount: 13800 },
    { date: '2024-03-04', amount: 15600 },
    { date: '2024-03-05', amount: 16800 },
    { date: '2024-03-06', amount: 14500 },
    { date: '2024-03-07', amount: 17200 }
  ],
  topProducts: [
    { name: 'Product A', sales: 245, revenue: 12250 },
    { name: 'Product B', sales: 189, revenue: 9450 },
    { name: 'Product C', sales: 156, revenue: 7800 },
    { name: 'Product D', sales: 134, revenue: 6700 },
    { name: 'Product E', sales: 98, revenue: 4900 }
  ],
  paymentMethods: [
    { method: 'Credit Card', percentage: 45 },
    { method: 'Cash', percentage: 25 },
    { method: 'Mobile Payment', percentage: 20 },
    { method: 'Bank Transfer', percentage: 10 }
  ],
  customerMetrics: {
    totalCustomers: 1250,
    newCustomers: 45,
    returningCustomers: 380,
    averageOrderValue: 125.50
  }
};

export default function POSInfoPage() {
  const handleExportData = () => {
    // Implement export functionality
    console.log('Exporting POS data...');
  };

  const handleGenerateReport = () => {
    // Implement report generation
    console.log('Generating POS report...');
  };

  const handleViewRawData = () => {
    // Implement raw data view
    console.log('Viewing raw POS data...');
  };

  return (
    <BaseModuleInfo
      moduleName="Point of Sale"
      moduleDescription="Sales and transaction analytics"
      moduleIcon={ShoppingBag}
      onExportData={handleExportData}
      onGenerateReport={handleGenerateReport}
      onViewRawData={handleViewRawData}
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales Today</p>
              <h3 className="text-2xl font-bold">$17,200</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Customers</p>
              <h3 className="text-2xl font-bold">45</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <h3 className="text-2xl font-bold">156</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Growth</p>
              <h3 className="text-2xl font-bold">+12.5%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Sales chart visualization would go here</span>
        </div>
      </Card>

      {/* Top Products */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Top Performing Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left py-3 px-4">Sales</th>
                <th className="text-left py-3 px-4">Revenue</th>
                <th className="text-left py-3 px-4">Trend</th>
              </tr>
            </thead>
            <tbody>
              {posData.topProducts.map((product) => (
                <tr key={product.name} className="border-b">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.sales}</td>
                  <td className="py-3 px-4">${product.revenue}</td>
                  <td className="py-3 px-4">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </BaseModuleInfo>
  );
} 