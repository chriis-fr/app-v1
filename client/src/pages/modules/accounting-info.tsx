import React from 'react';
import { useAccounting } from '@/hooks/use-accounting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Calculator, Receipt } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AccountingInfoPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const {
    accounts,
    journalEntries,
    financialPeriods,
    isLoadingAccounts,
    isLoadingJournalEntries,
    isLoadingFinancialPeriods,
  } = useAccounting();

  const isLoading = isLoadingAccounts || isLoadingJournalEntries || isLoadingFinancialPeriods;

  if (!user?.moduleAccess?.includes('accounting')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You don't have access to the accounting module.
        </p>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Accounting Module</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's financial records and transactions
          </p>
        </div>
        <Button onClick={() => setLocation('/dashboard/accounting')}>
          Open Module
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Accounts
                </CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingAccounts ? '...' : accounts?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active accounts in chart of accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Journal Entries
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingJournalEntries ? '...' : journalEntries?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total journal entries recorded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Financial Periods
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingFinancialPeriods ? '...' : financialPeriods?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active financial periods
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Ledger</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Record and manage journal entries</li>
                  <li>Track account balances</li>
                  <li>Generate financial reports</li>
                  <li>View transaction history</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chart of Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Manage account structure</li>
                  <li>Create and modify accounts</li>
                  <li>Set account types and categories</li>
                  <li>Track account balances</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Periods</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Manage fiscal periods</li>
                  <li>Close accounting periods</li>
                  <li>Generate period reports</li>
                  <li>Track period status</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Balance Sheet</li>
                  <li>Income Statement</li>
                  <li>Trial Balance</li>
                  <li>General Ledger Report</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Account Distribution</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Asset Accounts</p>
                      <p className="text-2xl font-bold">
                        {isLoadingAccounts
                          ? '...'
                          : accounts?.filter(a => a.type === 'asset').length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Liability Accounts</p>
                      <p className="text-2xl font-bold">
                        {isLoadingAccounts
                          ? '...'
                          : accounts?.filter(a => a.type === 'liability').length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Equity Accounts</p>
                      <p className="text-2xl font-bold">
                        {isLoadingAccounts
                          ? '...'
                          : accounts?.filter(a => a.type === 'equity').length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue Accounts</p>
                      <p className="text-2xl font-bold">
                        {isLoadingAccounts
                          ? '...'
                          : accounts?.filter(a => a.type === 'revenue').length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Journal Entry Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Posted Entries</p>
                      <p className="text-2xl font-bold">
                        {isLoadingJournalEntries
                          ? '...'
                          : journalEntries?.filter(e => e.status === 'posted').length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Draft Entries</p>
                      <p className="text-2xl font-bold">
                        {isLoadingJournalEntries
                          ? '...'
                          : journalEntries?.filter(e => e.status === 'draft').length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountingInfoPage; 