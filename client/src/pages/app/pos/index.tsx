import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import POSLayout from '@/components/layouts/pos-layout';
import { Product, Customer, Order, PaymentMethod, POSSettings } from '@/types/pos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Search, Plus, Printer, Download, Clock, Users, Package, DollarSign, Settings } from 'lucide-react';

// Default payment methods
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', type: 'cash' },
  { id: 'card', name: 'Card', type: 'card' },
  { id: 'mobile', name: 'Mobile Money', type: 'mobile' },
  { id: 'bank', name: 'Bank Transfer', type: 'bank_transfer' }
];

// Default POS settings
const DEFAULT_SETTINGS: POSSettings = {
  enable_customer_profiles: true,
  enable_inventory_tracking: true,
  enable_employee_time_tracking: true,
  enable_discounts: true,
  enable_loyalty_program: true,
  enable_multi_currency: false,
  enable_offline_mode: true,
  enable_receipt_printing: true,
  enable_email_receipts: true,
  enable_sms_notifications: false,
  default_tax_rate: 0.1,
  default_currency: 'USD',
  receipt_footer: 'Thank you for shopping with us!',
  receipt_header: 'Your Store Name'
};

// Add type for toast function
type ToastFunction = (params: {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}) => void;

export default function POSPage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [change, setChange] = useState<number>(0);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [settings, setSettings] = useState<POSSettings>(DEFAULT_SETTINGS);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [employeeAttendance, setEmployeeAttendance] = useState<any[]>([]);

  // Add missing state variables
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [employeeClockIn, setEmployeeClockIn] = useState<string | null>(null);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    // Check online status
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleOnlineStatus();

    // Fetch initial data
    fetchProducts();
    fetchCustomers();
    fetchOrders();

    if (isOffline) {
      loadOfflineData();
    } else {
      localStorage.removeItem('pos_offline_data');
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Data fetching functions with error handling
  const fetchProducts = async () => {
    try {
      const response = await api.get('/pos/products');
      if (Array.isArray(response)) {
        setProducts(response);
      } else {
        console.error('API response is not an array:', response);
        toast({
          title: 'Error',
          description: 'Invalid products data received',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/pos/customers');
      if (Array.isArray(response)) {
        setCustomers(response);
      } else {
        console.error('API response is not an array:', response);
        toast({
          title: 'Error',
          description: 'Invalid customers data received',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive',
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/pos/orders');
      if (Array.isArray(response)) {
        setOrders(response);
      } else {
        console.error('API response is not an array:', response);
        toast({
          title: 'Error',
          description: 'Invalid orders data received',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    }
  };

  // Cart management functions
  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast({
        title: 'Error',
        description: 'Product is out of stock',
        variant: 'destructive',
      });
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toast({
            title: 'Error',
            description: 'Not enough stock available',
            variant: 'destructive',
          });
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock_quantity) {
      toast({
        title: 'Error',
        description: 'Not enough stock available',
        variant: 'destructive',
      });
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Payment handling
  const handleAmountTenderedChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setAmountTendered(amount);
    setChange(amount - cartTotal);
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      handleAddToCart(product);
    } else {
      toast({
        title: 'Error',
        description: 'Product not found',
        variant: 'destructive',
      });
    }
    setBarcodeInput('');
  };

  const handleDiscountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setDiscount(amount);
  };

  const calculateTax = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const taxRate = 0.1; // 10% tax rate - should come from settings
    return subtotal * taxRate;
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = calculateTax();
    const discountAmount = discountType === 'percentage' 
      ? (subtotal + tax) * (discount / 100)
      : discount;
    return (subtotal + tax - discountAmount);
  };

  const handleClockIn = () => {
    const now = new Date().toISOString();
    setEmployeeClockIn(now);
    toast({
      title: 'Success',
      description: 'Clocked in successfully',
    });
  };

  const handleClockOut = () => {
    if (!employeeClockIn) return;
    
    const clockOut = new Date().toISOString();
    const duration = new Date(clockOut).getTime() - new Date(employeeClockIn).getTime();
    const hours = duration / (1000 * 60 * 60);
    
    toast({
      title: 'Success',
      description: `Clocked out. Worked ${hours.toFixed(2)} hours`,
    });
    setEmployeeClockIn(null);
  };

  const loadOfflineData = () => {
    if (isOffline) {
      const savedData = localStorage.getItem('pos_offline_data');
      if (savedData) {
        const { cart: savedCart, selectedCustomer: savedCustomer, orders: savedOrders } = JSON.parse(savedData);
        setCart(savedCart);
        setSelectedCustomer(savedCustomer);
        setOrders(savedOrders);
      }
    }
  };

  const saveOfflineData = () => {
    if (isOffline) {
      const offlineData = {
        cart,
        selectedCustomer,
        orders,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('pos_offline_data', JSON.stringify(offlineData));
    }
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPaymentMethod.type === 'cash' && amountTendered < cartTotal) {
      toast({
        title: 'Error',
        description: 'Insufficient amount tendered',
        variant: 'destructive',
      });
      return;
    }

    try {
      const order = {
        customerId: selectedCustomer.id,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal: cartTotal,
        tax: calculateTax(),
        discount: discount,
        discountType: discountType,
        total: calculateTotal(),
        paymentMethod: selectedPaymentMethod.type,
        amountTendered: amountTendered,
        change: change,
        status: 'completed' as const,
        paymentStatus: 'paid' as const,
        employeeId: user?.id,
        clockInTime: employeeClockIn,
        clockOutTime: new Date().toISOString(),
      };

      await api.post('/pos/orders', order);
      
      // Print receipt
      if (window.print) {
        window.print();
      }
      
      // Reset state
      setCart([]);
      setSelectedCustomer(null);
      setSelectedPaymentMethod(null);
      setAmountTendered(0);
      setChange(0);
      setDiscount(0);
      setEmployeeClockIn(null);
      
      fetchOrders();
      fetchProducts();
      
      toast({
        title: 'Success',
        description: 'Order placed successfully',
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order',
        variant: 'destructive',
      });
    }
  };

  // Filter products with null check
  const filteredProducts = Array.isArray(products) 
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      const response = await api.get(`/pos/sales/analytics?start_date=${format(dateRange.from, 'yyyy-MM-dd')}&end_date=${format(dateRange.to, 'yyyy-MM-dd')}`);
      setSalesData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch sales data',
        variant: 'destructive',
      });
    }
  };

  // Fetch low stock products
  const fetchLowStockProducts = async () => {
    try {
      const response = await api.get('/pos/products/low-stock');
      setLowStockProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      setLowStockProducts([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch low stock products',
        variant: 'destructive',
      });
    }
  };

  // Fetch employee attendance
  const fetchEmployeeAttendance = async () => {
    try {
      const response = await api.get('/pos/employees/attendance');
      setEmployeeAttendance(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching employee attendance:', error);
      setEmployeeAttendance([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch employee attendance',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSalesData();
    fetchLowStockProducts();
    fetchEmployeeAttendance();
  }, [dateRange]);

  return (
    <POSLayout>
      <div className="p-6">
        {isOffline && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
            <p>Offline Mode: Some features may be limited</p>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Sales</p>
                <h3 className="text-2xl font-bold">$12,345</h3>
                <p className="text-sm text-green-500">+12% from yesterday</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Employees</p>
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-sm text-gray-500">2 on break</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <h3 className="text-2xl font-bold">12</h3>
                <p className="text-sm text-red-500">Need attention</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <h3 className="text-2xl font-bold">5</h3>
                <p className="text-sm text-gray-500">2 ready for pickup</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sales & Analytics */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Sales Analytics</h2>
                <div className="flex items-center space-x-2">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range: any) => setDateRange(range)}
                  />
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-4">Low Stock Alerts</h2>
              <div className="space-y-4">
                {(lowStockProducts || []).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">Current Stock: {product.stock_quantity}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>
                ))}
                {(!lowStockProducts || lowStockProducts.length === 0) && (
                  <p className="text-gray-500 text-center">No low stock items</p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Employee Status */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
                <Button className="w-full" variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory Check
                </Button>
                <Button className="w-full" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Reports
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </Card>

            {/* Employee Status */}
            <Card className="p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-4">Employee Status</h2>
              <div className="space-y-4">
                {(employeeAttendance || []).map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-gray-500">
                        {employee.status === 'active' ? 'Clocked in' : 'On break'}
                      </p>
                    </div>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </div>
                ))}
                {(!employeeAttendance || employeeAttendance.length === 0) && (
                  <p className="text-gray-500 text-center">No active employees</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </POSLayout>
  );
} 