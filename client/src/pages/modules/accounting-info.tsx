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
  Shield
} from 'lucide-react';

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

const quickActions = [
  {
    id: 'backup',
    name: 'Backup Data',
    description: 'Create a backup of accounting data',
    icon: FileText,
    href: '/dashboard/accounting/info/backup'
  },
  {
    id: 'audit-logs',
    name: 'View Audit Logs',
    description: 'View system and audit logs',
    icon: Activity,
    href: '/dashboard/accounting/info/audit-logs'
  },
  {
    id: 'api-keys',
    name: 'Manage API Keys',
    description: 'Manage integration API keys',
    icon: Key,
    href: '/dashboard/accounting/info/api-keys'
  }
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

    if (!(user?.isOwner || user?.role === 'owner' || user?.moduleAccess?.includes('accounting'))) {
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
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
                <CardTitle>Module Status</CardTitle>
                <CardDescription>Current status and health of the accounting module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add module status information here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accountingConfig.map((config) => (
                <Card 
                  key={config.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setLocation(`/dashboard/accounting/info/${config.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-5 w-5" />
                      <CardTitle>{config.name}</CardTitle>
                    </div>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {config.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and access control settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Access Control",
                      description: "Manage user access and permissions",
                      icon: Lock,
                      href: "/dashboard/accounting/info/security/access"
                    },
                    {
                      title: "Encryption",
                      description: "Configure data encryption settings",
                      icon: Key,
                      href: "/dashboard/accounting/info/security/encryption"
                    },
                    {
                      title: "Audit Logs",
                      description: "View and manage audit logs",
                      icon: FileCheck,
                      href: "/dashboard/accounting/info/security/logs"
                    },
                    {
                      title: "Compliance",
                      description: "Configure compliance settings",
                      icon: Scale,
                      href: "/dashboard/accounting/info/security/compliance"
                    }
                  ].map((item) => (
                    <Card 
                      key={item.href}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setLocation(item.href)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <item.icon className="h-5 w-5" />
                          <CardTitle>{item.title}</CardTitle>
                        </div>
                        <CardDescription>{item.description}</CardDescription>
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
      {canAccessCompactSidebar() && <CompactSidebar />}
      <div className={`flex-1 ${canAccessCompactSidebar() ? 'ml-20' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
} 