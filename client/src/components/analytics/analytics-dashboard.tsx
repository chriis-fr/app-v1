import { Card } from '@/components/ui/card';
import {
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface Metric {
  name: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
}

interface DailyStat {
  date: string;
  value: number;
}

interface TopItem {
  name: string;
  value: number;
}

interface DistributionData {
  name: string;
  value: number;
}

interface Insight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}

interface AnalyticsDashboardProps {
  moduleId: string;
  moduleName: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onExportData: () => void;
  onRefresh: () => void;
  metrics: Metric[];
  dailyStats: DailyStat[];
  topItems: TopItem[];
  distributionData: DistributionData[];
  insights: Insight[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AnalyticsDashboard({
  moduleId,
  moduleName,
  timeRange,
  onTimeRangeChange,
  onExportData,
  onRefresh,
  metrics,
  dailyStats,
  topItems,
  distributionData,
  insights,
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Time Range and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="year">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onExportData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{metric.name}</p>
                <p className="text-2xl font-semibold mt-1">{metric.value}</p>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {metric.trend === 'up' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span className="text-sm">{metric.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Trend */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Items and Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Top Departments</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Employee Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {distributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                insight.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : insight.type === 'warning'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
