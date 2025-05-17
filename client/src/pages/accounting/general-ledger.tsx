import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useAccounting } from '@/hooks/use-accounting';
import { JournalEntryForm } from '@/components/accounting/journal-entry-form';
import { AccountForm } from '@/components/accounting/account-form';
import { PeriodForm } from '@/components/accounting/period-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JournalEntryDetails } from '@/components/accounting/journal-entry-details';
import type { Account, FinancialPeriod, JournalEntry } from '@/hooks/use-accounting';

export default function GeneralLedgerPage() {
  const [activeTab, setActiveTab] = useState('journal-entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEntryDetailsDialog, setShowEntryDetailsDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountDetailsDialog, setShowAccountDetailsDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<FinancialPeriod | null>(null);
  const [showPeriodDetailsDialog, setShowPeriodDetailsDialog] = useState(false);

  const {
    accounts,
    isLoadingAccounts,
    createAccount,
    isCreatingAccount,
    journalEntries,
    isLoadingJournalEntries,
    createJournalEntry,
    isCreatingJournalEntry,
    financialPeriods,
    isLoadingFinancialPeriods,
    createFinancialPeriod,
    isCreatingFinancialPeriod,
  } = useAccounting();

  const handleCreateAccount = async (data: any) => {
    await createAccount(data);
    setShowNewAccountDialog(false);
  };

  const handleCreateJournalEntry = async (data: any) => {
    await createJournalEntry(data);
    setShowNewEntryDialog(false);
  };

  const handleCreatePeriod = async (data: any) => {
    await createFinancialPeriod(data);
    setShowNewPeriodDialog(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">General Ledger</h1>
          <p className="text-muted-foreground">
            Manage your chart of accounts and journal entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="financial-periods">Financial Periods</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="journal-entries">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Journal Entries</CardTitle>
                  <CardDescription>Create and manage journal entries</CardDescription>
                </div>
                <Button onClick={() => setShowNewEntryDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {isLoadingJournalEntries ? (
                <div className="text-center py-4">Loading journal entries...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries?.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.reference}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.status === 'Posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setShowEntryDetailsDialog(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart-of-accounts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Chart of Accounts</CardTitle>
                  <CardDescription>Manage your chart of accounts</CardDescription>
                </div>
                <Button onClick={() => setShowNewAccountDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {isLoadingAccounts ? (
                <div className="text-center py-4">Loading accounts...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts?.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell>${account.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account);
                              setShowAccountDetailsDialog(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-periods">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Financial Periods</CardTitle>
                  <CardDescription>Manage your fiscal periods and years</CardDescription>
                </div>
                <Button onClick={() => setShowNewPeriodDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Period
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingFinancialPeriods ? (
                <div className="text-center py-4">Loading financial periods...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialPeriods?.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell>{period.name}</TableCell>
                        <TableCell>{new Date(period.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(period.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            period.status === 'Open' ? 'bg-green-100 text-green-800' :
                            period.status === 'Closed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {period.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedPeriod(period);
                              setShowPeriodDetailsDialog(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Generate and view financial reports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Reports content will be added here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Journal Entry Dialog */}
      <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <JournalEntryForm
            accounts={accounts || []}
            onSubmit={handleCreateJournalEntry}
            onCancel={() => setShowNewEntryDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* New Account Dialog */}
      <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>
          <AccountForm
            accounts={accounts || []}
            onSubmit={handleCreateAccount}
            onCancel={() => setShowNewAccountDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* New Period Dialog */}
      <Dialog open={showNewPeriodDialog} onOpenChange={setShowNewPeriodDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Financial Period</DialogTitle>
          </DialogHeader>
          <PeriodForm
            onSubmit={handleCreatePeriod}
            onCancel={() => setShowNewPeriodDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Journal Entry Details Dialog */}
      <Dialog open={showEntryDetailsDialog} onOpenChange={setShowEntryDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Journal Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <JournalEntryDetails 
              entry={selectedEntry} 
              onClose={() => setShowEntryDetailsDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Account Details Dialog */}
      <Dialog open={showAccountDetailsDialog} onOpenChange={setShowAccountDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div>
              <h3 className="text-lg font-semibold">{selectedAccount.name}</h3>
              <p className="text-muted-foreground">Code: {selectedAccount.code}</p>
              <p className="text-muted-foreground">Type: {selectedAccount.type}</p>
              <p className="text-muted-foreground">Balance: ${selectedAccount.balance.toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Period Details Dialog */}
      <Dialog open={showPeriodDetailsDialog} onOpenChange={setShowPeriodDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Financial Period Details</DialogTitle>
          </DialogHeader>
          {selectedPeriod && (
            <div>
              <h3 className="text-lg font-semibold">{selectedPeriod.name}</h3>
              <p className="text-muted-foreground">Start Date: {new Date(selectedPeriod.startDate).toLocaleDateString()}</p>
              <p className="text-muted-foreground">End Date: {new Date(selectedPeriod.endDate).toLocaleDateString()}</p>
              <p className="text-muted-foreground">Status: {selectedPeriod.status}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 