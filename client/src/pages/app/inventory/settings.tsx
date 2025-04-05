import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../hooks/use-auth";
import axios from "axios";
import InventoryLayout from "@/components/layouts/inventory-layout";
import AccessRestricted from "@/components/pos/AccessRestricted";

export default function InventorySettings() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    lowStockThreshold: 20,
    autoReorderEnabled: false,
    defaultWarehouse: "",
    stockAuditFrequency: "monthly",
    barcodeFormat: "CODE128",
    enableSupplyChainVerification: true,
    requireStockVerification: false,
    notifyLowStock: true,
    allowNegativeStock: false,
  });
  
  // Warehouse options for default warehouse setting
  const [warehouses, setWarehouses] = useState<any[]>([]);
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    setLocation(path);
  };
  
  // Check permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true);
      try {
        // Check if user has admin or manager role
        const hasAccess = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';
        
        if (!hasAccess) {
          toast({
            title: "Access Restricted",
            description: "Only managers and administrators can access inventory settings",
            variant: "destructive",
          });
        }
        
        setHasPermission(hasAccess);
        
        // If has access, fetch settings and warehouses
        if (hasAccess) {
          await fetchSettings();
          await fetchWarehouses();
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        toast({
          title: "Error",
          description: "Failed to verify access permissions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkPermission();
    }
  }, [user?.role]);
  
  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/inventory/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory settings",
        variant: "destructive",
      });
    }
  };
  
  // Fetch warehouses for the default warehouse dropdown
  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/api/inventory/warehouses');
      if (response.data) {
        setWarehouses(response.data);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast({
        title: "Error",
        description: "Failed to load warehouses",
        variant: "destructive",
      });
    }
  };
  
  // Handle form changes
  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Save settings
  const handleSave = async () => {
    try {
      await axios.post('/api/inventory/settings', settings);
      toast({
        title: "Success",
        description: "Inventory settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save inventory settings",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <InventoryLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </InventoryLayout>
    );
  }
  
  if (!hasPermission) {
    return (
      <InventoryLayout>
        <AccessRestricted 
          title="Access Restricted" 
          description="Only managers and administrators can access inventory settings."
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory Settings</h1>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic inventory management settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Items below this quantity will be marked as low stock
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="defaultWarehouse">Default Warehouse</Label>
                    <Select
                      value={settings.defaultWarehouse}
                      onValueChange={(value) => handleChange('defaultWarehouse', value)}
                    >
                      <SelectTrigger id="defaultWarehouse">
                        <SelectValue placeholder="Select a warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse._id} value={warehouse._id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="stockAuditFrequency">Stock Audit Frequency</Label>
                    <Select
                      value={settings.stockAuditFrequency}
                      onValueChange={(value) => handleChange('stockAuditFrequency', value)}
                    >
                      <SelectTrigger id="stockAuditFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to be notified about inventory events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts when items fall below the low stock threshold
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyLowStock}
                    onCheckedChange={(checked) => handleChange('notifyLowStock', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Reorder</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create reorder requests for low stock items
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoReorderEnabled}
                    onCheckedChange={(checked) => handleChange('autoReorderEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced inventory management features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="barcodeFormat">Barcode Format</Label>
                    <Select
                      value={settings.barcodeFormat}
                      onValueChange={(value) => handleChange('barcodeFormat', value)}
                    >
                      <SelectTrigger id="barcodeFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CODE128">CODE128</SelectItem>
                        <SelectItem value="QR">QR Code</SelectItem>
                        <SelectItem value="EAN13">EAN13</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Supply Chain Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable verification of ethical sourcing and supply chain transparency
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableSupplyChainVerification}
                      onCheckedChange={(checked) => handleChange('enableSupplyChainVerification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stock Verification Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require verification before completing stock movements
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireStockVerification}
                      onCheckedChange={(checked) => handleChange('requireStockVerification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Negative Stock</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow items to go below zero quantity
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowNegativeStock}
                      onCheckedChange={(checked) => handleChange('allowNegativeStock', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </InventoryLayout>
  );
} 