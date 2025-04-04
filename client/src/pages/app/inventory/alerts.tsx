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
  Bell,
  Package2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  FileText,
  Settings
} from "lucide-react";
import InventoryLayout from "@/components/layouts/inventory-layout";
import AccessRestricted from "@/components/pos/AccessRestricted";

// Mock data for alerts
const mockAlerts = [
  {
    id: 1,
    type: "Low Stock",
    item: "Product A",
    warehouse: "Main Warehouse",
    threshold: 10,
    current: 5,
    date: "2024-03-15",
    status: "Active",
    priority: "High"
  },
  {
    id: 2,
    type: "Expiring Soon",
    item: "Product B",
    warehouse: "North Distribution Center",
    threshold: "30 days",
    current: "15 days",
    date: "2024-03-14",
    status: "Active",
    priority: "Medium"
  },
  {
    id: 3,
    type: "Overstock",
    item: "Product C",
    warehouse: "South Storage Facility",
    threshold: 100,
    current: 150,
    date: "2024-03-14",
    status: "Resolved",
    priority: "Low"
  },
  {
    id: 4,
    type: "Quality Issue",
    item: "Product D",
    warehouse: "Main Warehouse",
    threshold: "0%",
    current: "2%",
    date: "2024-03-13",
    status: "Active",
    priority: "High"
  }
];

export default function InventoryAlerts() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Check if user has permission to manage alerts
  const hasPermission = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };
  
  // Handle new alert
  const handleNewAlert = () => {
    handleNavigate("/inventory/alerts/new");
  };
  
  // Handle alert settings
  const handleAlertSettings = () => {
    handleNavigate("/inventory/alerts/settings");
  };
  
  // Handle resolve alert
  const handleResolveAlert = (id: number) => {
    toast({
      title: "Resolving Alert",
      description: `Resolving alert ${id}...`,
    });
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-red-600";
      case "Resolved":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <AlertCircle className="h-4 w-4" />;
      case "Resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  // Filter alerts based on search term and filters
  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = 
      alert.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || alert.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });
  
  if (!hasPermission) {
    return (
      <InventoryLayout>
        <AccessRestricted 
          title="Access Restricted" 
          description="Only managers and administrators can manage alerts."
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory Alerts</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAlertSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Alert Settings
            </Button>
            <Button onClick={handleNewAlert}>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
              <SelectItem value="Overstock">Overstock</SelectItem>
              <SelectItem value="Quality Issue">Quality Issue</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <Bell className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Alert List</CardTitle>
            <CardDescription>
              Monitor and manage your inventory alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                        {alert.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        {alert.item}
                      </div>
                    </TableCell>
                    <TableCell>{alert.warehouse}</TableCell>
                    <TableCell>{alert.threshold}</TableCell>
                    <TableCell>{alert.current}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {alert.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        alert.priority === 'High' 
                          ? 'bg-red-100 text-red-800'
                          : alert.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {alert.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${getStatusColor(alert.status)}`}>
                        {getStatusIcon(alert.status)}
                        <span className="ml-2">{alert.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
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