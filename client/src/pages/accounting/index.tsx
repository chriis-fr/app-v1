import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { 
  Calculator, 
  Receipt, 
  BarChart3, 
  Settings,
  ArrowRight,
  BookOpen,
  DollarSign,
  FileText,
  PieChart,
  Users,
  Building2,
  CreditCard,
  Wallet,
  ChevronRight,
  Home
} from 'lucide-react';

const accountingModules = [
  {
    id: 'general-ledger',
    name: 'General Ledger',
    description: 'Record and manage journal entries, accounts, and financial periods',
    icon: BookOpen,
    features: [
      'Journal Entries',
      'Chart of Accounts',
      'Financial Periods',
      'Reports'
    ]
  },
  {
    id: 'accounts-payable',
    name: 'Accounts Payable',
    description: 'Manage vendor bills, payments, and outstanding balances',
    icon: CreditCard,
    features: [
      'Vendor Management',
      'Bill Entry',
      'Payment Processing',
      'Aging Reports'
    ]
  },
  {
    id: 'accounts-receivable',
    name: 'Accounts Receivable',
    description: 'Track customer invoices, payments, and outstanding balances',
    icon: Wallet,
    features: [
      'Customer Management',
      'Invoice Generation',
      'Payment Tracking',
      'Aging Reports'
    ]
  },
  {
    id: 'banking',
    name: 'Banking',
    description: 'Manage bank accounts, transactions, and reconciliations',
    icon: DollarSign,
    features: [
      'Bank Accounts',
      'Transactions',
      'Reconciliations',
      'Bank Statements'
    ]
  },
  {
    id: 'payroll-accounting',
    name: 'Payroll Accounting',
    description: 'Handle payroll processing and related accounting entries',
    icon: Users,
    features: [
      'Payroll Processing',
      'Tax Calculations',
      'Benefits Management',
      'Payroll Reports'
    ]
  },
  {
    id: 'fixed-assets',
    name: 'Fixed Assets',
    description: 'Track and manage company assets and depreciation',
    icon: Building2,
    features: [
      'Asset Management',
      'Depreciation',
      'Asset Disposal',
      'Asset Reports'
    ]
  },
  {
    id: 'tax-management',
    name: 'Tax Management',
    description: 'Handle tax calculations, filings, and compliance',
    icon: FileText,
    features: [
      'Tax Calculations',
      'Tax Returns',
      'Compliance',
      'Tax Reports'
    ]
  },
  {
    id: 'financial-reporting',
    name: 'Financial Reporting',
    description: 'Generate and analyze financial statements and reports',
    icon: PieChart,
    features: [
      'Balance Sheet',
      'Income Statement',
      'Cash Flow',
      'Custom Reports'
    ]
  }
];

const quickActions = [
  {
    id: 'new-transaction',
    name: 'New Transaction',
    description: 'Record a new financial transaction',
    icon: Receipt,
    href: '/dashboard/accounting/transactions/new'
  },
  {
    id: 'new-invoice',
    name: 'New Invoice',
    description: 'Create a new invoice for customers',
    icon: FileText,
    href: '/dashboard/accounting/invoices/new'
  },
  {
    id: 'reconcile',
    name: 'Reconcile Accounts',
    description: 'Match transactions with bank statements',
    icon: Calculator,
    href: '/dashboard/accounting/reconcile'
  }
];

export default function AccountingPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => setLocation('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      );
    }

    if (!user?.moduleAccess?.includes('accounting')) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have access to the accounting module. Please contact your administrator to request access.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => setLocation('/dashboard')}>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setLocation('/dashboard/modules')}>
              View Available Modules
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard')}>
            <Home className="h-4 w-4" />
          </Button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              <ChevronRight className="h-4 w-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(crumb.href)}
                className={index === breadcrumbs.length - 1 ? 'font-medium' : ''}
              >
                {crumb.label}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Accounting</h1>
            <p className="text-muted-foreground mt-2">
              Manage your organization's financial records and transactions
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setLocation('/dashboard/accounting/info')}>
              Module Info
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => setLocation('/dashboard/accounting/settings')}>
              Settings
              <Settings className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setLocation(action.href)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <action.icon className="h-5 w-5" />
                        <CardTitle>{action.name}</CardTitle>
                      </div>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Placeholder for recent activity */}
                    <p className="text-muted-foreground">No recent activity to display</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Modules */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Featured Modules</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accountingModules.slice(0, 3).map((module) => (
                  <Card 
                    key={module.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleModuleClick(module.id)}
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
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accountingModules.map((module) => (
                <Card 
                  key={module.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleModuleClick(module.id)}
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
                  {[
                    {
                      title: "Balance Sheet",
                      description: "View your organization\"s assets, liabilities, and equity",
                      icon: PieChart,
                      href: "/dashboard/accounting/reports/balance-sheet"
                    },
                    {
                      title: "Income Statement",
                      description: "View your organization\"s revenue, expenses, and profit",
                      icon: BarChart3,
                      href: "/dashboard/accounting/reports/income-statement"
                    },
                    {
                      title: "Cash Flow Statement",
                      description: "Track your organization\"s cash inflows and outflows",
                      icon: DollarSign,
                      href: "/dashboard/accounting/reports/cash-flow"
                    },
                    {
                      title: "Trial Balance",
                      description: "Verify the equality of debits and credits",
                      icon: Calculator,
                      href: "/dashboard/accounting/reports/trial-balance"
                    }
                  ].map((report) => (
                    <Card 
                      key={report.title} 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setLocation(report.href)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <report.icon className="h-5 w-5" />
                          <CardTitle>{report.title}</CardTitle>
                        </div>
                        <CardDescription>{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accounting Settings</CardTitle>
                <CardDescription>Configure your accounting preferences</CardDescription>
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
                    <h3 className="font-medium mb-2">Number Format</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Decimal Places</label>
                        <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Thousands Separator</label>
                        <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                          <option value=",">Comma (,)</option>
                          <option value=".">Period (.)</option>
                          <option value=" ">Space ( )</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Tax Settings</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Default Tax Rate</label>
                        <input
                          type="number"
                          className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tax Calculation Method</label>
                        <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                          <option value="inclusive">Tax Inclusive</option>
                          <option value="exclusive">Tax Exclusive</option>
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
    );
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Accounting', href: '/dashboard/accounting' }
  ];

  const handleModuleClick = (moduleId: string) => {
    setLocation(`/dashboard/accounting/${moduleId}`);
  };

  return (
    <div className="flex">
      <CompactSidebar />
      <div className="flex-1 ml-20">
        {renderContent()}
      </div>
    </div>
  );
} 