import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { 
  ArrowRight,
  Settings,
  ChevronRight,
  Home,
  Wallet,
  CreditCard,
  DollarSign,
  Bitcoin,
  LineChart,
  Building2,
  Users,
  FileText,
  Shield,
  Lock,
  Key,
  Network,
  Activity
} from 'lucide-react';

const financeModules = [
  {
    id: 'banking',
    name: 'Banking',
    description: 'Manage traditional banking operations and integrations',
    icon: Building2,
    features: [
      'Multi-bank integration',
      'SWIFT/SEPA/ACH support',
      'Bank reconciliation',
      'Payment processing',
      'Cash management',
      'Bank statements'
    ]
  },
  {
    id: 'crypto-wallets',
    name: 'Crypto & Digital Wallets',
    description: 'Manage cryptocurrency wallets and digital assets',
    icon: Bitcoin,
    features: [
      'Multi-chain support',
      'Wallet management',
      'Transaction tracking',
      'Exchange integration',
      'Cold storage',
      'Security monitoring'
    ]
  },
  {
    id: 'defi',
    name: 'DeFi Interactions',
    description: 'Manage decentralized finance operations',
    icon: Network,
    features: [
      'Smart contracts',
      'Yield farming',
      'Liquidity pools',
      'Staking management',
      'DeFi protocols',
      'Risk monitoring'
    ]
  },
  {
    id: 'investments',
    name: 'Investments & Portfolios',
    description: 'Track and manage investment portfolios',
    icon: LineChart,
    features: [
      'Portfolio tracking',
      'Asset allocation',
      'Performance analysis',
      'Risk assessment',
      'Investment reports',
      'Market data'
    ]
  },
  {
    id: 'fx',
    name: 'FX Management',
    description: 'Manage foreign exchange operations',
    icon: DollarSign,
    features: [
      'Currency trading',
      'Exchange rates',
      'Hedging strategies',
      'FX risk management',
      'Multi-currency accounts',
      'FX reporting'
    ]
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    description: 'Manage financial security and regulatory compliance',
    icon: Shield,
    features: [
      'Access control',
      'Security monitoring',
      'Compliance checks',
      'Audit trails',
      'Risk management',
      'Regulatory reporting'
    ]
  }
];

const quickActions = [
  {
    id: 'new-transaction',
    name: 'New Transaction',
    description: 'Record a new financial transaction',
    icon: DollarSign,
    href: '/dashboard/finance/transactions/new'
  },
  {
    id: 'crypto-transfer',
    name: 'Crypto Transfer',
    description: 'Transfer cryptocurrency between wallets',
    icon: Bitcoin,
    href: '/dashboard/finance/crypto/transfer'
  },
  {
    id: 'defi-action',
    name: 'DeFi Action',
    description: 'Execute DeFi operations',
    icon: Network,
    href: '/dashboard/finance/defi/actions'
  }
];

export default function FinancePage() {
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

    if (!user?.role?.includes('owner') && !user?.moduleAccess?.includes('finance')) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have access to the finance module. Please contact your administrator to request access.
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
            <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/finance')}>
              Finance
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Finance</h1>
            <p className="text-muted-foreground mt-2">
              Manage your organization's external financial operations and blockchain integration
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setLocation('/dashboard/finance/info')}>
              Module Info
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => setLocation('/dashboard/finance/settings')}>
              Settings
              <Settings className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
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
                <CardDescription>Latest financial activities and blockchain transactions</CardDescription>
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

          <TabsContent value="blockchain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Operations</CardTitle>
                <CardDescription>Manage blockchain transactions and smart contracts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Smart Contracts",
                      description: "Deploy and manage smart contracts",
                      icon: FileText,
                      href: "/dashboard/finance/blockchain/contracts"
                    },
                    {
                      title: "Transactions",
                      description: "View and verify blockchain transactions",
                      icon: Activity,
                      href: "/dashboard/finance/blockchain/transactions"
                    },
                    {
                      title: "Wallets",
                      description: "Manage cryptocurrency wallets",
                      icon: Wallet,
                      href: "/dashboard/finance/blockchain/wallets"
                    },
                    {
                      title: "Security",
                      description: "Manage blockchain security settings",
                      icon: Lock,
                      href: "/dashboard/finance/blockchain/security"
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
                <CardTitle>Finance Settings</CardTitle>
                <CardDescription>Configure finance preferences and blockchain settings</CardDescription>
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