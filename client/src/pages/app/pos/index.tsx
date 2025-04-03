import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import POSLayout from '@/components/layouts/pos-layout';
import POSMain from '@/components/modules/pos/POSMain';
import { Order, POSSettings } from '@/types/pos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { 
  Search, 
  Plus, 
  Minus,
  X,
  ShoppingCart,
  CreditCard,
  Wallet,
  DollarSign,
  Receipt,
  User,
  Printer,
  Trash2,
  Percent,
  ArrowRight,
  Clock, 
  Users, 
  Package, 
  Settings, 
  Download,
  AlignJustify,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';

// Default payment methods
interface AppPaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'mobile' | 'bank_transfer' | 'mobile_money' | 'crypto' | 'other';
  icon: any;
  enabled: boolean;
}

const DEFAULT_PAYMENT_METHODS: AppPaymentMethod[] = [
  { id: 'cash', name: 'Cash', type: 'cash', icon: DollarSign, enabled: true },
  { id: 'card', name: 'Card', type: 'card', icon: CreditCard, enabled: true },
  { id: 'mobile', name: 'Mobile Money', type: 'mobile_money', icon: Wallet, enabled: true },
  { id: 'bank', name: 'Bank Transfer', type: 'bank_transfer', icon: AlignJustify, enabled: true },
  { id: 'crypto', name: 'Cryptocurrency', type: 'crypto', icon: Wallet, enabled: true }
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

// Simplified Product type
interface AppProduct {
  _id: string;
  name: string;
  price: number;
  sku: string;
  barcode: string;
  stock_quantity: number;
  image_url?: string;
  category_id?: string;
  status: 'available' | 'unavailable';
}

// Cart Item type
interface AppCartItem {
  _id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
  product?: AppProduct;
}

// Customer type
interface AppCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

// Sale Session type
interface SaleSession {
  _id: string;
  orderId: string;
  items: AppCartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  customerId?: string;
  employeeId: string;
  counterId: string;
}

// Using string literal type instead of enum for better type checking
type ViewMode = 'main' | 'cashier';

export default function POSPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determine if user is a cashier based on role
  const isCashier = user?.role === 'cashier';
  const canAccessAdminFeatures = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
  
  // State management
  const [products, setProducts] = useState<AppProduct[]>([]);
  const [customers, setCustomers] = useState<AppCustomer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AppCustomer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [currentSale, setCurrentSale] = useState<SaleSession | null>(null);
  
  // For cashiers, force cashier view. Admins/managers can toggle
  const [viewMode, setViewMode] = useState<ViewMode>(isCashier ? 'cashier' : 'main');
  
  // Dialog states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  
  useEffect(() => {
    // When user role changes, update the view mode accordingly
    if (isCashier && viewMode !== 'cashier') {
      setViewMode('cashier');
    }
  }, [isCashier]);
  
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

  // Data fetching functions
  const fetchProducts = async () => {
    try {
      const response = await api.get('/pos/products');
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      if (response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/pos/orders');
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    }
  };

  const loadOfflineData = () => {
    // Load data from localStorage if in offline mode
    const savedData = localStorage.getItem('pos_offline_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.products) setProducts(data.products);
        if (data.customers) setCustomers(data.customers);
        if (data.currentSale) setCurrentSale(data.currentSale);
      } catch (error) {
        console.error('Error parsing offline data:', error);
      }
    }
  };

  // Cart management
  const handleAddProduct = (product: AppProduct) => {
    if (!currentSale) {
      startSaleMutation.mutate();
      return;
    }
    
    if (product.stock_quantity <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is out of stock',
        variant: 'destructive',
      });
      return;
    }
    
    addItemMutation.mutate({
      productId: product._id,
      quantity: 1
    });
  };

  // Helper to toggle view mode safely
  const toggleViewMode = () => {
    if (viewMode === 'main') {
      setViewMode('cashier');
    } else {
      setViewMode('main');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (currentSale) {
      removeItemMutation.mutate(itemId);
    }
  };

  const handleUpdateQuantityInCart = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Find item and remove it
      const item = currentSale?.items.find(i => i.productId === productId);
      if (item && item._id) {
        handleRemoveItem(item._id);
      }
      return;
    }
    
    // Otherwise add/update the item
    if (currentSale) {
      updateQuantityMutation.mutate({
        productId,
        quantity: newQuantity
      });
    }
  };

  const handleDiscount = () => {
    setIsDiscountOpen(true);
  };

  const handlePayment = () => {
    setIsPaymentOpen(true);
  };

  // Filter products based on search
  const filteredProductsBasedOnQuery = products.filter(product => {
    const matchesSearch = searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesCategory = selectedCategory 
      ? product.category_id === selectedCategory
      : true;
      
    return matchesSearch && matchesCategory;
  });

  // Calculate total items in cart
  const calculateTotalItems = (): number => {
    if (!currentSale || !currentSale.items) return 0;
    return currentSale.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Mutations
  const startSaleMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/pos/sale/start', {
        counterId: 'default'
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentSale({
        _id: data.saleId,
        orderId: data.orderId,
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        status: 'draft',
        paymentStatus: 'pending',
        employeeId: user?.id || '',
        counterId: 'default'
      });
      
      toast({
        title: 'New Sale Started',
        description: 'Ready to add products',
      });
    },
    onError: (error) => {
      console.error('Error starting sale:', error);
      toast({
        title: 'Error',
        description: 'Could not start a new sale',
        variant: 'destructive',
      });
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: { productId: string, quantity: number }) => {
      if (!currentSale) throw new Error('No active sale');
      
      const response = await api.post(`/pos/sale/${currentSale._id}/items`, data);
      return response.data;
    },
    onSuccess: (updatedSale) => {
      setCurrentSale(updatedSale);
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Could not add item to cart',
        variant: 'destructive',
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!currentSale) throw new Error('No active sale');
      
      const response = await api.delete(`/pos/sale/${currentSale._id}/items/${itemId}`);
      return response.data;
    },
    onSuccess: (updatedSale) => {
      setCurrentSale(updatedSale);
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Could not remove item from cart',
        variant: 'destructive',
      });
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async (data: { productId: string, quantity: number }) => {
      if (!currentSale) throw new Error('No active sale');
      
      // This is a simplified approach - might need to be adjusted based on API
      const response = await api.post(`/pos/sale/${currentSale._id}/items`, data);
      return response.data;
    },
    onSuccess: (updatedSale) => {
      setCurrentSale(updatedSale);
    },
    onError: (error) => {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Could not update item quantity',
        variant: 'destructive',
      });
    }
  });

  return (
    <POSLayout>
      {/* @ts-ignore - String literal comparison */}
      {viewMode === 'main' ? (
        <POSMain />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {isCashier && (
            <div className="bg-muted py-2 px-4 mb-4 text-sm col-span-3 rounded-md flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              <span>You are in cashier mode. Only transaction processing features are available.</span>
            </div>
          )}
          {/* Left Side - Product Catalog */}
          <div className="md:col-span-2">
            <div className="flex flex-col h-full">
              {/* Search and Filters */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Placeholder for category items */}
                    <SelectItem value="cat1">Category 1</SelectItem>
                    <SelectItem value="cat2">Category 2</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Only show the view toggle for admin/managers */}
                {canAccessAdminFeatures && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toggleViewMode();
                    }}
                  >
                    {/* @ts-ignore - String literal comparison */}
                    {viewMode === 'main' ? 'Cashier View' : 'Dashboard View'}
                  </Button>
                )}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto flex-grow">
                {filteredProductsBasedOnQuery.map((product) => (
                  <Card
                    key={product._id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleAddProduct(product)}
                  >
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      <div className="w-full aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate w-full">{product.name}</h3>
                      <p className="text-sm text-green-600 font-semibold">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{product.stock_quantity} in stock</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Cart */}
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Cart</span>
                  <Badge variant="outline" className="ml-2">
                    {calculateTotalItems()} {calculateTotalItems() === 1 ? 'item' : 'items'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <div className="flex-grow overflow-auto">
                {currentSale && currentSale.items.length > 0 ? (
                  <div className="space-y-2 p-2">
                    {currentSale.items.map((item, index) => (
                      <Card key={`${item.productId}-${index}`} className="p-2">
                        <div className="flex justify-between">
                          <div className="flex-grow">
                            <div className="font-medium">{item.product?.name || 'Product'}</div>
                            <div className="text-sm text-gray-500">
                              ${item.unitPrice.toFixed(2)} x {item.quantity}
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div className="font-medium">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleUpdateQuantityInCart(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleUpdateQuantityInCart(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-red-500"
                                onClick={() => handleRemoveItem(item._id as string)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                    <ShoppingCart className="h-10 w-10 mb-2" />
                    <p className="text-sm text-center">Your cart is empty. Add products to begin.</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${currentSale?.subtotal.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${currentSale?.tax.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>${currentSale?.discount.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${currentSale?.total.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button variant="outline" onClick={handleDiscount}>
                    <Percent className="mr-2 h-4 w-4" />
                    Discount
                  </Button>
                  <Button variant="outline" onClick={() => startSaleMutation.mutate()}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!currentSale || currentSale.items.length === 0}
                  onClick={handlePayment}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pay ${currentSale?.total.toFixed(2) || '0.00'}
                </Button>
                
                {isCashier && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Contact your manager for any special discounts or price adjustments.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>
              Complete the transaction using any payment method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Payment dialog content would go here */}
            <div className="text-lg font-bold text-center">
              Total: ${currentSale?.total.toFixed(2) || '0.00'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Add a discount to the current sale
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Discount dialog content would go here */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
            <DialogDescription>
              Transaction completed successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Receipt content would go here */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Search Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Search and select a customer for this sale
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Customer search dialog content would go here */}
          </div>
        </DialogContent>
      </Dialog>
    </POSLayout>
  );
} 