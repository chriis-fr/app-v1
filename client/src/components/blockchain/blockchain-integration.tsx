import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModules } from '@/hooks/use-modules';
import { 
  Link, 
  Wallet, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const recentTransactions = [
  {
    id: '0x123...abc',
    type: 'Transfer',
    amount: '1.5 ETH',
    status: 'completed',
    timestamp: '2024-03-15 14:30:00'
  },
  {
    id: '0x456...def',
    type: 'Smart Contract',
    amount: '0.8 ETH',
    status: 'pending',
    timestamp: '2024-03-15 14:25:00'
  },
  {
    id: '0x789...ghi',
    type: 'DeFi',
    amount: '2.3 ETH',
    status: 'completed',
    timestamp: '2024-03-15 14:20:00'
  }
];

export function BlockchainIntegration() {
  const { loading, error, fetchBlockchainChains, syncModule } = useModules();
  const [chains, setChains] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadChains = async () => {
      try {
        const data = await fetchBlockchainChains();
        setChains(data);
      } catch (err) {
        console.error('Failed to load blockchain chains:', err);
      }
    };

    loadChains();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncModule('blockchain');
    } catch (err) {
      console.error('Failed to sync blockchain:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Integration</CardTitle>
          <CardDescription>
            Manage blockchain connections and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chains" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chains">Supported Chains</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="wallet">Wallet Management</TabsTrigger>
            </TabsList>

            <TabsContent value="chains" className="space-y-4">
              <div className="space-y-4">
                {chains.map((chain) => (
                  <Card key={chain.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link className="h-5 w-5" />
                          <CardTitle>{chain.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {chain.status === 'connected' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      <CardDescription>{chain.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Last Sync</span>
                          <div className="text-sm">{chain.lastSync}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleSync}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            'Sync Now'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <Card key={tx.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link className="h-5 w-5" />
                          <CardTitle className="text-sm font-mono">{tx.id}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {tx.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Type</span>
                          <div className="text-sm">{tx.type}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Amount</span>
                          <div className="text-sm">{tx.amount}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Time</span>
                          <div className="text-sm">{tx.timestamp}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connect Wallet</CardTitle>
                  <CardDescription>
                    Connect your wallet to manage blockchain transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wallet Address</label>
                      <Input
                        placeholder="Enter wallet address"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                      />
                    </div>
                    <Button className="w-full">
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Wallet connection is secure</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 