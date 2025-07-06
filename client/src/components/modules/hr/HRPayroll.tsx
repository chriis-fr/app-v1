import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, DollarSign, User, Calendar } from 'lucide-react';
import { Employee } from '@/pages/hr/columns';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  salaryAmount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  taxDeduction: number;
  benefitsDeduction: number;
  netPay: number;
  lastUpdated: Date;
}

interface PayrollSettings {
  taxRate: number;
  benefitsRate: number;
  overtimeRate: number;
  currency: string;
  paymentFrequency: string;
  autoProcess: boolean;
  requireApproval: boolean;
  deductions: {
    healthInsurance: number;
    retirementPlan: number;
    lifeInsurance: number;
    otherDeductions: number;
  };
}

export default function HRPayroll() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>({
    taxRate: 15,
    benefitsRate: 5,
    overtimeRate: 1.5,
    currency: 'USD',
    paymentFrequency: 'monthly',
    autoProcess: false,
    requireApproval: true,
    deductions: {
      healthInsurance: 2,
      retirementPlan: 3,
      lifeInsurance: 1,
      otherDeductions: 0
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch payroll settings first
      const settingsResponse = await fetch('/api/hr/payroll-settings', {
        credentials: 'include'
      });
      
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        setPayrollSettings(settings);
      }
      
      // Fetch employees with payroll data
      const employeesResponse = await fetch('/api/hr/employees', {
        credentials: 'include'
      });
      
      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

      // Create payroll records from employee data using actual settings
      const payrollRecords = employeesData
        .filter((emp: any) => emp.status === 'active' && emp.isActive !== false)
        .map((emp: any) => {
          const salaryAmount = emp.salaryAmount || 0;
          const taxRate = payrollSettings.taxRate / 100;
          const benefitsRate = payrollSettings.benefitsRate / 100;
          const totalDeductionsRate = (payrollSettings.deductions.healthInsurance + 
                                      payrollSettings.deductions.retirementPlan + 
                                      payrollSettings.deductions.lifeInsurance + 
                                      payrollSettings.deductions.otherDeductions) / 100;
          
          const taxDeduction = salaryAmount * taxRate;
          const benefitsDeduction = salaryAmount * (benefitsRate + totalDeductionsRate);
          const netPay = salaryAmount - taxDeduction - benefitsDeduction;
          
          return {
            id: emp.id || emp._id,
            employeeId: emp.employeeId || emp.id || emp._id,
            employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown Employee',
            salaryAmount,
            currency: emp.currencyPreference || payrollSettings.currency,
            status: emp.salaryAmount && emp.salaryAmount > 0 ? 'active' : 'pending',
            paymentMethod: emp.payoutMethod || 'bank_transfer',
            taxDeduction,
            benefitsDeduction,
            netPay,
            lastUpdated: emp.updatedAt ? new Date(emp.updatedAt) : new Date()
          };
        });

      setPayrollRecords(payrollRecords);
      
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
    { 
      accessorKey: 'employeeName', 
      header: 'Employee Name',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.employeeName}</span>
        </div>
      )
    },
    { 
      accessorKey: 'salaryAmount', 
      header: 'Gross Salary',
      cell: ({ row }: { row: any }) => {
        const amount = row.original.salaryAmount || 0;
        return (
          <div className="font-medium">
            ${Number(amount).toLocaleString()}
          </div>
        );
      }
    },
    { 
      accessorKey: 'taxDeduction', 
      header: 'Tax Deduction',
      cell: ({ row }: { row: any }) => {
        const amount = row.original.taxDeduction || 0;
        return (
          <div className="text-red-600 font-medium">
            -${Number(amount).toLocaleString()}
          </div>
        );
      }
    },
    { 
      accessorKey: 'benefitsDeduction', 
      header: 'Benefits',
      cell: ({ row }: { row: any }) => {
        const amount = row.original.benefitsDeduction || 0;
        return (
          <div className="text-orange-600 font-medium">
            -${Number(amount).toLocaleString()}
          </div>
        );
      }
    },
    { 
      accessorKey: 'netPay', 
      header: 'Net Pay',
      cell: ({ row }: { row: any }) => {
        const amount = row.original.netPay || 0;
        return (
          <div className="font-bold text-green-600">
            ${Number(amount).toLocaleString()}
          </div>
        );
      }
    },
    { 
      accessorKey: 'currency', 
      header: 'Currency' 
    },
    { 
      accessorKey: 'paymentMethod', 
      header: 'Payment Method',
      cell: ({ row }: { row: any }) => {
        const method = row.original.paymentMethod;
        const methodLabels: { [key: string]: string } = {
          'stellar_wallet': 'Stellar Wallet',
          'mpesa': 'M-Pesa',
          'bank_transfer': 'Bank Transfer',
          'hybrid': 'Hybrid'
        };
        return methodLabels[method] || method;
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const status = row.original.status;
        const statusColors: { [key: string]: string } = {
          'active': 'bg-green-100 text-green-800',
          'pending': 'bg-yellow-100 text-yellow-800',
          'inactive': 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </span>
        );
      }
    },
    { 
      accessorKey: 'lastUpdated', 
      header: 'Last Updated',
      cell: ({ row }: { row: any }) => {
        const date = row.original.lastUpdated;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    },
  ];

  const handleExport = async () => {
    try {
      // Create CSV data from payroll records
      const csvData = [
        ['Employee Name', 'Gross Salary', 'Tax Deduction', 'Benefits Deduction', 'Net Pay', 'Currency', 'Payment Method', 'Status', 'Last Updated'],
        ...payrollRecords.map(record => [
          record.employeeName,
          `$${record.salaryAmount.toLocaleString()}`,
          `-$${record.taxDeduction.toLocaleString()}`,
          `-$${record.benefitsDeduction.toLocaleString()}`,
          `$${record.netPay.toLocaleString()}`,
          record.currency,
          record.paymentMethod,
          record.status,
          new Date(record.lastUpdated).toLocaleDateString()
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
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

  // Calculate summary statistics
  const totalGrossPayroll = payrollRecords.reduce((sum, record) => sum + record.salaryAmount, 0);
  const totalTaxDeductions = payrollRecords.reduce((sum, record) => sum + record.taxDeduction, 0);
  const totalBenefitsDeductions = payrollRecords.reduce((sum, record) => sum + record.benefitsDeduction, 0);
  const totalNetPayroll = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  const activeEmployees = payrollRecords.filter(record => record.status === 'active').length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employee Payroll Records</h2>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Payroll
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              With payroll data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalGrossPayroll.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${(totalTaxDeductions + totalBenefitsDeductions).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Tax & benefits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalNetPayroll.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              After deductions
            </p>
          </CardContent>
        </Card>
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