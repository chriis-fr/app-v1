import { Card } from '@/components/ui/card';
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, Shield } from 'lucide-react';

interface BlockchainMetric {
  title: string;
  value: string;
  change: number;
  icon: any;
}

const blockchainMetrics: BlockchainMetric[] = [
  {
    title: 'Total Transactions',
    value: '1,234',
    change: 12.5,
    icon: Activity
  },
  {
    title: 'Smart Contracts',
    value: '45',
    change: 8.2,
    icon: Wallet
  },
  {
    title: 'Digital Assets',
    value: '$2.5M',
    change: 15.7,
    icon: ArrowUpRight
  },
  {
    title: 'Security Score',
    value: '98%',
    change: 2.1,
    icon: Shield
  }
];

export default function BlockchainInsights() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Blockchain Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blockchainMetrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{metric.title}</p>
                <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                <div className="flex items-center mt-2">
                  {metric.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <metric.icon className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Blockchain Activities</h3>
        <div className="space-y-4">
          {[
            {
              type: 'Smart Contract',
              description: 'New supply chain contract deployed',
              timestamp: '2 hours ago'
            },
            {
              type: 'Transaction',
              description: 'Bulk payment processed',
              timestamp: '4 hours ago'
            },
            {
              type: 'Asset',
              description: 'New digital asset registered',
              timestamp: '6 hours ago'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
              <div>
                <p className="font-medium">{activity.type}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 