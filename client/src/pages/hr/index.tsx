import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Calendar,
  Shield,
  Plus,
  Search,
  UserPlus,
  Clock,
  CheckSquare,
  ShoppingCart,
  Package,
  BarChart3,
  Settings
} from 'lucide-react';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { DataTable } from '@/components/ui/data-table';
import { columns, Employee } from './columns';
import { Payroll } from '@/components/hr/Payroll';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TaskManager from '@/components/tasks/TaskManager';
import HRTaskManager from '@/components/hr/HRTaskManager';
import HRProcurement from '@/components/hr/HRProcurement';
import ProcurementMain from '@/components/modules/procurement/ProcurementMain';
import RFPManager from '@/components/modules/procurement/RFPManager';
import ContractManager from '@/components/modules/procurement/ContractManager';
import GRNManager from '@/components/modules/procurement/GRNManager';
import VendorPerformanceManager from '@/components/modules/procurement/VendorPerformanceManager';
import ProcurementPolicyManager from '@/components/modules/procurement/ProcurementPolicyManager';
import ProcurementCommitteeManager from '@/components/modules/procurement/ProcurementCommitteeManager';
import ProcurementAnalytics from '@/components/modules/procurement/ProcurementAnalytics';
import ProcurementAuditTrail from '@/components/modules/procurement/ProcurementAuditTrail';
import ProcurementNotifications from '@/components/modules/procurement/ProcurementNotifications';

export default function HRPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginAccessFilter, setLoginAccessFilter] = useState<'all' | 'login' | 'no-login'>('all');
  const [activeTab, setActiveTab] = useState('employees');
  const [procurementSubTab, setProcurementSubTab] = useState('overview');
  const organizationId = user?.organizationId || '';

  useEffect(() => {
    if (!user || !(user.role === 'owner' || user.role === 'hr_admin')) {
      setLocation('/dashboard');
      return;
    }
    
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['employees', 'skills', 'credentials', 'payroll', 'timeoff', 'performance', 'attendance', 'documents', 'leave', 'tasks', 'procurement'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    fetchEmployees();
    
    // Refresh attendance data every 30 seconds
    // const attendanceInterval = setInterval(fetchAttendanceData, 30000);
    
    // return () => clearInterval(attendanceInterval);
  }, [user]);

  const fetchEmployees = async () => {
    try {
      let url = '/api/hr/employees';
      if (loginAccessFilter === 'login') url += '?canLogin=true';
      if (loginAccessFilter === 'no-login') url += '?canLogin=false';
      const response = await fetch(url, { credentials: 'include' });
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Expected JSON, got: ' + text.slice(0, 200));
      }
      const data = await response.json();
      // Exclude owners if any slipped through
      setEmployees(data.filter((emp: any) => emp.role !== 'owner'));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCredential = async (credentialId: string, userId: string) => {
    try {
      const response = await fetch('/api/hr/verify-credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialId,
          userId
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Update the local state with the verified credential
        setEmployees(employees.map(emp => 
          emp.id === userId
            ? {
                ...emp,
                credentials: emp.credentials?.map(cred => 
                  cred.id === credentialId 
                    ? { ...cred, verified: true, blockchainHash: data.blockchainHash }
                    : cred
                )
              }
            : emp
        ));
        toast({
          title: 'Success',
          description: 'Credential verified successfully',
        });
      }
    } catch (error) {
      console.error('Error verifying credential:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify credential',
        variant: 'destructive',
      });
    }
  };

  const filteredEmployees = employees.filter(employee => 
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ModuleLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">HR Management</h1>
          <div className="flex gap-2">
            <Select value={loginAccessFilter} onValueChange={v => setLoginAccessFilter(v as any)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Login Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="login">With Login</SelectItem>
                <SelectItem value="no-login">No Login</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setLocation('/hr/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">
              <Users className="mr-2 h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Briefcase className="mr-2 h-4 w-4" />
              Skills & Matching
            </TabsTrigger>
            <TabsTrigger value="credentials">
              <FileText className="mr-2 h-4 w-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="payroll">
              <CreditCard className="mr-2 h-4 w-4" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="timeoff">
              <Calendar className="mr-2 h-4 w-4" />
              Time Off
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Shield className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Clock className="mr-2 h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="leave">
              <Calendar className="mr-2 h-4 w-4" />
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="mr-2 h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="procurement">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Procurement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredEmployees}
                  onRowClick={(employee) => setLocation(`/users/${employee.id}`)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skill Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillMatching
                  projectRequirements={{
                    skills: ['javascript', 'typescript', 'react', 'node.js'],
                    experience: 3
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>Credential Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="space-y-4">
                      <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                      <CredentialVerification
                        credentials={employee.credentials || []}
                        onVerify={(credentialId) => handleVerifyCredential(credentialId, employee.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredEmployees.map((employee) => (
                    <Payroll
                      key={employee.id}
                      employee={employee}
                      onUpdate={async (employeeId, compensation) => {
                        try {
                          const response = await fetch(`/api/hr/${employeeId}/compensation`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              compensation
                            }),
                          });
                          if (!response.ok) throw new Error('Failed to update compensation');
                          const updatedEmployee = await response.json();
                          setEmployees(employees.map(emp => 
                            emp.id === employeeId ? updatedEmployee : emp
                          ));
                        } catch (error) {
                          console.error('Error updating compensation:', error);
                          throw error;
                        }
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View and manage employee attendance records
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Employee Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access and manage employee documents and records
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle>Leave Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View and manage employee leave requests
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
              </CardHeader>
              <CardContent>
                <HRTaskManager organizationId={organizationId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procurement">
            <Card>
              <CardHeader>
                <CardTitle>Procurement Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900">24</p>
                          </div>
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                            <p className="text-2xl font-bold text-yellow-600">8</p>
                          </div>
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                            <p className="text-2xl font-bold text-green-600">12</p>
                          </div>
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Spend</p>
                            <p className="text-2xl font-bold text-gray-900">$45.2K</p>
                          </div>
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <CreditCard className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Procurement Subtabs */}
                  <Tabs value={procurementSubTab} onValueChange={setProcurementSubTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 mb-6">
                      <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden lg:inline">Overview</span>
                      </TabsTrigger>
                      <TabsTrigger value="requests" className="flex items-center gap-2 text-xs">
                        <FileText className="h-4 w-4" />
                        <span className="hidden lg:inline">Requests</span>
                      </TabsTrigger>
                      <TabsTrigger value="rfps" className="flex items-center gap-2 text-xs">
                        <Briefcase className="h-4 w-4" />
                        <span className="hidden lg:inline">RFPs</span>
                      </TabsTrigger>
                      <TabsTrigger value="contracts" className="flex items-center gap-2 text-xs">
                        <Shield className="h-4 w-4" />
                        <span className="hidden lg:inline">Contracts</span>
                      </TabsTrigger>
                      <TabsTrigger value="grns" className="flex items-center gap-2 text-xs">
                        <Package className="h-4 w-4" />
                        <span className="hidden lg:inline">GRNs</span>
                      </TabsTrigger>
                      <TabsTrigger value="vendors" className="flex items-center gap-2 text-xs">
                        <Users className="h-4 w-4" />
                        <span className="hidden lg:inline">Vendors</span>
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden lg:inline">Analytics</span>
                      </TabsTrigger>
                      <TabsTrigger value="policies" className="flex items-center gap-2 text-xs">
                        <Settings className="h-4 w-4" />
                        <span className="hidden lg:inline">Policies</span>
                      </TabsTrigger>
                      <TabsTrigger value="committee" className="flex items-center gap-2 text-xs">
                        <Users className="h-4 w-4" />
                        <span className="hidden lg:inline">Committee</span>
                      </TabsTrigger>
                      <TabsTrigger value="audit" className="flex items-center gap-2 text-xs">
                        <CheckSquare className="h-4 w-4" />
                        <span className="hidden lg:inline">Audit</span>
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden lg:inline">Notifications</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="border rounded-lg p-4">
                        <ProcurementMain />
                      </div>
                    </TabsContent>

                    <TabsContent value="requests">
                      <div className="border rounded-lg p-4">
                        <HRProcurement organizationId={organizationId} />
                      </div>
                    </TabsContent>

                    <TabsContent value="rfps">
                      <div className="border rounded-lg p-4">
                        <RFPManager />
                      </div>
                    </TabsContent>

                    <TabsContent value="contracts">
                      <div className="border rounded-lg p-4">
                        <ContractManager />
                      </div>
                    </TabsContent>

                    <TabsContent value="grns">
                      <div className="border rounded-lg p-4">
                        <GRNManager />
                      </div>
                    </TabsContent>

                    <TabsContent value="vendors">
                      <div className="border rounded-lg p-4">
                        <VendorPerformanceManager />
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                      <div className="border rounded-lg p-4">
                        <ProcurementAnalytics />
                      </div>
                    </TabsContent>

                    <TabsContent value="policies">
                      <div className="border rounded-lg p-4">
                        <ProcurementPolicyManager />
                      </div>
                    </TabsContent>

                    <TabsContent value="committee">
                      <div className="border rounded-lg p-4">
                        <ProcurementCommitteeManager />
                      </div>
                    </TabsContent>

                    <TabsContent value="audit">
                      <div className="border rounded-lg p-4">
                        <ProcurementAuditTrail />
                      </div>
                    </TabsContent>

                    <TabsContent value="notifications">
                      <div className="border rounded-lg p-4">
                        <ProcurementNotifications />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 