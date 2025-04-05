import { useState, useEffect, Suspense } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../hooks/use-auth";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package2, 
  Warehouse, 
  ArrowLeftRight, 
  Clipboard, 
  Shield, 
  BarChart, 
  QrCode, 
  AlertTriangle, 
  Plus 
} from "lucide-react";
import { useSWRConfig } from "swr";
import useSWR from "swr";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "../../../lib/api";
import InventoryLayout from "@/components/layouts/inventory-layout";
import StockList from "@/components/inventory/StockList";
import WarehouseList from "@/components/inventory/WarehouseList";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton for dashboard
const DashboardSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[100px]" />
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Skeleton className="h-8 w-[60px]" />
          </div>
          <p className="text-xs text-muted-foreground">
            <Skeleton className="h-3 w-[120px] mt-2" />
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Loading skeleton for tables
const TableSkeleton = () => (
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

export default function InventoryPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  
  const [activeTab, setActiveTab] = useState("stock");
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"dashboard" | "cashier">("dashboard");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Check if user is a cashier
  const isCashier = user?.role === 'cashier';
  
  // Check if user can access admin features (admin, owner, manager)
  const canAccessAdminFeatures = ['admin', 'owner', 'manager'].includes(user?.role || '');
  
  // Fetch warehouses with SWR
  const { data: warehouses, error: warehousesError, isLoading: warehousesLoading } = useSWR(
    '/api/inventory/warehouses',
    fetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000 // Cache for 1 minute
    }
  );
  
  // Fetch stock with filters and pagination
  const { data: stockData, error: stockError, isLoading: stockLoading } = useSWR(
    `/api/inventory/stock?${
      warehouseFilter !== "all" ? `warehouseId=${warehouseFilter}&` : ""
    }${
      stockFilter === "low" ? "lowStock=true&" : ""
    }${
      searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : ""
    }page=${page}&limit=${pageSize}`,
    fetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000 // Cache for 1 minute
    }
  );
  
  // Extract stock items and pagination info
  const stockItems = stockData?.items || [];
  const totalStockItems = stockData?.total || 0;
  
  // Fetch reorder requests
  const { data: reorderRequests, error: reorderError, isLoading: reorderLoading } = useSWR(
    '/api/inventory/reorders',
    fetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000 // Cache for 1 minute
    }
  );
  
  // If user is cashier and tries to access admin view, force cashier view
  useEffect(() => {
    if (isCashier && viewMode === "dashboard") {
      setViewMode("cashier");
    }
  }, [isCashier, viewMode]);

  // Handle errors
  useEffect(() => {
    if (warehousesError) {
      toast({
        title: "Error loading warehouses",
        description: "There was a problem loading the warehouses data",
        variant: "destructive",
      });
    }
    
    if (stockError) {
      toast({
        title: "Error loading stock",
        description: "There was a problem loading the stock data",
        variant: "destructive",
      });
    }
    
    if (reorderError) {
      toast({
        title: "Error loading reorder requests",
        description: "There was a problem loading the reorder requests",
        variant: "destructive",
      });
    }
  }, [warehousesError, stockError, reorderError, toast]);

  // Handle refresh
  const handleRefresh = () => {
    mutate('/api/inventory/warehouses');
    mutate(`/api/inventory/stock?${
      warehouseFilter !== "all" ? `warehouseId=${warehouseFilter}&` : ""
    }${
      stockFilter === "low" ? "lowStock=true&" : ""
    }${
      searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : ""
    }page=${page}&limit=${pageSize}`);
    mutate('/api/inventory/reorders');
  };

  // Calculate dashboard metrics
  const totalWarehouses = Array.isArray(warehouses) ? warehouses.length : 0;
  const lowStockCount = Array.isArray(stockItems) ? stockItems.filter(
    (item: any) => item.quantity <= item.minimumStockLevel
  ).length : 0;
  const pendingReordersCount = Array.isArray(reorderRequests) ? reorderRequests.filter(
    (request: any) => request.status === 'pending'
  ).length : 0;
  const totalStockItemsCount = totalStockItems;

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  return (
    <InventoryLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
          {canAccessAdminFeatures && (
            <Button onClick={() => handleNavigate("/inventory/warehouses/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Warehouse
            </Button>
          )}
        </div>
        
        {/* Summary cards (only in dashboard view) */}
        {viewMode === "dashboard" && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Items</CardTitle>
                <Package2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStockItemsCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWarehouses}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockCount}</div>
                {lowStockCount > 0 && (
                  <Badge variant="destructive" className="mt-1">
                    Attention Required
                  </Badge>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold">Pending Reorders</CardTitle>
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReordersCount}</div>
                {pendingReordersCount > 0 && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => handleNavigate("/inventory/reorders")}
                  >
                    Review Requests
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Search and filters */}
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[300px]"
          />
          
          <Select
            value={warehouseFilter}
            onValueChange={(value) => setWarehouseFilter(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {Array.isArray(warehouses) && warehouses.map((warehouse: any) => (
                <SelectItem key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={stockFilter}
            onValueChange={(value) => setStockFilter(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
            </SelectContent>
          </Select>
          
          {!isCashier && (
            <div className="flex-grow flex justify-end">
              <Button 
                onClick={() => handleNavigate("/inventory/add-stock")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Stock
              </Button>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" /> Stock
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" /> Warehouses
            </TabsTrigger>
            {!isCashier && (
              <>
                <TabsTrigger value="movements" className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" /> Movements
                </TabsTrigger>
                <TabsTrigger value="audits" className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4" /> Audits
                </TabsTrigger>
                <TabsTrigger value="supply-chain" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Supply Chain
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" /> Reports
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="stock" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Inventory</CardTitle>
                <CardDescription>
                  View and manage your stock across all warehouses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <StockList 
                    stockItems={stockItems || []} 
                    isLoading={!stockItems && !stockError}
                    canEdit={!isCashier}
                    onRefresh={() => mutate('/api/inventory/stock')}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="warehouses" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Warehouses</CardTitle>
                <CardDescription>
                  Manage your storage locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <WarehouseList 
                    warehouses={warehouses || []} 
                    isLoading={!warehouses && !warehousesError}
                    canEdit={!isCashier}
                    onRefresh={() => mutate('/api/inventory/warehouses')}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          {!isCashier && (
            <>
              <TabsContent value="movements" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Movements</CardTitle>
                    <CardDescription>
                      Track transfers, adjustments, and purchases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Movements component will be implemented here</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="audits" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Audits</CardTitle>
                    <CardDescription>
                      Schedule and review inventory audits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Audits component will be implemented here</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="supply-chain" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Supply Chain Verification</CardTitle>
                    <CardDescription>
                      Verify ethical sourcing and supply chain transparency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Supply chain component will be implemented here</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reports" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Reports</CardTitle>
                    <CardDescription>
                      Analyze inventory performance and trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Reports component will be implemented here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </InventoryLayout>
  );
} 