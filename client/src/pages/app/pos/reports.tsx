import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import POSLayout from '@/components/layouts/pos-layout';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DateRangePicker } from '@/components/date-range-picker';
import { DateRange, ReportData } from '@/types/pos';

export default function POSReports() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [reportData, setReportData] = useState<ReportData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    total_sales: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
    average_order_value: 0,
    top_selling_products: [],
    top_customers: [],
    sales_by_category: [],
    sales_by_hour: [],
    sales_by_day: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/pos/reports?start_date=${format(dateRange.from, 'yyyy-MM-dd')}&end_date=${format(dateRange.to, 'yyyy-MM-dd')}`);
      if (response && typeof response === 'object') {
        setReportData({
          date: format(new Date(), 'yyyy-MM-dd'),
          total_sales: response.total_sales || 0,
          total_orders: response.total_orders || 0,
          total_customers: response.total_customers || 0,
          total_products: response.total_products || 0,
          average_order_value: response.average_order_value || 0,
          top_selling_products: Array.isArray(response.top_selling_products) ? response.top_selling_products : [],
          top_customers: Array.isArray(response.top_customers) ? response.top_customers : [],
          sales_by_category: Array.isArray(response.sales_by_category) ? response.sales_by_category : [],
          sales_by_hour: Array.isArray(response.sales_by_hour) ? response.sales_by_hour : [],
          sales_by_day: Array.isArray(response.sales_by_day) ? response.sales_by_day : []
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/pos/reports/export?start_date=${format(dateRange.from, 'yyyy-MM-dd')}&end_date=${format(dateRange.to, 'yyyy-MM-dd')}`);
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  return (
    <POSLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <div className="flex items-center space-x-4">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <Button onClick={handleExport}>
              Export Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                <p className="text-2xl font-semibold">${(reportData?.total_sales || 0).toFixed(2)}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <p className="text-2xl font-semibold">{reportData?.total_orders || 0}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
                <p className="text-2xl font-semibold">${(reportData?.average_order_value || 0).toFixed(2)}</p>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(reportData?.top_selling_products || []).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>${(product.revenue || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Total Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(reportData?.top_customers || []).map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>${(customer.total_spent || 0).toFixed(2)}</TableCell>
                      <TableCell>{customer.total_orders || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </POSLayout>
  );
} 