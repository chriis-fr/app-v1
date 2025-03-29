import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { useAuth } from '@/hooks/use-auth';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2,
  CreditCard,
  Receipt,
  ArrowLeft
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy products data
  const products = [
    { id: '1', name: 'Product A', price: 10.99 },
    { id: '2', name: 'Product B', price: 15.99 },
    { id: '3', name: 'Product C', price: 20.99 },
    { id: '4', name: 'Product D', price: 25.99 },
  ];

  const addToCart = (product: typeof products[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.id === itemId);
      if (!item) return prevCart;
      
      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== itemId);
      }
      
      return prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="flex min-h-screen">
      {isAdmin && <CompactSidebar />}
      <div className={`flex-1 ${isAdmin ? 'ml-20' : ''}`}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(isAdmin ? '/dashboard' : '/pos')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Point of Sale</h1>
              <p className="text-sm text-gray-500">Process sales and transactions</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Products Section */}
            <div className="col-span-2">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {products.map(product => (
                  <Card
                    key={product.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2" />
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="col-span-1">
              <Card className="h-full">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                </div>
                <div className="p-4 space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <p className="text-center text-gray-500">Cart is empty</p>
                  )}
                </div>
                <div className="p-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Receipt className="h-4 w-4 mr-2" />
                      Cash
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 