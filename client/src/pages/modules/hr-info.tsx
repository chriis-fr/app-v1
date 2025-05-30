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
  Clock,
  Network,
  Layers,
  Target,
  PersonStanding,
  UserX,
  DollarSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [moduleSettings, setModuleSettings] = useState({
    enableAutomation: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableDocumentManagement: true,
    enableWorkflowApprovals: true,
    defaultLanguage: 'en',
    timeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    enableAuditLogging: true,
    enableDataExport: true,
    enableIntegration: true
  });

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

  const handleSettingChange = (setting: string, value: any) => {
    setModuleSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="flex h-screen">
      <CompactSidebar />
      <div className="flex-1 ml-20">
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">HR Module Management</h1>
            <div className="space-x-2">
            <Button onClick={() => setLocation('/hr')}>
              <Users className="mr-2 h-4 w-4" />
              View HR Dashboard
            </Button>
              <Button onClick={() => setLocation('/dashboard/hr/reports')}>
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>
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
              <TabsTrigger value="integrations">
                <Network className="mr-2 h-4 w-4" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {hrData.metrics.map((metric, index) => (
                  <Card key={index}>
                <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {metric.name}
                      </CardTitle>
                </CardHeader>
                <CardContent>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change}
                      </p>
                      </CardContent>
                    </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <Card>
                      <CardHeader>
                    <CardTitle>Department Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                    <div className="space-y-4">
                      {hrData.topDepartments.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{dept.name}</span>
                          <span className="font-medium">{dept.value} employees</span>
                        </div>
                      ))}
                    </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                    <CardTitle>Employee Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                    <div className="space-y-4">
                      {hrData.employeeStatus.map((status, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{status.name}</span>
                          <span className="font-medium">{status.value}%</span>
                        </div>
                      ))}
                    </div>
                      </CardContent>
                    </Card>
                  </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Module Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">General Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableAutomation">Enable Automation</Label>
                            <Switch
                              id="enableAutomation"
                              checked={moduleSettings.enableAutomation}
                              onCheckedChange={(checked) => handleSettingChange('enableAutomation', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableNotifications">Enable Notifications</Label>
                            <Switch
                              id="enableNotifications"
                              checked={moduleSettings.enableNotifications}
                              onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableAnalytics">Enable Analytics</Label>
                            <Switch
                              id="enableAnalytics"
                              checked={moduleSettings.enableAnalytics}
                              onCheckedChange={(checked) => handleSettingChange('enableAnalytics', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Display Settings</h3>
                  <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="defaultLanguage">Default Language</Label>
                            <Select
                              value={moduleSettings.defaultLanguage}
                              onValueChange={(value) => handleSettingChange('defaultLanguage', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timeZone">Time Zone</Label>
                            <Select
                              value={moduleSettings.timeZone}
                              onValueChange={(value) => handleSettingChange('timeZone', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="EST">EST</SelectItem>
                                <SelectItem value="PST">PST</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <Select
                              value={moduleSettings.dateFormat}
                              onValueChange={(value) => handleSettingChange('dateFormat', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Security Settings</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enableAuditLogging">Enable Audit Logging</Label>
                          <Switch
                            id="enableAuditLogging"
                            checked={moduleSettings.enableAuditLogging}
                            onCheckedChange={(checked) => handleSettingChange('enableAuditLogging', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enableDataExport">Enable Data Export</Label>
                          <Switch
                            id="enableDataExport"
                            checked={moduleSettings.enableDataExport}
                            onCheckedChange={(checked) => handleSettingChange('enableDataExport', checked)}
                          />
                        </div>
                    </div>
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
                  <div className="space-y-6">
                  <div className="space-y-4">
                      <h3 className="text-lg font-medium">HR Roles</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>HR Admin</Label>
                          <p className="text-sm text-muted-foreground">
                            Full access to all HR functions and settings
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>HR Manager</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to employee management and reporting
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>HR Assistant</Label>
                          <p className="text-sm text-muted-foreground">
                            Basic access to employee records and attendance
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Payroll Manager</Label>
                          <p className="text-sm text-muted-foreground">
                            Access to payroll and compensation management
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Access Control</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Employee Records</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">View Records</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Edit Records</span>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Delete Records</span>
                              <Switch />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Payroll Management</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">View Payroll</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Process Payroll</span>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Approve Payments</span>
                              <Switch />
                            </div>
                          </div>
                        </div>
                      </div>
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
                  <div className="space-y-6">
                  <div className="space-y-4">
                      <h3 className="text-lg font-medium">Approval Workflows</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Leave Requests</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Manager Approval</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">HR Approval</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Auto-approve for short leaves</span>
                              <Switch />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Expense Claims</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Manager Approval</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Finance Approval</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Auto-approve small amounts</span>
                              <Switch />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Automation Rules</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Employee Onboarding</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Auto-assign equipment</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Schedule orientation</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Send welcome emails</span>
                              <Switch defaultChecked />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Offboarding</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Collect equipment</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Schedule exit interview</span>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Send farewell emails</span>
                              <Switch defaultChecked />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Module Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                  <div className="space-y-4">
                      <h3 className="text-lg font-medium">Available Integrations</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Payroll Systems</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">ADP</span>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Paychex</span>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Gusto</span>
                              <Switch />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Time Tracking</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Toggl</span>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Time Doctor</span>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Clockify</span>
                              <Switch />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">API Configuration</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input id="apiKey" type="password" placeholder="Enter API key" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apiSecret">API Secret</Label>
                          <Input id="apiSecret" type="password" placeholder="Enter API secret" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enableIntegration">Enable API Integration</Label>
                          <Switch
                            id="enableIntegration"
                            checked={moduleSettings.enableIntegration}
                            onCheckedChange={(checked) => handleSettingChange('enableIntegration', checked)}
                          />
                        </div>
                      </div>
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