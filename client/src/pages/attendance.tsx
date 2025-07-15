import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, Clock, User, Calendar, FileText, Building, Users } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // For backward compatibility
  department: string;
  email: string;
  employeeId?: string;
  role?: string; // Added role for filtering
  source?: string; // 'user' or 'employee'
}

export default function AttendancePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMarkedToday, setHasMarkedToday] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const [formData, setFormData] = useState({
    status: 'present',
    notes: '',
    workDescription: '',
    hoursWorked: '',
    project: '',
    tasks: ''
  });

  useEffect(() => {
    fetchEmployees();
    checkTodayAttendance();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/attendance/employees', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out owners, just like the HR main page does
        const filteredEmployees = data.filter((emp: Employee) => emp.role !== 'owner');
        setEmployees(filteredEmployees);
        // Auto-select current user if they exist in the list
        const currentUser = filteredEmployees.find((emp: Employee) => emp.id === user?.id);
        if (currentUser) {
          setSelectedEmployee(currentUser.id);
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const response = await fetch('/api/attendance/live', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Don't hide the form - allow marking attendance for different employees
        console.log('Today\'s attendance data:', data);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedEmployee) {
      toast({ title: 'Error', description: 'Please select an employee', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          employeeId: selectedEmployee,
          employeeName: `${selectedEmp?.firstName} ${selectedEmp?.lastName}`,
          ...formData
        })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Attendance marked successfully!' });
        // Don't hide the form - allow marking attendance for different employees
        setSelectedEmployee(''); // Reset selection
        setFormData({ // Reset form
          status: 'present',
          notes: '',
          workDescription: '',
          hoursWorked: '',
          project: '',
          tasks: ''
        });
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.message || 'Failed to mark attendance', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark attendance', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedEmployee) {
      toast({ title: 'Error', description: 'Please select an employee', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          employeeId: selectedEmployee
        })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Checkout successful!' });
        checkTodayAttendance();
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.message || 'Failed to checkout', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to checkout', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-2">Mark daily attendance for your organization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{user.organization?.name || 'Your Organization'}</p>
                    <p className="text-sm text-gray-500">Organization Attendance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {hasMarkedToday ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Attendance Marked</span>
                  </div>
                  {todayAttendance && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Check-in Time:</span>
                        <span>{new Date(todayAttendance.checkInTime).toLocaleTimeString()}</span>
                      </div>
                      {todayAttendance.checkOutTime && (
                        <div className="flex justify-between">
                          <span>Check-out Time:</span>
                          <span>{new Date(todayAttendance.checkOutTime).toLocaleTimeString()}</span>
                        </div>
                      )}
                      {todayAttendance.totalHours && (
                        <div className="flex justify-between">
                          <span>Total Hours:</span>
                          <span>{todayAttendance.totalHours.toFixed(2)}h</span>
                        </div>
                      )}
                    </div>
                  )}
                  {!todayAttendance?.checkOutTime && (
                    <Button 
                      onClick={handleCheckout} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Processing...' : 'Check Out'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No attendance marked for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mark Attendance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Mark Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleMarkAttendance(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select value={selectedEmployee} onValueChange={(value) => {
                    setSelectedEmployee(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {`${employee.firstName} ${employee.lastName}`} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any notes about the attendance..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workDescription">Work Description (Optional - Can be updated later)</Label>
                  <Textarea
                    id="workDescription"
                    value={formData.workDescription}
                    onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                    placeholder="What work will this employee do today? (Optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoursWorked">Expected Hours (Optional)</Label>
                    <Input
                      id="hoursWorked"
                      type="number"
                      step="0.5"
                      value={formData.hoursWorked}
                      onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                      placeholder="8.0 (Optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project (Optional)</Label>
                    <Input
                      id="project"
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      placeholder="Project name (Optional)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tasks">Expected Tasks (Optional)</Label>
                  <Textarea
                    id="tasks"
                    value={formData.tasks}
                    onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
                    placeholder="Expected tasks for today (Optional)"
                  />
                </div>

                <Button type="submit" disabled={isLoading || !selectedEmployee} className="w-full">
                  {isLoading ? 'Marking Attendance...' : 'Mark Attendance'}
                </Button>
              </form>
            </CardContent>
          </Card>

        {/* Manual Entry for Others */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Manual Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Mark attendance for workers who don't have system access
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation('/attendance/manual')} 
                variant="outline" 
                className="w-full"
              >
                Manual Attendance Entry
              </Button>
              <Button 
                onClick={() => setLocation('/attendance/remote')} 
                variant="outline" 
                className="w-full"
              >
                Remote Attendance Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 