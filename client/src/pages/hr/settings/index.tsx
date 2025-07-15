import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HRSettingsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState('general');
  
  useEffect(() => {
    console.log('HR Settings Page - User:', user);
    console.log('HR Settings Page - User role:', user?.role);
    console.log('HR Settings Page - User isOwner:', user?.isOwner);
    
    if (!user) {
      console.log('HR Settings Page - No user, redirecting to dashboard');
      setLocation('/dashboard');
      return;
    }
    
    const hasAccess = user.role === 'owner' || user.role === 'hr_admin' || user.role === 'admin';
    console.log('HR Settings Page - Has access:', hasAccess);
    
    if (!hasAccess) {
      console.log('HR Settings Page - No access, redirecting to dashboard');
      setLocation('/dashboard');
      return;
    }
    
    console.log('HR Settings Page - Access granted');
  }, [user, setLocation]);
  
  // Show loading while checking access
  if (!user) {
    return (
      <ModuleLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </ModuleLayout>
    );
  }
  
  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">HR Module Settings</h1>
        <p className="text-muted-foreground mb-6">
          Configure HR module settings, permissions, and notifications for your organization.
        </p>
        
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">HR Module Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure general HR module settings, employee data fields, and default values.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Coming Soon:</strong> General HR settings configuration will be available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Permissions & Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Role-Based Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage who can access different HR functions and data.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Coming Soon:</strong> Permission management interface will be available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Notifications & Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">HR Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure email notifications, alerts, and reminders for HR events.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Coming Soon:</strong> Notification settings will be available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="policies">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>HR Policies & Procedures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Policy Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Define and manage HR policies, procedures, and compliance requirements.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>Coming Soon:</strong> Policy management tools will be available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Integrations & APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Third-Party Integrations</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect HR module with external services, payroll providers, and HR tools.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      <strong>Coming Soon:</strong> Integration settings will be available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 