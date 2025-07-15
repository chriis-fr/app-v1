import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, UserPlus, Clock, FileText, Users } from 'lucide-react';

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

export default function ManualAttendancePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    status: 'present',
    checkInTime: new Date().toISOString().slice(0, 16), // Current time
    notes: '',
    workDescription: '',
    hoursWorked: '',
    project: '',
    tasks: '',
    location: '',
    device: ''
  });

  useEffect(() => {
    fetchEmployees();
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
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee && !formData.employeeName.trim()) {
      toast({ title: 'Error', description: 'Please select an employee or enter a name', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
      const employeeName = selectedEmp?.name || formData.employeeName;
      const employeeId = selectedEmployee || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          employeeId,
          employeeName
        })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Manual attendance marked successfully!' });
        setLocation('/attendance');
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

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/attendance')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attendance
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Manual Attendance Entry</h1>
        <p className="text-gray-600 mt-2">Mark attendance for workers without system access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manual Attendance Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee (Optional)</Label>
              <Select value={selectedEmployee} onValueChange={(value) => {
                setSelectedEmployee(value);
                const selectedEmp = employees.find(emp => emp.id === value);
                setFormData({ 
                  ...formData, 
                  employeeId: value,
                  employeeName: selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : ''
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an existing employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {`${employee.firstName} ${employee.lastName}`} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select an existing employee or enter a new name below
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name *</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="Enter employee's full name"
                required={!selectedEmployee}
                disabled={!!selectedEmployee}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  type="datetime-local"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Office, Site A, Remote"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device">Device (Optional)</Label>
                <Input
                  id="device"
                  value={formData.device}
                  onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                  placeholder="e.g., Kiosk, Mobile, Computer"
                />
              </div>
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
              <Label htmlFor="workDescription">Work Description (Optional)</Label>
              <Textarea
                id="workDescription"
                value={formData.workDescription}
                onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                placeholder="What work did this employee do today?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoursWorked">Hours Worked</Label>
                <Input
                  id="hoursWorked"
                  type="number"
                  step="0.5"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                  placeholder="8.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="Project name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasks">Tasks Completed (Optional)</Label>
              <Textarea
                id="tasks"
                value={formData.tasks}
                onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
                placeholder="List the tasks this employee completed..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/attendance')} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (!selectedEmployee && !formData.employeeName.trim())} 
                className="flex-1"
              >
                {isLoading ? 'Marking Attendance...' : 'Mark Attendance'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 