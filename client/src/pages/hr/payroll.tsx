import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import HRPayroll from '@/components/modules/hr/HRPayroll';
import PayrollSettings from '@/components/hr/PayrollSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, TrendingUp, Calendar, Loader2, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface PayrollStats {
  totalEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  pendingPayments: number;
  totalTaxDeductions: number;
  totalBenefitsDeductions: number;
  netPayroll: number;
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

export default function PayrollPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [payrollStats, setPayrollStats] = useState<PayrollStats>({
    totalEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
    pendingPayments: 0,
    totalTaxDeductions: 0,
    totalBenefitsDeductions: 0,
    netPayroll: 0
  });
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

  const fetchPayrollStats = async () => {
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
      
      const employees = await employeesResponse.json();
      
      // Calculate payroll statistics using actual settings
      const activeEmployees = employees.filter((emp: any) => emp.status === 'active' && emp.isActive !== false);
      const employeesWithSalary = activeEmployees.filter((emp: any) => emp.salaryAmount && emp.salaryAmount > 0);
      
      const totalEmployees = activeEmployees.length;
      const totalPayroll = employeesWithSalary.reduce((sum: number, emp: any) => sum + (emp.salaryAmount || 0), 0);
      const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
      
      // Calculate tax and benefits deductions using settings
      const taxRate = payrollSettings.taxRate / 100;
      const benefitsRate = payrollSettings.benefitsRate / 100;
      const totalDeductionsRate = (payrollSettings.deductions.healthInsurance + 
                                  payrollSettings.deductions.retirementPlan + 
                                  payrollSettings.deductions.lifeInsurance + 
                                  payrollSettings.deductions.otherDeductions) / 100;
      
      const totalTaxDeductions = totalPayroll * taxRate;
      const totalBenefitsDeductions = totalPayroll * (benefitsRate + totalDeductionsRate);
      const netPayroll = totalPayroll - totalTaxDeductions - totalBenefitsDeductions;
      
      // Count pending payments (employees without recent payroll entries)
      const pendingPayments = activeEmployees.length; // For now, all active employees are considered pending
      
      setPayrollStats({
        totalEmployees,
        totalPayroll,
        averageSalary,
        pendingPayments,
        totalTaxDeductions,
        totalBenefitsDeductions,
        netPayroll
      });
      
    } catch (error) {
      console.error('Error fetching payroll stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payroll statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading payroll data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">
              Manage employee payroll, compensation, and payment processing
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setLocation('/hr')}>
              Back to HR
            </Button>
            <Button onClick={() => setLocation('/hr/payroll/process')}>
              <DollarSign className="mr-2 h-4 w-4" />
              Process Payroll
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Records
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payrollStats.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    Active employees
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gross Payroll</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${payrollStats.totalPayroll.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Before deductions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${payrollStats.netPayroll.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After deductions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payrollStats.pendingPayments}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Deductions Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    -${payrollStats.totalTaxDeductions.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {payrollSettings.taxRate}% tax rate applied
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    -${payrollStats.totalBenefitsDeductions.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {payrollSettings.benefitsRate + 
                     payrollSettings.deductions.healthInsurance + 
                     payrollSettings.deductions.retirementPlan + 
                     payrollSettings.deductions.lifeInsurance + 
                     payrollSettings.deductions.otherDeductions}% total deductions
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <HRPayroll />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <PayrollSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 