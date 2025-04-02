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
import CompactSidebar from '@/components/layout/CompactSidebar';
import { usePermissions } from '@/utils/permissions';
import {
  Settings,
  Printer,
  Bell,
  CreditCard,
  Users,
  Package,
  DollarSign,
  Receipt
} from 'lucide-react';

interface POSSettings {
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
}

export default function POSSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAdmin, isOwner } = usePermissions();
  const [settings, setSettings] = useState<POSSettings>({
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
    receipt_header: 'Your Store Name'
  });

  useEffect(() => {
    if (!isAdmin && !isOwner) {
      setLocation('/pos');
      return;
    }
    fetchSettings();
  }, [isAdmin, isOwner, setLocation]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/pos/settings');
      setSettings(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/pos/settings', settings);
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
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

  return (
    <div className="flex min-h-screen">
      <CompactSidebar />
      <div className="flex-1 ml-20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">POS Settings</h1>
              <p className="text-sm text-gray-500">Configure your POS system</p>
            </div>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label>Default Tax Rate</Label>
                    <Input
                      type="number"
                      value={settings?.default_tax_rate ?? 0.16}
                      onChange={(e) => handleSettingChange('default_tax_rate', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Default Currency</Label>
                    <Select
                      value={settings?.default_currency ?? 'USD'}
                      onValueChange={(value) => handleSettingChange('default_currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="receipts">
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label>Receipt Header</Label>
                    <Input
                      value={settings?.receipt_header ?? 'Your Store Name'}
                      onChange={(e) => handleSettingChange('receipt_header', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Receipt Footer</Label>
                    <Input
                      value={settings?.receipt_footer ?? 'Thank you for shopping with us!'}
                      onChange={(e) => handleSettingChange('receipt_footer', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Receipt Printing</Label>
                      <p className="text-sm text-gray-500">Print receipts automatically after checkout</p>
                    </div>
                    <Switch
                      checked={settings?.enable_receipt_printing ?? true}
                      onCheckedChange={(checked) => handleSettingChange('enable_receipt_printing', checked)}
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
                      checked={settings?.enable_customer_profiles ?? true}
                      onCheckedChange={(checked) => handleSettingChange('enable_customer_profiles', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Inventory Tracking</Label>
                      <p className="text-sm text-gray-500">Track product inventory levels</p>
                    </div>
                    <Switch
                      checked={settings?.enable_inventory_tracking ?? true}
                      onCheckedChange={(checked) => handleSettingChange('enable_inventory_tracking', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Employee Time Tracking</Label>
                      <p className="text-sm text-gray-500">Track employee working hours</p>
                    </div>
                    <Switch
                      checked={settings?.enable_employee_time_tracking ?? true}
                      onCheckedChange={(checked) => handleSettingChange('enable_employee_time_tracking', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Discounts</Label>
                      <p className="text-sm text-gray-500">Enable discount functionality</p>
                    </div>
                    <Switch
                      checked={settings?.enable_discounts ?? true}
                      onCheckedChange={(checked) => handleSettingChange('enable_discounts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Loyalty Program</Label>
                      <p className="text-sm text-gray-500">Enable customer loyalty program</p>
                    </div>
                    <Switch
                      checked={settings?.enable_loyalty_program ?? false}
                      onCheckedChange={(checked) => handleSettingChange('enable_loyalty_program', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Multi-Currency</Label>
                      <p className="text-sm text-gray-500">Enable multiple currency support</p>
                    </div>
                    <Switch
                      checked={settings?.enable_multi_currency ?? false}
                      onCheckedChange={(checked) => handleSettingChange('enable_multi_currency', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Offline Mode</Label>
                      <p className="text-sm text-gray-500">Enable offline functionality</p>
                    </div>
                    <Switch
                      checked={settings?.enable_offline_mode ?? true}
                      onCheckedChange={(checked) => handleSettingChange('enable_offline_mode', checked)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Receipts</Label>
                      <p className="text-sm text-gray-500">Send receipts via email</p>
                    </div>
                    <Switch
                      checked={settings?.enable_email_receipts ?? false}
                      onCheckedChange={(checked) => handleSettingChange('enable_email_receipts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings?.enable_sms_notifications ?? false}
                      onCheckedChange={(checked) => handleSettingChange('enable_sms_notifications', checked)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function getFeatureDescription(key: string): string {
  const descriptions: Record<string, string> = {
    enableCustomerProfiles: 'Store customer information and purchase history',
    enableInventoryTracking: 'Track stock levels and manage inventory',
    enableEmployeeTimeTracking: 'Track employee working hours and shifts',
    enableDiscounts: 'Apply discounts and promotions to sales',
    enableLoyaltyProgram: 'Implement customer loyalty program',
    enableMultiCurrency: 'Support multiple currencies for transactions',
    enableOfflineMode: 'Allow POS to work without internet connection',
    enableReceiptPrinting: 'Print physical receipts for transactions',
    enableEmailReceipts: 'Send digital receipts via email',
    enableSMSNotifications: 'Send SMS notifications for transactions'
  };
  return descriptions[key] || '';
} 