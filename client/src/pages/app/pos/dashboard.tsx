import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import POSLayout from '@/components/layouts/pos-layout';
import { Product, Order, Customer } from '@/types/pos';
import {
  ShoppingBag,
  Users,
  Package,
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard
} from 'lucide-react';

interface DashboardStats {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  average_order_value: number;
  top_selling_products: Product[];
  recent_orders: Order[];
  low_stock_products: Product[];
  sales_growth: number;
  low_stock_items: number;
  active_employees: number;
}

export default function POSDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    total_sales: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
    average_order_value: 0,
    top_selling_products: [],
    recent_orders: [],
    low_stock_products: [],
    sales_growth: 0,
    low_stock_items: 0,
    active_employees: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/pos/dashboard/stats');
      if (response && typeof response === 'object') {
        setStats({
          total_sales: response.total_sales || 0,
          total_orders: response.total_orders || 0,
          total_customers: response.total_customers || 0,
          total_products: response.total_products || 0,
          average_order_value: response.average_order_value || 0,
          top_selling_products: response.top_selling_products || [],
          recent_orders: response.recent_orders || [],
          low_stock_products: response.low_stock_products || [],
          sales_growth: response.sales_growth || 0,
          low_stock_items: response.low_stock_items || 0,
          active_employees: response.active_employees || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard statistics',
        variant: 'destructive',
      });
    }
  };

  return (
    <POSLayout>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-semibold">${stats?.total_sales?.toFixed(2) || '0.00'}</h3>
              <p className="text-sm text-green-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stats?.sales_growth?.toFixed(1) || '0.0'}% from last period
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-semibold">{stats?.total_orders || 0}</h3>
              <p className="text-sm text-gray-500">
                Avg. ${stats?.average_order_value?.toFixed(2) || '0.00'} per order
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Customers</p>
              <h3 className="text-2xl font-semibold">{stats?.total_customers || 0}</h3>
              <p className="text-sm text-gray-500">Active customers</p>
            </div>
          </Card>
          <Card className="p-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Products</p>
              <h3 className="text-2xl font-semibold">{stats?.total_products || 0}</h3>
              <p className="text-sm text-red-500">
                {stats?.low_stock_items || 0} low stock items
              </p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                <div className="space-y-4">
                  {stats.top_selling_products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-500">${product.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.stock_quantity} sold</p>
                        <p className="text-sm text-green-500">+12% from last month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {stats.recent_orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Order #{order.id}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total}</p>
                        <p className="text-sm text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Low Stock Products</h3>
              <div className="space-y-4">
                {stats.low_stock_products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.stock_quantity} in stock</p>
                      <p className="text-sm text-red-500">Low stock alert</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Average Order Value</h4>
                  <p className="text-2xl font-semibold">${stats.average_order_value}</p>
                  <p className="text-sm text-green-500">+8% from last month</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Total Orders</h4>
                  <p className="text-2xl font-semibold">{stats.total_orders}</p>
                  <p className="text-sm text-green-500">+12% from last month</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Total Customers</h4>
                  <p className="text-2xl font-semibold">{stats.total_customers}</p>
                  <p className="text-sm text-green-500">+5% from last month</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">New Customers</h4>
                  <p className="text-2xl font-semibold">24</p>
                  <p className="text-sm text-green-500">+15% from last month</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </POSLayout>
  );
} 