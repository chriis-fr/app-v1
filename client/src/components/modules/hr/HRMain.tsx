import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, DollarSign, Clock, Loader2, BarChart, TrendingUp, Plus, Search, User2, Users, Building2,
  Calendar, FileText, Settings, Briefcase, CreditCard, Package, Building, Activity, Target,
  CalendarDays, Receipt, Users2, Clock4, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  status: 'present' | 'absent' | 'break' | 'logout';
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface Birthday {
  id: string;
  employeeName: string;
  date: string;
}

interface WorkAnniversary {
  id: string;
  employeeName: string;
  date: string;
  yearsCompleted: number;
}

interface LeaveBalance {
  paidLeave: number;
  casualLeave: number;
  sickLeave: number;
  marriageLeave: number;
  unpaidLeave: number;
}

export default function HRMain() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payroll, setPayroll] = useState<PayrollData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [workAnniversaries, setWorkAnniversaries] = useState<WorkAnniversary[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    paidLeave: 0,
    casualLeave: 0,
    sickLeave: 0,
    marriageLeave: 0,
    unpaidLeave: 0
  });
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginAccessFilter, setLoginAccessFilter] = useState<'all' | 'login' | 'no-login'>('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
    
    // Set up real-time data refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
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
      
      // Fetch all HR data in parallel for better performance
      const [
        employeesResponse,
        payrollResponse,
        attendanceResponse,
        leaveRequestsResponse,
        holidaysResponse,
        birthdaysResponse,
        workAnniversariesResponse,
        leaveBalanceResponse,
        notificationsResponse,
        activityLogsResponse,
        dashboardSummaryResponse
      ] = await Promise.all([
        fetch('/api/hr/employees', { credentials: 'include' }),
        fetch('/api/hr/payroll', { credentials: 'include' }),
        fetch('/api/hr/attendance', { credentials: 'include' }),
        fetch('/api/hr/leave-requests', { credentials: 'include' }),
        fetch('/api/hr/holidays', { credentials: 'include' }),
        fetch('/api/hr/birthdays', { credentials: 'include' }),
        fetch('/api/hr/work-anniversaries', { credentials: 'include' }),
        fetch('/api/hr/leave-balance', { credentials: 'include' }),
        fetch('/api/hr/notifications', { credentials: 'include' }),
        fetch('/api/hr/activity-logs', { credentials: 'include' }),
        fetch('/api/hr/dashboard-summary', { credentials: 'include' })
      ]);

      // Handle responses
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData.filter((emp: any) => emp.role !== 'owner'));
      }

      if (payrollResponse.ok) {
        const payrollData = await payrollResponse.json();
        setPayroll(payrollData);
      }

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        setAttendance(attendanceData);
      }

      if (leaveRequestsResponse.ok) {
        const leaveRequestsData = await leaveRequestsResponse.json();
        setLeaveRequests(leaveRequestsData);
      }

      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        setHolidays(holidaysData);
      }

      if (birthdaysResponse.ok) {
        const birthdaysData = await birthdaysResponse.json();
        setBirthdays(birthdaysData);
      }

      if (workAnniversariesResponse.ok) {
        const workAnniversariesData = await workAnniversariesResponse.json();
        setWorkAnniversaries(workAnniversariesData);
      }

      if (leaveBalanceResponse.ok) {
        const leaveBalanceData = await leaveBalanceResponse.json();
        setLeaveBalance(leaveBalanceData);
      }

      // Store additional data for use in components
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        console.log('HR Notifications:', notificationsData);
      }

      if (activityLogsResponse.ok) {
        const activityLogsData = await activityLogsResponse.json();
        console.log('HR Activity Logs:', activityLogsData);
      }

      if (dashboardSummaryResponse.ok) {
        const dashboardSummaryData = await dashboardSummaryResponse.json();
        console.log('HR Dashboard Summary:', dashboardSummaryData);
      }

    } catch (error) {
      console.error('Error fetching HR data:', error);
      setError('Failed to load HR data. Please try again.');
      
      // Auto-dismiss error after 5 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
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

  // Calculate dashboard stats
  const presentEmployees = attendance.filter(a => a.status === 'present').length;
  const absentEmployees = attendance.filter(a => a.status === 'absent').length;
  const breakInEmployees = attendance.filter(a => a.status === 'break').length;
  const logoutEmployees = attendance.filter(a => a.status === 'logout').length;

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading data...</span>
    </div>
  );

  // Only show the unified HR tabbed interface for owner, hr_admin, admin
  if (user?.role === 'owner' || user?.role === 'hr_admin' || user?.role === 'admin') {
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 h-auto p-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="hiring" className="flex items-center gap-2">
                <Users2 className="h-4 w-4" />
                Hiring
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-2">
                <Clock4 className="h-4 w-4" />
                Time
              </TabsTrigger>
              <TabsTrigger value="leave" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Leave
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="payroll" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payroll
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="meeting-room" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Meeting Room
              </TabsTrigger>
              <TabsTrigger value="activity-logs" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Logs
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Employees</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{presentEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      out of {employees.length} total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Absent Employees</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{absentEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      out of {employees.length} total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Break In</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{breakInEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      currently on break
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Logged Out</CardTitle>
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{logoutEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      currently logged out
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Leave Balance Cards */}
              <div className="grid gap-4 md:grid-cols-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Paid Leave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leaveBalance.paidLeave}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leaveBalance.casualLeave}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leaveBalance.sickLeave}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Marriage Leave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leaveBalance.marriageLeave}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Unpaid Leave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leaveBalance.unpaidLeave}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Leave Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leaveRequests.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No leave requests found</p>
                    ) : (
                      <div className="space-y-2">
                        {leaveRequests.slice(0, 5).map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{request.employeeName}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.startDate} - {request.endDate}
                              </p>
                            </div>
                            <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                              {request.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Holidays */}
                <Card>
                  <CardHeader>
                    <CardTitle>Holidays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {holidays.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No holidays found for this month</p>
                    ) : (
                      <div className="space-y-2">
                        {holidays.slice(0, 5).map((holiday) => (
                          <div key={holiday.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{holiday.name}</span>
                            <span className="text-sm text-muted-foreground">{holiday.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Birthdays */}
                <Card>
                  <CardHeader>
                    <CardTitle>Birthdays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {birthdays.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No birthdays found for this month</p>
                    ) : (
                      <div className="space-y-2">
                        {birthdays.slice(0, 5).map((birthday) => (
                          <div key={birthday.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{birthday.employeeName}</span>
                            <span className="text-sm text-muted-foreground">{birthday.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Work Anniversaries */}
                <Card>
                  <CardHeader>
                    <CardTitle>Work Anniversaries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workAnniversaries.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No work anniversaries found for this month</p>
                    ) : (
                      <div className="space-y-2">
                        {workAnniversaries.slice(0, 5).map((anniversary) => (
                          <div key={anniversary.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{anniversary.employeeName}</p>
                              <p className="text-sm text-muted-foreground">{anniversary.yearsCompleted} years</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{anniversary.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Hiring Tab */}
            <TabsContent value="hiring" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Hiring Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/hiring/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Job Posting
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Job postings, candidate management, and onboarding workflows will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employees Tab */}
            <TabsContent value="employees" className="space-y-4">
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

            {/* Time Management Tab */}
            <TabsContent value="time" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Time Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/time/attendance')}>
                      <Clock className="mr-2 h-4 w-4" />
                      View Attendance
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Attendance tracking, check-in/out, break management, and time reports will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leave Management Tab */}
            <TabsContent value="leave" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Leave Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/leave/requests')}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      View Requests
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Leave requests, approvals, balances, and policies will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Asset Management Tab */}
            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Asset Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/assets')}>
                      <Package className="mr-2 h-4 w-4" />
                      Manage Assets
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Asset assignment, tracking, maintenance, and return management will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Company Calendar</CardTitle>
                    <Button onClick={() => setLocation('/hr/calendar')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      View Calendar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Company events, holidays, meetings, and important dates will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payroll Management Tab */}
            <TabsContent value="payroll" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Payroll Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/payroll')}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Process Payroll
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Salary processing, payslips, deductions, bonuses, and payroll reports will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expense Management Tab */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Expense Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/expenses')}>
                      <Receipt className="mr-2 h-4 w-4" />
                      View Expenses
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Employee expense claims, approvals, reimbursements, and expense reports will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Meeting Room Tab */}
            <TabsContent value="meeting-room" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Meeting Room Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/meeting-room')}>
                      <Building className="mr-2 h-4 w-4" />
                      Book Room
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Room bookings, schedules, availability, and meeting management will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity-logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Activity Logs</CardTitle>
                    <Button onClick={() => setLocation('/hr/activity-logs')}>
                      <Activity className="mr-2 h-4 w-4" />
                      View Logs
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Audit trail of HR actions, user activities, and system logs will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>HR Settings</CardTitle>
                    <Button onClick={() => setLocation('/hr/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Company policies, leave types, roles, permissions, and system configuration will be managed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback for non-HR users
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
        {user?.role === 'hr_admin' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  renderLoadingState()
                ) : (
                  <div className="space-y-2">
                    {Object.entries(
                      employees.reduce((acc: Record<string, number>, emp: Employee) => {
                        acc[emp.department] = (acc[emp.department] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([dept, count]) => (
                      <div key={dept} className="flex justify-between items-center">
                        <span>{dept}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  renderLoadingState()
                ) : (
                  <div className="space-y-2">
                    {employees
                      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
                      .slice(0, 5)
                      .map((emp) => (
                        <div key={emp.id} className="flex justify-between items-center">
                          <span>{emp.firstName} {emp.lastName}</span>
                          <span className="text-sm text-muted-foreground">
                            Joined {new Date(emp.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
