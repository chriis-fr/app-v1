import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search,
  ShoppingCart,
  CreditCard,
  Wallet,
  Bitcoin,
  DollarSign,
  Receipt,
  Printer,
  Share2,
  X,
  Plus,
  Minus,
  Trash2,
  User,
  Package,
  Tag,
  Percent,
  Clock,
  AlertCircle,
  Barcode,
  QrCode,
  Gift,
  History,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List
} from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  barcode?: string;
  sku: string;
  cost: number;
  taxRate: number;
  discount?: number;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
  discount?: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints?: number;
  membershipLevel?: 'basic' | 'silver' | 'gold' | 'platinum';
  discount?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  type: 'cash' | 'card' | 'crypto' | 'mobile';
  processingFee?: number;
}

interface Sale {
  id: string;
  items: CartItem[];
  customer?: Customer;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', icon: DollarSign, type: 'cash' },
  { id: 'card', name: 'Card', icon: CreditCard, type: 'card', processingFee: 0.02 },
  { id: 'crypto', name: 'Crypto', icon: Bitcoin, type: 'crypto', processingFee: 0.01 },
  { id: 'mobile', name: 'Mobile Pay', icon: Wallet, type: 'mobile', processingFee: 0.015 },
];

export default function POSPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const response = await api.get('/pos/products');
      return response.data;
    }
  });

  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers, error: customersError } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: async () => {
      const response = await api.get('/pos/customers');
      return response.data;
    }
  });

  // Fetch recent sales
  const { data: recentSales = [], isLoading: isLoadingSales, error: salesError } = useQuery({
    queryKey: ['pos-recent-sales'],
    queryFn: async () => {
      const response = await api.get('/pos/recent-sales');
      return response.data;
    }
  });

  // Fetch categories
  const categories = ['all', ...Array.from(new Set(products.map((p: Product) => p.category)))] as string[];

  // Filter products by category and search
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (sale: Sale) => {
      const response = await api.post('/pos/sales', sale);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-recent-sales'] });
      toast({
        title: 'Success',
        description: 'Sale completed successfully'
      });
      setCart([]);
      setShowPaymentModal(false);
      setSelectedCustomer(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to process sale',
        variant: 'destructive'
      });
    }
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = cart.reduce((sum, item) => sum + (item.subtotal * item.taxRate), 0);
  const customerDiscount = selectedCustomer?.discount || 0;
  const discountAmount = subtotal * customerDiscount;
  const total = subtotal + tax - discountAmount;

  // Cart operations
  const addToCart = (product: Product): void => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                subtotal: (item.quantity + 1) * item.price * (1 - (item.discount || 0))
              }
            : item
        );
      }
      return [...prevCart, { 
        ...product, 
        quantity: 1, 
        subtotal: product.price * (1 - (product.discount || 0))
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart =>
      prevCart.map((item: CartItem) => {
        if (item.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price * (1 - (item.discount || 0))
          };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Payment processing
  const handlePayment = async (method: PaymentMethod) => {
    setIsProcessing(true);
    try {
      const sale: Sale = {
        id: Date.now().toString(),
        items: cart,
        customer: selectedCustomer || undefined,
        paymentMethod: method,
        subtotal,
        tax,
        discount: discountAmount,
        total,
        timestamp: new Date(),
        status: 'completed'
      };

      await createSaleMutation.mutateAsync(sale);
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle errors
  useEffect(() => {
    if (productsError || customersError || salesError) {
      toast({
        title: 'Error',
        description: 'Failed to load POS data',
        variant: 'destructive'
      });
    }
  }, [productsError, customersError, salesError, toast]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Products */}
      <div className="w-2/3 p-4 flex flex-col">
        {/* Search and Filters */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => setShowBarcodeScanner(true)}>
            <Barcode className="h-4 w-4" />
          </Button>
        </div>

        {/* Products Grid/List */}
        <ScrollArea className="flex-1 bg-white rounded-lg shadow">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : productsError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <AlertCircle className="h-8 w-8 mr-2" />
              Failed to load products
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No products found
            </div>
          ) : (
            <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}`}>
              {filteredProducts.map((product: Product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex items-center' : ''
                  }`}
                  onClick={() => addToCart(product)}
                >
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`${
                          viewMode === 'list' ? 'w-16 h-16' : 'w-full h-32'
                        } object-cover rounded-md`}
                      />
                    ) : (
                      <div
                        className={`${
                          viewMode === 'list' ? 'w-16 h-16' : 'w-full h-32'
                        } bg-gray-200 rounded-md flex items-center justify-center`}
                      >
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className={viewMode === 'list' ? 'flex-1' : 'mt-2'}>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                          {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-1/3 bg-white border-l flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Current Sale</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomerModal(true)}
              className="text-sm"
            >
              {selectedCustomer ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {selectedCustomer.name}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Customer
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add products to start a sale</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                    {item.discount && (
                      <p className="text-sm text-green-600">
                        -${(item.price * item.quantity * item.discount).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart Summary */}
        <div className="border-t p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCart([]);
                setSelectedCustomer(null);
              }}
              disabled={cart.length === 0}
            >
              Clear
            </Button>
            <Button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Pay Now
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {paymentMethods.map((method) => (
              <Button
                key={method.id}
                variant={selectedPaymentMethod?.id === method.id ? 'default' : 'outline'}
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setSelectedPaymentMethod(method)}
              >
                <method.icon className="h-8 w-8" />
                <span>{method.name}</span>
                {method.processingFee && (
                  <span className="text-xs text-gray-500">
                    {method.processingFee * 100}% fee
                  </span>
                )}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedPaymentMethod && handlePayment(selectedPaymentMethod)}
              disabled={!selectedPaymentMethod || isProcessing}
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Modal */}
      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingCustomers ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : customersError ? (
              <div className="flex items-center justify-center h-32 text-red-500">
                <AlertCircle className="h-8 w-8 mr-2" />
                Failed to load customers
              </div>
            ) : customers.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No customers found
              </div>
            ) : (
              <div className="space-y-2">
                {customers.map((customer: Customer) => (
                  <Button
                    key={customer.id}
                    variant={selectedCustomer?.id === customer.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerModal(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomerModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCustomer(null);
                setShowCustomerModal(false);
              }}
            >
              Clear Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 