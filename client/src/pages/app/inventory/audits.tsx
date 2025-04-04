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
  FileText,
  Package2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Eye
} from "lucide-react";
import InventoryLayout from "@/components/layouts/inventory-layout";
import AccessRestricted from "@/components/pos/AccessRestricted";

// Mock data for audits
const mockAudits = [
  {
    id: 1,
    reference: "AUD-2024-001",
    type: "Physical Count",
    warehouse: "Main Warehouse",
    auditor: "John Smith",
    date: "2024-03-15",
    itemsCount: 150,
    discrepancies: 3,
    status: "Completed"
  },
  {
    id: 2,
    reference: "AUD-2024-002",
    type: "Cycle Count",
    warehouse: "North Distribution Center",
    auditor: "Jane Doe",
    date: "2024-03-14",
    itemsCount: 75,
    discrepancies: 0,
    status: "Completed"
  },
  {
    id: 3,
    reference: "AUD-2024-003",
    type: "Quality Inspection",
    warehouse: "South Storage Facility",
    auditor: "Mike Johnson",
    date: "2024-03-14",
    itemsCount: 50,
    discrepancies: 2,
    status: "In Progress"
  },
  {
    id: 4,
    reference: "AUD-2024-004",
    type: "Security Audit",
    warehouse: "Main Warehouse",
    auditor: "Sarah Williams",
    date: "2024-03-13",
    itemsCount: 200,
    discrepancies: 1,
    status: "Failed"
  }
];

export default function InventoryAudits() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Check if user has permission to manage audits
  const hasPermission = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };
  
  // Handle new audit
  const handleNewAudit = () => {
    handleNavigate("/inventory/audits/new");
  };
  
  // Handle view report
  const handleViewReport = (id: number) => {
    handleNavigate(`/inventory/audits/${id}/report`);
  };
  
  // Handle download report
  const handleDownloadReport = (id: number) => {
    toast({
      title: "Downloading Report",
      description: `Downloading report for audit ${id}...`,
    });
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
        return <AlertCircle className="h-4 w-4" />;
      case "Failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  // Filter audits based on search term and filters
  const filteredAudits = mockAudits.filter(audit => {
    const matchesSearch = 
      audit.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || audit.status === statusFilter;
    const matchesType = typeFilter === "all" || audit.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  if (!hasPermission) {
    return (
      <InventoryLayout>
        <AccessRestricted 
          title="Access Restricted" 
          description="Only managers and administrators can manage audits."
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory Audits</h1>
          <Button onClick={handleNewAudit}>
            <Plus className="mr-2 h-4 w-4" />
            New Audit
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audits..."
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
              <FileText className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Physical Count">Physical Count</SelectItem>
              <SelectItem value="Cycle Count">Cycle Count</SelectItem>
              <SelectItem value="Quality Inspection">Quality Inspection</SelectItem>
              <SelectItem value="Security Audit">Security Audit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Audit List</CardTitle>
            <CardDescription>
              Monitor and manage your inventory audits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Discrepancies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        {audit.reference}
                      </div>
                    </TableCell>
                    <TableCell>{audit.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        {audit.warehouse}
                      </div>
                    </TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {audit.date}
                      </div>
                    </TableCell>
                    <TableCell>{audit.itemsCount}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        audit.discrepancies === 0 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {audit.discrepancies}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${getStatusColor(audit.status)}`}>
                        {getStatusIcon(audit.status)}
                        <span className="ml-2">{audit.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewReport(audit.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadReport(audit.id)}
                        >
                          <Download className="h-4 w-4" />
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