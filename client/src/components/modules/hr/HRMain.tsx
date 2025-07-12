import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, DollarSign, Clock, Loader2, BarChart, TrendingUp, Plus, Search, User2, Users, Building2,
  Calendar, FileText, Settings, Briefcase, CreditCard, Package, Building, Activity, Target,
  CalendarDays, Receipt, Users2, Clock4, CheckCircle, XCircle, AlertCircle, ShoppingCart
} from 'lucide-react';
import { HRReports } from '@/components/hr/HRReports';
import { useToast } from '@/components/ui/use-toast';
import { Employee, columns as employeeColumns } from '@/pages/hr/columns';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { Payroll } from '@/components/hr/Payroll';
import HRProcurement from '@/components/hr/HRProcurement';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIDepartmentInsights } from '@/components/ai/AIDepartmentInsights';


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
    
    // Set up real-time data refresh every 30 seconds for attendance
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
        fetch('/api/attendance/live', { credentials: 'include' }),
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
        // Transform the data to map _id to id for frontend compatibility
        const transformedEmployees = employeesData
          .filter((emp: any) => emp.role !== 'owner')
          .map((emp: any) => ({
            ...emp,
            id: emp._id || emp.id, // Use _id if id doesn't exist
            _id: emp._id // Keep _id for backward compatibility
          }));
        setEmployees(transformedEmployees);
      }

      if (payrollResponse.ok) {
      const payrollData = await payrollResponse.json();
      setPayroll(payrollData);
      }

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        console.log('Attendance data from live API:', attendanceData);
        // Transform the attendance data to match our interface
        const transformedAttendance = attendanceData.attendance?.map((a: any) => ({
          employeeId: a.employeeId,
          checkInTime: a.checkInTime ? new Date(a.checkInTime) : new Date(),
          checkOutTime: a.checkOutTime ? new Date(a.checkOutTime) : undefined,
          status: a.status || 'absent'
        })) || [];
        setAttendance(transformedAttendance);
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
              <TabsTrigger value="procurement" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Procurement
              </TabsTrigger>
              <TabsTrigger value="meeting-room" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Meeting Room
              </TabsTrigger>
              <TabsTrigger value="activity-logs" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Logs
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
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
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Present Employees</CardTitle>
                    <div className="bg-green-600 text-white rounded-full p-2">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-700">{presentEmployees}</div>
                    <p className="text-xs text-green-600 font-medium">
                      out of {employees.length} total
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${employees.length > 0 ? (presentEmployees / employees.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">
                          {employees.length > 0 ? Math.round((presentEmployees / employees.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">Absent Employees</CardTitle>
                    <div className="bg-red-600 text-white rounded-full p-2">
                      <XCircle className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-700">{absentEmployees}</div>
                    <p className="text-xs text-red-600 font-medium">
                      out of {employees.length} total
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-red-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${employees.length > 0 ? (absentEmployees / employees.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-red-600 font-medium">
                          {employees.length > 0 ? Math.round((absentEmployees / employees.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">Break In</CardTitle>
                    <div className="bg-yellow-600 text-white rounded-full p-2">
                      <Clock className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-700">{breakInEmployees}</div>
                    <p className="text-xs text-yellow-600 font-medium">
                      currently on break
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-yellow-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${employees.length > 0 ? (breakInEmployees / employees.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-yellow-600 font-medium">
                          {employees.length > 0 ? Math.round((breakInEmployees / employees.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-800">Logged Out</CardTitle>
                    <div className="bg-gray-600 text-white rounded-full p-2">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-700">{logoutEmployees}</div>
                    <p className="text-xs text-gray-600 font-medium">
                      currently logged out
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${employees.length > 0 ? (logoutEmployees / employees.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {employees.length > 0 ? Math.round((logoutEmployees / employees.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Attendance Actions */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Quick Attendance Actions
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchData}
                      disabled={loading}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setLocation('/attendance')} 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Attendance
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation('/attendance/manual')} 
                      className="flex-1"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Manual Entry
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation('/attendance/remote')} 
                      className="flex-1"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Remote Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>

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

            

              {/* AI Insights */}
              <AIDepartmentInsights />
            </TabsContent>

            {/* Hiring Tab */}
            <TabsContent value="hiring" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Hiring Management</h2>
                  <p className="text-muted-foreground">Manage job postings, candidates, and hiring process</p>
                </div>
                <Button onClick={() => setLocation('/hr/hiring')}>
                      <Plus className="mr-2 h-4 w-4" />
                  Manage Hiring
                    </Button>
                  </div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" onClick={() => setLocation('/hr/hiring')} className="h-20 flex flex-col items-center justify-center">
                      <Briefcase className="h-6 w-6 mb-2" />
                      <span>Job Postings</span>
                    </Button>
                    <Button variant="outline" onClick={() => setLocation('/hr/hiring')} className="h-20 flex flex-col items-center justify-center">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Candidates</span>
                    </Button>
                    <Button variant="outline" onClick={() => setLocation('/hr/hiring')} className="h-20 flex flex-col items-center justify-center">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Applications</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employees Tab */}
            <TabsContent value="employees" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Employee Management</CardTitle>
              <Button onClick={() => setLocation('/hr/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={employeeColumns}
                    data={filteredEmployees}
                    onRowClick={(employee) => setLocation(`/hr/employees/${employee.id}`, { state: { employee } })}
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
                    <Button onClick={() => setLocation('/hr/timesheets')}>
                      <Clock className="mr-2 h-4 w-4" />
                      View Timesheets
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Track employee time entries, manage timesheets, and generate time reports.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leave Management Tab */}
            <TabsContent value="leave" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Leave Management</CardTitle>
                    <Button onClick={() => setLocation('/hr/leave-management')}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      View Requests
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Manage leave requests, approvals, balances, and policies.</p>
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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Payroll Management</h2>
                  <p className="text-muted-foreground">Employee payroll data and salary information</p>
                </div>
                    <Button onClick={() => setLocation('/hr/payroll')}>
                      <DollarSign className="mr-2 h-4 w-4" />
                  Go to Payroll
                    </Button>
                  </div>

              {/* Employee Payroll Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
                  ))
                ) : (
                  employees
                    .filter((emp: any) => emp.status === 'active' && emp.isActive !== false)
                    .slice(0, 6)
                    .map((employee: any) => {
                      const salaryAmount = employee.salaryAmount || 0;
                      const taxRate = 0.15; // 15% tax rate
                      const benefitsRate = 0.05; // 5% benefits rate
                      const taxDeduction = salaryAmount * taxRate;
                      const benefitsDeduction = salaryAmount * benefitsRate;
                      const netPay = salaryAmount - taxDeduction - benefitsDeduction;
                      
                      return (
                        <Card key={employee.id || employee._id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium">
                                {employee.firstName} {employee.lastName}
                              </CardTitle>
                              <Badge variant={employee.salaryAmount && employee.salaryAmount > 0 ? "default" : "secondary"}>
                                {employee.salaryAmount && employee.salaryAmount > 0 ? 'Active' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{employee.position || 'Employee'}</p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Gross Salary:</span>
                              <span className="font-medium">${salaryAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Tax:</span>
                              <span className="text-red-600 text-sm">-${taxDeduction.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Benefits:</span>
                              <span className="text-orange-600 text-sm">-${benefitsDeduction.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Net Pay:</span>
                                <span className="font-bold text-green-600">${netPay.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Payment: {employee.payoutMethod || 'Bank Transfer'}</span>
                              <span>{employee.currencyPreference || 'USD'}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                )}
              </div>

              {/* Payroll Summary */}
              {!loading && employees.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {employees.filter((emp: any) => emp.status === 'active' && emp.isActive !== false).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Employees</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${employees
                            .filter((emp: any) => emp.salaryAmount && emp.salaryAmount > 0)
                            .reduce((sum: number, emp: any) => sum + (emp.salaryAmount || 0), 0)
                            .toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Gross Payroll</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          -${employees
                            .filter((emp: any) => emp.salaryAmount && emp.salaryAmount > 0)
                            .reduce((sum: number, emp: any) => {
                              const salary = emp.salaryAmount || 0;
                              const taxDeduction = salary * 0.15;
                              const benefitsDeduction = salary * 0.05;
                              return sum + taxDeduction + benefitsDeduction;
                            }, 0)
                            .toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Deductions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${employees
                            .filter((emp: any) => emp.salaryAmount && emp.salaryAmount > 0)
                            .reduce((sum: number, emp: any) => {
                              const salary = emp.salaryAmount || 0;
                              const taxDeduction = salary * 0.15;
                              const benefitsDeduction = salary * 0.05;
                              return sum + salary - taxDeduction - benefitsDeduction;
                            }, 0)
                            .toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Net Payroll</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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

            {/* Procurement Management Tab */}
            <TabsContent value="procurement" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Procurement Management</CardTitle>
                    <Button onClick={() => setLocation('/dashboard/procurement')}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      View Procurement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <HRProcurement organizationId={user?.organizationId || ''} />
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

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Enhanced Header */}
              <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm">
                <div className="flex items-center justify-between px-8 py-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg">
                      <BarChart className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-indigo-900 mb-1">HR Reports & Analytics</h2>
                      <p className="text-indigo-700 text-sm">Generate, view, and export comprehensive HR reports for your organization.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setLocation('/dashboard/hr/reports')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Full Reports
                  </Button>
                </div>
              </div>

              {/* Quick Report Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100" onClick={() => setLocation('/dashboard/hr/reports')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                        <div className="bg-blue-600 text-white rounded-full p-1">
                          <Users className="h-3 w-3" />
                        </div>
                        Employee Summary
                      </CardTitle>
                      <div className="text-blue-400 group-hover:text-blue-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-blue-600 mb-3 font-medium">Comprehensive employee information report</p>
                    <div className="text-3xl font-bold text-blue-700 mb-1">{employees.length}</div>
                    <p className="text-xs text-blue-500">Total employees</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-green-100" onClick={() => setLocation('/dashboard/hr/reports')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-800">
                        <div className="bg-green-600 text-white rounded-full p-1">
                          <DollarSign className="h-3 w-3" />
                        </div>
                        Payroll Report
                      </CardTitle>
                      <div className="text-green-400 group-hover:text-green-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-green-600 mb-3 font-medium">Monthly payroll and compensation analysis</p>
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      ${employees
                        .filter((emp: any) => emp.salaryAmount && emp.salaryAmount > 0)
                        .reduce((sum: number, emp: any) => sum + (emp.salaryAmount || 0), 0)
                        .toLocaleString()}
                    </div>
                    <p className="text-xs text-green-500">Total payroll</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100" onClick={() => setLocation('/dashboard/hr/reports')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-800">
                        <div className="bg-orange-600 text-white rounded-full p-1">
                          <Calendar className="h-3 w-3" />
                        </div>
                        Leave Report
                      </CardTitle>
                      <div className="text-orange-400 group-hover:text-orange-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-orange-600 mb-3 font-medium">Leave requests and attendance tracking</p>
                    <div className="text-3xl font-bold text-orange-700 mb-1">{leaveRequests.length}</div>
                    <p className="text-xs text-orange-500">Pending requests</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100" onClick={() => setLocation('/dashboard/hr/reports')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-800">
                        <div className="bg-purple-600 text-white rounded-full p-1">
                          <Briefcase className="h-3 w-3" />
                        </div>
                        Hiring Report
                      </CardTitle>
                      <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-purple-600 mb-3 font-medium">Recruitment and hiring analytics</p>
                    <div className="text-3xl font-bold text-purple-700 mb-1">0</div>
                    <p className="text-xs text-purple-500">Active positions</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100" onClick={() => setLocation('/dashboard/hr/reports')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-800">
                        <div className="bg-indigo-600 text-white rounded-full p-1">
                          <Target className="h-3 w-3" />
                        </div>
                        Performance Report
                      </CardTitle>
                      <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-indigo-600 mb-3 font-medium">Employee performance and reviews</p>
                    <div className="text-3xl font-bold text-indigo-700 mb-1">{employees.length}</div>
                    <p className="text-xs text-indigo-500">Employees to review</p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-red-200 bg-gradient-to-br from-red-50 to-red-100" onClick={() => setLocation('/dashboard/hr/reports')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-800">
                        <div className="bg-red-600 text-white rounded-full p-1">
                          <Activity className="h-3 w-3" />
                        </div>
                        Turnover Report
                      </CardTitle>
                      <div className="text-red-400 group-hover:text-red-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-red-600 mb-3 font-medium">Employee retention and turnover analysis</p>
                    <div className="text-3xl font-bold text-red-700 mb-1">0%</div>
                    <p className="text-xs text-red-500">Turnover rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Report Generator */}
              <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white rounded-full p-2">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-blue-900">Advanced Report Generator</CardTitle>
                      <CardDescription className="text-blue-700">Create comprehensive HR reports with custom parameters and export options</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Report Types</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Employee Summary
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Payroll Analysis
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Leave Reports
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Performance Reviews
                        </div>
                      </div>
                    </div>
                    <HRReports />
                  </div>
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
