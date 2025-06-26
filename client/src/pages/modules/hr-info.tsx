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
import { hasFullAccess, hasModuleAccess } from '@/utils/access';

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
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    training: 0,
    turnoverRate: 0,
  });

  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    // Check if user is owner or in executive department
    const isAuthorized = hasFullAccess(user) || hasModuleAccess(user, 'hr');

    if (!isAuthorized) {
      toast({
        title: 'Access Denied',
        description: 'Only owners and executive department members can access this page.',
        variant: 'destructive',
      });
      setLocation('/dashboard');
      return;
    }

    async function fetchEmployees() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/hr/employees');
        const data = await res.json();
        setEmployees(data);
        // Calculate metrics
        const totalEmployees = data.length;
        const activeEmployees = data.filter((e: any) => e.status === 'active').length;
        const onLeave = data.filter((e: any) => e.status === 'on_leave').length;
        const training = data.filter((e: any) => e.status === 'training').length;
        // Example: turnoverRate (set to 0 or calculate if you have data)
        setMetrics({
          totalEmployees,
          activeEmployees,
          onLeave,
          training,
          turnoverRate: 0,
        });
      } catch (e) {
        setEmployees([]);
        setMetrics({
          totalEmployees: 0,
          activeEmployees: 0,
          onLeave: 0,
          training: 0,
          turnoverRate: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmployees();
  }, []);

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
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 gap-y-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card className={metrics.totalEmployees === 0 ? 'bg-gray-50 border-dashed border-2 border-gray-200' : ''}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      Total Employees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.totalEmployees === 0 ? (
                      <div className="flex flex-col items-center text-gray-400">
                        <div className="text-lg font-bold">0</div>
                        <div className="text-xs mt-1">No employees yet</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
                    )}
                  </CardContent>
                </Card>
                <Card className={metrics.totalEmployees === 0 ? 'bg-gray-50 border-dashed border-2 border-gray-200' : ''}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      Active Employees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.totalEmployees === 0 ? (
                      <div className="flex flex-col items-center text-gray-400">
                        <div className="text-lg font-bold">0</div>
                        <div className="text-xs mt-1">No employees yet</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">{metrics.activeEmployees}</div>
                    )}
                  </CardContent>
                </Card>
                <Card className={metrics.totalEmployees === 0 ? 'bg-gray-50 border-dashed border-2 border-gray-200' : ''}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      On Leave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.totalEmployees === 0 ? (
                      <div className="flex flex-col items-center text-gray-400">
                        <div className="text-lg font-bold">0</div>
                        <div className="text-xs mt-1">No employees yet</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">{metrics.onLeave}</div>
                    )}
                  </CardContent>
                </Card>
                <Card className={metrics.totalEmployees === 0 ? 'bg-gray-50 border-dashed border-2 border-gray-200' : ''}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.totalEmployees === 0 ? (
                      <div className="flex flex-col items-center text-gray-400">
                        <div className="text-lg font-bold">0</div>
                        <div className="text-xs mt-1">No employees yet</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">{metrics.training}</div>
                    )}
                  </CardContent>
                </Card>
                <Card className={metrics.totalEmployees === 0 ? 'bg-gray-50 border-dashed border-2 border-gray-200' : ''}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      Turnover Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.totalEmployees === 0 ? (
                      <div className="flex flex-col items-center text-gray-400">
                        <div className="text-lg font-bold">0%</div>
                        <div className="text-xs mt-1">No employees yet</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">{metrics.turnoverRate}%</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employees.length === 0 ? (
                        <div className="text-gray-400 text-center">No employees yet</div>
                      ) : (
                        Object.entries(employees.reduce((acc, emp) => {
                          acc[emp.department] = (acc[emp.department] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)).map(([name, value], index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{name}</span>
                            <span className="font-medium">{value} employees</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employees.length === 0 ? (
                        <div className="text-gray-400 text-center">No employees yet</div>
                      ) : (
                        Object.entries(employees.reduce((acc, emp) => {
                          acc[emp.status] = (acc[emp.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)).map(([name, value], index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{name.replace('_', ' ')}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))
                      )}
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