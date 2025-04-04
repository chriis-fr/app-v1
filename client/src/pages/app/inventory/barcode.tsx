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
  Barcode,
  Package2,
  Calendar,
  Printer,
  Download,
  Scan,
  QrCode,
  FileText,
  Filter
} from "lucide-react";
import InventoryLayout from "@/components/layouts/inventory-layout";
import AccessRestricted from "@/components/pos/AccessRestricted";

// Mock data for barcodes
const mockBarcodes = [
  {
    id: 1,
    code: "BAR-001-2024",
    item: "Product A",
    type: "EAN-13",
    format: "Barcode",
    created: "2024-03-15",
    status: "Active",
    prints: 5
  },
  {
    id: 2,
    code: "BAR-002-2024",
    item: "Product B",
    type: "Code 128",
    format: "Barcode",
    created: "2024-03-14",
    status: "Active",
    prints: 3
  },
  {
    id: 3,
    code: "QR-001-2024",
    item: "Product C",
    type: "QR Code",
    format: "QR",
    created: "2024-03-14",
    status: "Active",
    prints: 2
  },
  {
    id: 4,
    code: "BAR-003-2024",
    item: "Product D",
    type: "UPC-A",
    format: "Barcode",
    created: "2024-03-13",
    status: "Inactive",
    prints: 1
  }
];

export default function InventoryBarcode() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Check if user has permission to manage barcodes
  const hasPermission = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };
  
  // Handle new barcode
  const handleNewBarcode = () => {
    handleNavigate("/inventory/barcode/new");
  };
  
  // Handle scan barcode
  const handleScanBarcode = () => {
    toast({
      title: "Scanning Barcode",
      description: "Please scan the barcode...",
    });
  };
  
  // Handle print barcode
  const handlePrintBarcode = (id: number) => {
    toast({
      title: "Printing Barcode",
      description: `Printing barcode ${id}...`,
    });
  };
  
  // Handle download barcode
  const handleDownloadBarcode = (id: number) => {
    toast({
      title: "Downloading Barcode",
      description: `Downloading barcode ${id}...`,
    });
  };
  
  // Filter barcodes based on search term and filters
  const filteredBarcodes = mockBarcodes.filter(barcode => {
    const matchesSearch = 
      barcode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barcode.item.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFormat = formatFilter === "all" || barcode.format === formatFilter;
    const matchesType = typeFilter === "all" || barcode.type === typeFilter;
    
    return matchesSearch && matchesFormat && matchesType;
  });
  
  if (!hasPermission) {
    return (
      <InventoryLayout>
        <AccessRestricted 
          title="Access Restricted" 
          description="Only managers and administrators can manage barcodes."
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
          <h1 className="text-3xl font-bold tracking-tight">Barcode Management</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleScanBarcode}>
              <Scan className="mr-2 h-4 w-4" />
              Scan Barcode
            </Button>
            <Button onClick={handleNewBarcode}>
              <Plus className="mr-2 h-4 w-4" />
              New Barcode
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search barcodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="Barcode">Barcode</SelectItem>
              <SelectItem value="QR">QR Code</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Barcode className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="EAN-13">EAN-13</SelectItem>
              <SelectItem value="Code 128">Code 128</SelectItem>
              <SelectItem value="UPC-A">UPC-A</SelectItem>
              <SelectItem value="QR Code">QR Code</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Barcode List</CardTitle>
            <CardDescription>
              Manage and track your inventory barcodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Prints</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBarcodes.map((barcode) => (
                  <TableRow key={barcode.id}>
                    <TableCell className="font-medium">{barcode.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        {barcode.item}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {barcode.type === "QR Code" ? (
                          <QrCode className="mr-2 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Barcode className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        {barcode.type}
                      </div>
                    </TableCell>
                    <TableCell>{barcode.format}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {barcode.created}
                      </div>
                    </TableCell>
                    <TableCell>{barcode.prints}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        barcode.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {barcode.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrintBarcode(barcode.id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadBarcode(barcode.id)}
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