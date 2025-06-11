import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { blockchainData, financialMetrics } from '@/data/blockchain';
import { financialData } from '@/data/financial';
import { 
  Wallet, 
  Network, 
  Activity, 
  ArrowLeft,
  DollarSign,
  Users,
  Building2,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Receipt,
  Banknote,
  RefreshCw
} from 'lucide-react';

export default function FinanceModulePage() {
  const { module } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user has access to finance module
  if (!user || !(user.role === 'owner' || user.isOwner || user.role === 'admin' || user.moduleAccess?.includes('finance') || (user.permissions && user.permissions.some((p: any) => p.module === 'finance' && p.actions.length > 0)))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You don't have access to the finance module.
        </p>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Implement actual data refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderModuleHeader = (title: string, description: string) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setLocation('/dashboard/finance')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Finance
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );

  const renderBlockchainModule = () => {
  switch (module) {
      case 'stellar':
        return (
          <div className="container mx-auto py-8">
            {renderModuleHeader(
              'Stellar Operations',
              'Manage your Stellar blockchain operations and assets'
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Wallet Information</CardTitle>
                      <CardDescription>Your Stellar wallet details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Public Key</span>
                          <span className="font-mono">{blockchainData.stellar.walletInfo.publicKey}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Created</span>
                          <span>{new Date(blockchainData.stellar.walletInfo.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Last Activity</span>
                          <span>{new Date(blockchainData.stellar.walletInfo.lastActivity).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Total Assets</CardTitle>
                      <CardDescription>Current asset balances</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {blockchainData.stellar.balances.map((balance, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-muted/50 rounded">
                            <div>
                              <div className="font-medium">
                                {balance.asset_type === 'native' ? 'XLM' : balance.asset_code}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {balance.asset_type === 'native' ? 'Native Asset' : 'Token'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{balance.balance}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common Stellar operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button className="w-full justify-start" variant="outline">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Send Payment
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Add Asset
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View Statements
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest Stellar transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blockchainData.stellar.recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-4 bg-muted/50 rounded">
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Management</CardTitle>
                    <CardDescription>Manage your Stellar assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Native Assets</h3>
                        <div className="space-y-2">
                          {blockchainData.stellar.balances
                            .filter(b => b.asset_type === 'native')
                            .map((balance, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                <span>XLM</span>
                                <span className="font-medium">{balance.balance}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Custom Assets</h3>
                        <div className="space-y-2">
                          {blockchainData.stellar.balances
                            .filter(b => b.asset_type !== 'native')
                            .map((balance, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                <span>{balance.asset_code}</span>
                                <span className="font-medium">{balance.balance}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Stellar Settings</CardTitle>
                    <CardDescription>Configure your Stellar integration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Network</span>
                        <span className="font-medium">Testnet</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Horizon URL</span>
                        <span className="font-medium">https://horizon-testnet.stellar.org</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Transaction Fee</span>
                        <span className="font-medium">100 stroops</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'ethereum':
        return (
          <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => setLocation('/dashboard/finance')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Finance
              </Button>
              <h1 className="text-3xl font-bold">Ethereum Operations</h1>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Balances</CardTitle>
                  <CardDescription>Current Ethereum token balances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blockchainData.ethereum.balances.map((balance, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium">{balance.symbol}</div>
                          <div className="text-sm text-muted-foreground">Token</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{balance.balance}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest Ethereum transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blockchainData.ethereum.recentTransactions.map((tx) => (
                      <div key={tx.hash} className="flex justify-between items-center p-4 bg-muted/50 rounded">
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
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => setLocation('/dashboard/finance')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Finance
              </Button>
              <h1 className="text-3xl font-bold">All Transactions</h1>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stellar Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blockchainData.stellar.recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-4 bg-muted/50 rounded">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ethereum Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blockchainData.ethereum.recentTransactions.map((tx) => (
                      <div key={tx.hash} className="flex justify-between items-center p-4 bg-muted/50 rounded">
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
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'wallets':
        return (
          <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => setLocation('/dashboard/finance')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Finance
              </Button>
              <h1 className="text-3xl font-bold">Wallet Management</h1>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stellar Wallet</CardTitle>
                  <CardDescription>Your Stellar wallet information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Public Key</span>
                      <span className="font-mono">{blockchainData.stellar.walletInfo.publicKey}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(blockchainData.stellar.walletInfo.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Activity</span>
                      <span>{new Date(blockchainData.stellar.walletInfo.lastActivity).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wallet Balances</CardTitle>
                  <CardDescription>Current balances across all chains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Stellar Assets</h3>
                      <div className="space-y-2">
                        {blockchainData.stellar.balances.map((balance, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <span>{balance.asset_type === 'native' ? 'XLM' : balance.asset_code}</span>
                            <span className="font-medium">{balance.balance}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Ethereum Tokens</h3>
                      <div className="space-y-2">
                        {blockchainData.ethereum.balances.map((balance, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <span>{balance.symbol}</span>
                            <span className="font-medium">{balance.balance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
      return (
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
          <p className="text-muted-foreground mb-4">
            This finance module is under development.
          </p>
          <Button onClick={() => setLocation('/dashboard/finance')}>
            Return to Finance
          </Button>
        </div>
      );
    }
  };

  return renderBlockchainModule();
} 