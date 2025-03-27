import { useState } from 'react';
import { staticData } from '@/data/static';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Plus, ShoppingCart } from 'lucide-react';

// Define proper types for orders and inventory data
type Order = {
  id: string;
  posId: string;
  customerId: string;
  totalAmount: number;
  status: string;
  items: { id: string; orderId: string; productId: string; quantity: number; price: number; }[];
  createdAt: string;
  paymentMethod: string;
  tax: number;
  discount: number;
  netAmount: number;
};

type InventoryItem = {
  id: string;
  posId: string;
  productId: string;
  stockLevel: number;
  reorderPoint: number;
  optimalStock: number;
  updatedAt: string;
  location: string;
  value: number;
};

export default function POSMain() {
  const [activeView, setActiveView] = useState<'orders' | 'inventory'>('orders');
  const orders = staticData.pos.orders as Order[];
  const inventory = staticData.pos.inventory as InventoryItem[];

  const orderColumns = [
    { accessorKey: 'id', header: 'Order ID' },
    { accessorKey: 'customerId', header: 'Customer' },
    { accessorKey: 'totalAmount', header: 'Amount',
      cell: ({ row }: { row: any }) => `$${row.original.totalAmount.toFixed(2)}` 
    },
    { accessorKey: 'status', header: 'Status' },
  ];

  const inventoryColumns = [
    { accessorKey: 'productId', header: 'Product ID' },
    { accessorKey: 'stockLevel', header: 'Stock Level' },
    { accessorKey: 'updatedAt', header: 'Last Updated',
      cell: ({ row }: { row: any }) => new Date(row.original.updatedAt).toLocaleDateString()
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Point of Sale</h1>
          <p className="text-gray-500">Manage your sales and inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={activeView} onValueChange={(value: 'orders' | 'inventory') => setActiveView(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {activeView === 'orders' ? 'New Order' : 'Add Product'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((acc, order) => acc + order.totalAmount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order.status === 'Pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.stockLevel < 10).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeView === 'orders' ? 'Recent Orders' : 'Inventory Status'}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeView === 'orders' ? (
            <DataTable 
              columns={orderColumns}
              data={orders}
            />
          ) : (
            <DataTable 
              columns={inventoryColumns}
              data={inventory}
            />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
