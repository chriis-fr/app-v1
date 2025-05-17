import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blockchainService, WalletInfo, Transaction } from '@/services/blockchain';
import { useAuth } from '@/hooks/use-auth';
import { Wallet, ArrowUpRight, ArrowDownRight, Copy } from 'lucide-react';

export default function WalletInfo() {
  const { user } = useAuth();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWalletInfo = async () => {
      if (user?.organization?.walletAddress) {
        try {
          const info = await blockchainService.getWalletInfo(
            user.organization.walletAddress,
            'business'
          );
          setWalletInfo(info);
          
          const txHistory = await blockchainService.getTransactionHistory(
            user.organization.walletAddress
          );
          setTransactions(txHistory);
        } catch (error) {
          console.error('Error loading wallet info:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWalletInfo();
  }, [user?.organization?.walletAddress]);

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
    }
  };

  if (isLoading) {
    return <div>Loading wallet information...</div>;
  }

  if (!walletInfo) {
    return <div>No wallet information available</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Business Wallet</h2>
          <Button variant="outline" size="sm" onClick={copyAddress}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Address
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-mono text-sm break-all">{walletInfo.address}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-2xl font-bold">{walletInfo.balance} ETH</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Network</p>
            <p className="font-medium">{walletInfo.network}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.hash} className="flex items-center justify-between border-b pb-4 last:border-0">
              <div className="flex items-center gap-4">
                {tx.type === 'payment' ? (
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <p className="font-medium">
                    {tx.type === 'payment' ? 'Payment Sent' : 'Payment Received'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tx.type === 'payment' ? `To: ${tx.to}` : `From: ${tx.from}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{tx.amount} ETH</p>
                <p className="text-sm text-gray-500">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 