import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  FileText, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  Download,
  Settings,
  BarChart3
} from 'lucide-react';
import ModuleLayout from '@/components/layout/ModuleLayout';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'paid' | 'casual' | 'sick' | 'marriage' | 'unpaid' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  paidLeave: number;
  casualLeave: number;
  sickLeave: number;
  marriageLeave: number;
  unpaidLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  year: number;
}

interface LeavePolicy {
  id: string;
  name: string;
  leaveType: string;
  defaultDays: number;
  maxDays: number;
  requiresApproval: boolean;
  requiresDocumentation: boolean;
  description: string;
}

export default function LeaveManagementPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    fetchLeaveManagementData();
  }, []);

  const fetchLeaveManagementData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // const leaveRequestsResponse = await fetch('/api/hr/leave-management/requests');
      // const leaveBalancesResponse = await fetch('/api/hr/leave-management/balances');
      // const leavePoliciesResponse = await fetch('/api/hr/leave-management/policies');
      
      // For now, using empty arrays
      setLeaveRequests([]);
      setLeaveBalances([]);
      setLeavePolicies([]);
    } catch (error) {
      console.error('Error fetching leave management data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leave management data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'casual': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'marriage': return 'bg-purple-100 text-purple-800';
      case 'unpaid': return 'bg-gray-100 text-gray-800';
      case 'maternity': return 'bg-pink-100 text-pink-800';
      case 'paternity': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !['owner', 'admin', 'hr_admin'].includes(user.role?.toLowerCase())) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground">Manage leave requests, approvals, and policies</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="paid">Paid Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="marriage">Marriage Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : leaveRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Leave Requests</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Leave requests will appear here once employees submit them.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {leaveRequests
                  .filter(request => 
                    request.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(request => filterStatus === 'all' || request.status === filterStatus)
                  .filter(request => filterType === 'all' || request.leaveType === filterType)
                  .map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{request.employeeName}</h3>
                              <Badge className={getStatusColor(request.status)}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </Badge>
                              <Badge className={getLeaveTypeColor(request.leaveType)}>
                                {request.leaveType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {request.duration} days
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                Requested: {new Date(request.requestedDate).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Reason:</strong> {request.reason}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {request.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button variant="outline" size="sm" className="text-green-600">
                                  Approve
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances" className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : leaveBalances.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Leave Balances</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Leave balances will appear here once employees are added to the system.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {leaveBalances
                  .filter(balance => 
                    balance.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((balance) => (
                    <Card key={balance.employeeId} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">{balance.employeeName}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Paid Leave:</span>
                                <span className="ml-2 font-medium">{balance.paidLeave}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Casual Leave:</span>
                                <span className="ml-2 font-medium">{balance.casualLeave}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Sick Leave:</span>
                                <span className="ml-2 font-medium">{balance.sickLeave}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Marriage Leave:</span>
                                <span className="ml-2 font-medium">{balance.marriageLeave}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Unpaid Leave:</span>
                                <span className="ml-2 font-medium">{balance.unpaidLeave}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Maternity Leave:</span>
                                <span className="ml-2 font-medium">{balance.maternityLeave}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Paternity Leave:</span>
                                <span className="ml-2 font-medium">{balance.paternityLeave}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Year:</span>
                                <span className="ml-2 font-medium">{balance.year}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View History
                            </Button>
                            <Button variant="outline" size="sm">
                              Update Balance
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Leave Policies</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {leavePolicies.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Leave Policies</h3>
                    <p className="text-muted-foreground mb-4">
                      Create leave policies to define different types of leave and their rules.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Policy
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {leavePolicies.map((policy) => (
                      <Card key={policy.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold">{policy.name}</h3>
                                <Badge className={getLeaveTypeColor(policy.leaveType)}>
                                  {policy.leaveType}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{policy.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Default Days:</span>
                                  <span className="ml-2 font-medium">{policy.defaultDays}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Max Days:</span>
                                  <span className="ml-2 font-medium">{policy.maxDays}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Requires Approval:</span>
                                  <span className="ml-2 font-medium">{policy.requiresApproval ? 'Yes' : 'No'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Requires Documentation:</span>
                                  <span className="ml-2 font-medium">{policy.requiresDocumentation ? 'Yes' : 'No'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leave Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive leave reports and analytics will be available here.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Leave utilization reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Department-wise leave analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Leave trend analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Approval workflow reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 