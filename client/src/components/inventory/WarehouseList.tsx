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
  MoreHorizontal,
  Edit,
  Trash,
  RefreshCw,
  Package2,
  ArrowUpDown,
  Plus,
  MapPin,
  Phone,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Warehouse {
  _id: string;
  name: string;
  code: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity?: number;
  isActive: boolean;
  notes?: string;
}

interface WarehouseListProps {
  warehouses: Warehouse[];
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

export default function WarehouseList({
  warehouses,
  isLoading,
  canEdit,
  onRefresh,
  pagination,
}: WarehouseListProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof Warehouse>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle edit - memoized to avoid recreation on every render
  const handleEdit = useCallback((warehouse: Warehouse) => {
    setLocation(`/app/inventory/edit-warehouse/${warehouse._id}`);
  }, [setLocation]);

  // Handle delete - memoized to avoid recreation on every render
  const handleDelete = useCallback(async (warehouse: Warehouse) => {
    if (confirm(`Are you sure you want to delete ${warehouse.name}?`)) {
      try {
        await axios.delete(`/api/inventory/warehouses/${warehouse._id}`);
        toast({
          title: "Warehouse deleted",
          description: "The warehouse has been removed successfully",
        });
        onRefresh();
      } catch (error: any) {
        toast({
          title: "Error deleting warehouse",
          description: error.response?.data?.message || "There was an error deleting the warehouse",
          variant: "destructive",
        });
      }
    }
  }, [onRefresh, toast]);

  // Handle view stock - memoized to avoid recreation on every render
  const handleViewStock = useCallback((warehouse: Warehouse) => {
    setLocation(`/app/inventory/warehouse/${warehouse._id}/stock`);
  }, [setLocation]);

  // Handle sort - memoized to avoid recreation on every render
  const handleSort = useCallback((field: keyof Warehouse) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  // Sort warehouses - memoized to avoid recalculation on every render
  const sortedWarehouses = useMemo(() => {
    if (!warehouses || warehouses.length === 0) return [];
    
    return [...warehouses].sort((a, b) => {
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [warehouses, sortField, sortDirection]);

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
  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No warehouses found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There are no warehouses matching your criteria.
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
        <h2 className="text-lg font-medium">Warehouses</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setLocation('/app/inventory/add-warehouse')}>
              <Plus className="h-4 w-4 mr-1" />
              Add Warehouse
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
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center">
                  Code
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('isActive')}
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
            {sortedWarehouses.map((warehouse) => (
              <TableRow key={warehouse._id}>
                <TableCell>
                  <div className="font-medium">{warehouse.name}</div>
                </TableCell>
                <TableCell>{warehouse.code}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {warehouse.contactPerson && (
                      <div className="flex items-center text-sm">
                        <Package className="mr-2 h-3 w-3 text-muted-foreground" />
                        {warehouse.contactPerson}
                      </div>
                    )}
                    {warehouse.contactPhone && (
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        {warehouse.contactPhone}
                      </div>
                    )}
                    {warehouse.address && (
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                        {warehouse.address}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {warehouse.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactive</Badge>
                  )}
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
                      <DropdownMenuItem onClick={() => handleViewStock(warehouse)}>
                        <Package2 className="mr-2 h-4 w-4" />
                        View Stock
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(warehouse)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(warehouse)}>
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