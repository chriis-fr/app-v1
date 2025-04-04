import { useState } from 'react';
import { Package2, Warehouse, AlertTriangle, ArrowLeftRight, TrendingUp } from 'lucide-react';
import BaseModuleInfo from './base-module-info';
import AnalyticsDashboard, { TimeRange } from '@/components/analytics/analytics-dashboard';

// Dummy data for inventory metrics
const inventoryData = {
  dailyStats: [
    { date: '2024-03-01', value: 1250 },
    { date: '2024-03-02', value: 1280 },
    { date: '2024-03-03', value: 1220 },
    { date: '2024-03-04', value: 1300 },
    { date: '2024-03-05', value: 1275 },
    { date: '2024-03-06', value: 1260 },
    { date: '2024-03-07', value: 1290 }
  ],
  topItems: [
    { name: 'Electronics', value: 450 },
    { name: 'Clothing', value: 350 },
    { name: 'Food', value: 250 },
    { name: 'Furniture', value: 200 },
    { name: 'Other', value: 150 }
  ],
  distributionData: [
    { name: 'In Stock', value: 65 },
    { name: 'Low Stock', value: 20 },
    { name: 'Out of Stock', value: 10 },
    { name: 'Overstocked', value: 5 }
  ],
  metrics: [
    { name: 'Total Items', value: '1,250', change: '+2.5%', trend: 'up' as const },
    { name: 'Stock Value', value: '$125,000', change: '+5.2%', trend: 'up' as const },
    { name: 'Turnover Rate', value: '4.2', change: '+0.4', trend: 'up' as const },
    { name: 'Holding Cost', value: '$12,500', change: '-1.5%', trend: 'down' as const }
  ]
};

export default function InventoryInfoPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const handleExportData = () => {
    console.log('Exporting inventory data...');
  };

  const handleGenerateReport = () => {
    console.log('Generating inventory report...');
  };

  const handleViewRawData = () => {
    console.log('Viewing raw inventory data...');
  };

  const handleRefreshData = () => {
    console.log('Refreshing inventory data...');
  };

  return (
    <BaseModuleInfo
      moduleName="Inventory"
      description="Stock levels and inventory analytics"
      icon="package"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      onExportData={handleExportData}
      onGenerateReport={handleGenerateReport}
      onViewRawData={handleViewRawData}
      onRefreshData={handleRefreshData}
    >
      <AnalyticsDashboard
        moduleId="inventory"
        moduleName="Inventory"
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onExportData={handleExportData}
        onRefresh={handleRefreshData}
        metrics={inventoryData.metrics}
        dailyStats={inventoryData.dailyStats}
        topItems={inventoryData.topItems}
        distributionData={inventoryData.distributionData}
        insights={[
          {
            title: 'Stock Optimization',
            description: 'Overall stock levels have improved by 2.5%, with better turnover rates in electronics category',
            type: 'success'
          },
          {
            title: 'Low Stock Alert',
            description: '20% of items are running low on stock. Consider reviewing reorder points for these items.',
            type: 'warning'
          },
          {
            title: 'Cost Efficiency',
            description: 'Holding costs have decreased by 1.5% due to improved inventory turnover',
            type: 'success'
          }
        ]}
      />
    </BaseModuleInfo>
  );
} 