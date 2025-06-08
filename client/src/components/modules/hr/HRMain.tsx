import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, DollarSign, Clock, Loader2, BarChart, TrendingUp, Plus, Search, User2, Users, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Employee, columns as employeeColumns } from '@/pages/hr/columns';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { Payroll } from '@/components/hr/Payroll';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PayrollData {
  employeeId: string;
  amount: number;
  currency: string;
  status: string;
}

interface AttendanceData {
  employeeId: string;
  checkInTime: Date;
  checkOutTime?: Date;
}

export default function HRMain() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payroll, setPayroll] = useState<PayrollData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginAccessFilter, setLoginAccessFilter] = useState<'all' | 'login' | 'no-login'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
    }
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch employees
      const employeesResponse = await fetch('/api/hr/employees');
      if (!employeesResponse.ok) throw new Error('Failed to fetch employees');
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

      // Fetch payroll data
      const payrollResponse = await fetch('/api/hr/payroll');
      if (!payrollResponse.ok) throw new Error('Failed to fetch payroll data');
      const payrollData = await payrollResponse.json();
      setPayroll(payrollData);

      // Fetch attendance data
      const attendanceResponse = await fetch('/api/hr/attendance');
      if (!attendanceResponse.ok) throw new Error('Failed to fetch attendance data');
      const attendanceData = await attendanceResponse.json();
      setAttendance(attendanceData);
    } catch (error) {
      
      console.error('Error fetching data:', error);
      setError(String(error));
      toast({
        title: 'Error',
        description: 'Failed to fetch HR data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add search and filter logic
  const filteredEmployees = employees.filter(employee =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add credential verification handler
  const handleVerifyCredential = async (credentialId: string, userId: string) => {
    try {
      const response = await fetch('/api/hr/verify-credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credentialId, userId }),
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
        toast({ title: 'Success', description: 'Credential verified successfully' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to verify credential', variant: 'destructive' });
    }
  };

  const payrollColumns = [
    { accessorKey: 'employeeId', header: 'Employee ID' },
    { accessorKey: 'amount', header: 'Amount',
      cell: ({ row }: { row: any }) => `$${row.original.amount.toFixed(2)}` 
    },
    { accessorKey: 'currency', header: 'Currency' },
    { accessorKey: 'status', header: 'Status' },
  ];

  const attendanceColumns = [
    { accessorKey: 'employeeId', header: 'Employee ID' },
    { accessorKey: 'checkInTime', header: 'Check In',
      cell: ({ row }: { row: any }) => new Date(row.original.checkInTime).toLocaleTimeString()
    },
    { accessorKey: 'checkOutTime', header: 'Check Out',
      cell: ({ row }: { row: any }) => row.original.checkOutTime ? 
        new Date(row.original.checkOutTime).toLocaleTimeString() : 'Active'
    },
  ];

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading data...</span>
    </div>
  );

  // Department distribution and recent activity analytics for HR admins and admins
  let departmentDistribution: { name: string; value: number }[] = [];
  let recentActivity: { name: string; department: string; time: string }[] = [];
  if ((user?.role === 'hr_admin' || user?.role === 'admin') && employees.length > 0) {
    // Calculate department distribution
    const departmentCounts = employees.reduce((acc: Record<string, number>, emp: Employee) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
    departmentDistribution = Object.entries(departmentCounts).map(([name, value]) => ({ name, value: value as number }));
    // Recent activity: last 5 join dates
    recentActivity = employees
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 5)
      .map(emp => ({
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        time: new Date(emp.joinDate).toLocaleDateString()
      }));
  }

  // Only show the unified HR tabbed interface for owner, hr_admin, admin
  if (user?.role === 'owner' || user?.role === 'hr_admin' || user?.role === 'admin') {
    // Calculate summary stats
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const departmentCount = new Set(employees.map(e => e.department)).size;
    return (
      <DashboardLayout>
        <div className="space-y-4 pt-2">
          {/* Modern header with icon and background */}
          <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-4 px-8 py-8">
              <div className="bg-blue-600 text-white rounded-full p-4 shadow-lg">
                <User2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900 mb-1">HR Management</h1>
                <p className="text-blue-700 text-sm">Manage your organization's people, payroll, attendance, and more.</p>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-md border-blue-100">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{totalEmployees}</div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-blue-100">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <User2 className="h-5 w-5 text-green-600" />
                  Active Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{activeEmployees}</div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-blue-100">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{departmentCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6 pt-2 mt-2">
            <h1 className="text-2xl font-bold">Employee Management</h1>
            <div className="flex gap-2">
              <Select value={loginAccessFilter} onValueChange={v => setLoginAccessFilter(v as any)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Login Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="login">With Login</SelectItem>
                  <SelectItem value="no-login">No Login</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setLocation('/hr/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </div>
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
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="skills">Skills & Matching</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="leave">Leave Management</TabsTrigger>
            </TabsList>
            <TabsContent value="employees">
              <Card className="shadow-lg border-blue-100">
                <CardHeader>
                  <CardTitle>Employee Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={employeeColumns}
                    data={filteredEmployees}
                    onRowClick={(employee) => setLocation(`/hr/employees/${employee.id}`)}
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
                    projectRequirements={{ skills: ['javascript', 'typescript', 'react', 'node.js'], experience: 3 }}
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
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ compensation }),
                            });
                            if (!response.ok) throw new Error('Failed to update compensation');
                            const updatedEmployee = await response.json();
                            setEmployees(employees.map(emp => emp.id === employeeId ? updatedEmployee : emp));
                          } catch (error) {
                            toast({ title: 'Error', description: 'Failed to update compensation', variant: 'destructive' });
                          }
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">View and manage employee attendance records</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Access and manage employee documents and records</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="leave">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">View and manage employee leave requests</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Human Resources</h1>
          <Button onClick={() => setLocation('/users/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                renderLoadingState()
              ) : (
                <div className="text-2xl font-bold">{employees.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                renderLoadingState()
              ) : (
                <div className="text-2xl font-bold">
                  ${payroll.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                renderLoadingState()
              ) : (
                <div className="text-2xl font-bold">
                  {attendance.filter(a => !a.checkOutTime).length}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HR Admin Analytics */}
        {(user?.role === 'hr_admin' || user?.role === 'admin') && (
          <>
            <h2 className="text-xl font-semibold mt-6 mb-2">HR Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : departmentDistribution.length > 0 ? (
                    <div className="space-y-2">
                      {departmentDistribution.map((dept) => (
                        <div key={dept.name} className="flex items-center justify-between">
                          <span className="text-sm">{dept.name}</span>
                          <span className="text-sm font-medium">{dept.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No department data available</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    renderLoadingState()
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-2">
                      {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{activity.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{activity.department}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No recent activity</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Tabs defaultValue="employees">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            {loading ? (
              renderLoadingState()
            ) : (
              <DataTable
                columns={employeeColumns}
                data={employees}
              />
            )}
          </TabsContent>

          <TabsContent value="payroll">
            {loading ? (
              renderLoadingState()
            ) : (
              <DataTable
                columns={payrollColumns}
                data={payroll}
              />
            )}
          </TabsContent>

          <TabsContent value="attendance">
            {loading ? (
              renderLoadingState()
            ) : (
              <DataTable
                columns={attendanceColumns}
                data={attendance}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
