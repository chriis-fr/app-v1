import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeftRight,
  Edit,
  MoreHorizontal,
  Trash,
  QrCode,
  Clipboard,
  RefreshCw,
  ArrowUpDown,
  Package,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    sku: string;
    barcode?: string;
    price: number;
  };
  warehouseId: {
    _id: string;
    name: string;
    code: string;
  };
  quantity: number;
  availableQuantity: number;
  minimumStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  location?: string;
  costPerUnit: number;
  totalValue: number;
  batchNumber?: string;
  expiryDate?: string;
  status: string;
}

interface StockListProps {
  stockItems: StockItem[];
  isLoading: boolean;
  canEdit: boolean;
  onRefresh: () => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export default function StockList({
  stockItems,
  isLoading,
  canEdit,
  onRefresh,
  pagination,
}: StockListProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof StockItem | 'productName' | 'warehouseName'>('productName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Format currency - memoized to avoid recalculation on every render
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  // Format date - memoized to avoid recalculation on every render
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Get status badge color - memoized to avoid recalculation on every render
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }, []);

  // Handle edit - memoized to avoid recreation on every render
  const handleEdit = useCallback((stockItem: StockItem) => {
    setLocation(`/app/inventory/edit-stock/${stockItem._id}`);
  }, [setLocation]);

  // Handle delete - memoized to avoid recreation on every render
  const handleDelete = useCallback(async (stockItem: StockItem) => {
    if (confirm(`Are you sure you want to delete this stock item?`)) {
      try {
        await axios.delete(`/api/inventory/stock/${stockItem._id}`);
        toast({
          title: "Stock item deleted",
          description: "The stock item has been removed successfully",
        });
        onRefresh();
      } catch (error: any) {
        toast({
          title: "Error deleting stock item",
          description: error.response?.data?.message || "There was an error deleting the stock item",
          variant: "destructive",
        });
      }
    }
  }, [onRefresh, toast]);

  // Handle view movements - memoized to avoid recreation on every render
  const handleViewMovements = useCallback((stockItem: StockItem) => {
    setLocation(`/app/inventory/stock/${stockItem._id}/movements`);
  }, [setLocation]);

  // Handle scan barcode - memoized to avoid recreation on every render
  const handleScanBarcode = useCallback((stockItem: StockItem) => {
    setLocation(`/app/inventory/barcode?productId=${stockItem.productId._id}`);
  }, [setLocation]);

  // Handle sort - memoized to avoid recreation on every render
  const handleSort = useCallback((field: keyof StockItem | 'productName' | 'warehouseName') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  // Sort stock items - memoized to avoid recalculation on every render
  const sortedStockItems = useMemo(() => {
    if (!stockItems || stockItems.length === 0) return [];
    
    return [...stockItems].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      if (sortField === 'productName') {
        aValue = a.productId?.name || '';
        bValue = b.productId?.name || '';
      } else if (sortField === 'warehouseName') {
        aValue = a.warehouseId?.name || '';
        bValue = b.warehouseId?.name || '';
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stockItems, sortField, sortDirection]);

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        <div className="border rounded-md">
          <div className="h-10 border-b flex items-center px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-[100px] mx-2" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b flex items-center px-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-4 w-[100px] mx-2" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!stockItems || stockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No stock items found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There are no stock items matching your criteria.
        </p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Stock Items</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setLocation('/app/inventory/add-stock')}>
              <Plus className="h-4 w-4 mr-1" />
              Add Stock
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center">
                  Product
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('warehouseName')}
              >
                <div className="flex items-center">
                  Warehouse
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center">
                  Quantity
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStockItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.productId?.name || 'Unknown Product'}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {item.productId?.sku || 'N/A'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.warehouseId?.name || 'Unknown Warehouse'}</div>
                    <div className="text-sm text-muted-foreground">
                      Code: {item.warehouseId?.code || 'N/A'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.quantity}</div>
                    <div className="text-sm text-muted-foreground">
                      Min: {item.minimumStockLevel}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(item.status)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewMovements(item)}>
                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                        View Movements
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleScanBarcode(item)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan Barcode
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 