import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Building2, 
  Tag, 
  TrendingUp, 
  BarChart2, 
  PieChart, 
  LineChart,
  Download,
  FileText,
  RefreshCw,
  Database
} from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics-dashboard';

// Dummy data for CRM metrics
const crmMetrics = {
  admin: {
    dailyStats: [
      { date: '2024-03-01', contacts: 1250, leads: 450, conversion: 32, response: 2.5 },
      { date: '2024-03-02', contacts: 1280, leads: 460, conversion: 33, response: 2.4 },
      { date: '2024-03-03', contacts: 1300, leads: 470, conversion: 34, response: 2.3 },
      { date: '2024-03-04', contacts: 1320, leads: 480, conversion: 35, response: 2.2 },
      { date: '2024-03-05', contacts: 1340, leads: 490, conversion: 36, response: 2.1 },
      { date: '2024-03-06', contacts: 1360, leads: 500, conversion: 37, response: 2.0 },
      { date: '2024-03-07', contacts: 1380, leads: 510, conversion: 38, response: 1.9 }
    ],
    topItems: [
      { name: 'Email Campaign', leads: 245, conversion: 45 },
      { name: 'Website Form', leads: 189, conversion: 38 },
      { name: 'Social Media', leads: 156, conversion: 32 },
      { name: 'Referral Program', leads: 134, conversion: 28 },
      { name: 'Trade Show', leads: 98, conversion: 25 }
    ],
    distribution: [
      { label: 'New', value: 30 },
      { label: 'Contacted', value: 25 },
      { label: 'Qualified', value: 20 },
      { label: 'Proposal', value: 15 },
      { label: 'Negotiation', value: 10 }
    ],
    metrics: [
      { label: 'Total Contacts', value: '1,380', icon: Users, color: 'blue' },
      { label: 'Active Leads', value: '510', icon: UserPlus, color: 'green' },
      { label: 'Conversion Rate', value: '38%', icon: TrendingUp, color: 'purple' },
      { label: 'Avg. Response Time', value: '1.9h', icon: Phone, color: 'yellow' }
    ]
  },
  sales: {
    dailyStats: [
      { date: '2024-03-01', personalLeads: 45, conversion: 28, dealSize: 12500, response: 1.8 },
      { date: '2024-03-02', personalLeads: 48, conversion: 29, dealSize: 13000, response: 1.7 },
      { date: '2024-03-03', personalLeads: 50, conversion: 30, dealSize: 13500, response: 1.6 },
      { date: '2024-03-04', personalLeads: 52, conversion: 31, dealSize: 14000, response: 1.5 },
      { date: '2024-03-05', personalLeads: 54, conversion: 32, dealSize: 14500, response: 1.4 },
      { date: '2024-03-06', personalLeads: 56, conversion: 33, dealSize: 15000, response: 1.3 },
      { date: '2024-03-07', personalLeads: 58, conversion: 34, dealSize: 15500, response: 1.2 }
    ],
    topItems: [
      { name: 'Enterprise', leads: 25, value: 125000 },
      { name: 'Mid-Market', leads: 18, value: 90000 },
      { name: 'SMB', leads: 15, value: 45000 },
      { name: 'Startup', leads: 12, value: 30000 },
      { name: 'Non-Profit', leads: 8, value: 20000 }
    ],
    distribution: [
      { label: 'Personal', value: 60 },
      { label: 'Team', value: 40 }
    ],
    metrics: [
      { label: 'Personal Leads', value: '58', icon: UserPlus, color: 'blue' },
      { label: 'Conversion Rate', value: '34%', icon: TrendingUp, color: 'green' },
      { label: 'Avg. Deal Size', value: '$15.5K', icon: Building2, color: 'purple' },
      { label: 'Response Time', value: '1.2h', icon: Phone, color: 'yellow' }
    ]
  },
  marketing: {
    dailyStats: [
      { date: '2024-03-01', newLeads: 85, quality: 75, roi: 250, costPerLead: 25 },
      { date: '2024-03-02', newLeads: 88, quality: 76, roi: 260, costPerLead: 24 },
      { date: '2024-03-03', newLeads: 90, quality: 77, roi: 270, costPerLead: 23 },
      { date: '2024-03-04', newLeads: 92, quality: 78, roi: 280, costPerLead: 22 },
      { date: '2024-03-05', newLeads: 94, quality: 79, roi: 290, costPerLead: 21 },
      { date: '2024-03-06', newLeads: 96, quality: 80, roi: 300, costPerLead: 20 },
      { date: '2024-03-07', newLeads: 98, quality: 81, roi: 310, costPerLead: 19 }
    ],
    topItems: [
      { name: 'Email Campaign', leads: 45, roi: 350 },
      { name: 'Social Media', leads: 35, roi: 280 },
      { name: 'Content Marketing', leads: 25, roi: 220 },
      { name: 'SEO', leads: 20, roi: 180 },
      { name: 'PPC', leads: 15, roi: 150 }
    ],
    distribution: [
      { label: 'High Quality', value: 40 },
      { label: 'Medium Quality', value: 35 },
      { label: 'Low Quality', value: 25 }
    ],
    metrics: [
      { label: 'New Leads', value: '98', icon: UserPlus, color: 'blue' },
      { label: 'Lead Quality', value: '81%', icon: TrendingUp, color: 'green' },
      { label: 'Campaign ROI', value: '310%', icon: BarChart2, color: 'purple' },
      { label: 'Cost per Lead', value: '$19', icon: Tag, color: 'yellow' }
    ]
  }
};

export default function CRMInfoPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  // Get metrics based on user role
  const role = user?.role || 'admin';
  const metrics = crmMetrics[role as keyof typeof crmMetrics] || crmMetrics.admin;

  const handleExportData = () => {
    // Removed: console.log('Exporting CRM data...');
  };

  const handleGenerateReport = () => {
    // Removed: console.log('Generating CRM report...');
  };

  const handleViewRawData = () => {
    // Removed: console.log('Viewing raw CRM data...');
  };

  const handleRefreshData = () => {
    // Removed: console.log('Refreshing CRM data...');
  };

  const getInsights = () => {
    if (role === 'admin') {
      return [
        'Lead generation has increased by 15% over the last week',
        'Average response time has improved by 0.6 hours',
        'Conversion rate has increased by 6% from last month'
      ];
    } else if (role === 'sales') {
      return [
        'Personal lead conversion rate is 5% above team average',
        'Response time is 0.3 hours faster than last week',
        'Average deal size has increased by $2,500'
      ];
    } else {
      return [
        'Campaign ROI has improved by 60% from last month',
        'Lead quality score has increased by 6%',
        'Cost per lead has decreased by $6'
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">CRM Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track and analyze your customer relationship management metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewRawData}>
            <Database className="mr-2 h-4 w-4" />
            View Raw Data
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <AnalyticsDashboard
        metrics={metrics.metrics}
        dailyStats={metrics.dailyStats}
        topItems={metrics.topItems}
        distribution={metrics.distribution}
        insights={getInsights()}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  );
} 