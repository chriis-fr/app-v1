import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Save, DollarSign, User, Building, CreditCard, Shield, FileText, Calendar, MapPin, Phone, Mail, Briefcase, Users, Award, Settings, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import PayrollOnboarding from '@/components/hr/PayrollOnboarding';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  joinDate: string;
  phoneNumber?: string;
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
  team?: string;
  salaryAmount?: number;
  payoutMethod?: string;
  currencyPreference?: string;
  country?: string;
  walletAddress?: string;
  taxId?: string;
  salaryFrequency?: string;
  contractType?: string;
  startDate?: string;
  createdAt: Date;
  updatedAt: Date;
  canLogin: boolean;
  source: string;
  
  // Additional fields from User model
  isOwner?: boolean;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLogin?: string;
  location?: any;
  workSchedule?: any;
  emergencyContact?: any;
  skills?: string[];
  certifications?: string[];
  education?: any;
  performance?: any;
  compensation?: any;
  benefits?: any;
  equipment?: any;
  accessLevels?: any;
  documents?: any;
  wallet?: any;
  legalDetails?: any;
  address?: any;
  paymentPreference?: string;
  cryptoWallets?: any;
  bankAccounts?: any;
  avatarUrl?: string;
  role?: string;
  permissions?: any;
}

export default function EmployeeHRDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);
  const [loadingPayrollHistory, setLoadingPayrollHistory] = useState(false);

    const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let employeeData;
      let canLogin = false;
      let source = 'user';
      
      // First, try to fetch from users API (for employees with login access)
      try {
        console.log('Trying to fetch from users API first...');
        const userResponse = await fetch(`/api/mongodb/users/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (userResponse.ok) {
          employeeData = await userResponse.json();
          canLogin = true;
          source = 'user';
          console.log('User data fetched successfully:', employeeData);
        } else {
          throw new Error('User not found, trying employee API...');
        }
      } catch (userError) {
        console.log('User API failed, trying employee API...');
        
        // If user API fails, try employee API (for employees without login access)
        try {
          const hrResponse = await fetch(`/api/hr/employees/${id}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!hrResponse.ok) {
            throw new Error(`Failed to fetch employee data: ${hrResponse.status} ${hrResponse.statusText}`);
          }
          
          employeeData = await hrResponse.json();
          canLogin = false;
          source = 'employee';
          console.log('Employee data fetched successfully:', employeeData);
        } catch (employeeError) {
          // If individual employee API fails, try to get from employee list
          console.log('Individual employee API failed, trying employee list...');
          const employeesResponse = await fetch('/api/hr/employees', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (employeesResponse.ok) {
            const employees = await employeesResponse.json();
            const targetEmployee = employees.find((emp: any) => emp.id === id || emp._id === id);
            
            if (targetEmployee) {
              // Employee found in list, use this data
              console.log('Employee found in list, using list data:', targetEmployee);
              employeeData = targetEmployee;
              canLogin = targetEmployee.canLogin || false;
              source = 'employee_list';
            } else {
              throw new Error('Employee not found in any system');
            }
          } else {
            throw new Error('Failed to verify employee existence');
          }
        }
      }
      
      // Set default values for UI fields if they don't exist in the database
      const employeeWithDefaults = {
        ...employeeData,
        // Ensure we have the correct ID
        id: employeeData.id || employeeData._id || id,
        // Basic fields with fallbacks
        position: employeeData.position || '',
        status: employeeData.status || 'active',
        department: employeeData.department || '',
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email || '',
        joinDate: employeeData.joinDate || employeeData.createdAt || '',
        phoneNumber: employeeData.phoneNumber || '',
        employeeId: employeeData.employeeId || (canLogin ? (employeeData.id || employeeData._id) : ''),
        hireDate: employeeData.hireDate || '',
        managerId: employeeData.managerId || '',
        team: employeeData.team || '',
        createdAt: employeeData.createdAt ? new Date(employeeData.createdAt) : new Date(),
        updatedAt: employeeData.updatedAt ? new Date(employeeData.updatedAt) : new Date(),
        // Payroll fields with better defaults
        salaryAmount: employeeData.salaryAmount || employeeData.compensation?.baseSalary || 0,
        payoutMethod: employeeData.payoutMethod || employeeData.paymentPreference || '',
        currencyPreference: employeeData.currencyPreference || 'USD',
        country: employeeData.country || '',
        walletAddress: employeeData.walletAddress || employeeData.wallet?.address || '',
        taxId: employeeData.taxId || employeeData.legalDetails?.taxId || '',
        salaryFrequency: employeeData.salaryFrequency || 'monthly',
        contractType: employeeData.contractType || 'full_time',
        startDate: employeeData.startDate || employeeData.hireDate || '',
        // Additional fields with better fallbacks
        username: employeeData.username || '',
        isOwner: employeeData.isOwner || false,
        isActive: employeeData.isActive || false,
        emailVerified: employeeData.emailVerified || false,
        lastLogin: employeeData.lastLogin || '',
        location: employeeData.location || null,
        workSchedule: employeeData.workSchedule || null,
        emergencyContact: employeeData.emergencyContact || null,
        skills: employeeData.skills || [],
        certifications: employeeData.certifications || [],
        education: employeeData.education || null,
        performance: employeeData.performance || null,
        compensation: employeeData.compensation || null,
        benefits: employeeData.benefits || null,
        equipment: employeeData.equipment || null,
        accessLevels: employeeData.accessLevels || null,
        documents: employeeData.documents || null,
        wallet: employeeData.wallet || null,
        legalDetails: employeeData.legalDetails || null,
        address: employeeData.address || null,
        paymentPreference: employeeData.paymentPreference || 'bank',
        cryptoWallets: employeeData.cryptoWallets || null,
        bankAccounts: employeeData.bankAccounts || null,
        avatarUrl: employeeData.avatarUrl || '',
        role: employeeData.role || 'employee',
        permissions: employeeData.permissions || null,
        // Add source information
        canLogin: canLogin,
        source: source
      };
      
      setEmployee(employeeWithDefaults);
      } catch (err) {
      console.error('Error fetching employee:', err);
        setError(String(err));
      toast({
        title: 'Error',
        description: 'Failed to fetch employee data',
        variant: 'destructive',
      });
      } finally {
        setLoading(false);
      }
    };

  const handleSave = async (section: string, data: any) => {
    if (!employee) return;
    
    setSaving(true);
    try {
      const updateData = { [section]: data };
      
      // Determine which API to use based on login access
      let response;
      
      if (employee.canLogin) {
        // Employee has login access - update via users API
        console.log('Employee has login access, updating via users API');
        response = await fetch(`/api/mongodb/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
      } else {
        // Employee has no login access - update via HR employees API
        console.log('Employee has no login access, updating via HR employees API');
        response = await fetch(`/api/hr/employees/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      const updatedEmployee = await response.json();
      setEmployee({ ...employee, ...updatedEmployee });
      
      toast({
        title: 'Success',
        description: 'Employee information updated successfully',
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee information',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePayrollSuccess = () => {
    // Refresh employee data to show updated payroll information
    fetchEmployee();
    fetchPayrollHistory();
    setShowPayrollModal(false);
    toast({
      title: 'Success',
      description: 'Employee added to payroll successfully',
    });
  };

  const fetchPayrollHistory = async () => {
    if (!employee) return;
    
    setLoadingPayrollHistory(true);
    try {
      const response = await fetch(`/api/hr/employees/${employee.id}/payroll-history`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const history = await response.json();
        setPayrollHistory(history);
      }
    } catch (error) {
      console.error('Error fetching payroll history:', error);
    } finally {
      setLoadingPayrollHistory(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    if (employee) {
      fetchPayrollHistory();
    }
  }, [employee]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading employee data...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="ghost" onClick={() => setLocation('/hr')}>Back to HR</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Employee not found</p>
            <Button variant="ghost" onClick={() => setLocation('/hr')}>
              Back to HR
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper function to check if field has data
  const hasData = (field: any) => {
    return field !== null && field !== undefined && field !== '' && field !== 0;
  };

  // Helper function to get field status
  const getFieldStatus = (field: any, fieldName: string) => {
    if (hasData(field)) {
      return { hasData: true, message: '' };
    } else {
      return { 
        hasData: false, 
        message: `No ${fieldName} data available. This field is disabled until data is added.` 
      };
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <Button variant="ghost" className="mb-4" onClick={() => setLocation('/hr')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to HR
        </Button>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
            <p className="text-muted-foreground">{employee.position} • {employee.department}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                {employee.status}
              </Badge>
              <Badge variant={employee.canLogin ? 'default' : 'outline'}>
                {employee.canLogin ? 'Has Login Access' : 'No Login Access'}
              </Badge>
              <Badge variant="secondary">
                Source: {employee.source}
              </Badge>
              {employee.role && (
                <Badge variant="outline">
                  Role: {employee.role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Data Availability Alert */}
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Status</AlertTitle>
          <AlertDescription>
            This employee has {employee.canLogin ? 'login access' : 'no login access'}. 
            Fields without data are disabled and will be enabled once data is added. 
            Source: {employee.source} model.
          </AlertDescription>
        </Alert>

        {/* Data Summary Card */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Data Availability Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasData(employee.firstName) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Basic Info</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasData(employee.position) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Employment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasData(employee.salaryAmount) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Payroll</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasData(employee.phoneNumber) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Contact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${employee.skills && employee.skills.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Skills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasData(employee.role) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasData(employee.employeeId) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Employee ID</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employment
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Skills & Education
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Access & Permissions
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input 
                      value={employee.firstName} 
                      onChange={(e) => setEmployee({...employee, firstName: e.target.value})}
                      disabled={!hasData(employee.firstName)}
                    />
                    {!hasData(employee.firstName) && (
                      <p className="text-xs text-muted-foreground">No first name data available</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input 
                      value={employee.lastName} 
                      onChange={(e) => setEmployee({...employee, lastName: e.target.value})}
                      disabled={!hasData(employee.lastName)}
                    />
                    {!hasData(employee.lastName) && (
                      <p className="text-xs text-muted-foreground">No data available</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      value={employee.email} 
                      onChange={(e) => setEmployee({...employee, email: e.target.value})}
                      disabled={!hasData(employee.email)}
                    />
                    {!hasData(employee.email) && (
                      <p className="text-xs text-muted-foreground">No data available</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      value={employee.username || ''} 
                      onChange={(e) => setEmployee({...employee, username: e.target.value})}
                      disabled={!hasData(employee.username)}
                      placeholder="No username set"
                    />
                    {!hasData(employee.username) && (
                      <p className="text-xs text-muted-foreground">No username set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <div className="relative">
                      <Input 
                        value={employee.employeeId || employee.id || ''} 
                        onChange={(e) => setEmployee({...employee, employeeId: e.target.value})}
                        disabled={employee.canLogin || !hasData(employee.employeeId)}
                        placeholder={employee.canLogin ? "Auto-generated from user ID" : "No employee ID set"}
                        className={employee.canLogin ? "pr-10" : ""}
                      />
                      {employee.canLogin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => {
                            const employeeId = employee.employeeId || employee.id;
                            if (employeeId) {
                              navigator.clipboard.writeText(employeeId);
                              toast({
                                title: "Copied!",
                                description: "Employee ID copied to clipboard",
                              });
                            }
                          }}
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      )}
                    </div>
                    {employee.canLogin ? (
                      <p className="text-xs text-muted-foreground">Auto-generated from user ID (read-only)</p>
                    ) : !hasData(employee.employeeId) && (
                      <p className="text-xs text-muted-foreground">No employee ID set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Join Date</Label>
                    <Input 
                      type="date" 
                      value={employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : ''}
                      disabled={!hasData(employee.joinDate)}
                    />
                    {!hasData(employee.joinDate) && (
                      <p className="text-xs text-muted-foreground">No join date set</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => handleSave('basic', { 
                      firstName: employee.firstName, 
                      lastName: employee.lastName, 
                      email: employee.email, 
                      username: employee.username,
                      employeeId: employee.employeeId 
                    })} 
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment Information Tab */}
          <TabsContent value="employment">
            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input 
                      value={employee.position} 
                      onChange={(e) => setEmployee({...employee, position: e.target.value})}
                      disabled={!hasData(employee.position)}
                    />
                    {!hasData(employee.position) && (
                      <p className="text-xs text-muted-foreground">No position set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input 
                      value={employee.department} 
                      onChange={(e) => setEmployee({...employee, department: e.target.value})}
                      disabled={!hasData(employee.department)}
                    />
                    {!hasData(employee.department) && (
                      <p className="text-xs text-muted-foreground">No department set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={employee.status} 
                      onValueChange={(value) => setEmployee({...employee, status: value as 'active' | 'inactive'})}
                      disabled={!hasData(employee.status)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {!hasData(employee.status) && (
                      <p className="text-xs text-muted-foreground">No status set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Team</Label>
                    <Input 
                      value={employee.team || ''} 
                      onChange={(e) => setEmployee({...employee, team: e.target.value})}
                      disabled={!hasData(employee.team)}
                      placeholder="No team assigned"
                    />
                    {!hasData(employee.team) && (
                      <p className="text-xs text-muted-foreground">No team assigned</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Manager ID</Label>
                    <Input 
                      value={employee.managerId || ''} 
                      onChange={(e) => setEmployee({...employee, managerId: e.target.value})}
                      disabled={!hasData(employee.managerId)}
                      placeholder="No manager assigned"
                    />
                    {!hasData(employee.managerId) && (
                      <p className="text-xs text-muted-foreground">No manager assigned</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Hire Date</Label>
                    <Input 
                      type="date" 
                      value={employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : ''}
                      disabled={!hasData(employee.hireDate)}
                    />
                    {!hasData(employee.hireDate) && (
                      <p className="text-xs text-muted-foreground">No hire date set</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => handleSave('employment', { 
                      position: employee.position, 
                      department: employee.department, 
                      status: employee.status, 
                      team: employee.team, 
                      managerId: employee.managerId, 
                      hireDate: employee.hireDate 
                    })} 
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Payroll Information</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPayrollModal(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add to Payroll
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary Amount</Label>
                    <Input 
                      type="number" 
                      value={employee.salaryAmount || 0} 
                      onChange={(e) => setEmployee({...employee, salaryAmount: parseFloat(e.target.value) || 0})}
                      disabled={!hasData(employee.salaryAmount)}
                    />
                    {!hasData(employee.salaryAmount) && (
                      <p className="text-xs text-muted-foreground">No salary set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={employee.currencyPreference || 'USD'} 
                      onValueChange={(value) => setEmployee({...employee, currencyPreference: value})}
                      disabled={!hasData(employee.currencyPreference)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    {!hasData(employee.currencyPreference) && (
                      <p className="text-xs text-muted-foreground">No currency set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Payout Method</Label>
                    <Select 
                      value={employee.payoutMethod || ''} 
                      onValueChange={(value) => setEmployee({...employee, payoutMethod: value})}
                      disabled={!hasData(employee.payoutMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stellar_wallet">Stellar Wallet</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    {!hasData(employee.payoutMethod) && (
                      <p className="text-xs text-muted-foreground">No payout method set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Frequency</Label>
                    <Select 
                      value={employee.salaryFrequency || 'monthly'} 
                      onValueChange={(value) => setEmployee({...employee, salaryFrequency: value})}
                      disabled={!hasData(employee.salaryFrequency)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="biweekly">Biweekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    {!hasData(employee.salaryFrequency) && (
                      <p className="text-xs text-muted-foreground">No frequency set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Contract Type</Label>
                    <Select 
                      value={employee.contractType || 'full_time'} 
                      onValueChange={(value) => setEmployee({...employee, contractType: value})}
                      disabled={!hasData(employee.contractType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                    {!hasData(employee.contractType) && (
                      <p className="text-xs text-muted-foreground">No contract type set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Tax ID</Label>
                    <Input 
                      value={employee.taxId || ''} 
                      onChange={(e) => setEmployee({...employee, taxId: e.target.value})}
                      disabled={!hasData(employee.taxId)}
                      placeholder="No tax ID set"
                    />
                    {!hasData(employee.taxId) && (
                      <p className="text-xs text-muted-foreground">No tax ID set</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => handleSave('payroll', { 
                      salaryAmount: employee.salaryAmount,
                      currencyPreference: employee.currencyPreference,
                      payoutMethod: employee.payoutMethod,
                      salaryFrequency: employee.salaryFrequency,
                      contractType: employee.contractType,
                      taxId: employee.taxId
                    })} 
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payroll History */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPayrollHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading payroll history...</span>
                  </div>
                ) : payrollHistory.length > 0 ? (
                  <div className="space-y-2">
                    {payrollHistory.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{entry.period}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.paymentMethod} • {entry.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{entry.currency} {entry.netPay}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No payroll history found. Add employee to payroll to see history.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      value={employee.phoneNumber || ''} 
                      onChange={(e) => setEmployee({...employee, phoneNumber: e.target.value})}
                      disabled={!hasData(employee.phoneNumber)}
                      placeholder="No phone number set"
                    />
                    {!hasData(employee.phoneNumber) && (
                      <p className="text-xs text-muted-foreground">No phone number set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input 
                      value={employee.country || ''} 
                      onChange={(e) => setEmployee({...employee, country: e.target.value})}
                      disabled={!hasData(employee.country)}
                      placeholder="No country set"
                    />
                    {!hasData(employee.country) && (
                      <p className="text-xs text-muted-foreground">No country set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input 
                      value={employee.walletAddress || ''} 
                      onChange={(e) => setEmployee({...employee, walletAddress: e.target.value})}
                      disabled={!hasData(employee.walletAddress)}
                      placeholder="No wallet address set"
                    />
                    {!hasData(employee.walletAddress) && (
                      <p className="text-xs text-muted-foreground">No wallet address set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Login</Label>
                    <Input 
                      value={employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : ''} 
                      disabled={true}
                      placeholder="Never logged in"
                    />
                    {!hasData(employee.lastLogin) && (
                      <p className="text-xs text-muted-foreground">Never logged in</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => handleSave('contact', { 
                      phoneNumber: employee.phoneNumber,
                      country: employee.country,
                      walletAddress: employee.walletAddress
                    })} 
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills & Education Tab */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Skills</Label>
                    <div className="mt-2">
                      {employee.skills && employee.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {employee.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills listed</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Certifications</Label>
                    <div className="mt-2">
                      {employee.certifications && employee.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {employee.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline">{cert}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No certifications listed</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Education</Label>
                    <div className="mt-2">
                      {employee.education ? (
                        <div className="p-3 bg-muted rounded">
                          <pre className="text-sm">{JSON.stringify(employee.education, null, 2)}</pre>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No education information</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access & Permissions Tab */}
          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access & Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input 
                      value={employee.role || ''} 
                      disabled={true}
                      placeholder="No role set"
                    />
                    {!hasData(employee.role) && (
                      <p className="text-xs text-muted-foreground">No role set</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Is Owner</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={employee.isOwner || false} 
                        disabled={true}
                      />
                      <span className="text-sm">{employee.isOwner ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Is Active</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={employee.isActive || false} 
                        disabled={true}
                      />
                      <span className="text-sm">{employee.isActive ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Verified</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={employee.emailVerified || false} 
                        disabled={true}
                      />
                      <span className="text-sm">{employee.emailVerified ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Can Login</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={employee.canLogin || false} 
                        disabled={true}
                      />
                      <span className="text-sm">{employee.canLogin ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Input 
                      value={employee.source || ''} 
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Permissions</Label>
                  <div className="mt-2">
                    {employee.permissions ? (
                      <div className="p-3 bg-muted rounded">
                        <pre className="text-sm">{JSON.stringify(employee.permissions, null, 2)}</pre>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No permissions data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payroll Onboarding Modal */}
      {showPayrollModal && employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add {employee.firstName} {employee.lastName} to Payroll</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPayrollModal(false)}
              >
                ✕
              </Button>
            </div>
            <PayrollOnboarding
              employee={employee}
              onClose={() => setShowPayrollModal(false)}
              onSuccess={handlePayrollSuccess}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 