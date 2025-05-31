import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, DollarSign, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Employee } from '@/pages/hr/columns';

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
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payroll, setPayroll] = useState<PayrollData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      toast({
        title: 'Error',
        description: 'Failed to fetch HR data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const employeeColumns = [
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
  ];

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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Human Resources</h1>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

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
