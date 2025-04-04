import { useState } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../hooks/use-auth";
import { 
  Search, 
  Plus, 
  Truck,
  Package2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  FileText,
  Download,
  Phone,
  Mail,
  Building2,
  DollarSign
} from "lucide-react";
import InventoryLayout from "@/components/layouts/inventory-layout";
import AccessRestricted from "@/components/pos/AccessRestricted";

// Mock data for suppliers
const mockSuppliers = [
  {
    id: 1,
    name: "ABC Supplies",
    contact: "John Smith",
    phone: "+1 234-567-8900",
    email: "john@abcsupplies.com",
    address: "123 Supplier St, City",
    items: 25,
    orders: 12,
    status: "Active",
    rating: 4.5
  },
  {
    id: 2,
    name: "XYZ Distributors",
    contact: "Jane Doe",
    phone: "+1 234-567-8901",
    email: "jane@xyzdist.com",
    address: "456 Distributor Ave, Town",
    items: 18,
    orders: 8,
    status: "Active",
    rating: 4.2
  },
  {
    id: 3,
    name: "Global Logistics",
    contact: "Mike Wilson",
    phone: "+1 234-567-8902",
    email: "mike@globallog.com",
    address: "789 Logistics Rd, Village",
    items: 15,
    orders: 5,
    status: "Inactive",
    rating: 3.8
  }
];

// Mock data for orders
const mockOrders = [
  {
    id: 1,
    supplier: "ABC Supplies",
    items: 5,
    total: 2500,
    date: "2024-03-15",
    status: "Completed",
    reference: "PO-2024-001"
  },
  {
    id: 2,
    supplier: "XYZ Distributors",
    items: 3,
    total: 1800,
    date: "2024-03-14",
    status: "In Progress",
    reference: "PO-2024-002"
  },
  {
    id: 3,
    supplier: "Global Logistics",
    items: 4,
    total: 3200,
    date: "2024-03-13",
    status: "Failed",
    reference: "PO-2024-003"
  }
];

export default function InventorySupplyChain() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("suppliers");
  
  // Check if user has permission to manage supply chain
  const hasPermission = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };
  
  // Handle new supplier
  const handleNewSupplier = () => {
    handleNavigate("/inventory/supply-chain/suppliers/new");
  };
  
  // Handle new order
  const handleNewOrder = () => {
    handleNavigate("/inventory/supply-chain/orders/new");
  };
  
  // Handle view supplier details
  const handleViewSupplier = (id: number) => {
    handleNavigate(`/inventory/supply-chain/suppliers/${id}`);
  };
  
  // Handle view order details
  const handleViewOrder = (id: number) => {
    handleNavigate(`/inventory/supply-chain/orders/${id}`);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Completed":
        return "text-green-600";
      case "In Progress":
        return "text-yellow-600";
      case "Inactive":
      case "Failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
      case "Completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "In Progress":
        return <Clock className="h-4 w-4" />;
      case "Inactive":
      case "Failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  // Filter suppliers based on search term
  const filteredSuppliers = mockSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter orders based on search term
  const filteredOrders = mockOrders.filter(order => 
    order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!hasPermission) {
    return (
      <InventoryLayout>
        <AccessRestricted 
          title="Access Restricted" 
          description="Only managers and administrators can manage the supply chain."
          redirectPath="/inventory"
          redirectLabel="Return to Dashboard"
        />
      </InventoryLayout>
      );
  }
  
  return (
    <InventoryLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Supply Chain</h1>
          <Button onClick={activeTab === "suppliers" ? handleNewSupplier : handleNewOrder}>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "suppliers" ? "New Supplier" : "New Order"}
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[180px]">
              <Truck className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="suppliers">Suppliers</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {activeTab === "suppliers" ? (
          <Card>
            <CardHeader>
              <CardTitle>Supplier List</CardTitle>
              <CardDescription>
                Manage your supplier relationships and contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          {supplier.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          {supplier.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          {supplier.items}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.orders}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {supplier.rating.toFixed(1)}
                          <span className="text-yellow-500 ml-1">★</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center ${getStatusColor(supplier.status)}`}>
                          {getStatusIcon(supplier.status)}
                          <span className="ml-2">{supplier.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewSupplier(supplier.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Track and manage your purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.reference}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          {order.items}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                          {order.total.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {order.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{order.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </InventoryLayout>
  );
} 