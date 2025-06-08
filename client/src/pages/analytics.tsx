import { Card } from '@/components/ui/card';
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
import { Download, RefreshCw, Users, Activity, Server, Database, Clock } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { useLocation } from 'wouter';
import { MainLayout } from '@/components/layout/MainLayout';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Utility function to format storage size
const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Format to 2 decimal places and remove trailing zeros
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
};

// Custom tooltip formatter for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-medium">{data.name} Storage</p>
        <p className="text-sm">{formatStorageSize(data.value)}</p>
      </div>
    );
  }
  return null;
};

interface AnalyticsData {
  systemMetrics: {
    users: {
      total: number;
      active: number;
      new: number;
      inactive: number;
    };
    activity: {
      transactions: number;
      journalEntries: number;
      employees: number;
      businessPartners: number;
    };
    storage: {
      total: number;
      used: number;
      free: number;
    };
    performance: {
      cpu: number;
      memory: number;
      uptime: number;
    };
  };
  dailyStats: Array<{
    date: string;
    transactions: number;
    errors: number;
    latency: number;
  }>;
  topUsers: Array<{
    name: string;
    activity: number;
  }>;
  organization: {
    name: string;
    size: string;
    createdAt: string;
    activeModules: string[];
  };
  moduleUsage: Array<{
    module: string;
    usageCount: number;
    lastUsed: string;
  }>;
  loginActivity: Array<{
    name: string;
    logins: Array<{
      date: string;
      count: number;
    }>;
  }>;
  loadTimeStats: Array<{
    date: string;
    avg: number;
    min: number;
    max: number;
  }>;
  aiInsights: Array<{
    title: string;
    description: string;
    type: 'success' | 'warning' | 'error';
  }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useAuth();
  const { canAccessCompactSidebar } = useRoleAccess();
  const [, setLocation] = useLocation();

  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 0, // Disable caching to always get fresh data
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleExportData = async () => {
    try {
      const response = await axios.get('/api/analytics/export', {
        responseType: 'blob',
        params: { timeRange }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast.success('Analytics data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh analytics data');
    }
  }, [refetch]);

  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value);
    toast.info('Updating analytics data...');
  }, []);

  if (!canAccessCompactSidebar()) {
    setLocation('/');
    return null;
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-red-500">Error loading analytics data. Please try again.</div>
          <Button onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">System Analytics</h1>
            <p className="text-gray-600">Monitor your system's performance and usage</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportData} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </>
          ) : (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold mt-1">{data?.systemMetrics.users.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">System Activity</p>
                    <p className="text-2xl font-semibold mt-1">{data?.systemMetrics.activity.transactions}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Server Load</p>
                    <p className="text-2xl font-semibold mt-1">{data?.systemMetrics.performance.cpu}%</p>
                  </div>
                  <Server className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Uptime</p>
                    <p className="text-2xl font-semibold mt-1">{data?.systemMetrics.performance.uptime}%</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Performance Trend */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">System Performance Trend</h3>
          <div className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="transactions" stroke="#3b82f6" name="Transactions" />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
                  <Line type="monotone" dataKey="latency" stroke="#10b981" name="Latency (ms)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Resource Usage */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Storage Usage</h3>
            <div className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      formatter={(value) => `${value} Storage`}
                    />
                    <Pie
                      data={[
                        { 
                          name: 'Used', 
                          value: data?.systemMetrics.storage.used || 0,
                          formattedValue: formatStorageSize(data?.systemMetrics.storage.used || 0)
                        },
                        { 
                          name: 'Free', 
                          value: data?.systemMetrics.storage.free || 0,
                          formattedValue: formatStorageSize(data?.systemMetrics.storage.free || 0)
                        }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, formattedValue }) => `${name}: ${formattedValue}`}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Total Storage: {formatStorageSize((data?.systemMetrics.storage.used || 0) + (data?.systemMetrics.storage.free || 0))}</p>
            </div>
          </Card>

          {/* Top Active Users */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Top Active Users</h3>
            <div className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.topUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="activity" fill="#3b82f6" name="Activities" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Module Usage Section */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Module Usage</h3>
          <div className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.moduleUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usageCount" fill="#f59e0b" name="Usage Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {!isLoading && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium">Module</th>
                    <th className="text-left font-medium">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.moduleUsage.map((mod) => (
                    <tr key={mod.module}>
                      <td className="py-1 pr-4">{mod.module}</td>
                      <td className="py-1">{new Date(mod.lastUsed).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Login Activity Section */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Login Activity (Last 7 Days)</h3>
          <div className="overflow-x-auto">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium">User</th>
                    {data?.loginActivity[0]?.logins.slice(0, 7).map((l, idx) => (
                      <th key={idx} className="text-left font-medium">{l.date}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.loginActivity.map((user) => (
                    <tr key={user.name}>
                      <td className="py-1 pr-4">{user.name}</td>
                      {user.logins.slice(0, 7).map((l, idx) => (
                        <td key={idx} className="py-1">{l.count}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Load Time Stats Section */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Load Time Stats (ms)</h3>
          <div className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.loadTimeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avg" stroke="#3b82f6" name="Avg" />
                  <Line type="monotone" dataKey="min" stroke="#10b981" name="Min" />
                  <Line type="monotone" dataKey="max" stroke="#ef4444" name="Max" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* AI Insights Section */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
          <div className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              data?.aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg mb-2 ${
                    insight.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : insight.type === 'warning'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-sm mt-1">{insight.description}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
} 