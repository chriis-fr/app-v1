import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface TimesheetEntry {
  _id: string;
  userId: string;
  organizationId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed' | 'stopped';
  type: 'work' | 'break' | 'meeting' | 'training' | 'other';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const timesheetColumns = [
  {
    accessorKey: 'user',
    header: 'Employee',
    cell: ({ row }: any) => {
      const user = row.getValue('user');
      return (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{user.firstName} {user.lastName}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'startTime',
    header: 'Start Time',
    cell: ({ row }: any) => {
      const startTime = new Date(row.getValue('startTime'));
      return startTime.toLocaleString();
    }
  },
  {
    accessorKey: 'endTime',
    header: 'End Time',
    cell: ({ row }: any) => {
      const endTime = row.getValue('endTime');
      return endTime ? new Date(endTime).toLocaleString() : '-';
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: any) => {
      const type = row.getValue('type');
      const typeColors = {
        work: 'bg-blue-100 text-blue-800',
        break: 'bg-yellow-100 text-yellow-800',
        meeting: 'bg-purple-100 text-purple-800',
        training: 'bg-green-100 text-green-800',
        other: 'bg-gray-100 text-gray-800'
      };
      return (
        <Badge className={typeColors[type as keyof typeof typeColors]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-blue-100 text-blue-800',
        stopped: 'bg-red-100 text-red-800'
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }: any) => {
      const startTime = new Date(row.getValue('startTime'));
      const endTime = row.getValue('endTime');
      
      if (!endTime) return '-';
      
      const duration = new Date(endTime).getTime() - startTime.getTime();
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const timesheet = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];

export default function TimesheetsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hr/timesheets', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimesheets(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch timesheets',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch timesheets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesSearch = 
      timesheet.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timesheet.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timesheet.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter;
    const matchesType = typeFilter === 'all' || timesheet.type === typeFilter;
    
    const matchesDate = !dateFilter || 
      new Date(timesheet.startTime).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const exportTimesheets = () => {
    // Implementation for exporting timesheets
    toast({
      title: 'Export',
      description: 'Timesheets exported successfully'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Timesheets</h1>
            <p className="text-muted-foreground">Track and manage employee time entries</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportTimesheets}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheets.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timesheets.filter(t => t.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paused Sessions</CardTitle>
              <Pause className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timesheets.filter(t => t.status === 'paused').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Square className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timesheets.filter(t => 
                  t.status === 'completed' && 
                  new Date(t.endTime!).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timesheet Table */}
        <Card>
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading timesheets...</span>
              </div>
            ) : (
              <DataTable
                columns={timesheetColumns}
                data={filteredTimesheets}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 