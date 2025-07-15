import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Shield, BarChart } from 'lucide-react';
import { staticData } from '@/data/static';
import { useOrganization } from '@/contexts/OrganizationContext';

export function AIInsights() {
  const { organization } = useOrganization();
  if (!organization?.aiEnabled) return null;

  const { aiAnalytics } = staticData.companies[0];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
      
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Growth Opportunities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiAnalytics.marketTrends.growthOpportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {index + 1}
                  </Badge>
                  <p>{opportunity}</p>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Recommended Actions</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {aiAnalytics.marketTrends.recommendedActions.map((action, index) => (
                    <li key={index}>• {action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Blockchain Health</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalytics.blockchainMetrics.walletHealth.securityScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Security</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalytics.blockchainMetrics.walletHealth.transactionEfficiency}%
                  </div>
                  <div className="text-sm text-muted-foreground">Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalytics.blockchainMetrics.walletHealth.gasOptimization}%
                  </div>
                  <div className="text-sm text-muted-foreground">Gas Optimization</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Smart Contract Optimizations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {aiAnalytics.blockchainMetrics.smartContractAnalysis.recommendedOptimizations.map((opt, index) => (
                    <li key={index}>• {opt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Growth Projections</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Short-term Outlook</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${aiAnalytics.growthProjections.shortTerm.expectedRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Expected Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      +{aiAnalytics.growthProjections.shortTerm.projectedGrowth}%
                    </div>
                    <div className="text-sm text-muted-foreground">Projected Growth</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Required Investments</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {aiAnalytics.growthProjections.longTerm.requiredInvestments.map((investment, index) => (
                    <li key={index}>• {investment}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <CardTitle>Industry Standing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalytics.industryComparison.revenuePercentile}th
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue Percentile</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalytics.industryComparison.sustainabilityRank}
                  </div>
                  <div className="text-sm text-muted-foreground">Sustainability Rank</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Competitive Advantages</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {aiAnalytics.industryComparison.competitiveAdvantages.map((advantage, index) => (
                    <li key={index}>• {advantage}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
