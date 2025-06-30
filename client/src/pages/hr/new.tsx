import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  availableModules, 
  userRoles, 
  departments, 
  departmentPositions,
  officeLocations,
  timezones,
  getTimezoneOffset
} from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { 
  Building,
  Mail,
  Phone,
  Shield,
  User,
  Briefcase,
  Calendar,
  Loader2,
  Key,
  MapPin,
  Clock,
  Users,
  FileText,
  Wallet,
  Heart,
  Laptop,
  GraduationCap,
  Award,
  Star,
  DollarSign,
  ShieldCheck,
  FileCheck,
  Building2,
  DoorOpen,
  FileKey,
  Banknote,
  FileSpreadsheet,
  Globe,
  Map,
  Home,
  BuildingIcon,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormData {
  // Basic Information
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'contractor' | 'vendor_admin' | 'vendor_manager' | 'vendor_employee';
  department: string;
  position: string;
  status: 'active' | 'inactive';
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
  team?: string;
  vendorId?: string;

  // Location
  location?: {
    office?: string;
    floor?: string;
    deskNumber?: string;
  };

  // Work Schedule
  workSchedule?: {
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };

  // Emergency Contact
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };

  // Skills & Education
  skills?: string[];
  certifications?: string[];
  education?: Array<{
    degree?: string;
    institution?: string;
    graduationYear?: string;
  }>;

  // Performance & Compensation
  performance?: {
    lastReviewDate?: string;
    nextReviewDate?: string;
    rating?: number;
  };
  compensation?: {
    baseSalary?: number;
    bonus?: number;
    stockOptions?: number;
    currency?: string;
  };

  // Benefits
  benefits?: {
    healthInsurance?: boolean;
    dentalInsurance?: boolean;
    visionInsurance?: boolean;
    retirementPlan?: boolean;
    lifeInsurance?: boolean;
  };

  // Equipment
  equipment?: {
    laptop?: string;
    monitor?: string;
    phone?: string;
    accessories?: string[];
  };

  // Access Levels
  accessLevels?: {
    systems?: string[];
    buildings?: string[];
    rooms?: string[];
  };

  // Documents
  documents?: Array<{
    id?: string;
    type?: string;
    url?: string;
    expiryDate?: string;
  }>;

  // Module Access & Permissions
  moduleAccess: string[];
  permissions: Array<{
    module: string;
    actions: string[];
  }>;

  // Basic employee fields
  employmentType?: string;
  salary?: string;
  canLogin: boolean;
}

// Add this interface for module permissions
interface ModulePermission {
  module: string;
  role: 'admin' | 'user';
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manage: boolean;
  };
}

export default function NewEmployeePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [customPosition, setCustomPosition] = useState('');
  const [modulePermissions, setModulePermissions] = useState<Record<string, ModulePermission>>({});

  // Filter roles for HR - they can only create users with roles lower than executives
  const hrAllowedRoles = userRoles.filter(role => 
    ['manager', 'employee', 'contractor'].includes(role)
  );

  // Filter positions to exclude executive positions
  const hrAllowedPositions = Object.entries(departmentPositions).reduce((acc, [dept, positions]) => {
    if (dept !== 'Executive') {
      acc[dept] = positions;
    }
    return acc;
  }, {} as Record<string, readonly string[]>);

  const [form, setForm] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'employee',
    department: '',
    position: '',
    status: 'active',
    employmentType: '',
    salary: '',
    canLogin: false,
    moduleAccess: [],
    permissions: [],
    location: {},
    workSchedule: {},
    emergencyContact: {},
    skills: [],
    certifications: [],
    education: [],
    performance: {},
    compensation: {},
    benefits: {},
    equipment: {},
    accessLevels: {},
    documents: []
  });

  const userSteps = [
    { id: '1', title: 'Basic Info' },
    { id: '2', title: 'Work Details' },
    { id: '3', title: 'Contact & Location' },
    { id: '4', title: 'Access & Permissions' },
    { id: '5', title: 'Additional Info' },
    { id: '6', title: 'Review & Confirm' }
  ];

  const employeeSteps = [
    { id: '1', title: 'Basic Info' },
    { id: '2', title: 'Work Details' },
    { id: '3', title: 'Review & Confirm' }
  ];

  if (!currentUser || !['owner', 'admin'].includes(currentUser.role?.toLowerCase())) {
    setLocation('/dashboard');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggle = (checked: boolean) => {
    setForm(prev => ({ ...prev, canLogin: checked }));
    if (!checked) {
      setCurrentStep(1);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setForm(prev => ({ ...prev, department: value, position: '' }));
    setCustomPosition('');
  };

  const handleModuleToggle = (module: string) => {
    setForm(prev => ({
      ...prev,
      moduleAccess: prev.moduleAccess.includes(module)
        ? prev.moduleAccess.filter(m => m !== module)
        : [...prev.moduleAccess, module]
    }));
  };

  const handleModuleRoleChange = (module: string, role: 'admin' | 'user') => {
    setModulePermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        module,
        role
      }
    }));
  };

  const handlePermissionChange = (
    module: string,
    permission: keyof ModulePermission['permissions'],
    value: boolean
  ) => {
    setModulePermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        module,
        permissions: {
          ...prev[module]?.permissions,
          [permission]: value
        }
      }
    }));
  };

  const validateModuleAccess = (role: string, modules: string[]) => {
    const roleModuleMap: Record<string, string[]> = {
      owner: [...availableModules],
      admin: [...availableModules],
      manager: ['dashboard', 'hr', 'inventory', 'pos', 'crm', 'accounting', 'analytics'],
      employee: ['dashboard', 'hr', 'inventory', 'pos'],
      contractor: ['dashboard', 'hr', 'inventory'],
      vendor_admin: ['dashboard', 'inventory', 'pos'],
      vendor_manager: ['dashboard', 'inventory', 'pos'],
      vendor_employee: ['dashboard', 'inventory']
    };

    const allowedModules = roleModuleMap[role] || [];
    return modules.filter(module => allowedModules.includes(module));
  };

  const nextStep = () => {
    if (currentStep < (form.canLogin ? 6 : 3)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (form.canLogin) {
        // Create a user (same as users/new)
        const payload: any = { ...form };
        
        // Remove HR-specific fields that don't exist in User model
        delete payload.employmentType;
        delete payload.salary;
        delete payload.canLogin;
        
        // Validate required fields for user creation
        if (!form.email || !form.username || !form.password || !form.role || form.moduleAccess.length === 0) {
          toast({ title: 'Error', description: 'All login and module fields are required.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        
        // Get current user's organization ID
        if (!currentUser?.organizationId) {
          toast({ title: 'Error', description: 'No organization ID found', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        
        // Validate and set module access based on role
        const validatedModuleAccess = validateModuleAccess(form.role, form.moduleAccess);
        
        // Create the user with the current organization ID and module permissions
        const newUserData = {
          ...payload,
          organizationId: currentUser.organizationId,
          isOwner: form.role === 'owner',
          moduleAccess: validatedModuleAccess,
          permissions: Object.entries(modulePermissions).map(([module, perm]) => ({
            module,
            role: perm.role,
            actions: Object.entries(perm.permissions)
              .filter(([_, value]) => value)
              .map(([key]) => key)
          }))
        };

        console.log('Creating user with data:', newUserData);

        const response = await fetch('/api/mongodb/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create user');
        }

        const createdUser = await response.json();
        toast({
          title: 'Success',
          description: createdUser?.user?._id
            ? `User created successfully. Employee ID: ${createdUser.user._id}`
            : 'User created successfully.',
        });
        setLocation('/hr');
      } else {
        // Create a basic employee (no login access)
        const payload: any = { ...form };
        
        // For basic employees (no login), use custom position if department is "Other"
        if (!form.canLogin && form.department === 'Other') {
          payload.position = customPosition;
        }
        
        // Remove HR-specific fields that don't exist in User model
        delete payload.employmentType;
        delete payload.salary;
        delete payload.benefits;
        delete payload.supervisor;
        delete payload.canLogin;
        
        // For basic employees, set default values for required fields
        payload.email = `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase()}@${currentUser?.organization?.name?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`;
        payload.username = `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase()}`;
        payload.password = 'tempPassword123!'; // Temporary password for basic employees
        payload.role = 'employee';
        payload.moduleAccess = ['dashboard', 'profile'];
        payload.status = 'active';
        payload.isActive = true;
        payload.emailVerified = false;
        
        // Validate required fields including custom position for "Other" department
        const positionToValidate = (!form.canLogin && form.department === 'Other') ? customPosition : form.position;
        if (!form.firstName || !form.lastName || !form.department || !positionToValidate) {
          toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        
        // Get current user's organization ID
        if (!currentUser?.organizationId) {
          toast({ title: 'Error', description: 'No organization ID found', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        
        // Add organization ID to payload
        payload.organizationId = currentUser.organizationId;
        
        console.log('Creating employee with payload:', payload);
        
        const response = await api.post('/hr/employees', payload);
        console.log('API response:', response);
        
        toast({ title: 'Success', description: 'Employee created successfully' });
        setLocation('/hr');
      }
    } catch (error: any) {
      console.error('Error creating employee/user:', error);
      
      // Handle specific error types
      if (error.response?.status === 403) {
        toast({ 
          title: 'Permission Denied', 
          description: error.response?.data?.error || 'You do not have permission to create employees', 
          variant: 'destructive' 
        });
        return;
      }
      
      if (error.response?.status === 401) {
        toast({ 
          title: 'Authentication Error', 
          description: 'Please log in again to continue', 
          variant: 'destructive' 
        });
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
        return;
      }
      
      // Handle token expiration specifically
      if (error.name === 'TokenExpiredError' || error.message?.includes('Token expired')) {
        toast({ 
          title: 'Session Expired', 
          description: 'Your session has expired. Please log in again.', 
          variant: 'destructive' 
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
        return;
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create employee/user';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailablePositions = (department: string) => {
    return hrAllowedPositions[department] || [];
  };

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{form.canLogin ? 'Add User with Login Access' : 'Add Employee'}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stepper Navigation */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Switch checked={form.canLogin} onCheckedChange={handleToggle} id="canLogin" />
                <Label htmlFor="canLogin">Allow login for this employee</Label>
              </div>
              <div className="flex gap-2">
                {(form.canLogin ? userSteps : employeeSteps).map((stepObj, idx) => (
                  <div
                    key={stepObj.id}
                    className={`flex-1 text-center py-2 rounded ${currentStep === Number(stepObj.id) ? 'bg-blue-100 font-bold' : 'bg-gray-100'}`}
                  >
                    {stepObj.title}
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Render step content based on canLogin and currentStep */}
              {form.canLogin ? (
                <>
                  {Number(currentStep) === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={form.firstName} onChange={handleChange} name="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={form.lastName} onChange={handleChange} name="lastName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={form.username} onChange={handleChange} name="username" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={form.email} onChange={handleChange} name="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={form.password} onChange={handleChange} name="password" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" value={form.phoneNumber} onChange={handleChange} name="phoneNumber" placeholder="+1234567890" />
                        <p className="text-sm text-muted-foreground">Phone number for urgent communications</p>
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={form.department} onValueChange={value => handleDepartmentChange(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.filter(dept => dept !== 'Executive').map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        {form.department === 'Other' ? (
                          <>
                            <Input 
                              id="customPosition" 
                              value={customPosition} 
                              onChange={(e) => setCustomPosition(e.target.value)} 
                              placeholder="Enter custom position" 
                              required 
                            />
                            <p className="text-sm text-muted-foreground">Enter a custom position for this employee</p>
                          </>
                        ) : (
                          <Select value={form.position} onValueChange={value => setForm(prev => ({ ...prev, position: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailablePositions(form.department).map((position) => (
                                <SelectItem key={position} value={position}>{position}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">Employment Type</Label>
                        <Input id="employmentType" value={form.employmentType} onChange={handleChange} name="employmentType" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input id="salary" value={form.salary} onChange={handleChange} name="salary" />
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 3 && (
                    <div className="space-y-6">
                      <Alert>
                        <AlertTitle>Review Employee Information</AlertTitle>
                        <AlertDescription>
                          Please review all the information below before creating the employee.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Basic Information</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {form.firstName} {form.lastName}</p>
                            <p><strong>Email:</strong> {form.email || 'Not provided'}</p>
                            <p><strong>Phone:</strong> {form.phoneNumber || 'Not provided'}</p>
                            <p><strong>Department:</strong> {form.department}</p>
                            <p><strong>Position:</strong> {form.department === 'Other' ? customPosition : form.position}</p>
                            <p><strong>Employment Type:</strong> {form.employmentType || 'Not specified'}</p>
                            <p><strong>Salary:</strong> {form.salary || 'Not specified'}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Access & Permissions</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Login Access:</strong> {form.canLogin ? 'Yes' : 'No'}</p>
                            <p><strong>Status:</strong> {form.status}</p>
                            <p><strong>Role:</strong> {form.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={form.role} onValueChange={value => setForm(prev => ({ ...prev, role: value as any }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {hrAllowedRoles.map((role) => (
                              <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label>Module Access</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {availableModules.map((module) => (
                            <div key={module} className="flex items-center space-x-2">
                              <Checkbox
                                id={`module-access-${module}`}
                                checked={form.moduleAccess.includes(module)}
                                onCheckedChange={() => handleModuleToggle(module)}
                              />
                              <Label htmlFor={`module-access-${module}`} className="text-sm">{module}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {form.moduleAccess.length > 0 && (
                        <div className="space-y-4">
                          <Label>Module Permissions</Label>
                          <div className="space-y-4">
                            {form.moduleAccess.map((module) => (
                              <div key={module} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">{module}</h4>
                                  <Select 
                                    value={modulePermissions[module]?.role || 'user'} 
                                    onValueChange={(value) => handleModuleRoleChange(module, value as 'admin' | 'user')}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                  {(['view', 'create', 'edit', 'delete', 'manage'] as const).map((permission) => (
                                    <div key={permission} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${module}-${permission}`}
                                        checked={modulePermissions[module]?.permissions?.[permission] || false}
                                        onCheckedChange={(checked) => handlePermissionChange(module, permission, checked as boolean)}
                                      />
                                      <Label htmlFor={`${module}-${permission}`} className="text-xs capitalize">{permission}</Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {Number(currentStep) === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Skills & Education</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma-separated)</Label>
                            <Textarea 
                              id="skills" 
                              value={form.skills?.join(', ') || ''} 
                              onChange={(e) => setForm(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))} 
                              placeholder="e.g., JavaScript, React, Project Management"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                            <Textarea 
                              id="certifications" 
                              value={form.certifications?.join(', ') || ''} 
                              onChange={(e) => setForm(prev => ({ ...prev, certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))} 
                              placeholder="e.g., PMP, AWS Certified, Scrum Master"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Compensation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="baseSalary">Base Salary</Label>
                            <Input 
                              id="baseSalary" 
                              type="number" 
                              value={form.compensation?.baseSalary || ''} 
                              onChange={(e) => setForm(prev => ({ ...prev, compensation: { ...prev.compensation, baseSalary: Number(e.target.value) } }))} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bonus">Bonus</Label>
                            <Input 
                              id="bonus" 
                              type="number" 
                              value={form.compensation?.bonus || ''} 
                              onChange={(e) => setForm(prev => ({ ...prev, compensation: { ...prev.compensation, bonus: Number(e.target.value) } }))} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={form.compensation?.currency || 'USD'} onValueChange={value => setForm(prev => ({ ...prev, compensation: { ...prev.compensation, currency: value } }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="CAD">CAD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Benefits</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {(['healthInsurance', 'dentalInsurance', 'visionInsurance', 'retirementPlan', 'lifeInsurance'] as const).map((benefit) => (
                            <div key={benefit} className="flex items-center space-x-2">
                              <Checkbox
                                id={benefit}
                                checked={form.benefits?.[benefit] || false}
                                onCheckedChange={(checked) => setForm(prev => ({ 
                                  ...prev, 
                                  benefits: { ...prev.benefits, [benefit]: checked as boolean } 
                                }))}
                              />
                              <Label htmlFor={benefit} className="text-sm capitalize">{benefit.replace(/([A-Z])/g, ' $1').trim()}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Equipment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="laptop">Laptop</Label>
                            <Input 
                              id="laptop" 
                              value={form.equipment?.laptop || ''} 
                              onChange={(e) => setForm(prev => ({ ...prev, equipment: { ...prev.equipment, laptop: e.target.value } }))} 
                              placeholder="e.g., MacBook Pro 16"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monitor">Monitor</Label>
                            <Input 
                              id="monitor" 
                              value={form.equipment?.monitor || ''} 
                              onChange={(e) => setForm(prev => ({ ...prev, equipment: { ...prev.equipment, monitor: e.target.value } }))} 
                              placeholder="e.g., Dell 27&quot; 4K"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input 
                              id="phone" 
                              value={form.equipment?.phone || ''} 
                              onChange={(e) => setForm(prev => ({ ...prev, equipment: { ...prev.equipment, phone: e.target.value } }))} 
                              placeholder="e.g., iPhone 15 Pro"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accessories">Accessories (comma-separated)</Label>
                            <Input 
                              id="accessories" 
                              value={form.equipment?.accessories?.join(', ') || ''} 
                              onChange={(e) => setForm(prev => ({ 
                                ...prev, 
                                equipment: { 
                                  ...prev.equipment, 
                                  accessories: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                                } 
                              }))} 
                              placeholder="e.g., Keyboard, Mouse, Headphones"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 6 && (
                    <div className="space-y-6">
                      <Alert>
                        <AlertTitle>Review Employee Information</AlertTitle>
                        <AlertDescription>
                          Please review all the information below before creating the employee.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Basic Information</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {form.firstName} {form.lastName}</p>
                            <p><strong>Email:</strong> {form.email}</p>
                            <p><strong>Username:</strong> {form.username}</p>
                            <p><strong>Phone:</strong> {form.phoneNumber}</p>
                            <p><strong>Role:</strong> {form.role}</p>
                            <p><strong>Department:</strong> {form.department}</p>
                            <p><strong>Position:</strong> {form.position}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Access & Permissions</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Module Access:</strong></p>
                            <ul className="list-disc list-inside ml-2">
                              {form.moduleAccess.map(module => (
                                <li key={module}>{module}</li>
                              ))}
                            </ul>
                            <p><strong>Status:</strong> {form.status}</p>
                          </div>
                        </div>

                        {form.location?.office && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Location</h3>
                            <div className="space-y-2 text-sm">
                              <p><strong>Office:</strong> {form.location.office}</p>
                              {form.location.floor && <p><strong>Floor:</strong> {form.location.floor}</p>}
                              {form.location.deskNumber && <p><strong>Desk:</strong> {form.location.deskNumber}</p>}
                            </div>
                          </div>
                        )}

                        {form.compensation?.baseSalary && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Compensation</h3>
                            <div className="space-y-2 text-sm">
                              <p><strong>Base Salary:</strong> {form.compensation.baseSalary} {form.compensation.currency}</p>
                              {form.compensation.bonus && <p><strong>Bonus:</strong> {form.compensation.bonus} {form.compensation.currency}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {Number(currentStep) === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={form.firstName} onChange={handleChange} name="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={form.lastName} onChange={handleChange} name="lastName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={form.email} onChange={handleChange} name="email" placeholder="employee@company.com" />
                        <p className="text-sm text-muted-foreground">Email for notifications and communications</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" value={form.phoneNumber} onChange={handleChange} name="phoneNumber" placeholder="+1234567890" />
                        <p className="text-sm text-muted-foreground">Phone number for urgent communications</p>
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={form.department} onValueChange={value => handleDepartmentChange(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.filter(dept => dept !== 'Executive').map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        {form.department === 'Other' ? (
                          <>
                            <Input 
                              id="customPosition" 
                              value={customPosition} 
                              onChange={(e) => setCustomPosition(e.target.value)} 
                              placeholder="Enter custom position" 
                              required 
                            />
                            <p className="text-sm text-muted-foreground">Enter a custom position for this employee</p>
                          </>
                        ) : (
                          <Select value={form.position} onValueChange={value => setForm(prev => ({ ...prev, position: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailablePositions(form.department).map((position) => (
                                <SelectItem key={position} value={position}>{position}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">Employment Type</Label>
                        <Input id="employmentType" value={form.employmentType} onChange={handleChange} name="employmentType" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input id="salary" value={form.salary} onChange={handleChange} name="salary" />
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 3 && (
                    <div>
                      {/* Optionally, show a review/confirmation step here */}
                      <p>Review the information and click Create Employee to submit.</p>
                    </div>
                  )}
                </>
              )}
              {/* Step navigation buttons */}
              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" disabled={Number(currentStep) === 1} onClick={() => setCurrentStep(s => Number(s) - 1)}>Previous</Button>
                {((form.canLogin && Number(currentStep) < 6) || (!form.canLogin && Number(currentStep) < 3)) ? (
                  <Button type="button" onClick={() => setCurrentStep(s => Number(s) + 1)}>Next</Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Employee'}</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
} 