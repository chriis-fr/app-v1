import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Wallet, Shield } from 'lucide-react';
import { staticData } from '@/data/static';

export function BusinessHealth() {
  const company = staticData.companies[0];
  const { businessMetrics, aiAnalytics } = company;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold bg-clip-text text-black">
        Business Health
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue and Profit KPIs */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">${businessMetrics.revenue.toLocaleString()}</div>
            <p className="text-xs text-primary/70">
              +{businessMetrics.growthRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Net Profit</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">${businessMetrics.profit.toLocaleString()}</div>
            <p className="text-xs text-emerald-600/70">
              {((businessMetrics.profit / businessMetrics.revenue) * 100).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        {/* Cash Flow Overview */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">${businessMetrics.cashFlow.toLocaleString()}</div>
            <p className="text-xs text-blue-600/70">
              Current month
            </p>
          </CardContent>
        </Card>

        {/* Blockchain Audit Status */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Blockchain Audit</CardTitle>
            <Shield className="h-4 w-4 text-purple-600/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{aiAnalytics.blockchainMetrics.walletHealth.securityScore}%</div>
            <p className="text-xs text-purple-600/70">
              Security Score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* B2B Transaction Summary */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-black">B2B Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-primary/5">
              <p className="text-sm font-medium text-black">Total Transactions</p>
              <p className="text-2xl font-bold text-black">{staticData.blockchain.analytics.totalTransactions}</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50">
              <p className="text-sm font-medium text-black">Success Rate</p>
              <p className="text-2xl font-bold text-black">{staticData.blockchain.analytics.successRate}%</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-sm font-medium text-black">Daily Volume</p>
              <p className="text-2xl font-bold text-black">${staticData.blockchain.analytics.dailyVolume}K</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Fraud Alert */}
      {aiAnalytics.performanceInsights.improvements.some(imp => imp.toLowerCase().includes('risk')) && (
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <CardTitle className="text-sm font-medium text-red-500">AI Fraud Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              Unusual transaction patterns detected. Review recent transactions for potential fraud.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 