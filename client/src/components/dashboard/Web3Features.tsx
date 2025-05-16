import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Vote, Shield, Link, ArrowUpRight } from 'lucide-react';
import { staticData } from '@/data/static';
import { Button } from '@/components/ui/button';

export function Web3Features() {
  const company = staticData.companies[0];
  const { aiAnalytics } = company;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Web3 and Governance Features</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Smart Wallet Dashboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Wallet</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Wallet Address</p>
                <p className="text-sm font-mono">{company.walletAddress}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                  <p className="text-2xl font-bold">
                    {aiAnalytics.blockchainMetrics.walletHealth.securityScore}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Efficiency</p>
                  <p className="text-2xl font-bold">
                    {aiAnalytics.blockchainMetrics.walletHealth.transactionEfficiency}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governance Voting */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Governance</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Proposals</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Voting Power</p>
                <p className="text-2xl font-bold">1,000 CHAINS</p>
              </div>
              <Button className="w-full">
                View Proposals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Public Audit Portal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Portal</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">
                  {aiAnalytics.blockchainMetrics.smartContractAnalysis.activeContracts}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {aiAnalytics.blockchainMetrics.smartContractAnalysis.successRate}%
                </p>
              </div>
              <Button variant="outline" className="w-full">
                <Link className="h-4 w-4 mr-2" />
                View on Explorer
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Contract Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Smart Contract Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Execution Cost</p>
                <p className="text-lg font-semibold">
                  {aiAnalytics.blockchainMetrics.smartContractAnalysis.avgExecutionCost}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gas Optimization</p>
                <p className="text-lg font-semibold">
                  {aiAnalytics.blockchainMetrics.walletHealth.gasOptimization}%
                </p>
              </div>
            </div>

            {/* Recommended Optimizations */}
            <div>
              <h4 className="font-medium mb-2">Recommended Optimizations</h4>
              <ul className="space-y-2">
                {aiAnalytics.blockchainMetrics.smartContractAnalysis.recommendedOptimizations.map((opt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowUpRight className="h-4 w-4 mt-1 text-muted-foreground" />
                    <span className="text-sm">{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 