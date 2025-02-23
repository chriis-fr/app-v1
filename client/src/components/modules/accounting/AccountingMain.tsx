import { useState } from 'react';
import { staticData } from '@/data/static';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Receipt, PlusCircle } from 'lucide-react';

export default function AccountingMain() {
  const invoices = staticData.accounting.invoices;
  const ledger = staticData.accounting.ledger;

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

        <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="ledger">General Ledger</TabsTrigger>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
