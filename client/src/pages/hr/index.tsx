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
  Clock
} from 'lucide-react';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { DataTable } from '@/components/ui/data-table';
import { columns, Employee } from './columns';
import { Payroll } from '@/components/hr/Payroll';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HRPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginAccessFilter, setLoginAccessFilter] = useState<'all' | 'login' | 'no-login'>('all');

  useEffect(() => {
    if (!user || !(user.role === 'owner' || user.role === 'hr_admin')) {
      setLocation('/dashboard');
      return;
    }
    fetchEmployees();
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

        <Tabs defaultValue="employees" className="space-y-4">
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
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 