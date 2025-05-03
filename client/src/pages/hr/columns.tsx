import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hireDate: string;
  managerId?: string;
  team?: string;
  skills?: string[];
  experienceYears: number;
  credentials?: Array<{
    id: string;
    type: 'education' | 'certification' | 'experience';
    title: string;
    issuer: string;
    date: string;
    verified: boolean;
    blockchainHash?: string;
  }>;
  compensation?: {
    baseSalary: number;
    bonus: number;
    stockOptions: number;
    currency: string;
  };
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'position',
    header: 'Position',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusMap: Record<string, BadgeVariant> = {
        active: 'default',
        inactive: 'secondary',
        on_leave: 'outline',
        terminated: 'destructive'
      };
      
      return (
        <Badge variant={statusMap[status] || 'secondary'}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Unknown'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'hireDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Hire Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
]; 