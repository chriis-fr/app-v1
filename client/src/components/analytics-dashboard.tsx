import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, BarChart, PieChart } from '@/components/ui/charts';

interface Metric {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface DailyStat {
  date: string;
  [key: string]: number | string;
}

interface TopItem {
  name: string;
  [key: string]: number | string;
}

interface DistributionItem {
  label: string;
  value: number;
}

interface AnalyticsDashboardProps {
  metrics: Metric[];
  dailyStats: DailyStat[];
  topItems: TopItem[];
  distribution: DistributionItem[];
  insights: string[];
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export default function AnalyticsDashboard({
  metrics,
  dailyStats,
  topItems,
  distribution,
  insights,
  timeRange,
  onTimeRangeChange,
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className={`p-2 rounded-full bg-${metric.color}-100`}>
                  <Icon className={`h-4 w-4 text-${metric.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          <LineChart data={dailyStats} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Items</h3>
          <BarChart data={topItems} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution</h3>
          <PieChart data={distribution} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
} 