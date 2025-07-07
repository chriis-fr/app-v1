import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSettingsSchema, OrganizationSettings } from '../../../shared/schema';
import { getAvailableCountries } from '@/config/countries';
import { Camera, Upload, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BackButton } from '@/components/ui/back-button';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { hasFullAccess } from '@/utils/access';
import { AISettings } from '@/components/ai';

interface OrganizationFormData {
  name: string;
  type: string;
  industry: string;
  size?: string;
  address?: string;
  country?: string;
  taxId?: string;
  website?: string;
}

const MODULES = ['hr', 'inventory', 'accounting', 'crm', 'pos'];

function CustomFieldManager() {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState('hr');
  const [fields, setFields] = useState(((user?.organization?.settings as any)?.customFields?.[selectedModule]) || []);

  useEffect(() => {
    setFields(((user?.organization?.settings as any)?.customFields?.[selectedModule]) || []);
  }, [selectedModule, user]);

  const handleAddField = () => setFields([...fields, { name: '', type: 'string', required: false }]);
  const handleFieldChange = (idx: number, key: string, value: any) => {
    const updated = [...fields];
    updated[idx][key] = value;
    setFields(updated);
  };
  const handleRemoveField = (idx: number) => setFields(fields.filter((_: any, i: number) => i !== idx));

  const handleSave = async () => {
    await fetch(`/api/organization/custom-fields/${selectedModule}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customFields: fields }),
    });
    toast({ title: 'Custom fields updated!' });
  };

  return (
    <div className="my-8 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-bold mb-2">Custom Fields</h2>
      <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} className="mb-4">
        {MODULES.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
      </select>
      <ul>
        {fields.map((field: any, idx: number) => (
          <li key={idx} className="flex gap-2 items-center mb-2">
            <input value={field.name} onChange={e => handleFieldChange(idx, 'name', e.target.value)} placeholder="Field Name" className="border p-1 rounded" />
            <select value={field.type} onChange={e => handleFieldChange(idx, 'type', e.target.value)} className="border p-1 rounded">
              <option value="string">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Checkbox</option>
            </select>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(idx, 'required', e.target.checked)} /> Required
            </label>
            <button type="button" onClick={() => handleRemoveField(idx)} className="text-red-500">Remove</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={handleAddField} className="bg-blue-100 px-2 py-1 rounded">Add Field</button>
        <button type="button" onClick={handleSave} className="bg-green-100 px-2 py-1 rounded">Save</button>
      </div>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  const { user, setUser } = useAuth();
  const [, setLocation] = useLocation();
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(user?.organization?.settings?.branding?.logo || null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<OrganizationFormData>({
    defaultValues: {
      name: user?.organization?.name || '',
      type: user?.organization?.type || '',
      industry: user?.organization?.industry || '',
      size: user?.organization?.size || '',
      address: user?.organization?.address || '',
      country: user?.organization?.country || '',
      taxId: user?.organization?.taxId || '',
      website: user?.organization?.website || '',
    },
  });

  const settingsForm = useForm<OrganizationSettings>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      theme: {
        primaryColor: user?.organization?.settings?.theme?.primaryColor || '#282881',
        secondaryColor: user?.organization?.settings?.theme?.secondaryColor || '#ffffff',
        darkMode: user?.organization?.settings?.theme?.darkMode || false,
      },
      branding: {
        logo: user?.organization?.settings?.branding?.logo || null,
        favicon: user?.organization?.settings?.branding?.favicon || null,
        companyName: user?.organization?.settings?.branding?.companyName || user?.organization?.name || '',
        tagline: user?.organization?.settings?.branding?.tagline || '',
        website: user?.organization?.settings?.branding?.website || user?.organization?.website || '',
        email: user?.organization?.settings?.branding?.email || '',
        phone: user?.organization?.settings?.branding?.phone || '',
        address: user?.organization?.settings?.branding?.address || user?.organization?.address || '',
      },
      modules: {
        enabled: user?.organization?.settings?.modules?.enabled || [],
        defaultModule: user?.organization?.settings?.modules?.defaultModule || '',
      },
      notifications: {
        email: user?.organization?.settings?.notifications?.email ?? true,
        push: user?.organization?.settings?.notifications?.push ?? true,
        sms: user?.organization?.settings?.notifications?.sms ?? false,
      },
      security: {
        twoFactorAuth: user?.organization?.settings?.security?.twoFactorAuth ?? false,
        sessionTimeout: user?.organization?.settings?.security?.sessionTimeout || 30,
        passwordPolicy: {
          minLength: user?.organization?.settings?.security?.passwordPolicy?.minLength || 8,
          requireSpecialChars: user?.organization?.settings?.security?.passwordPolicy?.requireSpecialChars ?? true,
          requireNumbers: user?.organization?.settings?.security?.passwordPolicy?.requireNumbers ?? true,
        },
      },
      integrations: {
        paymentGateways: user?.organization?.settings?.integrations?.paymentGateways || [],
        emailService: user?.organization?.settings?.integrations?.emailService || '',
        smsService: user?.organization?.settings?.integrations?.smsService || '',
      },
      backup: {
        frequency: user?.organization?.settings?.backup?.frequency || 'daily',
        retention: user?.organization?.settings?.backup?.retention || 30,
        autoBackup: user?.organization?.settings?.backup?.autoBackup ?? true,
      },
      workingDays: user?.organization?.settings?.workingDays || [],
      workingHours: {
        start: user?.organization?.settings?.workingHours?.start || '09:00',
        end: user?.organization?.settings?.workingHours?.end || '17:00',
      },
      holidays: user?.organization?.settings?.holidays || [],
      customSettings: user?.organization?.settings?.customSettings || {},
      accounting: user?.organization?.settings?.accounting ? {
        fiscalYearStart: user.organization.settings.accounting.fiscalYearStart,
        fiscalYearEnd: user.organization.settings.accounting.fiscalYearEnd,
        taxYearStart: user.organization.settings.accounting.taxYearStart,
        taxYearEnd: user.organization.settings.accounting.taxYearEnd,
        currency: user.organization.settings.accounting.currency,
        taxRates: user.organization.settings.accounting.taxRates,
        chartOfAccounts: user.organization.settings.accounting.chartOfAccounts,
        reportingPeriods: user.organization.settings.accounting.reportingPeriods,
        taxJurisdictions: user.organization.settings.accounting.taxJurisdictions,
        compliance: user.organization.settings.accounting.compliance,
      } : undefined,
      payroll: user?.organization?.settings?.payroll ? {
        paymentFrequency: user.organization.settings.payroll.paymentFrequency,
        paymentDay: user.organization.settings.payroll.paymentDay,
        overtimeRate: user.organization.settings.payroll.overtimeRate,
        bonusStructure: user.organization.settings.payroll.bonusStructure,
        deductions: user.organization.settings.payroll.deductions,
      } : undefined,
      benefits: user?.organization?.settings?.benefits ? {
        mandatory: user.organization.settings.benefits.mandatory,
        optional: user.organization.settings.benefits.optional,
      } : undefined,
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/organization/logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const { url } = await response.json();
      setOrganizationLogo(url);
      settingsForm.setValue('branding.logo', url);
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    try {
      const response = await fetch('/api/organization/logo', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      setOrganizationLogo(null);
      settingsForm.setValue('branding.logo', null);
    } catch (error) {
      console.error('Error deleting logo:', error);
    }
  };

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization');
      }

      const updatedOrganization = await response.json();
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          organization: updatedOrganization
        };
      });
    } catch (error) {
      console.error('Error updating organization:', error);
    }
  };

  const onSettingsSubmit = async (data: OrganizationSettings) => {
    try {
      const response = await fetch('/api/organization/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization settings');
      }

      const updatedOrganization = await response.json();
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          organization: updatedOrganization
        };
      });
    } catch (error) {
      console.error('Error updating organization settings:', error);
    }
  };

  if (!user || !hasFullAccess(user)) {
    return <div>Access denied. Redirecting...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <CompactSidebar />
      <div className="flex-1 ml-20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="mb-6">
            <BackButton />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Update your organization's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    {organizationLogo ? (
                      <img
                        src={organizationLogo}
                        alt="Organization Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-primary">
                        {user.organization?.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90">
                        <Camera className="w-4 h-4" />
                      </div>
                    </label>
                  </div>
                  {organizationLogo && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 w-8 h-8 rounded-full"
                      onClick={handleLogoDelete}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold">{user.organization?.name}</h3>
                  <p className="text-muted-foreground">{user.organization?.industry}</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input id="name" {...form.register('name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Input id="type" {...form.register('type')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" {...form.register('industry')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input id="size" {...form.register('size')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...form.register('address')} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={form.watch('country')}
                      onValueChange={(value) => form.setValue('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCountries().map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input id="taxId" {...form.register('taxId')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...form.register('website')} />
                </div>

                <Button type="submit" className="w-full">
                  Save Organization Info
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Configure your organization's settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="accounting">Accounting</TabsTrigger>
                  <TabsTrigger value="payroll">Payroll</TabsTrigger>
                  <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
              <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input id="primaryColor" type="color" {...settingsForm.register('theme.primaryColor')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <Input id="secondaryColor" type="color" {...settingsForm.register('theme.secondaryColor')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                        <Switch
                          id="darkMode"
                          checked={settingsForm.watch('theme.darkMode')}
                          onCheckedChange={(checked) => settingsForm.setValue('theme.darkMode', checked)}
                        />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Branding</h3>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" {...settingsForm.register('branding.companyName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" {...settingsForm.register('branding.tagline')} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security</h3>
                  <div className="space-y-2">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                        <Switch
                          id="twoFactorAuth"
                          checked={settingsForm.watch('security.twoFactorAuth')}
                          onCheckedChange={(checked) => settingsForm.setValue('security.twoFactorAuth', checked)}
                        />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input id="sessionTimeout" type="number" {...settingsForm.register('security.sessionTimeout')} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="space-y-2">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <Switch
                          id="emailNotifications"
                          checked={settingsForm.watch('notifications.email')}
                          onCheckedChange={(checked) => settingsForm.setValue('notifications.email', checked)}
                        />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <Switch
                          id="pushNotifications"
                          checked={settingsForm.watch('notifications.push')}
                          onCheckedChange={(checked) => settingsForm.setValue('notifications.push', checked)}
                        />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <Switch
                          id="smsNotifications"
                          checked={settingsForm.watch('notifications.sms')}
                          onCheckedChange={(checked) => settingsForm.setValue('notifications.sms', checked)}
                        />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Save Settings
                </Button>
              </form>
                </TabsContent>

                <TabsContent value="accounting">
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Fiscal Year</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
                          <Input 
                            id="fiscalYearStart" 
                            type="date" 
                            {...settingsForm.register('accounting.fiscalYearStart')} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                          <Input 
                            id="fiscalYearEnd" 
                            type="date" 
                            {...settingsForm.register('accounting.fiscalYearEnd')} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Tax Settings</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="taxYearStart">Tax Year Start</Label>
                          <Input 
                            id="taxYearStart" 
                            type="date" 
                            {...settingsForm.register('accounting.taxYearStart')} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxYearEnd">Tax Year End</Label>
                          <Input 
                            id="taxYearEnd" 
                            type="date" 
                            {...settingsForm.register('accounting.taxYearEnd')} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Reporting Periods</h3>
                      <div className="space-y-2">
                        <Label>Select Reporting Periods</Label>
                        <div className="space-y-2">
                          {['monthly', 'quarterly', 'annually'].map((period) => (
                            <div key={period} className="flex items-center space-x-2">
                              <Switch
                                id={`reporting-${period}`}
                                checked={settingsForm.watch('accounting.reportingPeriods')?.includes(period)}
                                onCheckedChange={(checked) => {
                                  const current = settingsForm.watch('accounting.reportingPeriods') || [];
                                  settingsForm.setValue(
                                    'accounting.reportingPeriods',
                                    checked
                                      ? [...current, period]
                                      : current.filter((p) => p !== period)
                                  );
                                }}
                              />
                              <Label htmlFor={`reporting-${period}`}>{period.charAt(0).toUpperCase() + period.slice(1)}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Tax Jurisdictions</h3>
                      <div className="space-y-4">
                        {settingsForm.watch('accounting.taxJurisdictions')?.map((jurisdiction: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={jurisdiction.name}
                                  onChange={(e) => {
                                    const jurisdictions = [...(settingsForm.watch('accounting.taxJurisdictions') || [])];
                                    jurisdictions[index] = { ...jurisdiction, name: e.target.value };
                                    settingsForm.setValue('accounting.taxJurisdictions', jurisdictions);
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Input
                                  value={jurisdiction.type}
                                  onChange={(e) => {
                                    const jurisdictions = [...(settingsForm.watch('accounting.taxJurisdictions') || [])];
                                    jurisdictions[index] = { ...jurisdiction, type: e.target.value };
                                    settingsForm.setValue('accounting.taxJurisdictions', jurisdictions);
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                const jurisdictions = settingsForm.watch('accounting.taxJurisdictions') || [];
                                settingsForm.setValue(
                                  'accounting.taxJurisdictions',
                                  jurisdictions.filter((_: any, i: number) => i !== index)
                                );
                              }}
                            >
                              Remove Jurisdiction
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const jurisdictions = settingsForm.watch('accounting.taxJurisdictions') || [];
                            settingsForm.setValue('accounting.taxJurisdictions', [
                              ...jurisdictions,
                              { name: '', type: '', rates: {}, filingDeadlines: [] }
                            ]);
                          }}
                        >
                          Add Tax Jurisdiction
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Accounting Settings
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="payroll">
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Payment Settings</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                          <Select
                            value={settingsForm.watch('payroll.paymentFrequency')}
                            onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => {
                              settingsForm.setValue('payroll.paymentFrequency', value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentDay">Payment Day</Label>
                          <Input
                            id="paymentDay"
                            type="number"
                            min={1}
                            max={31}
                            {...settingsForm.register('payroll.paymentDay')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Overtime & Bonuses</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="overtimeRate">Overtime Rate</Label>
                          <Input
                            id="overtimeRate"
                            type="number"
                            step="0.01"
                            {...settingsForm.register('payroll.overtimeRate')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Deductions</h3>
                      <div className="space-y-2">
                        {settingsForm.watch('payroll.deductions')?.map((deduction: any, index: number) => (
                          <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Input
                                value={deduction.type}
                                onChange={(e) => {
                                  const deductions = [...(settingsForm.watch('payroll.deductions') || [])];
                                  deductions[index] = { ...deductions[index], type: e.target.value };
                                  settingsForm.setValue('payroll.deductions', deductions);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Rate</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={deduction.rate}
                                onChange={(e) => {
                                  const deductions = [...(settingsForm.watch('payroll.deductions') || [])];
                                  deductions[index] = { ...deductions[index], rate: parseFloat(e.target.value) };
                                  settingsForm.setValue('payroll.deductions', deductions);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Threshold</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={deduction.threshold}
                                onChange={(e) => {
                                  const deductions = [...(settingsForm.watch('payroll.deductions') || [])];
                                  deductions[index] = { ...deductions[index], threshold: parseFloat(e.target.value) };
                                  settingsForm.setValue('payroll.deductions', deductions);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const deductions = [...(settingsForm.watch('payroll.deductions') || [])];
                            deductions.push({ type: '', rate: 0, threshold: 0 });
                            settingsForm.setValue('payroll.deductions', deductions);
                          }}
                        >
                          Add Deduction
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Payroll Settings
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="benefits">
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Mandatory Benefits</h3>
                      <div className="space-y-4">
                        {settingsForm.watch('benefits.mandatory')?.map((benefit: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Input
                                  value={benefit.type}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.mandatory') || [])];
                                    benefits[index] = { ...benefit, type: e.target.value };
                                    settingsForm.setValue('benefits.mandatory', benefits);
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Provider</Label>
                                <Input
                                  value={benefit.provider}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.mandatory') || [])];
                                    benefits[index] = { ...benefit, provider: e.target.value };
                                    settingsForm.setValue('benefits.mandatory', benefits);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Coverage</Label>
                              <Textarea
                                value={benefit.coverage}
                                onChange={(e) => {
                                  const benefits = [...(settingsForm.watch('benefits.mandatory') || [])];
                                  benefits[index] = { ...benefit, coverage: e.target.value };
                                  settingsForm.setValue('benefits.mandatory', benefits);
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Employee Cost</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={benefit.cost.employee}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.mandatory') || [])];
                                    benefits[index] = {
                                      ...benefit,
                                      cost: { ...benefit.cost, employee: parseFloat(e.target.value) }
                                    };
                                    settingsForm.setValue('benefits.mandatory', benefits);
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Employer Cost</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={benefit.cost.employer}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.mandatory') || [])];
                                    benefits[index] = {
                                      ...benefit,
                                      cost: { ...benefit.cost, employer: parseFloat(e.target.value) }
                                    };
                                    settingsForm.setValue('benefits.mandatory', benefits);
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                const benefits = settingsForm.watch('benefits.mandatory') || [];
                                settingsForm.setValue(
                                  'benefits.mandatory',
                                  benefits.filter((_: any, i: number) => i !== index)
                                );
                              }}
                            >
                              Remove Benefit
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const benefits = settingsForm.watch('benefits.mandatory') || [];
                            settingsForm.setValue('benefits.mandatory', [
                              ...benefits,
                              { type: '', provider: '', coverage: '', cost: { employee: 0, employer: 0 } }
                            ]);
                          }}
                        >
                          Add Mandatory Benefit
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Optional Benefits</h3>
                      <div className="space-y-4">
                        {settingsForm.watch('benefits.optional')?.map((benefit: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Input
                                  value={benefit.type}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.optional') || [])];
                                    benefits[index] = { ...benefit, type: e.target.value };
                                    settingsForm.setValue('benefits.optional', benefits);
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Provider</Label>
                                <Input
                                  value={benefit.provider}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.optional') || [])];
                                    benefits[index] = { ...benefit, provider: e.target.value };
                                    settingsForm.setValue('benefits.optional', benefits);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Coverage</Label>
                              <Textarea
                                value={benefit.coverage}
                                onChange={(e) => {
                                  const benefits = [...(settingsForm.watch('benefits.optional') || [])];
                                  benefits[index] = { ...benefit, coverage: e.target.value };
                                  settingsForm.setValue('benefits.optional', benefits);
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Employee Cost</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={benefit.cost.employee}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.optional') || [])];
                                    benefits[index] = {
                                      ...benefit,
                                      cost: { ...benefit.cost, employee: parseFloat(e.target.value) }
                                    };
                                    settingsForm.setValue('benefits.optional', benefits);
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Employer Cost</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={benefit.cost.employer}
                                  onChange={(e) => {
                                    const benefits = [...(settingsForm.watch('benefits.optional') || [])];
                                    benefits[index] = {
                                      ...benefit,
                                      cost: { ...benefit.cost, employer: parseFloat(e.target.value) }
                                    };
                                    settingsForm.setValue('benefits.optional', benefits);
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                const benefits = settingsForm.watch('benefits.optional') || [];
                                settingsForm.setValue(
                                  'benefits.optional',
                                  benefits.filter((_: any, i: number) => i !== index)
                                );
                              }}
                            >
                              Remove Benefit
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const benefits = settingsForm.watch('benefits.optional') || [];
                            settingsForm.setValue('benefits.optional', [
                              ...benefits,
                              { type: '', provider: '', coverage: '', cost: { employee: 0, employer: 0 } }
                            ]);
                          }}
                        >
                          Add Optional Benefit
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Benefits Settings
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="compliance">
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Required Reports</h3>
                      <div className="space-y-2">
                        <Label>Required Reports</Label>
                        <div className="space-y-2">
                          {settingsForm.watch('accounting.compliance.requiredReports')?.map((report: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={report}
                                onChange={(e) => {
                                  const reports = [...(settingsForm.watch('accounting.compliance.requiredReports') || [])];
                                  reports[index] = e.target.value;
                                  settingsForm.setValue('accounting.compliance.requiredReports', reports);
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  const reports = [...(settingsForm.watch('accounting.compliance.requiredReports') || [])];
                                  reports.splice(index, 1);
                                  settingsForm.setValue('accounting.compliance.requiredReports', reports);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const reports = [...(settingsForm.watch('accounting.compliance.requiredReports') || [])];
                              reports.push('');
                              settingsForm.setValue('accounting.compliance.requiredReports', reports);
                            }}
                          >
                            Add Report
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Filing Deadlines</h3>
                      <div className="space-y-2">
                        <Label>Filing Deadlines</Label>
                        <div className="space-y-2">
                          {Object.entries(settingsForm.watch('accounting.compliance.filingDeadlines') || {} as Record<string, string[]>).map(([report, deadlines], index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={report}
                                  onChange={(e) => {
                                    const deadlines = settingsForm.watch('accounting.compliance.filingDeadlines') || {};
                                    const newDeadlines = { ...deadlines };
                                    delete newDeadlines[report];
                                    newDeadlines[e.target.value] = deadlines[report];
                                    settingsForm.setValue('accounting.compliance.filingDeadlines', newDeadlines);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const deadlines = { ...(settingsForm.watch('accounting.compliance.filingDeadlines') || {}) };
                                    delete deadlines[report];
                                    settingsForm.setValue('accounting.compliance.filingDeadlines', deadlines);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="pl-4 space-y-2">
                                {deadlines.map((deadline: string, deadlineIndex: number) => (
                                  <div key={deadlineIndex} className="flex items-center space-x-2">
                                    <Input
                                      value={deadline}
                                      onChange={(e) => {
                                        const deadlines = settingsForm.watch('accounting.compliance.filingDeadlines') || {};
                                        const newDeadlines = [...deadlines[report]];
                                        newDeadlines[deadlineIndex] = e.target.value;
                                        settingsForm.setValue('accounting.compliance.filingDeadlines', {
                                          ...deadlines,
                                          [report]: newDeadlines,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {
                                        const deadlines = settingsForm.watch('accounting.compliance.filingDeadlines') || {};
                                        const newDeadlines = [...deadlines[report]];
                                        newDeadlines.splice(deadlineIndex, 1);
                                        settingsForm.setValue('accounting.compliance.filingDeadlines', {
                                          ...deadlines,
                                          [report]: newDeadlines,
                                        });
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const deadlines = settingsForm.watch('accounting.compliance.filingDeadlines') || {};
                                    settingsForm.setValue('accounting.compliance.filingDeadlines', {
                                      ...deadlines,
                                      [report]: [...deadlines[report], ''],
                                    });
                                  }}
                                >
                                  Add Deadline
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const deadlines = settingsForm.watch('accounting.compliance.filingDeadlines') || {};
                              settingsForm.setValue('accounting.compliance.filingDeadlines', {
                                ...deadlines,
                                'New Report': [''],
                              });
                            }}
                          >
                            Add Report
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Required Documentation</h3>
                      <div className="space-y-2">
                        <Label>Required Documentation</Label>
                        <div className="space-y-2">
                          {settingsForm.watch('accounting.compliance.documentation')?.map((doc: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={doc}
                                onChange={(e) => {
                                  const docs = [...(settingsForm.watch('accounting.compliance.documentation') || [])];
                                  docs[index] = e.target.value;
                                  settingsForm.setValue('accounting.compliance.documentation', docs);
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  const docs = [...(settingsForm.watch('accounting.compliance.documentation') || [])];
                                  docs.splice(index, 1);
                                  settingsForm.setValue('accounting.compliance.documentation', docs);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const docs = [...(settingsForm.watch('accounting.compliance.documentation') || [])];
                              docs.push('');
                              settingsForm.setValue('accounting.compliance.documentation', docs);
                            }}
                          >
                            Add Documentation
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Compliance Settings
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="ai">
                  <AISettings 
                    organizationId={user?.organizationId}
                    currentSettings={{
                      isEnabled: true, // TODO: Get from organization settings
                      allowPersonalAI: true,
                      allowOrganizationAI: true,
                    }}
                    onSettingsChange={(settings) => {
                      console.log('AI Settings changed:', settings);
                      // TODO: Save to organization settings
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {user?.organization?.settings?.modules?.enabled.includes('blockchain') && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Blockchain Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Wallet Address</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="0x..."
                    value={user?.organization?.walletAddress || ''}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Smart Contract Preferences</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Enable automatic contract deployment
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Enable multi-signature transactions
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Enable gas price optimization
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Network Preferences</label>
                  <select className="w-full p-2 border rounded">
                    <option value="ethereum">Ethereum Mainnet</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          <CustomFieldManager />
        </div>
      </div>
    </div>
  );
} 