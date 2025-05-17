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
  AlertCircle
} from 'lucide-react';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { DataTable } from '@/components/ui/data-table';
import { columns, Employee } from '@/pages/hr/columns';
import { Payroll } from '@/components/hr/Payroll';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function HRInfo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for dashboard metrics
  const metrics = {
    totalEmployees: 150,
    activeEmployees: 142,
    onLeave: 8,
    pendingApprovals: 5,
    departmentDistribution: [
      { name: 'Engineering', value: 45 },
      { name: 'Sales', value: 35 },
      { name: 'Marketing', value: 25 },
      { name: 'Operations', value: 20 },
      { name: 'Finance', value: 15 }
    ],
    recentActivity: [
      { type: 'new_hire', name: 'John Doe', department: 'Engineering', time: '2 hours ago' },
      { type: 'leave_request', name: 'Jane Smith', department: 'Marketing', time: '4 hours ago' },
      { type: 'promotion', name: 'Mike Johnson', department: 'Sales', time: '1 day ago' }
    ]
  };

  useEffect(() => {
    if (!user || !user.moduleAccess?.includes('hr')) {
      setLocation('/dashboard');
      return;
    }

    fetchEmployees();
  }, [user]);

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </DashboardLayout>
    );
  }

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
              <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.onLeave} on leave
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.departmentDistribution.slice(0, 3).map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <span className="text-sm">{dept.name}</span>
                    <span className="text-sm font-medium">{dept.value}</span>
                  </div>
                ))}
              </div>
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
                  <DataTable
                    columns={columns}
                    data={filteredEmployees}
                    onRowClick={(employee) => setLocation(`/users/${employee.id}`)}
                  />
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
                  <CardDescription>Verify employee credentials using blockchain technology</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredEmployees.map((employee) => (
                      <div key={employee.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                          <Badge variant="outline">{employee.department}</Badge>
                        </div>
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
                  <CardDescription>Manage employee compensation and benefits</CardDescription>
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

            <TabsContent value="timeoff">
              <Card>
                <CardHeader>
                  <CardTitle>Time Off Management</CardTitle>
                  <CardDescription>Track and manage employee time off requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Time off management features coming soon...
                  </div>
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
                  <div className="text-center py-8 text-muted-foreground">
                    Performance management features coming soon...
                  </div>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 