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
  FileText,
  PieChart,
  Users,
  Building2,
  ChevronRight,
  Home,
  ClipboardList,
  Scale,
  FileCheck,
  DollarSign
} from 'lucide-react';

const accountingModules = [
  {
    id: 'general-ledger',
    name: 'General Ledger',
    description: 'Record and manage journal entries, accounts, and financial periods',
    icon: BookOpen,
    features: [
      'Double-entry bookkeeping',
      'Chart of accounts',
      'Journal entries',
      'Financial periods',
      'IFRS/GAAP compliance',
      'Multi-currency support'
    ]
  },
  {
    id: 'accounts-payable',
    name: 'Accounts Payable',
    description: 'Manage vendor invoices, payments, and credit terms',
    icon: Receipt,
    features: [
      'Vendor management',
      'Invoice processing',
      'Payment scheduling',
      'Credit management',
      'Automated approvals',
      'Vendor statements'
    ]
  },
  {
    id: 'accounts-receivable',
    name: 'Accounts Receivable',
    description: 'Track customer invoices, payments, and credit management',
    icon: FileText,
    features: [
      'Customer invoicing',
      'Payment tracking',
      'Credit management',
      'Collection management',
      'Aging reports',
      'Customer statements'
    ]
  },
  {
    id: 'fixed-assets',
    name: 'Fixed Assets',
    description: 'Track and manage company assets and depreciation',
    icon: Building2,
    features: [
      'Asset tracking',
      'Depreciation calculation',
      'Asset disposal',
      'Maintenance records',
      'Asset valuation',
      'Capital budgeting'
    ]
  },
  {
    id: 'taxation',
    name: 'Taxation',
    description: 'Handle tax calculations, filings, and compliance',
    icon: Scale,
    features: [
      'Multi-jurisdiction tax',
      'VAT/GST management',
      'Tax reporting',
      'Compliance tracking',
      'Tax planning',
      'Audit support'
    ]
  },
  {
    id: 'budgeting',
    name: 'Budgeting',
    description: 'Create and manage budgets, forecasts, and variance analysis',
    icon: PieChart,
    features: [
      'Budget creation',
      'Forecasting',
      'Variance analysis',
      'Cost centers',
      'Budget approvals',
      'Performance tracking'
    ]
  }
];

const quickActions = [
  {
    id: 'new-journal-entry',
    name: 'New Journal Entry',
    description: 'Record a new journal entry',
    icon: Receipt,
    href: '/dashboard/accounting/journal-entries/new'
  },
  {
    id: 'new-invoice',
    name: 'New Invoice',
    description: 'Create a new customer invoice',
    icon: FileText,
    href: '/dashboard/accounting/invoices/new'
  },
  {
    id: 'new-bill',
    name: 'New Bill',
    description: 'Record a new vendor bill',
    icon: Receipt,
    href: '/dashboard/accounting/bills/new'
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
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/accounting')}>
              Accounting
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Accounting</h1>
            <p className="text-muted-foreground mt-2">
              Manage your organization's internal financial operations and compliance
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

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest accounting activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add recent activity list here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accountingModules.map((module) => (
                <Card 
                  key={module.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setLocation(`/dashboard/accounting/${module.id}`)}
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
                      description: "View your organization's assets, liabilities, and equity",
                      icon: PieChart,
                      href: "/dashboard/accounting/reports/balance-sheet"
                    },
                    {
                      title: "Income Statement",
                      description: "View your organization's revenue, expenses, and profit",
                      icon: BarChart3,
                      href: "/dashboard/accounting/reports/income-statement"
                    },
                    {
                      title: "Cash Flow Statement",
                      description: "Track your organization's cash inflows and outflows",
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
                      key={report.href}
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
                <CardDescription>Configure accounting preferences and defaults</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add settings form here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
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