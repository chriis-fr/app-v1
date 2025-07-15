import { useState, useEffect } from 'react';
import { staticData } from '@/data/static';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Receipt, PlusCircle, DollarSign, Users } from 'lucide-react';

export default function AccountingMain() {
  const [invoices, setInvoices] = useState(staticData.accounting.invoices);
  const [ledger, setLedger] = useState(staticData.accounting.ledger);
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccountingData = async () => {
      setLoading(true);
      try {
        const [ledgerRes, invoicesRes, payrollRes] = await Promise.all([
          fetch('/api/accounting/ledger'),
          fetch('/api/accounting/invoices'),
          fetch('/api/accounting/payroll')
        ]);

        if (ledgerRes.ok) {
          const ledgerData = await ledgerRes.json();
          setLedger(ledgerData);
        }

        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData);
        }

        if (payrollRes.ok) {
          const payrollData = await payrollRes.json();
          setPayrollData(payrollData);
        }
      } catch (error) {
        console.error('Error fetching accounting data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountingData();
  }, []);

  const invoiceColumns = [
    { accessorKey: 'id', header: 'Invoice ID' },
    { accessorKey: 'customerId', header: 'Customer ID' },
    { accessorKey: 'amount', header: 'Amount',
      cell: ({ row }: { row: any }) => `$${row.original.amount.toFixed(2)}` 
    },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'createdAt', header: 'Date',
      cell: ({ row }: { row: any }) => new Date(row.original.createdAt).toLocaleDateString()
    },
  ];

  const ledgerColumns = [
    { accessorKey: 'id', header: 'Entry ID' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'amount', header: 'Amount',
      cell: ({ row }: { row: any }) => `$${row.original.amount.toFixed(2)}` 
    },
    { accessorKey: 'createdAt', header: 'Date',
      cell: ({ row }: { row: any }) => new Date(row.original.createdAt).toLocaleDateString()
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Accounting</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${ledger
                  .filter(entry => entry.type === 'Credit')
                  .reduce((acc, entry) => acc + entry.amount, 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${invoices
                  .filter(inv => inv.status === 'Pending')
                  .reduce((acc, inv) => acc + inv.amount, 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${ledger
                  .reduce((acc, entry) => 
                    acc + (entry.type === 'Credit' ? entry.amount : -entry.amount), 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payroll Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payrollData?.summary?.totalPayrollExpense?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {payrollData?.summary?.employeeCount || 0} employees
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="ledger">General Ledger</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Records</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={invoiceColumns}
                  data={invoices}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ledger">
            <Card>
              <CardHeader>
                <CardTitle>Ledger Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={ledgerColumns}
                  data={ledger}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payroll Accounting
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payrollData ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${payrollData.summary?.totalPayrollExpense?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Payroll Expense</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${payrollData.summary?.totalTaxPayable?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-muted-foreground">Tax Payable</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          ${payrollData.summary?.totalNetPay?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-muted-foreground">Net Pay</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Payroll Entries</h3>
                      <DataTable 
                        columns={[
                          { accessorKey: 'reference', header: 'Reference' },
                          { accessorKey: 'description', header: 'Description' },
                          { accessorKey: 'amount', header: 'Amount',
                            cell: ({ row }: { row: any }) => `$${row.original.amount.toFixed(2)}`
                          },
                          { accessorKey: 'date', header: 'Date',
                            cell: ({ row }: { row: any }) => new Date(row.original.date).toLocaleDateString()
                          },
                          { accessorKey: 'status', header: 'Status' }
                        ]}
                        data={payrollData.entries || []}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No payroll data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
