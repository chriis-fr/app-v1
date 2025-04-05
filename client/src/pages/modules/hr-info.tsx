import { useState } from 'react';
import BaseModuleInfo from './base-module-info';
import AnalyticsDashboard, { TimeRange } from '@/components/analytics/analytics-dashboard';

// Dummy data for HR metrics
const hrData = {
  dailyStats: [
    { date: '2024-03-01', value: 150 },
    { date: '2024-03-02', value: 155 },
    { date: '2024-03-03', value: 148 },
    { date: '2024-03-04', value: 162 },
    { date: '2024-03-05', value: 158 },
    { date: '2024-03-06', value: 165 },
    { date: '2024-03-07', value: 170 }
  ],
  topDepartments: [
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 35 },
    { name: 'Marketing', value: 25 },
    { name: 'Operations', value: 20 },
    { name: 'Finance', value: 15 }
  ],
  employeeStatus: [
    { name: 'Active', value: 85 },
    { name: 'On Leave', value: 10 },
    { name: 'Training', value: 5 }
  ],
  metrics: [
    { name: 'Total Employees', value: 250, change: '+5%', trend: 'up' as const },
    { name: 'Average Tenure', value: '3.2 years', change: '+0.3', trend: 'up' as const },
    { name: 'Turnover Rate', value: '8.5%', change: '-2%', trend: 'down' as const },
    { name: 'Training Hours', value: '24.5', change: '+3.2', trend: 'up' as const }
  ]
};

export default function HRInfoPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const handleExportData = () => {
    console.log('Exporting HR data...');
  };

  const handleGenerateReport = () => {
    console.log('Generating HR report...');
  };

  const handleViewRawData = () => {
    console.log('Viewing raw HR data...');
  };

  const handleRefreshData = () => {
    console.log('Refreshing HR data...');
  };

  return (
    <BaseModuleInfo
      moduleName="HR Management"
      description="Comprehensive human resources management and analytics"
      icon="users"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      onExportData={handleExportData}
      onGenerateReport={handleGenerateReport}
      onViewRawData={handleViewRawData}
      onRefreshData={handleRefreshData}
    >
      <AnalyticsDashboard
        moduleId="hr"
        moduleName="HR Management"
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onExportData={handleExportData}
        onRefresh={handleRefreshData}
        metrics={hrData.metrics}
        dailyStats={hrData.dailyStats}
        topItems={hrData.topDepartments}
        distributionData={hrData.employeeStatus}
        insights={[
          {
            title: 'Employee Growth Trend',
            description: 'Positive growth in engineering department with 5 new hires this month',
            type: 'success'
          },
          {
            title: 'Training Impact',
            description: 'Training hours increased by 15% leading to improved performance metrics',
            type: 'info'
          },
          {
            title: 'Retention Improvement',
            description: 'Turnover rate decreased by 2% due to new retention initiatives',
            type: 'success'
          }
        ]}
      />
    </BaseModuleInfo>
  );
} 