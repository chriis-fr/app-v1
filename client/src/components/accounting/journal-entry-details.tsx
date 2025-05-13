import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
}

interface JournalEntryLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
  account: Account;
}

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  status: string;
  lines: JournalEntryLine[];
}

interface JournalEntryDetailsProps {
  entry: JournalEntry;
  onClose: () => void;
  onPost?: () => void;
  onVoid?: () => void;
}

export function JournalEntryDetails({ entry, onClose, onPost, onVoid }: JournalEntryDetailsProps) {
  const totalDebits = entry.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredits = entry.lines.reduce((sum, line) => sum + line.credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{entry.reference}</h2>
          <p className="text-muted-foreground">{entry.description}</p>
        </div>
        <Badge
          variant={
            entry.status === 'Posted' ? 'default' :
            entry.status === 'Void' ? 'destructive' :
            'secondary'
          }
        >
          {entry.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{format(new Date(entry.date), 'PPP')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Created By</CardTitle>
          </CardHeader>
          <CardContent>
            <p>System User</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Lines</CardTitle>
          <CardDescription>Details of the journal entry lines</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{line.account.name}</div>
                      <div className="text-sm text-muted-foreground">{line.account.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>{line.description}</TableCell>
                  <TableCell className="text-right">
                    {line.debit > 0 ? `$${line.debit.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {line.credit > 0 ? `$${line.credit.toLocaleString()}` : '-'}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="text-right font-medium">Total</TableCell>
                <TableCell className="text-right font-medium">
                  ${totalDebits.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${totalCredits.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {entry.status === 'Draft' && (
          <>
            <Button variant="outline" onClick={onVoid}>
              Void Entry
            </Button>
            <Button onClick={onPost}>
              Post Entry
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
} 