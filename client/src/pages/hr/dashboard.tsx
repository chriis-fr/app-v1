import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  LogOut, 
  Calendar, 
  FileText, 
  Gift, 
  Award,
  Plus,
  Search,
  Filter,
  BarChart3,
  Settings,
  Building,
  DollarSign,
  Briefcase,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import ModuleLayout from '@/components/layout/ModuleLayout';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: 'present' | 'absent' | 'on-break' | 'logged-out';
  checkInTime?: string;
  checkOutTime?: string;
  breakStartTime?: string;
  avatar?: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'company' | 'optional';
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: 'paid' | 'casual' | 'sick' | 'marriage' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected';
}

interface Birthday {
  id: string;
  employeeName: string;
  date: string;
  department: string;
}

interface WorkAnniversary {
  id: string;
  employeeName: string;
  date: string;
  yearsCompleted: number;
  department: string;
}

interface LeaveBalance {
  paidLeave: number;
  casualLeave: number;
  sickLeave: number;
  marriageLeave: number;
  unpaidLeave: number;
}

export default function HRDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [workAnniversaries, setWorkAnniversaries] = useState<WorkAnniversary[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    paidLeave: 0,
    casualLeave: 0,
    sickLeave: 0,
    marriageLeave: 0,
    unpaidLeave: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employeesResponse = await fetch('/api/hr/employees');
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
      }

      // Fetch holidays
      const holidaysResponse = await fetch('/api/hr/holidays');
      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        setHolidays(holidaysData);
      }

      // Fetch leave requests
      const leaveRequestsResponse = await fetch('/api/hr/leave-requests');
      if (leaveRequestsResponse.ok) {
        const leaveRequestsData = await leaveRequestsResponse.json();
        setLeaveRequests(leaveRequestsData);
      }

      // Fetch birthdays
      const birthdaysResponse = await fetch('/api/hr/birthdays');
      if (birthdaysResponse.ok) {
        const birthdaysData = await birthdaysResponse.json();
        setBirthdays(birthdaysData);
      }

      // Fetch work anniversaries
      const anniversariesResponse = await fetch('/api/hr/work-anniversaries');
      if (anniversariesResponse.ok) {
        const anniversariesData = await anniversariesResponse.json();
        setWorkAnniversaries(anniversariesData);
      }

      // Fetch leave balance
      const leaveBalanceResponse = await fetch('/api/hr/leave-balance');
      if (leaveBalanceResponse.ok) {
        const leaveBalanceData = await leaveBalanceResponse.json();
        setLeaveBalance(leaveBalanceData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'on-break': return 'bg-blue-100 text-blue-800';
      case 'logged-out': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="h-4 w-4" />;
      case 'absent': return <UserX className="h-4 w-4" />;
      case 'on-break': return <Clock className="h-4 w-4" />;
      case 'logged-out': return <LogOut className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'casual': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'marriage': return 'bg-purple-100 text-purple-800';
      case 'unpaid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const presentEmployees = employees.filter(emp => emp.status === 'present');
  const absentEmployees = employees.filter(emp => emp.status === 'absent');
  const onBreakEmployees = employees.filter(emp => emp.status === 'on-break');
  const loggedOutEmployees = employees.filter(emp => emp.status === 'logged-out');

  if (!user || !['owner', 'admin', 'hr_admin'].includes(user.role?.toLowerCase())) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        {/* Header with User Info and Plan */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to NexStaff Dashboard</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Plan: Premium</span>
              <span>|</span>
              <span>Expires: Jun 27, 2025</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.department || 'N/A'}</p>
            </div>
            <Avatar>
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Employee Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Employees</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentEmployees.length} / {employees.length}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {presentEmployees.slice(0, 3).map((emp) => (
                  <Avatar key={emp.id} className="h-6 w-6">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback className="text-xs">{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Employees</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{absentEmployees.length} / {employees.length}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {absentEmployees.slice(0, 3).map((emp) => (
                  <Avatar key={emp.id} className="h-6 w-6">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback className="text-xs">{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Break in</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onBreakEmployees.length} / {employees.length}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {onBreakEmployees.slice(0, 3).map((emp) => (
                  <Avatar key={emp.id} className="h-6 w-6">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback className="text-xs">{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logout</CardTitle>
              <LogOut className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loggedOutEmployees.length} / {employees.length}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {loggedOutEmployees.slice(0, 3).map((emp) => (
                  <Avatar key={emp.id} className="h-6 w-6">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback className="text-xs">{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Holidays */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Holidays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {holidays.length === 0 ? (
                    <p className="text-muted-foreground">No holidays found for this month.</p>
                  ) : (
                    <div className="space-y-2">
                      {holidays.map((holiday) => (
                        <div key={holiday.id} className="flex justify-between items-center">
                          <span>{holiday.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(holiday.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Leave Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Leave Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaveRequests.length === 0 ? (
                    <p className="text-muted-foreground">No Leaves Information found.</p>
                  ) : (
                    <div className="space-y-2">
                      {leaveRequests.map((request) => (
                        <div key={request.id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{request.employeeName}</span>
                            <Badge className={`ml-2 ${getLeaveTypeColor(request.leaveType)}`}>
                              {request.leaveType}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Birthdays */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Birthdays
                    <Button variant="link" size="sm" className="ml-auto">
                      See all
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {birthdays.length === 0 ? (
                    <p className="text-muted-foreground">No birthdays found for this month.</p>
                  ) : (
                    <div className="space-y-2">
                      {birthdays.map((birthday) => (
                        <div key={birthday.id} className="flex justify-between items-center">
                          <span>{birthday.employeeName}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(birthday.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Anniversaries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Work Anniversaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {workAnniversaries.length === 0 ? (
                    <p className="text-muted-foreground">No work anniversary found for this month.</p>
                  ) : (
                    <div className="space-y-2">
                      {workAnniversaries.map((anniversary) => (
                        <div key={anniversary.id} className="flex justify-between items-center">
                          <span>{anniversary.employeeName}</span>
                          <div className="text-sm text-muted-foreground">
                            <span>{new Date(anniversary.date).toLocaleDateString()}</span>
                            <span className="ml-2">({anniversary.yearsCompleted} years)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Leave Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{leaveBalance.paidLeave}</div>
                    <div className="text-sm text-muted-foreground">Paid Leave</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{leaveBalance.casualLeave}</div>
                    <div className="text-sm text-muted-foreground">Casual Leave</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{leaveBalance.sickLeave}</div>
                    <div className="text-sm text-muted-foreground">Sick Leave</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{leaveBalance.marriageLeave}</div>
                    <div className="text-sm text-muted-foreground">Marriage Leave</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{leaveBalance.unpaidLeave}</div>
                    <div className="text-sm text-muted-foreground">Unpaid Leave</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={() => setLocation('/hr/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>

            <div className="grid gap-4">
              {employees
                .filter(emp => 
                  `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  emp.department.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((employee) => (
                  <Card key={employee.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{employee.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(employee.status)}>
                            {getStatusIcon(employee.status)}
                            {employee.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => setLocation(`/hr/employees/${employee.id}`)}>
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calendar view with holidays, events, and meetings will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>HR Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive HR reports and analytics will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 