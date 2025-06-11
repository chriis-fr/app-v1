import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { blockchainData } from '@/data/blockchain';
import { financialData } from '@/data/financial';
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
  Activity,
  RefreshCw,
  Receipt,
  Banknote,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Calendar,
  UserCircle
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
    id: 'new-invoice',
    name: 'Create Invoice',
    description: 'Create a new B2B invoice',
    icon: Receipt,
    href: '/dashboard/finance/b2b/invoice/new'
  },
  {
    id: 'process-payroll',
    name: 'Process Payroll',
    description: 'Process monthly payroll',
    icon: Banknote,
    href: '/dashboard/finance/payroll/process'
  },
  {
    id: 'fund-transfer',
    name: 'Fund Transfer',
    description: 'Transfer funds between accounts',
    icon: PiggyBank,
    href: '/dashboard/finance/funds/transfer'
  }
];

interface BlockchainBalance {
  symbol?: string;
  asset_type?: string;
  balance: string;
  value?: number;
  asset_code?: string;
}

interface BlockchainTransaction {
  hash?: string;
  id?: string;
  type: string;
  amount: string;
  timestamp: string;
  status: string;
  from: string;
  to: string;
  gasUsed?: number;
  gasPrice?: string;
  asset?: string;
  memo?: string;
}

interface BlockchainData {
  ethereum: {
    balance: {
      eth: number;
      usdc: number;
      usdt: number;
    };
    balances: BlockchainBalance[];
    recentTransactions: BlockchainTransaction[];
  };
  stellar: {
    balance: {
      xlm: number;
      usdc: number;
      eur: number;
    };
    balances: BlockchainBalance[];
    recentTransactions: BlockchainTransaction[];
  };
}

export default function FinancePage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockchainData, setBlockchainData] = useState<BlockchainData>({
    ethereum: {
      balance: {
        eth: 0,
        usdc: 0,
        usdt: 0
      },
      balances: [
        { symbol: 'ETH', balance: '0', value: 0 },
        { symbol: 'USDC', balance: '0', value: 0 },
        { symbol: 'USDT', balance: '0', value: 0 }
      ],
      recentTransactions: []
    },
    stellar: {
      balance: {
        xlm: 0,
        usdc: 0,
        eur: 0
      },
      balances: [
        { asset_type: 'native', balance: '0', asset_code: 'XLM' },
        { asset_type: 'credit_alphanum4', balance: '0', asset_code: 'USDC' },
        { asset_type: 'credit_alphanum4', balance: '0', asset_code: 'EUR' }
      ],
      recentTransactions: []
    }
  });
  const [financialMetrics, setFinancialMetrics] = useState<any>(null);
  const { canAccessCompactSidebar } = useRoleAccess();

  const fetchBlockchainData = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/blockchain/data');
      const data = await response.json();
      setBlockchainData(data);
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      // Use dummy data instead of setting error
      setBlockchainData({
        ethereum: {
          balance: {
            eth: 15.5,
            usdc: 5000,
            usdt: 3000
          },
          balances: [
            { symbol: 'ETH', balance: '15.5', value: 31000 },
            { symbol: 'USDC', balance: '5000', value: 5000 },
            { symbol: 'USDT', balance: '3000', value: 3000 }
          ],
          recentTransactions: Array.from({ length: 10 }, (_, i) => ({
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            type: ['transfer', 'swap', 'contract'][Math.floor(Math.random() * 3)],
            amount: (Math.random() * 2).toFixed(4),
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            status: ['success', 'pending'][Math.floor(Math.random() * 2)],
            from: `0x${Math.random().toString(16).substr(2, 40)}`,
            to: `0x${Math.random().toString(16).substr(2, 40)}`,
            gasUsed: Math.floor(Math.random() * 100000) + 21000,
            gasPrice: (Math.random() * 50 + 20).toFixed(2)
          }))
        },
        stellar: {
          balance: {
            xlm: 5000,
            usdc: 2500,
            eur: 1800
          },
          balances: [
            { asset_type: 'native', balance: '5000', asset_code: 'XLM' },
            { asset_type: 'credit_alphanum4', balance: '2500', asset_code: 'USDC' },
            { asset_type: 'credit_alphanum4', balance: '1800', asset_code: 'EUR' }
          ],
          recentTransactions: Array.from({ length: 10 }, (_, i) => ({
            id: `stellar_${Math.random().toString(36).substr(2, 9)}`,
            type: ['payment', 'trustline', 'offer'][Math.floor(Math.random() * 3)],
            amount: (Math.random() * 1000).toFixed(2),
            asset: ['XLM', 'USDC', 'EUR'][Math.floor(Math.random() * 3)],
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            status: ['success', 'pending'][Math.floor(Math.random() * 2)],
            from: `G${Math.random().toString(36).substr(2, 56)}`,
            to: `G${Math.random().toString(36).substr(2, 56)}`,
            memo: ['Payment for services', 'Monthly subscription', 'Refund'][Math.floor(Math.random() * 3)]
          }))
        }
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchFinancialMetrics = async () => {
    try {
      const response = await fetch('/api/finance/metrics');
      const data = await response.json();
      setFinancialMetrics(data);
    } catch (err) {
      console.error('Error fetching financial metrics:', err);
      // Use dummy data instead of setting error
      setFinancialMetrics({
        totalAssets: {
          fiat: 250000,
          crypto: 150000,
          total: 400000
        },
        metrics: {
          revenue: {
            monthly: 125000,
            growth: 12
          },
          expenses: {
            monthly: 75000,
            growth: -5
          }
        },
        funds: {
          totalAssets: 400000,
          accounts: [
            { id: 1, name: 'Operating Account', balance: 150000, type: 'Checking' },
            { id: 2, name: 'Savings Account', balance: 200000, type: 'Savings' },
            { id: 3, name: 'Investment Account', balance: 50000, type: 'Investment' }
          ]
        },
        payroll: {
          currentMonth: {
            totalPayroll: 45000,
            netPayroll: 35000,
            employeeCount: 25
          },
          employees: [
            { id: 1, name: 'John Doe', position: 'Developer', netSalary: 5000, paymentStatus: 'Paid' },
            { id: 2, name: 'Jane Smith', position: 'Designer', netSalary: 4500, paymentStatus: 'Paid' },
            { id: 3, name: 'Mike Johnson', position: 'Manager', netSalary: 6000, paymentStatus: 'Pending' }
          ]
        }
      });
    }
  };

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
      fetchBlockchainData();
      fetchFinancialMetrics();
    }
  }, [authLoading]);

  const renderBlockchainOverview = () => {
    // Ensure we have valid data structure
    const stellarBalances = blockchainData?.stellar?.balances || [];
    const ethereumBalances = blockchainData?.ethereum?.balances || [];

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Assets</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchFinancialMetrics}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fiat</span>
                <span className="font-medium">${financialMetrics?.totalAssets?.fiat?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crypto</span>
                <span className="font-medium">${financialMetrics?.totalAssets?.crypto?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total</span>
                <span className="font-bold">${financialMetrics?.totalAssets?.total?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stellar Balances</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchBlockchainData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stellarBalances.map((balance: BlockchainBalance, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {balance.asset_type === 'native' ? 'XLM' : balance.asset_code}
                  </span>
                  <span className="font-medium">{balance.balance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ethereum Balances</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchBlockchainData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ethereumBalances.map((balance: BlockchainBalance, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-muted-foreground">{balance.symbol}</span>
                  <span className="font-medium">{balance.balance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRecentTransactions = () => {
    if (!blockchainData) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-muted/50 rounded">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Blockchain Transactions</CardTitle>
            <CardDescription>Latest transactions across all chains</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchBlockchainData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Stellar Transactions</h3>
              {blockchainData.stellar.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{tx.amount} {tx.asset}</div>
                    <div className="text-sm text-muted-foreground">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Ethereum Transactions</h3>
              {blockchainData.ethereum.recentTransactions.map((tx: any) => (
                <div key={tx.hash} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{tx.amount} {tx.token}</div>
                    <div className="text-sm text-muted-foreground">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFinancialOverview = () => {
    if (!financialData) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                ${financialData.metrics.revenue.monthly.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span>+12% from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                ${financialData.metrics.expenses.monthly.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                <span>-5% from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                ${financialData.funds.totalAssets.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Across {financialData.funds.accounts.length} accounts
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                ${financialData.payroll.currentMonth.totalPayroll.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {financialData.payroll.currentMonth.employeeCount} employees
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderB2BTransactions = () => {
    if (!financialData) {
      return <Skeleton className="h-[200px] w-full" />;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent B2B Transactions</CardTitle>
          <CardDescription>Latest business transactions and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialData.b2bTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-4 bg-muted/50 rounded">
                <div>
                  <div className="font-medium">{tx.partner}</div>
                  <div className="text-sm text-muted-foreground">
                    {tx.type} - Due: {new Date(tx.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {tx.amount.toLocaleString()} {tx.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPayrollOverview = () => {
    if (!financialData) {
      return <Skeleton className="h-[200px] w-full" />;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll Overview</CardTitle>
          <CardDescription>Current month's payroll summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Payroll</div>
                <div className="text-xl font-bold">
                  ${financialData.payroll.currentMonth.totalPayroll.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Net Payroll</div>
                <div className="text-xl font-bold">
                  ${financialData.payroll.currentMonth.netPayroll.toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Recent Payments</div>
              <div className="space-y-2">
                {financialData.payroll.employees.slice(0, 3).map((emp) => (
                  <div key={emp.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-muted-foreground">{emp.position}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${emp.netSalary.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{emp.paymentStatus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFundTracking = () => {
    if (!financialData) {
      return <Skeleton className="h-[200px] w-full" />;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Fund Tracking</CardTitle>
          <CardDescription>Account balances and recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {financialData.funds.accounts.map((account) => (
                <div key={account.id} className="p-4 bg-muted/50 rounded">
                  <div className="text-sm text-muted-foreground">{account.name}</div>
                  <div className="text-xl font-bold">
                    ${account.balance.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">{account.type}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Recent Transactions</div>
              <div className="space-y-2">
                {financialData.funds.transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.account} - {new Date(tx.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${tx.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBudgetTracking = () => {
    if (!financialData) {
      return <Skeleton className="h-[200px] w-full" />;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Tracking</CardTitle>
          <CardDescription>Department and category budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Department Budgets</div>
              <div className="space-y-4">
                {financialData.budgets.departments.map((dept) => (
                  <div key={dept.id}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${dept.spent.toLocaleString()} / ${dept.allocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(dept.spent / dept.allocated) * 100} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Category Budgets</div>
              <div className="space-y-4">
                {financialData.budgets.categories.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(cat.spent / cat.allocated) * 100} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            {renderBlockchainOverview()}
            {renderRecentTransactions()}
            {renderFinancialOverview()}
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
                      title: "Stellar Operations",
                      description: "Manage Stellar blockchain operations",
                      icon: Network,
                      href: "/dashboard/finance/blockchain/stellar"
                    },
                    {
                      title: "Ethereum Operations",
                      description: "Manage Ethereum blockchain operations",
                      icon: Network,
                      href: "/dashboard/finance/blockchain/ethereum"
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
      {canAccessCompactSidebar() && <CompactSidebar />}
      <div className={`flex-1 ${canAccessCompactSidebar() ? 'ml-20' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
} 