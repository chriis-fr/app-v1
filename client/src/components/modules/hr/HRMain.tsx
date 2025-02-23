import { useState } from 'react';
import { staticData } from '@/data/static';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, DollarSign, Clock } from 'lucide-react';

export default function HRMain() {
  const employees = staticData.hr.employees;
  const payroll = staticData.hr.payroll;
  const attendance = staticData.hr.attendance;

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
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payroll.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendance.filter(a => !a.checkOutTime).length}
              </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Employee Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={employeeColumns}
                  data={employees}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Records</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={payrollColumns}
                  data={payroll}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Log</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={attendanceColumns}
                  data={attendance}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
