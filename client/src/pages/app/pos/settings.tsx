import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import POSLayout from '@/components/layouts/pos-layout';
import { usePermissions } from '@/utils/permissions';
import AccessRestricted from '@/components/pos/AccessRestricted';
import {
  Settings,
  Printer,
  Bell,
  CreditCard,
  Users,
  Package,
  DollarSign,
  Receipt,
  ArrowLeft,
  Shield,
  Save
} from 'lucide-react';

interface POSSettings {
  // Basic settings
  enable_customer_profiles: boolean;
  enable_inventory_tracking: boolean;
  enable_employee_time_tracking: boolean;
  enable_discounts: boolean;
  enable_loyalty_program: boolean;
  enable_multi_currency: boolean;
  enable_offline_mode: boolean;
  enable_receipt_printing: boolean;
  enable_email_receipts: boolean;
  enable_sms_notifications: boolean;
  default_tax_rate: number;
  default_currency: string;
  receipt_footer: string;
  receipt_header: string;
  // Additional settings
  organizationId: string;
  organization_name: string;
  enable_barcode_scanning: boolean;
  enable_quick_keys: boolean;
  enable_price_override: boolean;
  enable_hold_orders: boolean;
  enable_returns: boolean;
  enable_gift_cards: boolean;
  pos_terminal_timeout: number;
  default_payment_method: string;
  default_receipt_type: string;
  cash_drawer_management: boolean;
  transaction_history_days: number;
}

export default function POSSettings() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAdmin, isOwner } = usePermissions();
  
  // Full default settings object
  const [settings, setSettings] = useState<POSSettings>({
    // Basic settings
    enable_customer_profiles: true,
    enable_inventory_tracking: true,
    enable_employee_time_tracking: true,
    enable_discounts: true,
    enable_loyalty_program: false,
    enable_multi_currency: false,
    enable_offline_mode: true,
    enable_receipt_printing: true,
    enable_email_receipts: false,
    enable_sms_notifications: false,
    default_tax_rate: 0.16,
    default_currency: 'USD',
    receipt_footer: 'Thank you for shopping with us!',
    receipt_header: 'Your Store Name',
    // Additional settings
    organizationId: user?.organizationId || '',
    organization_name: user?.organization?.name || 'My Organization',
    enable_barcode_scanning: true,
    enable_quick_keys: true,
    enable_price_override: false,
    enable_hold_orders: true,
    enable_returns: true,
    enable_gift_cards: false,
    pos_terminal_timeout: 15,
    default_payment_method: 'cash',
    default_receipt_type: 'print',
    cash_drawer_management: true,
    transaction_history_days: 30
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check if user has permission to access settings
    const checkPermission = () => {
      // Only admin, manager or owner can access settings
      const hasAccess = isAdmin || isOwner || user?.role === 'manager';
      setHasPermission(hasAccess);
      
      if (!hasAccess) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access POS settings. Only managers and administrators can access this page.',
          variant: 'destructive',
        });
        setLocation('/pos');
      } else {
        fetchSettings();
      }
    };

    checkPermission();
  }, [isAdmin, isOwner, setLocation, toast, user?.role]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Make sure to fetch settings specific to this organization
      if (!user?.organizationId) {
        throw new Error('Organization ID not found');
      }

      const response = await api.get(`/pos/settings/${user.organizationId}`);
      
      if (response.data) {
        // Merge with defaults in case some settings are missing
        setSettings(prev => ({ ...prev, ...response.data }));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch settings. Using defaults.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Always include organization ID to ensure settings are saved for this specific org
      const settingsToSave = {
        ...settings,
        organizationId: user?.organizationId
      };
      
      await api.post('/pos/settings', settingsToSave);
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const handleSettingChange = (key: keyof POSSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // If loading or no permission, show placeholder
  if (isLoading) {
    return (
      <POSLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </POSLayout>
    );
  }
  
  if (!hasPermission) {
    return (
      <POSLayout>
        <AccessRestricted 
          title="Settings Access Restricted"
          description="Only managers and administrators can access and modify POS settings for your organization."
        />
      </POSLayout>
    );
  }

  return (
    <POSLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation('/pos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to POS
          </Button>
          <div>
              <h1 className="text-2xl font-semibold">POS Settings</h1>
              <p className="text-sm text-gray-500">Configure your POS system for {settings.organization_name}</p>
            </div>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="receipts">
              <Receipt className="h-4 w-4 mr-2" />
              Receipts
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="features">
              <Package className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="access">
              <Shield className="h-4 w-4 mr-2" />
              Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
          <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label>Organization Name</Label>
                  <p className="text-sm text-gray-500 mb-2">This is your main business name that appears on receipts</p>
                  <Input
                    value={settings.organization_name}
                    onChange={(e) => handleSettingChange('organization_name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Default Tax Rate</Label>
                  <p className="text-sm text-gray-500 mb-2">The default tax rate applied to products</p>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={settings.default_tax_rate * 100}
                      onChange={(e) => handleSettingChange('default_tax_rate', parseFloat(e.target.value) / 100)}
                      className="w-24"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
                
              <div>
                  <Label>Default Currency</Label>
                  <p className="text-sm text-gray-500 mb-2">The main currency used for transactions</p>
                  <Select
                    value={settings.default_currency}
                    onValueChange={(value) => handleSettingChange('default_currency', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="KES">KES (Ksh)</SelectItem>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="ZAR">ZAR (R)</SelectItem>
                  </SelectContent>
                </Select>
                </div>
                
                <div>
                  <Label>POS Terminal Timeout (minutes)</Label>
                  <p className="text-sm text-gray-500 mb-2">Automatically log out cashiers after this period of inactivity</p>
                  <Input
                    type="number"
                    value={settings.pos_terminal_timeout}
                    onChange={(e) => handleSettingChange('pos_terminal_timeout', parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
                
                <div>
                  <Label>Transaction History (days)</Label>
                  <p className="text-sm text-gray-500 mb-2">Number of days to keep transaction history readily available</p>
                  <Input
                    type="number"
                    value={settings.transaction_history_days}
                    onChange={(e) => handleSettingChange('transaction_history_days', parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="receipts">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label>Receipt Header</Label>
                  <p className="text-sm text-gray-500 mb-2">Text that appears at the top of all receipts</p>
                  <Input
                    value={settings.receipt_header}
                    onChange={(e) => handleSettingChange('receipt_header', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Receipt Footer</Label>
                  <p className="text-sm text-gray-500 mb-2">Text that appears at the bottom of all receipts</p>
                  <Input
                    value={settings.receipt_footer}
                    onChange={(e) => handleSettingChange('receipt_footer', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Default Receipt Type</Label>
                  <p className="text-sm text-gray-500 mb-2">How receipts are provided by default</p>
                  <Select
                    value={settings.default_receipt_type}
                    onValueChange={(value) => handleSettingChange('default_receipt_type', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="print">Print</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="none">No Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Receipt Printing</Label>
                    <p className="text-sm text-gray-500">Print receipts automatically after checkout</p>
                  </div>
                  <Switch
                    checked={settings.enable_receipt_printing}
                    onCheckedChange={(checked) => handleSettingChange('enable_receipt_printing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Email Receipts</Label>
                    <p className="text-sm text-gray-500">Send receipts via email when customer email is available</p>
                  </div>
                  <Switch
                    checked={settings.enable_email_receipts}
                    onCheckedChange={(checked) => handleSettingChange('enable_email_receipts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Send receipt links via SMS when customer phone is available</p>
                  </div>
                  <Switch
                    checked={settings.enable_sms_notifications}
                    onCheckedChange={(checked) => handleSettingChange('enable_sms_notifications', checked)}
                  />
              </div>
            </div>
          </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label>Default Payment Method</Label>
                  <p className="text-sm text-gray-500 mb-2">The payment method selected by default</p>
                  <Select
                    value={settings.default_payment_method}
                    onValueChange={(value) => handleSettingChange('default_payment_method', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cash Drawer Management</Label>
                    <p className="text-sm text-gray-500">Enable cash drawer tracking and management</p>
                  </div>
                  <Switch
                    checked={settings.cash_drawer_management}
                    onCheckedChange={(checked) => handleSettingChange('cash_drawer_management', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Multi-Currency</Label>
                    <p className="text-sm text-gray-500">Allow transactions in multiple currencies</p>
                  </div>
                  <Switch
                    checked={settings.enable_multi_currency}
                    onCheckedChange={(checked) => handleSettingChange('enable_multi_currency', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Gift Cards</Label>
                    <p className="text-sm text-gray-500">Allow gift card sales and redemptions</p>
                  </div>
                  <Switch
                    checked={settings.enable_gift_cards}
                    onCheckedChange={(checked) => handleSettingChange('enable_gift_cards', checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="features">
          <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer Profiles</Label>
                    <p className="text-sm text-gray-500">Enable customer management and profiles</p>
                  </div>
                  <Switch
                    checked={settings.enable_customer_profiles}
                    onCheckedChange={(checked) => handleSettingChange('enable_customer_profiles', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Inventory Tracking</Label>
                    <p className="text-sm text-gray-500">Track product inventory levels</p>
                  </div>
                  <Switch
                    checked={settings.enable_inventory_tracking}
                    onCheckedChange={(checked) => handleSettingChange('enable_inventory_tracking', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Employee Time Tracking</Label>
                    <p className="text-sm text-gray-500">Track employee working hours</p>
                  </div>
                  <Switch
                    checked={settings.enable_employee_time_tracking}
                    onCheckedChange={(checked) => handleSettingChange('enable_employee_time_tracking', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Discounts</Label>
                    <p className="text-sm text-gray-500">Enable discount functionality</p>
                  </div>
                  <Switch
                    checked={settings.enable_discounts}
                    onCheckedChange={(checked) => handleSettingChange('enable_discounts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Loyalty Program</Label>
                    <p className="text-sm text-gray-500">Enable customer loyalty program</p>
                  </div>
                  <Switch
                    checked={settings.enable_loyalty_program}
                    onCheckedChange={(checked) => handleSettingChange('enable_loyalty_program', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Barcode Scanning</Label>
                    <p className="text-sm text-gray-500">Enable barcode scanner support</p>
                  </div>
                  <Switch
                    checked={settings.enable_barcode_scanning}
                    onCheckedChange={(checked) => handleSettingChange('enable_barcode_scanning', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quick Keys</Label>
                    <p className="text-sm text-gray-500">Enable keyboard shortcuts for faster operation</p>
                  </div>
                  <Switch
                    checked={settings.enable_quick_keys}
                    onCheckedChange={(checked) => handleSettingChange('enable_quick_keys', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Offline Mode</Label>
                    <p className="text-sm text-gray-500">Allow the POS to function without internet connection</p>
                  </div>
                  <Switch
                    checked={settings.enable_offline_mode}
                    onCheckedChange={(checked) => handleSettingChange('enable_offline_mode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Hold Orders</Label>
                    <p className="text-sm text-gray-500">Allow saving transactions for later completion</p>
                  </div>
                  <Switch
                    checked={settings.enable_hold_orders}
                    onCheckedChange={(checked) => handleSettingChange('enable_hold_orders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Returns</Label>
                    <p className="text-sm text-gray-500">Enable product return processing</p>
                  </div>
                  <Switch
                    checked={settings.enable_returns}
                    onCheckedChange={(checked) => handleSettingChange('enable_returns', checked)}
                  />
                </div>
            </div>
          </Card>
          </TabsContent>
          
          <TabsContent value="access">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Price Override</Label>
                    <p className="text-sm text-gray-500">Allow cashiers to change prices at checkout</p>
                  </div>
                  <Switch
                    checked={settings.enable_price_override}
                    onCheckedChange={(checked) => handleSettingChange('enable_price_override', checked)}
                  />
                </div>
                
                <div>
                  <Label>Access Control</Label>
                  <p className="text-sm text-gray-500 mb-4">Configure which roles can access specific POS features</p>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-4 bg-gray-100 p-2">
                      <div className="font-medium">Feature</div>
                      <div className="font-medium text-center">Cashier</div>
                      <div className="font-medium text-center">Manager</div>
                      <div className="font-medium text-center">Admin</div>
                    </div>
                    
                    <div className="grid grid-cols-4 p-2 border-t">
                      <div>View Reports</div>
                      <div className="flex justify-center"><Switch checked={false} disabled /></div>
                      <div className="flex justify-center"><Switch checked={true} disabled /></div>
                      <div className="flex justify-center"><Switch checked={true} disabled /></div>
                    </div>
                    
                    <div className="grid grid-cols-4 p-2 border-t">
                      <div>Void Transactions</div>
                      <div className="flex justify-center"><Switch checked={false} disabled /></div>
                      <div className="flex justify-center"><Switch checked={true} disabled /></div>
                      <div className="flex justify-center"><Switch checked={true} disabled /></div>
                    </div>
                    
                    <div className="grid grid-cols-4 p-2 border-t">
                      <div>Adjust Inventory</div>
                      <div className="flex justify-center"><Switch checked={false} disabled /></div>
                      <div className="flex justify-center"><Switch checked={true} disabled /></div>
                      <div className="flex justify-center"><Switch checked={true} disabled /></div>
                    </div>
                    
                    <div className="grid grid-cols-4 p-2 border-t">
                      <div>Modify Settings</div>
                      <div className="flex justify-center"><Switch checked={false} disabled /></div>
                      <div className="flex justify-center"><Switch checked={false} disabled /></div>
                      <div className="flex justify-center"><Switch checked={true} disabled /></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Note: These role permissions are managed by system administrators and cannot be changed here.
                    Only admins and owners can access and modify settings for your organization.
                  </p>
          </div>
        </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </POSLayout>
  );
}

// Helper function - keep if already existing
function getFeatureDescription(key: string): string {
  const descriptions: Record<string, string> = {
    enable_customer_profiles: "Allow customer management and tracking",
    enable_inventory_tracking: "Track product stock levels automatically",
    enable_employee_time_tracking: "Track employee clock-in/out times",
    enable_discounts: "Allow applying discounts to transactions",
    enable_loyalty_program: "Enable points-based customer loyalty system",
    enable_multi_currency: "Support multiple currencies in transactions",
    enable_offline_mode: "Allow POS to function without internet connection",
    enable_receipt_printing: "Print physical receipts",
    enable_email_receipts: "Send digital receipts via email",
    enable_sms_notifications: "Send receipt links and notifications via SMS",
  };
  
  return descriptions[key] || "Configure this feature";
} 