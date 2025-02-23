import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Mail, Phone } from 'lucide-react';

// Mock CRM data since it's not in the static dataset
const mockCustomers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    status: 'Active',
    lastContact: '2024-01-15T10:00:00Z',
    totalPurchases: 1500.00
  },
  // Add more mock customers as needed
];

export default function CRMMain() {
  const customerColumns = [
    { accessorKey: 'name', header: 'Customer Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'lastContact', header: 'Last Contact',
      cell: ({ row }: { row: any }) => new Date(row.original.lastContact).toLocaleDateString()
    },
    { accessorKey: 'totalPurchases', header: 'Total Purchases',
      cell: ({ row }: { row: any }) => `$${row.original.totalPurchases.toFixed(2)}`
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customer Relationship Management</h1>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCustomers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockCustomers.filter(c => c.status === 'Active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockCustomers.reduce((acc, c) => acc + c.totalPurchases, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={customerColumns}
              data={mockCustomers}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCustomers.slice(0, 3).map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last contact: {new Date(customer.lastContact).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Purchase Value</span>
                  <span className="font-bold">
                    ${(mockCustomers.reduce((acc, c) => acc + c.totalPurchases, 0) / 
                      mockCustomers.length).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Customer Retention Rate</span>
                  <span className="font-bold">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Customer Satisfaction</span>
                  <span className="font-bold">4.5/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
