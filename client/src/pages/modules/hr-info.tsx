import { useState, useEffect } from 'react';
import BaseModuleInfo from './base-module-info';
import AnalyticsDashboard, { TimeRange } from '@/components/analytics/analytics-dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Calendar,
  Shield,
  Search
} from 'lucide-react';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { DataTable } from '@/components/ui/data-table';
import { columns, Employee } from '@/pages/hr/columns';
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
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { toast } = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();

  // Check if user has access to HR module
  if (!user?.moduleAccess?.includes('hr') && !user?.isOwner) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access the HR module.</p>
            <Button onClick={() => setLocation('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/mongodb/users');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
                    ? { ...cred, verified: true, blockchainHash: data.blockchainHash }
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
    <BaseModuleInfo
      moduleName="HR Management"
      description="Comprehensive human resources management and analytics"
      icon="users"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      onExportData={handleExportData}
      onGenerateReport={handleGenerateReport}
      onViewRawData={handleViewRawData}
      onRefreshData={handleRefreshData}
    >
      <div className="space-y-6">
        <AnalyticsDashboard
          moduleId="hr"
          moduleName="HR Management"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onExportData={handleExportData}
          onRefresh={handleRefreshData}
          metrics={hrData.metrics}
          dailyStats={hrData.dailyStats}
          topItems={hrData.topDepartments}
          distributionData={hrData.employeeStatus}
          insights={[
            {
              title: 'Employee Growth Trend',
              description: 'Positive growth in engineering department with 5 new hires this month',
              type: 'success'
            },
            {
              title: 'Training Impact',
              description: 'Training hours increased by 15% leading to improved performance metrics',
              type: 'info'
            },
            {
              title: 'Retention Improvement',
              description: 'Turnover rate decreased by 2% due to new retention initiatives',
              type: 'success'
            }
          ]}
        />

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">
              <Users className="mr-2 h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Briefcase className="mr-2 h-4 w-4" />
              Skills & Matching
            </TabsTrigger>
            <TabsTrigger value="credentials">
              <FileText className="mr-2 h-4 w-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="payroll">
              <CreditCard className="mr-2 h-4 w-4" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="timeoff">
              <Calendar className="mr-2 h-4 w-4" />
              Time Off
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Shield className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredEmployees}
                  onRowClick={(employee) => window.location.href = `/users/${employee.id}`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skill Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillMatching
                  projectRequirements={{
                    skills: ['javascript', 'typescript', 'react', 'node.js'],
                    experience: 3
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>Credential Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="space-y-4">
                      <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                      <CredentialVerification
                        credentials={employee.credentials || []}
                        onVerify={(credentialId) => handleVerifyCredential(credentialId, employee.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredEmployees.map((employee) => (
                    <Payroll
                      key={employee.id}
                      employee={employee}
                      onUpdate={async (employeeId, compensation) => {
                        try {
                          const response = await fetch(`/api/hr/${employeeId}/compensation`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              compensation
                            }),
                          });
                          if (!response.ok) throw new Error('Failed to update compensation');
                          const updatedEmployee = await response.json();
                          setEmployees(employees.map(emp => 
                            emp.id === employeeId ? updatedEmployee : emp
                          ));
                        } catch (error) {
                          console.error('Error updating compensation:', error);
                          throw error;
                        }
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tabs content for timeoff and performance */}
        </Tabs>
      </div>
    </BaseModuleInfo>
  );
} 