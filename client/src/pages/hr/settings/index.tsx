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
    if (!user || !(user.role === 'owner' || user.role === 'hr_admin')) {
      setLocation('/dashboard');
    }
  }, [user]);
  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">HR Module Settings</h1>
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card className="mt-4">
              <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
              <CardContent>
                <p>Configure general HR module settings here. (Coming soon)</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="permissions">
            <Card className="mt-4">
              <CardHeader><CardTitle>Permissions</CardTitle></CardHeader>
              <CardContent>
                <p>Manage HR permissions and access control. (Coming soon)</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card className="mt-4">
              <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
              <CardContent>
                <p>Set up HR notifications and alerts. (Coming soon)</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 