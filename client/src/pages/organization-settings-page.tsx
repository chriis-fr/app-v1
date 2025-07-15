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
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BackButton } from '@/components/ui/back-button';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { hasFullAccess } from '@/utils/access';
import { AISettings } from '@/components/ai';
import { api } from '@/lib/api';
import axios from 'axios';

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

function CustomFieldManager({ toast }: { toast: any }) {
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
  const { user, setUser, getToken } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(user?.organization?.settings?.branding?.logo || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Add debugging for authentication
  useEffect(() => {
    console.log('=== Organization Settings Page Debug ===');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('User Role:', user?.role);
    console.log('User isOwner:', user?.isOwner);
    console.log('User organizationId:', user?.organizationId);
    console.log('Token from auth hook:', getToken());
    console.log('Token from localStorage:', localStorage.getItem('token'));
    console.log('=====================================');
  }, [user, getToken]);

  // Add a test function to verify authentication
  const testAuthentication = async () => {
    try {
      const token = getToken();
      console.log('Testing authentication with token:', token);
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Auth test response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Auth test user data:', userData);
        toast({
          title: "Authentication Test",
          description: "Authentication is working correctly.",
        });
      } else {
        const errorText = await response.text();
        console.log('Auth test error:', errorText);
        toast({
          title: "Authentication Test Failed",
          description: `Status: ${response.status}, Error: ${errorText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Auth test error:', error);
      toast({
        title: "Authentication Test Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Add a function to force re-authentication
  const forceReAuth = () => {
    console.log('Force re-authentication called');
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  // Check if user is properly authenticated
  const isUserAuthenticated = () => {
    const token = getToken();
    const hasUser = !!user;
    const isOwner = user?.isOwner;
    const isAdmin = user?.role === 'admin';
    const hasOrgId = !!user?.organizationId;
    
    console.log('Authentication check:', {
      hasToken: !!token,
      hasUser,
      isOwner,
      isAdmin,
      hasOrgId
    });
    
    return token && hasUser && (isOwner || isAdmin) && hasOrgId;
  };

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
    // resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      theme: {
        primaryColor: user?.organization?.settings?.theme?.primaryColor || '#2563eb',
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
      ai: {
        isEnabled: user?.organization?.settings?.ai?.isEnabled ?? true,
        allowPersonalAI: user?.organization?.settings?.ai?.allowPersonalAI ?? true,
        allowOrganizationAI: user?.organization?.settings?.ai?.allowOrganizationAI ?? true,
        model: user?.organization?.settings?.ai?.model || 'gpt-3.5-turbo',
        temperature: user?.organization?.settings?.ai?.temperature || 0.7,
        maxTokens: user?.organization?.settings?.ai?.maxTokens || 1000,
        moduleSettings: {
          hr: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.hr?.enabled ?? true,
            canAccessEmployeeData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessEmployeeData ?? true,
            canAccessPayrollData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessPayrollData ?? true,
            canAccessHiringData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessHiringData ?? true,
            canAccessPerformanceData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessPerformanceData ?? true,
          },
          finance: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.finance?.enabled ?? true,
            canAccessFinancialData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessFinancialData ?? true,
            canAccessAccountingData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessAccountingData ?? true,
            canAccessBudgetData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessBudgetData ?? true,
            canAccessTaxData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessTaxData ?? true,
          },
          inventory: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.inventory?.enabled ?? true,
            canAccessStockData: user?.organization?.settings?.ai?.moduleSettings?.inventory?.canAccessStockData ?? true,
            canAccessWarehouseData: user?.organization?.settings?.ai?.moduleSettings?.inventory?.canAccessWarehouseData ?? true,
            canAccessSupplyChainData: user?.organization?.settings?.ai?.moduleSettings?.inventory?.canAccessSupplyChainData ?? true,
          },
          sales: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.sales?.enabled ?? true,
            canAccessCustomerData: user?.organization?.settings?.ai?.moduleSettings?.sales?.canAccessCustomerData ?? true,
            canAccessSalesData: user?.organization?.settings?.ai?.moduleSettings?.sales?.canAccessSalesData ?? true,
            canAccessCRMData: user?.organization?.settings?.ai?.moduleSettings?.sales?.canAccessCRMData ?? true,
          },
          general: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.general?.enabled ?? true,
            canAccessGeneralData: user?.organization?.settings?.ai?.moduleSettings?.general?.canAccessGeneralData ?? true,
            canAccessAnalyticsData: user?.organization?.settings?.ai?.moduleSettings?.general?.canAccessAnalyticsData ?? true,
          },
        },
      },
    },
  });

  const aiSettingsForm = useForm({
    defaultValues: {
      ai: {
        isEnabled: user?.organization?.settings?.ai?.isEnabled ?? true,
        allowPersonalAI: user?.organization?.settings?.ai?.allowPersonalAI ?? true,
        allowOrganizationAI: user?.organization?.settings?.ai?.allowOrganizationAI ?? true,
        model: user?.organization?.settings?.ai?.model || 'gpt-3.5-turbo',
        temperature: user?.organization?.settings?.ai?.temperature || 0.7,
        maxTokens: user?.organization?.settings?.ai?.maxTokens || 1000,
        moduleSettings: {
          hr: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.hr?.enabled ?? true,
            canAccessEmployeeData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessEmployeeData ?? true,
            canAccessPayrollData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessPayrollData ?? true,
            canAccessHiringData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessHiringData ?? true,
            canAccessPerformanceData: user?.organization?.settings?.ai?.moduleSettings?.hr?.canAccessPerformanceData ?? true,
          },
          finance: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.finance?.enabled ?? true,
            canAccessFinancialData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessFinancialData ?? true,
            canAccessAccountingData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessAccountingData ?? true,
            canAccessBudgetData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessBudgetData ?? true,
            canAccessTaxData: user?.organization?.settings?.ai?.moduleSettings?.finance?.canAccessTaxData ?? true,
          },
          inventory: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.inventory?.enabled ?? true,
            canAccessStockData: user?.organization?.settings?.ai?.moduleSettings?.inventory?.canAccessStockData ?? true,
            canAccessWarehouseData: user?.organization?.settings?.ai?.moduleSettings?.inventory?.canAccessWarehouseData ?? true,
            canAccessSupplyChainData: user?.organization?.settings?.ai?.moduleSettings?.inventory?.canAccessSupplyChainData ?? true,
          },
          sales: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.sales?.enabled ?? true,
            canAccessCustomerData: user?.organization?.settings?.ai?.moduleSettings?.sales?.canAccessCustomerData ?? true,
            canAccessSalesData: user?.organization?.settings?.ai?.moduleSettings?.sales?.canAccessSalesData ?? true,
            canAccessCRMData: user?.organization?.settings?.ai?.moduleSettings?.sales?.canAccessCRMData ?? true,
          },
          general: {
            enabled: user?.organization?.settings?.ai?.moduleSettings?.general?.enabled ?? true,
            canAccessGeneralData: user?.organization?.settings?.ai?.moduleSettings?.general?.canAccessGeneralData ?? true,
            canAccessAnalyticsData: user?.organization?.settings?.ai?.moduleSettings?.general?.canAccessAnalyticsData ?? true,
          },
        },
      },
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
      console.log('=== onSubmit called ===');
      console.log('Organization data received:', data);
      
      // Check if user is properly authenticated
      if (!isUserAuthenticated()) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to update organization info.",
          variant: "destructive",
        });
        return;
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get authentication token
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('About to make api request for organization info...');
      
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      console.log('Fetch request completed');
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(`Failed to update organization: ${response.status} ${errorText}`);
      }

      const updatedOrganization = await response.json();
      console.log('Response data:', updatedOrganization);
      
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          organization: updatedOrganization
        };
      });
      
      toast({
        title: "Organization Info saved",
        description: "Your organization information has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update organization info. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a function to save general settings (everything except AI)
  const onGeneralSettingsSubmit = async (data: any) => {
    try {
      setIsSavingSettings(true);
      console.log('=== onGeneralSettingsSubmit called ===');
      console.log('General settings data received:', data);
      
      // Check if user is properly authenticated
      if (!isUserAuthenticated()) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to update settings.",
          variant: "destructive",
        });
        return;
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('About to make api request for general settings...');
      
      // Get current settings and merge with general settings (excluding AI)
      const currentSettings = user?.organization?.settings || {};
      const { ai, ...generalSettings } = data; // Exclude AI settings
      const updatedSettings = {
        ...currentSettings,
        ...generalSettings // This includes theme, branding, modules, etc.
      };
      
      console.log('Updated general settings to send:', updatedSettings);
      
      // Use the auth hook's getToken function
      const token = getToken();
      console.log('Token from auth hook:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token?.length);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Use fetch with manual token handling like the auth hook
      const response = await fetch('/api/organization/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: updatedSettings
        })
      });

      console.log('Fetch request completed');
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        
        if (response.status === 401) {
          // Token might be expired, redirect to login
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(`Failed to update general settings: ${response.status} ${errorText}`);
      }

      const updatedOrganization = await response.json();
      console.log('Response data:', updatedOrganization);
      
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          organization: updatedOrganization
        };
      });
      
      toast({
        title: "General Settings saved",
        description: "Your general settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating general settings:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        response: error?.response?.data
      });
      toast({
        title: "Error",
        description: error?.response?.data?.error || error?.message || "Failed to update general settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Modify the existing AI settings save function to be more specific
  const onAISettingsSubmit = async (data: any) => {
    try {
      setIsSavingSettings(true);
      console.log('=== onAISettingsSubmit called ===');
      console.log('AI settings data received:', data);
      
      // Check if user is properly authenticated
      if (!isUserAuthenticated()) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to update settings.",
          variant: "destructive",
        });
        return;
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('About to make api request for AI settings...');
      
      // Get current settings and merge with AI settings only
      const currentSettings = user?.organization?.settings || {};
      const updatedSettings = {
        ...currentSettings,
        ai: data.ai // Only update the AI section
      };
      
      console.log('Updated AI settings to send:', updatedSettings);
      
      // Use the auth hook's getToken function
      const token = getToken();
      console.log('Token from auth hook:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token?.length);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Use fetch with manual token handling like the auth hook
      const response = await fetch('/api/organization/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: updatedSettings
        })
      });

      console.log('Fetch request completed');
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        
        if (response.status === 401) {
          // Token might be expired, redirect to login
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(`Failed to update AI settings: ${response.status} ${errorText}`);
      }

      const updatedOrganization = await response.json();
      console.log('Response data:', updatedOrganization);
      
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          organization: updatedOrganization
        };
      });
      
      toast({
        title: "AI Settings saved",
        description: "Your AI settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating AI settings:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        response: error?.response?.data
      });
      toast({
        title: "Error",
        description: error?.response?.data?.error || error?.message || "Failed to update AI settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
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

          {/* Debug Information - Only show when not authenticated */}
          {!isUserAuthenticated() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Debug Information</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>User ID: {user?.id || 'Not set'}</p>
                <p>User Role: {user?.role || 'Not set'}</p>
                <p>Is Owner: {user?.isOwner ? 'Yes' : 'No'}</p>
                <p>Is Admin: {user?.role === 'admin' ? 'Yes' : 'No'}</p>
                <p>Organization ID: {user?.organizationId || 'Not set'}</p>
                <p>Token: {getToken() ? 'Present' : 'Missing'}</p>
                <p>Authentication Status: {isUserAuthenticated() ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
              </div>
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <p className="font-semibold">⚠️ Authentication Issues Detected:</p>
                <ul className="list-disc list-inside mt-1">
                  {!getToken() && <li>Missing authentication token</li>}
                  {!user && <li>No user data available</li>}
                  {user && !user.isOwner && user?.role !== 'admin' && <li>User is not an owner or admin</li>}
                  {user && !user.organizationId && <li>No organization ID</li>}
                </ul>
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={testAuthentication} 
                  variant="outline" 
                  size="sm"
                >
                  Test Authentication
                </Button>
                <Button 
                  onClick={forceReAuth} 
                  variant="destructive" 
                  size="sm"
                >
                  Force Re-Login
                </Button>
              </div>
            </div>
          )}

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
                    <Label htmlFor="type">Business Type</Label>
                    <Select
                      value={form.watch('type')}
                      onValueChange={(value) => form.setValue('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Business Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sme">Small & Medium Enterprise</SelectItem>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="ngo">Non-Governmental Organization</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="business">General Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={form.watch('industry')}
                      onValueChange={(value) => form.setValue('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="nonprofit">Non-Profit</SelectItem>
                        <SelectItem value="professional_services">Professional Services</SelectItem>
                        <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                        <SelectItem value="telecommunications">Telecommunications</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select
                      value={form.watch('size')}
                      onValueChange={(value) => form.setValue('size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Company Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <form onSubmit={settingsForm.handleSubmit(onGeneralSettingsSubmit)} className="space-y-6">
                <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme & Branding Colors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                    <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</Label>
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer"
                                style={{ backgroundColor: settingsForm.watch('theme.primaryColor') }}
                                onClick={() => document.getElementById('primaryColor')?.click()}
                              />
                              <Input 
                                id="primaryColor" 
                                type="color" 
                                className="w-16 h-10 cursor-pointer"
                                {...settingsForm.register('theme.primaryColor')} 
                              />
                              <Input 
                                type="text" 
                                value={settingsForm.watch('theme.primaryColor')}
                                onChange={(e) => settingsForm.setValue('theme.primaryColor', e.target.value)}
                                className="flex-1"
                                placeholder="#2563eb"
                              />
                    </div>
                            <p className="text-xs text-muted-foreground">
                              This color is used for buttons, links, and primary actions
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                    <div className="space-y-2">
                            <Label htmlFor="secondaryColor" className="text-sm font-medium">Secondary Color</Label>
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer"
                                style={{ backgroundColor: settingsForm.watch('theme.secondaryColor') }}
                                onClick={() => document.getElementById('secondaryColor')?.click()}
                              />
                              <Input 
                                id="secondaryColor" 
                                type="color" 
                                className="w-16 h-10 cursor-pointer"
                                {...settingsForm.register('theme.secondaryColor')} 
                              />
                              <Input 
                                type="text" 
                                value={settingsForm.watch('theme.secondaryColor')}
                                onChange={(e) => settingsForm.setValue('theme.secondaryColor', e.target.value)}
                                className="flex-1"
                                placeholder="#ffffff"
                              />
                    </div>
                            <p className="text-xs text-muted-foreground">
                              This color is used for backgrounds and secondary elements
                            </p>
                  </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-3">Color Preview</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div 
                              className="h-8 rounded-md"
                              style={{ backgroundColor: settingsForm.watch('theme.primaryColor') }}
                            />
                            <p className="text-xs text-center">Primary Color</p>
                          </div>
                          <div className="space-y-2">
                            <div 
                              className="h-8 rounded-md border"
                              style={{ backgroundColor: settingsForm.watch('theme.secondaryColor') }}
                            />
                            <p className="text-xs text-center">Secondary Color</p>
                          </div>
                          <div className="space-y-2">
                            <Button 
                              className="w-full"
                              style={{ backgroundColor: settingsForm.watch('theme.primaryColor') }}
                            >
                              Sample Button
                            </Button>
                            <p className="text-xs text-center">Button Preview</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-3">Quick Color Presets</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { name: 'Blue', primary: '#2563eb', secondary: '#ffffff' },
                            { name: 'Purple', primary: '#7c3aed', secondary: '#ffffff' },
                            { name: 'Green', primary: '#059669', secondary: '#ffffff' },
                            { name: 'Orange', primary: '#ea580c', secondary: '#ffffff' },
                            { name: 'Red', primary: '#dc2626', secondary: '#ffffff' },
                            { name: 'Teal', primary: '#0d9488', secondary: '#ffffff' },
                            { name: 'Indigo', primary: '#4f46e5', secondary: '#ffffff' },
                            { name: 'Pink', primary: '#db2777', secondary: '#ffffff' }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                              onClick={() => {
                                settingsForm.setValue('theme.primaryColor', preset.primary);
                                settingsForm.setValue('theme.secondaryColor', preset.secondary);
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: preset.primary }}
                                />
                                <span className="text-xs font-medium">{preset.name}</span>
                              </div>
                            </button>
                          ))}
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

                    <Button type="submit" className="w-full" disabled={isSavingSettings}>
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Settings...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                </Button>
              </form>
                </TabsContent>

                <TabsContent value="accounting">
                  <form onSubmit={settingsForm.handleSubmit(onGeneralSettingsSubmit)} className="space-y-6">
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
                  <form onSubmit={settingsForm.handleSubmit(onGeneralSettingsSubmit)} className="space-y-6">
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
                  <form onSubmit={settingsForm.handleSubmit(onGeneralSettingsSubmit)} className="space-y-6">
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
                  <form onSubmit={settingsForm.handleSubmit(onGeneralSettingsSubmit)} className="space-y-6">
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
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log('AI form submitted');
                    const formData = aiSettingsForm.getValues();
                    console.log('AI form data:', formData);
                    onAISettingsSubmit(formData);
                  }} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">AI Assistant Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="aiEnabled">Enable AI Assistant</Label>
                            <p className="text-sm text-muted-foreground">Allow AI features throughout the application</p>
                          </div>
                          <Switch
                            id="aiEnabled"
                            checked={aiSettingsForm.watch('ai.isEnabled')}
                            onCheckedChange={(checked) => aiSettingsForm.setValue('ai.isEnabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="personalAI">Allow Personal AI</Label>
                            <p className="text-sm text-muted-foreground">Users can use AI for personal assistance</p>
                          </div>
                          <Switch
                            id="personalAI"
                            checked={aiSettingsForm.watch('ai.allowPersonalAI')}
                            onCheckedChange={(checked) => aiSettingsForm.setValue('ai.allowPersonalAI', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="organizationAI">Allow Organization AI</Label>
                            <p className="text-sm text-muted-foreground">AI can access organization-wide data</p>
                          </div>
                          <Switch
                            id="organizationAI"
                            checked={aiSettingsForm.watch('ai.allowOrganizationAI')}
                            onCheckedChange={(checked) => aiSettingsForm.setValue('ai.allowOrganizationAI', checked)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-md font-medium">AI Model Configuration</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="aiModel">Model</Label>
                            <Select
                              value={aiSettingsForm.watch('ai.model')}
                              onValueChange={(value) => aiSettingsForm.setValue('ai.model', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="claude-3">Claude 3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="aiTemperature">Temperature</Label>
                            <Input 
                              id="aiTemperature" 
                              type="number" 
                              step="0.1"
                              min="0"
                              max="2"
                              {...aiSettingsForm.register('ai.temperature')} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="aiMaxTokens">Max Tokens</Label>
                            <Input 
                              id="aiMaxTokens" 
                              type="number" 
                              {...aiSettingsForm.register('ai.maxTokens')} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-md font-medium">Module-Specific AI Settings</h4>
                        
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label>HR Module AI</Label>
                              <Switch
                                checked={aiSettingsForm.watch('ai.moduleSettings.hr.enabled')}
                                onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.hr.enabled', checked)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.hr.canAccessEmployeeData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.hr.canAccessEmployeeData', checked)}
                                />
                                <span>Employee Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.hr.canAccessPayrollData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.hr.canAccessPayrollData', checked)}
                                />
                                <span>Payroll Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.hr.canAccessHiringData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.hr.canAccessHiringData', checked)}
                                />
                                <span>Hiring Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.hr.canAccessPerformanceData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.hr.canAccessPerformanceData', checked)}
                                />
                                <span>Performance Data</span>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label>Finance Module AI</Label>
                              <Switch
                                checked={aiSettingsForm.watch('ai.moduleSettings.finance.enabled')}
                                onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.finance.enabled', checked)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.finance.canAccessFinancialData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.finance.canAccessFinancialData', checked)}
                                />
                                <span>Financial Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.finance.canAccessAccountingData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.finance.canAccessAccountingData', checked)}
                                />
                                <span>Accounting Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.finance.canAccessBudgetData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.finance.canAccessBudgetData', checked)}
                                />
                                <span>Budget Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.finance.canAccessTaxData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.finance.canAccessTaxData', checked)}
                                />
                                <span>Tax Data</span>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label>Inventory Module AI</Label>
                              <Switch
                                checked={aiSettingsForm.watch('ai.moduleSettings.inventory.enabled')}
                                onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.inventory.enabled', checked)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.inventory.canAccessStockData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.inventory.canAccessStockData', checked)}
                                />
                                <span>Stock Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.inventory.canAccessWarehouseData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.inventory.canAccessWarehouseData', checked)}
                                />
                                <span>Warehouse Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.inventory.canAccessSupplyChainData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.inventory.canAccessSupplyChainData', checked)}
                                />
                                <span>Supply Chain Data</span>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label>Sales Module AI</Label>
                              <Switch
                                checked={aiSettingsForm.watch('ai.moduleSettings.sales.enabled')}
                                onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.sales.enabled', checked)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.sales.canAccessCustomerData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.sales.canAccessCustomerData', checked)}
                                />
                                <span>Customer Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.sales.canAccessSalesData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.sales.canAccessSalesData', checked)}
                                />
                                <span>Sales Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.sales.canAccessCRMData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.sales.canAccessCRMData', checked)}
                                />
                                <span>CRM Data</span>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label>General AI</Label>
                              <Switch
                                checked={aiSettingsForm.watch('ai.moduleSettings.general.enabled')}
                                onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.general.enabled', checked)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.general.canAccessGeneralData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.general.canAccessGeneralData', checked)}
                                />
                                <span>General Data</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={aiSettingsForm.watch('ai.moduleSettings.general.canAccessAnalyticsData')}
                                  onCheckedChange={(checked) => aiSettingsForm.setValue('ai.moduleSettings.general.canAccessAnalyticsData', checked)}
                                />
                                <span>Analytics Data</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSavingSettings}>
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving AI Settings...
                        </>
                      ) : (
                        'Save AI Settings'
                      )}
                    </Button>
                    
                    {/* Test button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          console.log('Testing API connection...');
                          const response = await fetch('/api/test', {
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            },
                          });
                          const data = await response.json();
                          console.log('Test response:', data);
                          toast({
                            title: "API Test",
                            description: "API is working: " + JSON.stringify(data),
                          });
                        } catch (error) {
                          console.error('API test failed:', error);
                          toast({
                            title: "API Test Failed",
                            description: "Error: " + error,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Test API Connection
                    </Button>
                  </form>
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

                          <CustomFieldManager toast={toast} />
        </div>
      </div>
    </div>
  );
} 