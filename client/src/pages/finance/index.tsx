import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { 
  ArrowRight,
  BarChart3,
  DollarSign,
  FileText,
  PieChart,
  Settings,
  TrendingUp,
  Wallet,
  CreditCard,
  Building2,
  Users,
  Globe
} from 'lucide-react';

const financeModules = [
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'View key financial metrics and performance indicators',
    icon: TrendingUp,
    features: [
      'Revenue Overview',
      'Expense Analysis',
      'Profit Margins',
      'Cash Flow Trends'
    ]
  },
  {
    id: 'budgeting',
    name: 'Budgeting',
    description: 'Create and manage budgets across departments',
    icon: Wallet,
    features: [
      'Budget Planning',
      'Variance Analysis',
      'Forecasting',
      'Department Budgets'
    ]
  },
  {
    id: 'investment',
    name: 'Investment Management',
    description: 'Track and manage investments and returns',
    icon: DollarSign,
    features: [
      'Portfolio Tracking',
      'Return Analysis',
      'Risk Assessment',
      'Investment Reports'
    ]
  },
  {
    id: 'treasury',
    name: 'Treasury Management',
    description: 'Manage cash flow, liquidity, and financial risk',
    icon: CreditCard,
    features: [
      'Cash Management',
      'Risk Hedging',
      'Liquidity Planning',
      'Treasury Reports'
    ]
  },
  {
    id: 'asset-management',
    name: 'Asset Management',
    description: 'Track and manage company assets and investments',
    icon: Building2,
    features: [
      'Asset Tracking',
      'Valuation',
      'Performance Analysis',
      'Asset Reports'
    ]
  },
  {
    id: 'financial-planning',
    name: 'Financial Planning',
    description: 'Long-term financial planning and strategy',
    icon: PieChart,
    features: [
      'Strategic Planning',
      'Growth Projections',
      'Scenario Analysis',
      'Planning Reports'
    ]
  },
  {
    id: 'compliance',
    name: 'Financial Compliance',
    description: 'Ensure regulatory compliance and reporting',
    icon: FileText,
    features: [
      'Regulatory Reporting',
      'Compliance Monitoring',
      'Audit Management',
      'Compliance Reports'
    ]
  },
  {
    id: 'international',
    name: 'International Finance',
    description: 'Manage international financial operations',
    icon: Globe,
    features: [
      'Currency Management',
      'International Payments',
      'Exchange Rate Risk',
      'Global Reports'
    ]
  }
];

export default function FinancePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user is an owner
  if (!user?.role?.includes('owner')) {
    return (
      <div className="flex">
        <CompactSidebar />
        <div className="flex-1 ml-20">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              This page is only accessible to organization owners.
            </p>
            <Button onClick={() => setLocation('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <CompactSidebar />
      <div className="flex-1 ml-20">
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Finance</h1>
              <p className="text-muted-foreground mt-2">
                Manage your organization's financial strategy and operations
              </p>
            </div>
            <Button onClick={() => setLocation('/dashboard/accounting')}>
              Go to Accounting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {financeModules.slice(0, 3).map((module) => (
                  <Card 
                    key={module.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setLocation(`/dashboard/finance/${module.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <module.icon className="h-5 w-5" />
                        <CardTitle>{module.name}</CardTitle>
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {module.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {financeModules.map((module) => (
                  <Card 
                    key={module.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setLocation(`/dashboard/finance/${module.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <module.icon className="h-5 w-5" />
                        <CardTitle>{module.name}</CardTitle>
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {module.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Generate and view financial reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          View key performance indicators and financial metrics
                        </p>
                        <Button className="mt-4" variant="outline">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Budget Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Compare actual vs. budgeted performance
                        </p>
                        <Button className="mt-4" variant="outline">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Investment Portfolio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Track investment performance and returns
                        </p>
                        <Button className="mt-4" variant="outline">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Assess financial risks and exposure
                        </p>
                        <Button className="mt-4" variant="outline">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Finance Settings</CardTitle>
                  <CardDescription>Configure your financial management preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">General Settings</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Default Currency</label>
                          <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Fiscal Year Start</label>
                          <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                            <option value="1">January</option>
                            <option value="4">April</option>
                            <option value="7">July</option>
                            <option value="10">October</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Investment Settings</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Risk Tolerance</label>
                          <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Investment Horizon</label>
                          <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                            <option value="short">Short Term</option>
                            <option value="medium">Medium Term</option>
                            <option value="long">Long Term</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Budget Settings</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Budget Period</label>
                          <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Budget Approval</label>
                          <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                            <option value="auto">Automatic</option>
                            <option value="manual">Manual</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 