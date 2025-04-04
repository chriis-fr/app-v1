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
}

export default function WarehouseList({
  warehouses,
  isLoading,
  canEdit,
  onRefresh,
}: WarehouseListProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof Warehouse>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle edit
  const handleEdit = (warehouse: Warehouse) => {
    setLocation(`/app/inventory/edit-warehouse/${warehouse._id}`);
  };

  // Handle delete
  const handleDelete = async (warehouse: Warehouse) => {
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
  };

  // Handle view stock
  const handleViewStock = (warehouse: Warehouse) => {
    setLocation(`/app/inventory/warehouse/${warehouse._id}/stock`);
  };

  // Handle sort
  const handleSort = (field: keyof Warehouse) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort warehouses
  const sortedWarehouses = [...warehouses].sort((a, b) => {
    if (sortField === 'name' || sortField === 'code') {
      const valueA = (a[sortField] || '').toLowerCase();
      const valueB = (b[sortField] || '').toLowerCase();
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } else if (sortField === 'capacity') {
      const valueA = a[sortField] || 0;
      const valueB = b[sortField] || 0;
      return sortDirection === 'asc'
        ? valueA - valueB
        : valueB - valueA;
    } else {
      return 0;
    }
  });

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
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
  if (warehouses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Package className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No warehouses found</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-md">
          You haven't added any warehouses yet or no warehouses match your search criteria.
        </p>
        <Button onClick={() => setLocation("/app/inventory/add-warehouse")}>
          Add Warehouse
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
        
        {canEdit && (
          <Button onClick={() => setLocation("/app/inventory/add-warehouse")} className="gap-1">
            <Plus className="h-4 w-4" /> Add Warehouse
          </Button>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer w-[200px]" onClick={() => handleSort('name')}>
              <div className="flex items-center gap-1">
                Name
                {sortField === 'name' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('code')}>
              <div className="flex items-center gap-1">
                Code
                {sortField === 'code' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('capacity')}>
              <div className="flex items-center justify-end gap-1">
                Capacity
                {sortField === 'capacity' && (
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedWarehouses.map((warehouse) => (
            <TableRow key={warehouse._id}>
              <TableCell className="font-medium">
                {warehouse.name}
              </TableCell>
              <TableCell>{warehouse.code}</TableCell>
              <TableCell>
                {warehouse.address ? (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">
                      {warehouse.address}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No address</span>
                )}
              </TableCell>
              <TableCell>
                {warehouse.contactPerson ? (
                  <div>
                    <div className="text-sm">{warehouse.contactPerson}</div>
                    {warehouse.contactPhone && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {warehouse.contactPhone}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No contact</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {warehouse.capacity ? (
                  `${warehouse.capacity.toLocaleString()} units`
                ) : (
                  <span className="text-muted-foreground">Unspecified</span>
                )}
              </TableCell>
              <TableCell>
                {warehouse.isActive !== false ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    Inactive
                  </Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(warehouse)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(warehouse)}
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