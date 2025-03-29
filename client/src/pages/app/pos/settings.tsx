import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

// POS types available for organizations
const POS_TYPES = [
  { id: 'retail', name: 'Retail Store', description: 'Standard retail point of sale system' },
  { id: 'restaurant', name: 'Restaurant', description: 'POS system with table management and kitchen orders' },
  { id: 'service', name: 'Service Business', description: 'POS system for service-based businesses' },
  { id: 'custom', name: 'Custom POS', description: 'Fully customizable POS system' }
];

export default function POSSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [posType, setPosType] = useState('retail');
  const [settings, setSettings] = useState({
    enableCustomerProfiles: true,
    enableInventoryTracking: true,
    enableEmployeeTimeTracking: true,
    enableDiscounts: true,
    enableLoyaltyProgram: false,
    enableMultiCurrency: false,
    enableOfflineMode: true,
    enableReceiptPrinting: true,
    enableEmailReceipts: false,
    enableSMSNotifications: false
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // TODO: Save settings to backend
    console.log('Saving POS settings:', { posType, settings });
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/pos')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">POS Settings</h1>
            <p className="text-sm text-gray-500">Customize your POS system</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">POS Type</h2>
            <div className="space-y-4">
              <div>
                <Label>Select POS Type</Label>
                <Select value={posType} onValueChange={setPosType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select POS type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POS_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {POS_TYPES.find(t => t.id === posType)?.description}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Features</h2>
            <div className="space-y-4">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {getFeatureDescription(key)}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => handleSettingChange(key, checked)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
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