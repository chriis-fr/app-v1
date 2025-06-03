import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

export interface Credential {
  id: string;
  title: string;
  type: 'education' | 'certification' | 'experience';
  name: string;
  issuer: string;
  date: string;
  verified: boolean;
  blockchainHash?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: 'active' | 'on_leave' | 'terminated';
  joinDate: string;
  credentials?: Credential[];
  canLogin: boolean;
}

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'firstName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'department',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'position',
    header: 'Position',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 ${
            status === 'active' ? 'bg-green-500' :
            status === 'on_leave' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="capitalize">{status.replace('_', ' ')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'joinDate',
    header: 'Join Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('joinDate'));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'canLogin',
    header: 'Login Access',
    cell: ({ row }: { row: any }) =>
      row.original.canLogin ? (
        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Yes</span>
      ) : (
        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">No</span>
      ),
  },
]; 