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
  ArrowLeftRight,
  Package2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter
} from "lucide-react";
import InventoryLayout from "@/components/layouts/inventory-layout";
import AccessRestricted from "@/components/pos/AccessRestricted";

// Mock data for movements
const mockMovements = [
  {
    id: 1,
    type: "Transfer",
    item: "Product A",
    quantity: 50,
    fromWarehouse: "Main Warehouse",
    toWarehouse: "North Distribution Center",
    date: "2024-03-15",
    time: "10:30 AM",
    status: "Completed",
    reference: "TRF-2024-001"
  },
  {
    id: 2,
    type: "Receipt",
    item: "Product B",
    quantity: 100,
    fromWarehouse: "Supplier",
    toWarehouse: "Main Warehouse",
    date: "2024-03-14",
    time: "02:15 PM",
    status: "Completed",
    reference: "REC-2024-002"
  },
  {
    id: 3,
    type: "Transfer",
    item: "Product C",
    quantity: 25,
    fromWarehouse: "South Storage Facility",
    toWarehouse: "Main Warehouse",
    date: "2024-03-14",
    time: "11:45 AM",
    status: "In Progress",
    reference: "TRF-2024-003"
  },
  {
    id: 4,
    type: "Issue",
    item: "Product D",
    quantity: 30,
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Customer",
    date: "2024-03-13",
    time: "09:20 AM",
    status: "Failed",
    reference: "ISS-2024-004"
  }
];

export default function InventoryMovements() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Check if user has permission to view movements
  const hasPermission = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };
  
  // Handle new movement
  const handleNewMovement = () => {
    handleNavigate("/inventory/movements/new");
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "In Progress":
        return "text-yellow-600";
      case "Failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "In Progress":
        return <Clock className="h-4 w-4" />;
      case "Failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  // Filter movements based on search term and filters
  const filteredMovements = mockMovements.filter(movement => {
    const matchesSearch = 
      movement.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.fromWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.toWarehouse.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || movement.status === statusFilter;
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  if (!hasPermission) {
    return (
      <InventoryLayout>
        <AccessRestricted 
          title="Access Restricted" 
          description="Only managers and administrators can view inventory movements."
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory Movements</h1>
          <Button onClick={handleNewMovement}>
            <Plus className="mr-2 h-4 w-4" />
            New Movement
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="Receipt">Receipt</SelectItem>
              <SelectItem value="Issue">Issue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Movement History</CardTitle>
            <CardDescription>
              Track and manage inventory movements between warehouses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">{movement.reference}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ArrowLeftRight className="mr-2 h-4 w-4 text-muted-foreground" />
                        {movement.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        {movement.item}
                      </div>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.fromWarehouse}</TableCell>
                    <TableCell>{movement.toWarehouse}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {movement.date}
                      </div>
                    </TableCell>
                    <TableCell>{movement.time}</TableCell>
                    <TableCell>
                      <div className={`flex items-center ${getStatusColor(movement.status)}`}>
                        {getStatusIcon(movement.status)}
                        <span className="ml-2">{movement.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </InventoryLayout>
  );
} 