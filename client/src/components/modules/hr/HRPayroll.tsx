import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Employee } from '@/pages/hr/columns';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
}

export default function HRPayroll() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

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

      // Fetch payroll records
      const payrollResponse = await fetch('/api/hr/payroll');
      if (!payrollResponse.ok) throw new Error('Failed to fetch payroll records');
      const payrollData = await payrollResponse.json();

      // Combine employee data with payroll records
      const enrichedPayrollRecords = payrollData.map((record: any) => {
        const employee = employeesData.find((emp: Employee) => emp.id === record.employeeId);
        return {
          ...record,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : record.employeeName || 'Unknown',
          // Ensure we have fallback values for required fields
          netSalary: record.netSalary || record.amount || 0,
          currency: record.currency || 'USD',
          status: record.status || 'pending',
          paymentDate: record.paymentDate || record.date || null,
        };
      });

      setPayrollRecords(enrichedPayrollRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payroll data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessorKey: 'employeeName', header: 'Employee Name' },
    { accessorKey: 'netSalary', header: 'Amount',
      cell: ({ row }: { row: any }) => {
        const amount = row.original.netSalary || row.original.amount || 0;
        return `$${Number(amount).toFixed(2)}`;
      }
    },
    { accessorKey: 'currency', header: 'Currency' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'paymentDate', header: 'Date',
      cell: ({ row }: { row: any }) => {
        const date = row.original.paymentDate || row.original.date;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    },
  ];

  const handleExport = async () => {
    try {
      const response = await fetch('/api/hr/payroll/export');
      if (!response.ok) throw new Error('Failed to export payroll data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Payroll data exported successfully',
      });
    } catch (error) {
      console.error('Error exporting payroll:', error);
      toast({
        title: 'Error',
        description: 'Failed to export payroll data',
        variant: 'destructive',
      });
    }
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading payroll data...</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Payroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            renderLoadingState()
          ) : (
            <DataTable
              columns={columns}
              data={payrollRecords}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 