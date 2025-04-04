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
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users,
  Package2,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import InventoryLayout from "@/components/layouts/inventory-layout";
import AccessRestricted from "@/components/pos/AccessRestricted";

// Mock data for warehouses
const mockWarehouses = [
  {
    id: 1,
    name: "Main Warehouse",
    location: "123 Main St, City",
    capacity: "10,000 sq ft",
    utilization: "78%",
    manager: "John Doe",
    contact: "+1 234-567-8900",
    email: "main@warehouse.com",
    items: 1250,
    status: "Active"
  },
  {
    id: 2,
    name: "North Distribution Center",
    location: "456 North Ave, Town",
    capacity: "8,000 sq ft",
    utilization: "65%",
    manager: "Jane Smith",
    contact: "+1 234-567-8901",
    email: "north@warehouse.com",
    items: 850,
    status: "Active"
  },
  {
    id: 3,
    name: "South Storage Facility",
    location: "789 South Rd, Village",
    capacity: "5,000 sq ft",
    utilization: "45%",
    manager: "Mike Johnson",
    contact: "+1 234-567-8902",
    email: "south@warehouse.com",
    items: 420,
    status: "Maintenance"
  }
];

export default function InventoryWarehouses() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Check if user has permission to manage warehouses
  const hasPermission = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };
  
  // Handle add warehouse
  const handleAddWarehouse = () => {
    handleNavigate("/inventory/warehouses/new");
  };
  
  // Handle edit warehouse
  const handleEditWarehouse = (id: number) => {
    handleNavigate(`/inventory/warehouses/${id}/edit`);
  };
  
  // Handle delete warehouse
  const handleDeleteWarehouse = (id: number) => {
    toast({
      title: "Delete Warehouse",
      description: `Are you sure you want to delete warehouse ${id}?`,
    });
  };
  
  // Filter warehouses based on search term
  const filteredWarehouses = mockWarehouses.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!hasPermission) {
    return (
      <InventoryLayout>
        <AccessRestricted 
          title="Access Restricted" 
          description="Only managers and administrators can manage warehouses."
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
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <Button onClick={handleAddWarehouse}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Warehouse List</CardTitle>
            <CardDescription>
              Manage your inventory locations and storage facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {warehouse.location}
                      </div>
                    </TableCell>
                    <TableCell>{warehouse.capacity}</TableCell>
                    <TableCell>{warehouse.utilization}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {warehouse.manager}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        {warehouse.contact}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        {warehouse.items}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        warehouse.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {warehouse.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditWarehouse(warehouse.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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