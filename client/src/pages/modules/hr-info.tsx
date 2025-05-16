import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { 
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Calendar,
  Shield,
  Settings,
  BarChart,
  UserPlus,
  Clock
} from 'lucide-react';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { DataTable } from '@/components/ui/data-table';
import { columns, Employee, Credential } from '@/pages/hr/columns';
import { Payroll } from '@/components/hr/Payroll';

// Dummy data for HR metrics
const hrData = {
  dailyStats: [
    { date: '2024-03-01', value: 150 },
    { date: '2024-03-02', value: 155 },
    { date: '2024-03-03', value: 148 },
    { date: '2024-03-04', value: 162 },
    { date: '2024-03-05', value: 158 },
    { date: '2024-03-06', value: 165 },
    { date: '2024-03-07', value: 170 }
  ],
  topDepartments: [
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 35 },
    { name: 'Marketing', value: 25 },
    { name: 'Operations', value: 20 },
    { name: 'Finance', value: 15 }
  ],
  employeeStatus: [
    { name: 'Active', value: 85 },
    { name: 'On Leave', value: 10 },
    { name: 'Training', value: 5 }
  ],
  metrics: [
    { name: 'Total Employees', value: 250, change: '+5%', trend: 'up' as const },
    { name: 'Average Tenure', value: '3.2 years', change: '+0.3', trend: 'up' as const },
    { name: 'Turnover Rate', value: '8.5%', change: '-2%', trend: 'down' as const },
    { name: 'Training Hours', value: '24.5', change: '+3.2', trend: 'up' as const }
  ]
};

export default function HRInfoPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    // Check if user is owner or in executive department
    const isAuthorized = user.role === 'owner' || 
                        (user.department?.toLowerCase() === 'executive' && user.moduleAccess?.includes('hr'));

    if (!isAuthorized) {
      toast({
        title: 'Access Denied',
        description: 'Only owners and executive department members can access this page.',
        variant: 'destructive',
      });
      setLocation('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleVerifyCredential = async (credentialId: string, userId: string) => {
    try {
      const response = await fetch('/api/hr/verify-credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialId,
          userId
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(employees.map(emp => 
          emp.id === userId
            ? {
                ...emp,
                credentials: emp.credentials?.map(cred => 
                  cred.id === credentialId 
                    ? { 
                        ...cred, 
                        verified: true, 
                        blockchainHash: data.blockchainHash,
                        title: cred.title,
                        issuer: cred.issuer,
                        date: cred.date
                      }
                    : cred
                )
              }
            : emp
        ));
        toast({
          title: 'Success',
          description: 'Credential verified successfully',
        });
      }
    } catch (error) {
      console.error('Error verifying credential:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify credential',
        variant: 'destructive',
      });
    }
  };

  const filteredEmployees = employees.filter(employee => 
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportData = () => {
    console.log('Exporting HR data...');
  };

  const handleGenerateReport = () => {
    console.log('Generating HR report...');
  };

  const handleViewRawData = () => {
    console.log('Viewing raw HR data...');
  };

  const handleRefreshData = () => {
    console.log('Refreshing HR data...');
  };

  return (
    <div className="flex h-screen">
      <CompactSidebar />
      <div className="flex-1 ml-20">
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">HR Module Management</h1>
            <Button onClick={() => setLocation('/hr')}>
              <Users className="mr-2 h-4 w-4" />
              View HR Dashboard
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="mr-2 h-4 w-4" />
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger value="workflows">
                <Briefcase className="mr-2 h-4 w-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Module Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Total Employees</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Active Departments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pending Approvals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Module Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">General Settings</h3>
                      <p className="text-muted-foreground">
                        Configure general HR module settings and preferences
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Integration Settings</h3>
                      <p className="text-muted-foreground">
                        Manage integrations with other modules and external services
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Notification Settings</h3>
                      <p className="text-muted-foreground">
                        Configure notification preferences for HR-related events
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              <Card>
                <CardHeader>
                  <CardTitle>Roles & Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">HR Roles</h3>
                      <p className="text-muted-foreground">
                        Manage HR-specific roles and their permissions
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Access Control</h3>
                      <p className="text-muted-foreground">
                        Configure access levels for different HR functions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflows">
              <Card>
                <CardHeader>
                  <CardTitle>HR Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Approval Workflows</h3>
                      <p className="text-muted-foreground">
                        Configure approval processes for HR operations
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Automation Rules</h3>
                      <p className="text-muted-foreground">
                        Set up automated HR processes and notifications
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>HR Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Standard Reports</h3>
                      <p className="text-muted-foreground">
                        Access and configure standard HR reports
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Custom Reports</h3>
                      <p className="text-muted-foreground">
                        Create and manage custom HR reports
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 