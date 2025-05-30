import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Employee } from '@/pages/hr/columns';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: string;
}

export default function HRAttendance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch employees
      const employeesResponse = await fetch('/api/mongodb/users');
      if (!employeesResponse.ok) throw new Error('Failed to fetch employees');
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

      // Fetch attendance records
      const attendanceResponse = await fetch('/api/hr/attendance');
      if (!attendanceResponse.ok) throw new Error('Failed to fetch attendance records');
      const attendanceData = await attendanceResponse.json();

      // Combine employee data with attendance records
      const enrichedAttendanceRecords = attendanceData.map((record: any) => {
        const employee = employeesData.find((emp: Employee) => emp.id === record.employeeId);
        return {
          ...record,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
          status: record.checkOutTime ? 'Checked Out' : 'Active',
        };
      });

      setAttendanceRecords(enrichedAttendanceRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessorKey: 'employeeName', header: 'Employee Name' },
    { accessorKey: 'checkInTime', header: 'Check In',
      cell: ({ row }: { row: any }) => new Date(row.original.checkInTime).toLocaleTimeString()
    },
    { accessorKey: 'checkOutTime', header: 'Check Out',
      cell: ({ row }: { row: any }) => row.original.checkOutTime ? 
        new Date(row.original.checkOutTime).toLocaleTimeString() : 'Active'
    },
    { accessorKey: 'status', header: 'Status' },
  ];

  const handleExport = async () => {
    try {
      const response = await fetch('/api/hr/attendance/export');
      if (!response.ok) throw new Error('Failed to export attendance data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Attendance data exported successfully',
      });
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to export attendance data',
        variant: 'destructive',
      });
    }
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading attendance data...</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Attendance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            renderLoadingState()
          ) : (
            <DataTable
              columns={columns}
              data={attendanceRecords}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 