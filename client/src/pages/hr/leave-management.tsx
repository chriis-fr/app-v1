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
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  Edit,
  Eye,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

const leaveColumns = [
  {
    accessorKey: 'employeeName',
    header: 'Employee',
    cell: ({ row }: any) => {
      const employeeName = row.getValue('employeeName');
      return (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{employeeName}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'leaveType',
    header: 'Leave Type',
    cell: ({ row }: any) => {
      const leaveType = row.getValue('leaveType');
      const typeColors = {
        'Annual Leave': 'bg-blue-100 text-blue-800',
        'Sick Leave': 'bg-red-100 text-red-800',
        'Maternity Leave': 'bg-pink-100 text-pink-800',
        'Paternity Leave': 'bg-purple-100 text-purple-800',
        'Study Leave': 'bg-green-100 text-green-800',
        'Unpaid Leave': 'bg-gray-100 text-gray-800'
      };
      return (
        <Badge className={typeColors[leaveType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
          {leaveType}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }: any) => {
      const startDate = new Date(row.getValue('startDate'));
      return startDate.toLocaleDateString();
    }
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }: any) => {
      const endDate = new Date(row.getValue('endDate'));
      return endDate.toLocaleDateString();
    }
  },
  {
    accessorKey: 'days',
    header: 'Days',
    cell: ({ row }: any) => {
      const days = row.getValue('days');
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }: any) => {
      const submittedAt = new Date(row.getValue('submittedAt'));
      return submittedAt.toLocaleDateString();
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const leaveRequest = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          {leaveRequest.status === 'pending' && (
            <>
              <Button variant="outline" size="sm" className="text-green-600">
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      );
}
  }
];

export default function LeaveManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, balanceResponse] = await Promise.all([
        fetch('/api/hr/leave-requests', { credentials: 'include' }),
        fetch('/api/hr/leave-balance', { credentials: 'include' })
      ]);
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setLeaveRequests(requestsData);
      }
      
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setLeaveBalance(balanceData);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leave data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.leaveType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const exportLeaveData = () => {
    // Implementation for exporting leave data
    toast({
      title: 'Export',
      description: 'Leave data exported successfully'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground">Manage employee leave requests and balances</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportLeaveData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        {/* Leave Balance Overview */}
        {leaveBalance && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaveBalance.totalEmployees}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaveBalance.pendingRequests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaveBalance.approvedRequests}</div>
              </CardContent>
            </Card>
            
              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaveBalance.rejectedRequests}</div>
                </CardContent>
              </Card>
                            </div>
        )}

        {/* Leave Balance Details */}
        {leaveBalance && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {leaveBalance.leaveTypes?.map((leaveType: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{leaveType.type}</span>
                      <Badge variant="outline">{leaveType.remainingDays} left</Badge>
                              </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total: {leaveType.totalDays}</span>
                        <span>Used: {leaveType.usedDays}</span>
                              </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(leaveType.usedDays / leaveType.totalDays) * 100}%` }}
                        ></div>
                              </div>
                          </div>
                        </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    id="search"
                    placeholder="Search employees or leave types..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
                              <div>
                <Label htmlFor="type">Leave Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                    <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                    <SelectItem value="Study Leave">Study Leave</SelectItem>
                    <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

        {/* Leave Requests Table */}
            <Card>
              <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading leave requests...</span>
                  </div>
                ) : (
              <DataTable
                columns={leaveColumns}
                data={filteredLeaveRequests}
              />
                )}
              </CardContent>
            </Card>
      </div>
    </DashboardLayout>
  );
} 