import { useState } from 'react';
import { ShoppingBag, DollarSign, Users, CreditCard, TrendingUp } from 'lucide-react';
import BaseModuleInfo from './base-module-info';
import AnalyticsDashboard, { TimeRange } from '@/components/analytics/analytics-dashboard';

// Dummy data for POS metrics
const posData = {
  dailyStats: [
    { date: '2024-03-01', value: 12500 },
    { date: '2024-03-02', value: 14200 },
    { date: '2024-03-03', value: 13800 },
    { date: '2024-03-04', value: 15600 },
    { date: '2024-03-05', value: 16800 },
    { date: '2024-03-06', value: 14500 },
    { date: '2024-03-07', value: 17200 }
  ],
  topItems: [
    { name: 'Product A', value: 245 },
    { name: 'Product B', value: 189 },
    { name: 'Product C', value: 156 },
    { name: 'Product D', value: 134 },
    { name: 'Product E', value: 98 }
  ],
  distributionData: [
    { name: 'Credit Card', value: 45 },
    { name: 'Cash', value: 25 },
    { name: 'Mobile Payment', value: 20 },
    { name: 'Bank Transfer', value: 10 }
  ],
  metrics: [
    { name: 'Total Sales', value: '$125,000', change: '+12.5%', trend: 'up' as const },
    { name: 'Average Order', value: '$125.50', change: '+5.2%', trend: 'up' as const },
    { name: 'New Customers', value: '45', change: '+8.3%', trend: 'up' as const },
    { name: 'Return Rate', value: '2.8%', change: '-0.5%', trend: 'down' as const }
  ]
};

export default function POSInfoPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const handleExportData = () => {
    console.log('Exporting POS data...');
  };

  const handleGenerateReport = () => {
    console.log('Generating POS report...');
  };

  const handleViewRawData = () => {
    console.log('Viewing raw POS data...');
  };

  const handleRefreshData = () => {
    console.log('Refreshing POS data...');
  };

  return (
    <BaseModuleInfo
      moduleName="Point of Sale"
      description="Sales and transaction analytics"
      icon="shopping-bag"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      onExportData={handleExportData}
      onGenerateReport={handleGenerateReport}
      onViewRawData={handleViewRawData}
      onRefreshData={handleRefreshData}
    >
      <AnalyticsDashboard
        moduleId="pos"
        moduleName="Point of Sale"
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onExportData={handleExportData}
        onRefresh={handleRefreshData}
        metrics={posData.metrics}
        dailyStats={posData.dailyStats}
        topItems={posData.topItems}
        distributionData={posData.distributionData}
        insights={[
          {
            title: 'Sales Growth',
            description: 'Sales have increased by 12.5% compared to last week, driven by strong performance in electronics category',
            type: 'success'
          },
          {
            title: 'Customer Acquisition',
            description: 'New customer acquisition rate is up by 8.3%, with mobile payment adoption increasing',
            type: 'success'
          },
          {
            title: 'Inventory Alert',
            description: 'Product A is running low on stock. Consider restocking soon to maintain sales momentum',
            type: 'warning'
          }
        ]}
      />
    </BaseModuleInfo>
  );
} 