import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Settings } from 'lucide-react';

interface PayrollSettings {
  taxRate: number;
  benefitsRate: number;
  overtimeRate: number;
  currency: string;
  paymentFrequency: string;
  autoProcess: boolean;
  requireApproval: boolean;
  deductions: {
    healthInsurance: number;
    retirementPlan: number;
    lifeInsurance: number;
    otherDeductions: number;
  };
}

export default function PayrollSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PayrollSettings>({
    taxRate: 15,
    benefitsRate: 5,
    overtimeRate: 1.5,
    currency: 'USD',
    paymentFrequency: 'monthly',
    autoProcess: false,
    requireApproval: true,
    deductions: {
      healthInsurance: 2,
      retirementPlan: 3,
      lifeInsurance: 1,
      otherDeductions: 0
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hr/payroll-settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Use default settings if API doesn't exist yet
        console.log('Using default payroll settings');
      }
    } catch (error) {
      console.error('Error fetching payroll settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/hr/payroll-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payroll settings saved successfully',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving payroll settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save payroll settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PayrollSettings] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading payroll settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Payroll Settings</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefitsRate">Benefits Rate (%)</Label>
              <Input
                id="benefitsRate"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={settings.benefitsRate}
                onChange={(e) => handleInputChange('benefitsRate', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtimeRate">Overtime Rate (multiplier)</Label>
              <Input
                id="overtimeRate"
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={settings.overtimeRate}
                onChange={(e) => handleInputChange('overtimeRate', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select value={settings.paymentFrequency} onValueChange={(value) => handleInputChange('paymentFrequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deductions Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Deductions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="healthInsurance">Health Insurance (%)</Label>
              <Input
                id="healthInsurance"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.deductions.healthInsurance}
                onChange={(e) => handleInputChange('deductions.healthInsurance', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementPlan">Retirement Plan (%)</Label>
              <Input
                id="retirementPlan"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.deductions.retirementPlan}
                onChange={(e) => handleInputChange('deductions.retirementPlan', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifeInsurance">Life Insurance (%)</Label>
              <Input
                id="lifeInsurance"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={settings.deductions.lifeInsurance}
                onChange={(e) => handleInputChange('deductions.lifeInsurance', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherDeductions">Other Deductions (%)</Label>
              <Input
                id="otherDeductions"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.deductions.otherDeductions}
                onChange={(e) => handleInputChange('deductions.otherDeductions', parseFloat(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Processing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoProcess">Auto Process Payroll</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically process payroll on scheduled dates
                </p>
              </div>
              <Switch
                id="autoProcess"
                checked={settings.autoProcess}
                onCheckedChange={(checked) => handleInputChange('autoProcess', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireApproval">Require Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require manager approval before processing
                </p>
              </div>
              <Switch
                id="requireApproval"
                checked={settings.requireApproval}
                onCheckedChange={(checked) => handleInputChange('requireApproval', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tax Rate:</span>
                <span className="font-medium">{settings.taxRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Benefits Rate:</span>
                <span className="font-medium">{settings.benefitsRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Health Insurance:</span>
                <span className="font-medium">{settings.deductions.healthInsurance}%</span>
              </div>
              <div className="flex justify-between">
                <span>Retirement Plan:</span>
                <span className="font-medium">{settings.deductions.retirementPlan}%</span>
              </div>
              <div className="flex justify-between">
                <span>Life Insurance:</span>
                <span className="font-medium">{settings.deductions.lifeInsurance}%</span>
              </div>
              <div className="flex justify-between">
                <span>Other Deductions:</span>
                <span className="font-medium">{settings.deductions.otherDeductions}%</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Deductions:</span>
                  <span className="text-red-600">
                    {settings.taxRate + settings.benefitsRate + settings.deductions.healthInsurance + 
                     settings.deductions.retirementPlan + settings.deductions.lifeInsurance + 
                     settings.deductions.otherDeductions}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 