import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSettingsSchema, OrganizationSettings } from '../../../shared/schema';
import { Camera, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { BackButton } from '@/components/ui/back-button';

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

  if (!user) {
    setLocation('/auth');
    return <div>Redirecting...</div>;
  }

  if (user.role !== 'admin' && user.role !== 'owner') {
    setLocation('/dashboard');
    return <div>Access denied. Redirecting...</div>;
  }

  return (
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
          <div className="flex flex-col sm:flex-row items-center gap-6">
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
                <Input id="country" {...form.register('country')} />
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
                <Input id="darkMode" type="checkbox" {...settingsForm.register('theme.darkMode')} />
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
                <Input id="twoFactorAuth" type="checkbox" {...settingsForm.register('security.twoFactorAuth')} />
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
                <Input id="emailNotifications" type="checkbox" {...settingsForm.register('notifications.email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <Input id="pushNotifications" type="checkbox" {...settingsForm.register('notifications.push')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <Input id="smsNotifications" type="checkbox" {...settingsForm.register('notifications.sms')} />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 