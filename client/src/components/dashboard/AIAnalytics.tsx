import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Users, Wallet, Package, Building2 } from 'lucide-react';
import { staticData } from '@/data/static';
import { useOrganization } from '@/contexts/OrganizationContext';

export function AIAnalytics() {
  const { organization } = useOrganization();
  if (!organization?.aiEnabled) return null;
  const company = staticData.companies[0];
  const { aiAnalytics } = company;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold bg-clip-text text-black">
        AI-Powered Analytics
      </h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sales Forecast */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Sales Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              ${aiAnalytics.growthProjections.shortTerm.expectedRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-primary/70">
              Projected {aiAnalytics.growthProjections.shortTerm.projectedGrowth}% growth
            </p>
          </CardContent>
        </Card>

        {/* Employee Churn Risk */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Employee Churn Risk</CardTitle>
            <Users className="h-4 w-4 text-emerald-600/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{staticData.hr.analytics.turnoverRate}%</div>
            <p className="text-xs text-emerald-600/70">
              Current turnover rate
            </p>
          </CardContent>
        </Card>

        {/* B2B Payment Optimization */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Payment Optimization</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {aiAnalytics.blockchainMetrics.smartContractAnalysis.successRate}%
            </div>
            <p className="text-xs text-blue-600/70">
              Transaction success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Market Trends */}
            <div className="p-4 rounded-lg bg-primary/5">
              <h4 className="font-medium mb-3 text-black">Market Trends</h4>
              <ul className="space-y-2">
                {aiAnalytics.marketTrends.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-primary/10 transition-colors">
                    <TrendingUp className="h-4 w-4 mt-1 text-primary/70" />
                    <span className="text-sm text-black">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Performance Insights */}
            <div className="p-4 rounded-lg bg-emerald-50">
              <h4 className="font-medium mb-3 text-black">Performance Insights</h4>
              <ul className="space-y-2">
                {aiAnalytics.performanceInsights.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-emerald-100/50 transition-colors">
                    <Package className="h-4 w-4 mt-1 text-emerald-600/70" />
                    <span className="text-sm text-black">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Industry Comparison */}
            <div className="p-4 rounded-lg bg-blue-50">
              <h4 className="font-medium mb-3 text-black">Industry Standing</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-blue-100/50">
                  <p className="text-sm text-black/70">Revenue Percentile</p>
                  <p className="text-lg font-semibold text-black">{aiAnalytics.industryComparison.revenuePercentile}%</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100/50">
                  <p className="text-sm text-black/70">Growth Percentile</p>
                  <p className="text-lg font-semibold text-black">{aiAnalytics.industryComparison.growthPercentile}%</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100/50">
                  <p className="text-sm text-black/70">Efficiency Score</p>
                  <p className="text-lg font-semibold text-black">{aiAnalytics.industryComparison.efficiencyScore}%</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100/50">
                  <p className="text-sm text-black/70">Sustainability Rank</p>
                  <p className="text-lg font-semibold text-black">{aiAnalytics.industryComparison.sustainabilityRank}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 