import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Building2,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { api } from '@/lib/api';

interface ProcurementMetrics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalSpent: number;
  totalBudget: number;
  activeSuppliers: number;
  totalPurchaseOrders: number;
  averageProcessingTime: number;
  costSavings: number;
  complianceRate: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

interface SupplierPerformance {
  id: string;
  name: string;
  totalSpent: number;
  orderCount: number;
  averageRating: number;
  onTimeDelivery: number;
}

interface MonthlyTrend {
  month: string;
  requests: number;
  spending: number;
  orders: number;
}

export default function ProcurementAnalytics() {
  const [metrics, setMetrics] = useState<ProcurementMetrics | null>(null);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/procurement/analytics?timeRange=${timeRange}`);
      const data = response.data;
      
      setMetrics(data.metrics);
      setCategorySpending(data.categorySpending);
      setSupplierPerformance(data.supplierPerformance);
      setMonthlyTrends(data.monthlyTrends);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number, previousValue: number) => {
    if (value > previousValue) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < previousValue) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Procurement Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into procurement performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(metrics.totalRequests, metrics.totalRequests - 5)}
                <span className="ml-1">+5 from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalSpent.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(metrics.totalSpent, metrics.totalSpent - 10000)}
                <span className="ml-1">+$10K from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSuppliers}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(metrics.activeSuppliers, metrics.activeSuppliers - 2)}
                <span className="ml-1">+2 from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.complianceRate}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(metrics.complianceRate, metrics.complianceRate - 2)}
                <span className="ml-1">+2% from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metrics.approvedRequests}</span>
                      <Badge variant="outline">{((metrics.approvedRequests / metrics.totalRequests) * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metrics.pendingRequests}</span>
                      <Badge variant="outline">{((metrics.pendingRequests / metrics.totalRequests) * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Rejected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metrics.rejectedRequests}</span>
                      <Badge variant="outline">{((metrics.rejectedRequests / metrics.totalRequests) * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Budget</span>
                  <span className="font-medium">${metrics.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Spent</span>
                  <span className="font-medium">${metrics.totalSpent.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.totalSpent / metrics.totalBudget) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Utilization: {((metrics.totalSpent / metrics.totalBudget) * 100).toFixed(1)}%</span>
                  <span>Remaining: ${(metrics.totalBudget - metrics.totalSpent).toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Spending */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorySpending.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>${category.amount.toLocaleString()}</span>
                  <Badge variant="outline">{category.percentage.toFixed(1)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplierPerformance.slice(0, 5).map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {supplier.orderCount} orders • {supplier.averageRating.toFixed(1)}/5 rating
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${supplier.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {supplier.onTimeDelivery}% on-time delivery
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageProcessingTime || 0} days</div>
            <p className="text-xs text-muted-foreground">
              Target: 5 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.costSavings.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Through negotiations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalPurchaseOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 