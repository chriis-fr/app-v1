import { useState } from "react";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

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
}

export default function StockList({
  stockItems,
  isLoading,
  canEdit,
  onRefresh,
}: StockListProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof StockItem | 'productName' | 'warehouseName'>('productName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
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
  };

  // Handle transfer
  const handleTransfer = (stockItem: StockItem) => {
    setLocation(`/app/inventory/transfer?productId=${stockItem.productId._id}&warehouseId=${stockItem.warehouseId._id}`);
  };

  // Handle edit
  const handleEdit = (stockItem: StockItem) => {
    setLocation(`/app/inventory/edit-stock/${stockItem._id}`);
  };

  // Handle delete
  const handleDelete = async (stockItem: StockItem) => {
    if (confirm(`Are you sure you want to delete ${stockItem.productId.name} from ${stockItem.warehouseId.name}?`)) {
      try {
        await axios.delete(`/api/inventory/stock/${stockItem._id}`);
        toast({
          title: "Stock deleted",
          description: "The stock item has been removed successfully",
        });
        onRefresh();
      } catch (error) {
        toast({
          title: "Error deleting stock",
          description: "There was an error deleting the stock item",
          variant: "destructive",
        });
      }
    }
  };

  // Handle barcode view
  const handleViewBarcode = (stockItem: StockItem) => {
    setLocation(`/app/inventory/barcode/${stockItem.productId._id}`);
  };

  // Handle create reorder request
  const handleCreateReorder = async (stockItem: StockItem) => {
    try {
      await axios.post('/api/inventory/reorders', {
        productId: stockItem.productId._id,
        warehouseId: stockItem.warehouseId._id,
        requestedQuantity: stockItem.reorderQuantity,
        currentStockLevel: stockItem.quantity,
        reorderPoint: stockItem.reorderPoint,
      });
      
      toast({
        title: "Reorder request created",
        description: `A reorder request for ${stockItem.productId.name} has been created`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error creating reorder request",
        description: "There was an error creating the reorder request",
        variant: "destructive",
      });
    }
  };

  // Handle sort
  const handleSort = (field: keyof StockItem | 'productName' | 'warehouseName') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort stock items
  const sortedStockItems = [...stockItems].sort((a, b) => {
    if (sortField === 'productName') {
      const nameA = a.productId?.name?.toLowerCase() || '';
      const nameB = b.productId?.name?.toLowerCase() || '';
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortField === 'warehouseName') {
      const nameA = a.warehouseId?.name?.toLowerCase() || '';
      const nameB = b.warehouseId?.name?.toLowerCase() || '';
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortField === 'quantity' || sortField === 'costPerUnit' || sortField === 'totalValue') {
      return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    } else {
      return 0;
    }
  });

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render empty state
  if (stockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Package className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No stock items found</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-md">
          You haven't added any stock items yet or no items match your search criteria.
        </p>
        <Button onClick={() => setLocation("/app/inventory/add-stock")}>
          Add Stock Item
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer w-[200px]" onClick={() => handleSort('productName')}>
              <div className="flex items-center gap-1">
                Product
                {sortField === 'productName' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('warehouseName')}>
              <div className="flex items-center gap-1">
                Warehouse
                {sortField === 'warehouseName' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('quantity')}>
              <div className="flex items-center justify-end gap-1">
                Quantity
                {sortField === 'quantity' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('costPerUnit')}>
              <div className="flex items-center justify-end gap-1">
                Cost/Unit
                {sortField === 'costPerUnit' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('totalValue')}>
              <div className="flex items-center justify-end gap-1">
                Total Value
                {sortField === 'totalValue' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStockItems.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">
                <div>
                  {item.productId?.name || 'Unknown Product'}
                  <div className="text-xs text-muted-foreground">
                    SKU: {item.productId?.sku || 'N/A'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  {item.warehouseId?.name || 'Unknown Warehouse'}
                  <div className="text-xs text-muted-foreground">
                    {item.location || 'No location specified'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  {item.quantity}
                  {item.quantity <= item.reorderPoint && (
                    <div className="text-xs text-red-500">
                      Reorder at: {item.reorderPoint}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.costPerUnit)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.totalValue)}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                    {canEdit && (
                      <>
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTransfer(item)}>
                          <ArrowLeftRight className="mr-2 h-4 w-4" />
                          Transfer
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => handleViewBarcode(item)}>
                      <QrCode className="mr-2 h-4 w-4" />
                      View Barcode
                    </DropdownMenuItem>
                    {canEdit && (
                      <>
                        <DropdownMenuSeparator />
                        {item.quantity <= item.reorderPoint && (
                          <DropdownMenuItem onClick={() => handleCreateReorder(item)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Create Reorder
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item)}
                          className="text-red-600"
                        >
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
    </div>
  );
} 