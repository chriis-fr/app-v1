import { useState } from 'react';
import { staticData } from '@/data/static';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpDown, Shield, Plus } from 'lucide-react';

export default function BlockchainMain() {
  const transactions = staticData.blockchain.transactions;

  const transactionColumns = [
    { accessorKey: 'txHash', header: 'Transaction Hash' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'amount', header: 'Amount',
      cell: ({ row }: { row: any }) => `${row.original.amount} ETH`
    },
    { accessorKey: 'createdAt', header: 'Timestamp',
      cell: ({ row }: { row: any }) => new Date(row.original.createdAt).toLocaleString()
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Blockchain Integration</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)} ETH
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Smart Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Connected Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Main Company Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        0x1234...5678
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Operations Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        0x8765...4321
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Payment Contract</p>
                      <p className="text-sm text-muted-foreground">
                        Status: Active
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Supply Chain Contract</p>
                      <p className="text-sm text-muted-foreground">
                        Status: Active
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={transactionColumns}
              data={transactions}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
