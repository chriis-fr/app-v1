import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { 
  ArrowRight,
  Settings,
  ChevronRight,
  Home,
  BookOpen,
  FileText,
  PieChart,
  Users,
  Building2,
  ClipboardList,
  Scale,
  FileCheck,
  Lock,
  Key,
  Network,
  Activity,
  Shield,
  Receipt,
  Banknote
} from 'lucide-react';
import { hasFullAccess, hasModuleAccess } from '@/utils/access';

const accountingConfig = [
  {
    id: 'general',
    name: 'General Settings',
    description: 'Configure basic accounting settings and preferences',
    icon: Settings,
    features: [
      'Chart of accounts',
      'Fiscal year settings',
      'Currency preferences',
      'Number formatting',
      'Multi-entity support',
      'Language settings'
    ]
  },
  {
    id: 'audit',
    name: 'Audit & Compliance',
    description: 'Configure audit trails and compliance settings',
    icon: FileCheck,
    features: [
      'Audit trails',
      'Compliance checks',
      'Documentation',
      'Audit reports',
      'Regulatory compliance',
      'Internal controls'
    ]
  },
  {
    id: 'governance',
    name: 'Data Governance',
    description: 'Manage data governance and quality',
    icon: Shield,
    features: [
      'Data quality rules',
      'Data lineage',
      'Master data management',
      'Data retention',
      'Data classification',
      'Privacy controls'
    ]
  },
  {
    id: 'permissions',
    name: 'Permissions & Access',
    description: 'Manage user permissions and access controls',
    icon: Lock,
    features: [
      'Role management',
      'Access control',
      'User permissions',
      'Workflow approvals',
      'Multi-factor auth',
      'Session management'
    ]
  },
  {
    id: 'integration',
    name: 'Integrations & APIs',
    description: 'Configure system integrations and data sync',
    icon: Network,
    features: [
      'API management',
      'Data sync',
      'Webhooks',
      'Third-party apps',
      'Blockchain integration',
      'Banking APIs'
    ]
  },
  {
    id: 'encryption',
    name: 'Encryption & Security',
    description: 'Configure security and encryption settings',
    icon: Key,
    features: [
      'Data encryption',
      'Key management',
      'Security policies',
      'Access logs',
      'Security monitoring',
      'Backup encryption'
    ]
  }
];

// --- Add summary data for demonstration ---
const summary = {
  totalRevenue: 120000,
  totalExpenses: 85000,
  netProfit: 35000,
  outstandingInvoices: 12000,
  payables: 8000,
  receivables: 15000,
  taxLiabilities: 4000,
  payroll: 22000,
  cashFlow: 18000,
  health: 'good', // could be 'good', 'warning', 'critical'
};

// --- Add quick actions ---
const quickActions = [
  { id: 'create-invoice', name: 'Create Invoice', icon: FileText, href: '/dashboard/accounting/invoice/new' },
  { id: 'record-expense', name: 'Record Expense', icon:Receipt, href: '/dashboard/accounting/expense/new' },
  { id: 'run-payroll', name: 'Run Payroll', icon: Banknote, href: '/dashboard/accounting/payroll' },
  { id: 'export-report', name: 'Export Report', icon: FileText, href: '/dashboard/accounting/reports/export' },
  { id: 'sync-bank', name: 'Sync Bank Feed', icon: Network, href: '/dashboard/accounting/bank-sync' },
];

// --- Add extra tabs for accounting aspects ---
const extraTabs = [
  { value: 'statements', label: 'Financial Statements' },
  { value: 'tax', label: 'Tax & Compliance' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'b2b', label: 'B2B & Invoicing' },
  { value: 'assets', label: 'Assets & Liabilities' },
  { value: 'budget', label: 'Budgeting' },
  { value: 'integrations', label: 'Integrations' },
];

export default function AccountingInfoPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canAccessCompactSidebar } = useRoleAccess();

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  // --- Add summary cards for overview ---
  const renderSummaryCards = () => (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${summary.totalRevenue.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">${summary.totalExpenses.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Net Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">${summary.netProfit.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">${summary.cashFlow.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );

  // --- Render content for each new tab ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'statements':
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader><CardContent>Assets, Liabilities, Equity</CardContent></Card>
            <Card><CardHeader><CardTitle>Income Statement</CardTitle></CardHeader><CardContent>Revenue, Expenses, Profit</CardContent></Card>
            <Card><CardHeader><CardTitle>Cash Flow Statement</CardTitle></CardHeader><CardContent>Operating, Investing, Financing</CardContent></Card>
          </div>
        );
      case 'tax':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Tax Filings</CardTitle></CardHeader><CardContent>Status: Up to date</CardContent></Card>
            <Card><CardHeader><CardTitle>Compliance</CardTitle></CardHeader><CardContent>All checks passed</CardContent></Card>
            <Card><CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader><CardContent>Recent audits available</CardContent></Card>
          </div>
        );
      case 'payroll':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Payroll Summary</CardTitle></CardHeader><CardContent>Total: ${summary.payroll.toLocaleString()}</CardContent></Card>
            <Card><CardHeader><CardTitle>Next Payroll Date</CardTitle></CardHeader><CardContent>{new Date().toLocaleDateString()}</CardContent></Card>
          </div>
        );
      case 'b2b':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Outstanding Invoices</CardTitle></CardHeader><CardContent>${summary.outstandingInvoices.toLocaleString()}</CardContent></Card>
            <Card><CardHeader><CardTitle>Receivables</CardTitle></CardHeader><CardContent>${summary.receivables.toLocaleString()}</CardContent></Card>
            <Card><CardHeader><CardTitle>Payables</CardTitle></CardHeader><CardContent>${summary.payables.toLocaleString()}</CardContent></Card>
          </div>
        );
      case 'assets':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Major Assets</CardTitle></CardHeader><CardContent>Equipment, Vehicles, IP, etc.</CardContent></Card>
            <Card><CardHeader><CardTitle>Liabilities</CardTitle></CardHeader><CardContent>Loans, Credit, etc.</CardContent></Card>
            <Card><CardHeader><CardTitle>Depreciation</CardTitle></CardHeader><CardContent>Tracked annually</CardContent></Card>
          </div>
        );
      case 'budget':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Budget vs Actual</CardTitle></CardHeader><CardContent>On track</CardContent></Card>
            <Card><CardHeader><CardTitle>Department Budgets</CardTitle></CardHeader><CardContent>Marketing, HR, R&D, etc.</CardContent></Card>
          </div>
        );
      case 'integrations':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Bank Integrations</CardTitle></CardHeader><CardContent>Connected</CardContent></Card>
            <Card><CardHeader><CardTitle>ERP Integrations</CardTitle></CardHeader><CardContent>Connected</CardContent></Card>
            <Card><CardHeader><CardTitle>Payment Gateways</CardTitle></CardHeader><CardContent>Connected</CardContent></Card>
          </div>
        );
      default:
        return null;
    }
  };

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

    if (!(hasFullAccess(user) || hasModuleAccess(user, 'accounting'))) {
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
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/accounting/info')}>
              Module Info
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Accounting Module Info</h1>
            <p className="text-muted-foreground mt-2">
              Configure and manage accounting module settings
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setLocation('/dashboard/accounting')}>
              Back to Accounting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => setLocation('/dashboard/accounting/settings')}>
              Settings
              <Settings className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {renderSummaryCards()}

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5 mb-8">
          {quickActions.map((action) => (
            <Card
              key={action.id}
              role="button"
              tabIndex={0}
              aria-label={action.name}
              className="flex flex-col items-center justify-center p-6 cursor-pointer transition-transform hover:shadow-lg hover:scale-[1.03] focus:ring-2 focus:ring-primary outline-none"
              onClick={() => setLocation(action.href)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setLocation(action.href); }}
            >
              <action.icon className="h-8 w-8 mb-3 text-primary" />
              <span className="font-semibold text-center text-base">{action.name}</span>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {extraTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Status</CardTitle>
                <CardDescription>Current status and health of the accounting module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${summary.health === 'good' ? 'bg-green-500' : summary.health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium">Health: {summary.health.charAt(0).toUpperCase() + summary.health.slice(1)}</span>
                  </div>
                  {/* Add more module status info here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Render new tab content */}
          {extraTabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              {renderTabContent()}
            </TabsContent>
          ))}

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Settings</CardTitle>
                <CardDescription>Configure module preferences and defaults</CardDescription>
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
      {/* {canAccessCompactSidebar() && <CompactSidebar />} */}
      <div className={`flex-1 ${canAccessCompactSidebar() ? 'ml-20' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
} 