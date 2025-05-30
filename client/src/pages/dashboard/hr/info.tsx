import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Calendar,
  Shield,
  Plus,
  Search,
  BarChart,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { DataTable } from '@/components/ui/data-table';
import { columns, Employee } from '@/pages/hr/columns';
import { Payroll } from '@/components/hr/Payroll';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DepartmentDistribution {
  name: string;
  value: number;
}

interface RecentActivity {
  type: 'new_hire' | 'leave_request' | 'promotion';
  name: string;
  department: string;
  time: string;
}

interface DataAccessInfo {
  lastUpdated: Date;
  lastAccessed: Date;
  department: string;
}

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  pendingApprovals: number;
  departmentDistribution: DepartmentDistribution[];
  recentActivity: RecentActivity[];
  dataAccess: Record<string, DataAccessInfo>;
}

export default function HRInfo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState<HRMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    pendingApprovals: 0,
    departmentDistribution: [],
    recentActivity: [],
    dataAccess: {}
  });

  useEffect(() => {
    if (!user || !user.moduleAccess?.includes('hr')) {
      setLocation('/dashboard');
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch employees
      const employeesResponse = await fetch('/api/mongodb/users');
      if (!employeesResponse.ok) throw new Error('Failed to fetch employees');
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

      // Calculate metrics from real data
      const activeEmployees = employeesData.filter((emp: Employee) => emp.status === 'active').length;
      const onLeave = employeesData.filter((emp: Employee) => emp.status === 'on_leave').length;
      
      // Calculate department distribution
      const departmentCounts = employeesData.reduce((acc: Record<string, number>, emp: Employee) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {});

      const departmentDistribution: DepartmentDistribution[] = Object.entries(departmentCounts).map(([name, value]) => ({
        name,
        value: value as number
      }));

      // Get recent activity from employees data
      const recentActivity: RecentActivity[] = employeesData
        .sort((a: Employee, b: Employee) => 
          new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
        )
        .slice(0, 5)
        .map((emp: Employee) => ({
          type: 'new_hire' as const,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          time: new Date(emp.joinDate).toLocaleDateString()
        }));

      // Track data access for each department
      const dataAccess: Record<string, DataAccessInfo> = {};
      employeesData.forEach((emp: Employee) => {
        if (!dataAccess[emp.department]) {
          dataAccess[emp.department] = {
            lastUpdated: new Date(emp.joinDate),
            lastAccessed: new Date(emp.joinDate),
            department: emp.department
          };
        } else {
          // Update timestamps if newer
          const currentLastUpdated = new Date(emp.joinDate);
          
          if (currentLastUpdated > dataAccess[emp.department].lastUpdated) {
            dataAccess[emp.department].lastUpdated = currentLastUpdated;
            dataAccess[emp.department].lastAccessed = currentLastUpdated;
          }
        }
      });

      setMetrics({
        totalEmployees: employeesData.length,
        activeEmployees,
        onLeave,
        pendingApprovals: 0,
        departmentDistribution,
        recentActivity,
        dataAccess
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch HR data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCredential = async (credentialId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/hr/credentials/${credentialId}/verify`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to verify credential');
        toast({
          title: 'Success',
          description: 'Credential verified successfully',
        });
    } catch (error) {
      console.error('Error verifying credential:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify credential',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCompensation = async (employeeId: string, compensation: any): Promise<void> => {
    try {
      const response = await fetch(`/api/hr/${employeeId}/compensation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ compensation }),
      });
      if (!response.ok) throw new Error('Failed to update compensation');
      toast({
        title: 'Success',
        description: 'Compensation updated successfully',
      });
    } catch (error) {
      console.error('Error updating compensation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update compensation',
        variant: 'destructive',
      });
    }
  };

  const filteredEmployees = employees.filter(employee => 
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading HR data...</span>
    </div>
  );

  const renderEmptyState = (message: string, department?: string) => {
    const accessInfo = department ? metrics.dataAccess[department] : null;
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-2">{message}</div>
        <div className="space-y-1">
          {accessInfo ? (
            <>
              <p className="text-sm text-muted-foreground">
                Last updated: {accessInfo.lastUpdated.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Last accessed: {accessInfo.lastAccessed.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No data available yet
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Data will be populated as it becomes available
          </p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">HR Management</h1>
            <p className="text-muted-foreground mt-1">Manage your workforce efficiently</p>
          </div>
          <Button onClick={() => setLocation('/users/new')} size="lg">
            <UserPlus className="mr-2 h-5 w-5" />
            Add Employee
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
              <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                    {metrics.totalEmployees === 0 ? 'No employees yet' : 'Total workforce'}
              </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
              <div className="text-2xl font-bold">{metrics.activeEmployees}</div>
              <p className="text-xs text-muted-foreground">
                    {metrics.onLeave > 0 ? `${metrics.onLeave} on leave` : 'All employees active'}
              </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
              <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                    {metrics.pendingApprovals === 0 ? 'No pending approvals' : 'Requires attention'}
              </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : metrics.departmentDistribution?.length > 0 ? (
              <div className="space-y-2">
                  {metrics.departmentDistribution.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <span className="text-sm">{dept.name}</span>
                    <span className="text-sm font-medium">{dept.value}</span>
                  </div>
                ))}
              </div>
              ) : (
                renderEmptyState('No department data available', 'HR')
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Tabs defaultValue="employees" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
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
                  <CardDescription>View and manage your organization's workforce</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : filteredEmployees.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={filteredEmployees}
                    onRowClick={(employee) => setLocation(`/users/${employee.id}`)}
                  />
                  ) : (
                    renderEmptyState('No employees found', 'HR')
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Matching</CardTitle>
                  <CardDescription>Find the best candidates for your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : (
                  <SkillMatching
                    projectRequirements={{
                      skills: ['javascript', 'typescript', 'react', 'node.js'],
                      experience: 3
                    }}
                  />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials">
              <Card>
                <CardHeader>
                  <CardTitle>Credential Verification</CardTitle>
                  <CardDescription>Verify employee credentials and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : (
                        <CredentialVerification
                      credentials={[]}
                      onVerify={handleVerifyCredential}
                        />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Management</CardTitle>
                  <CardDescription>Manage employee compensation and benefits</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : (
                      <Payroll
                      employee={employees[0] || {} as Employee}
                      onUpdate={handleUpdateCompensation}
                      />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeoff">
              <Card>
                <CardHeader>
                  <CardTitle>Time Off Management</CardTitle>
                  <CardDescription>Track and manage employee time off requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : (
                    renderEmptyState(
                      'Time off management features coming soon...',
                      'HR'
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Management</CardTitle>
                  <CardDescription>Track and evaluate employee performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : (
                    renderEmptyState(
                      'Performance management features coming soon...',
                      'HR'
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              renderLoadingState()
            ) : metrics.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {metrics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {activity.type === 'new_hire' && <UserPlus className="h-4 w-4 text-primary" />}
                      {activity.type === 'leave_request' && <Calendar className="h-4 w-4 text-primary" />}
                      {activity.type === 'promotion' && <TrendingUp className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.department}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
            ) : (
              renderEmptyState(
                'No recent activity',
                'HR'
              )
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 