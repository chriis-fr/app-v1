import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { userRoles, departments, availableModules } from '@shared/schema';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  department: typeof departments[number];
  position: string;
  status: 'active' | 'inactive';
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
  team?: string;
  vendorId?: string; // For vendor users

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
  moduleAccess: typeof availableModules[number][];
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
}

// Add this interface for module permissions
interface ModulePermission {
  module: typeof availableModules[number];
  role: 'admin' | 'user';
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manage: boolean;
  };
}

export default function NewUserPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [vendors, setVendors] = useState<Array<{ id: string; name: string; vendorCode: string }>>([]);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    position: '',
    status: 'active',
    moduleAccess: [],
    permissions: []
  });

  // Add state for module permissions
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);

  // Keep formData.moduleAccess in sync with modulePermissions
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      moduleAccess: modulePermissions.map(p => p.module)
    }));
  }, [modulePermissions]);

  // Fetch vendors when component mounts
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  // Only owner and admin can access this page
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
    setLocation('/dashboard');
    return null;
  }

  // Check if the selected role is a vendor role
  const isVendorRole = (role: string) => {
    return role === 'vendor_admin' || role === 'vendor_manager' || role === 'vendor_employee';
  };

  // Update validation function for module access
  const validateModuleAccess = (role: string, modules: typeof availableModules[number][]) => {
    if (role === 'owner') {
      return [...availableModules];
    }
    
    // Vendor roles get limited access
    if (isVendorRole(role)) {
      return ['inventory', 'pos'] as typeof availableModules[number][];
    }
    
    const requiredModules: Record<string, typeof availableModules[number][]> = {
      'admin': ['hr', 'inventory', 'pos', 'reports', 'settings'] as typeof availableModules[number][],
      'manager': ['hr', 'inventory', 'pos', 'reports'] as typeof availableModules[number][],
      'employee': ['pos'] as typeof availableModules[number][],
      'contractor': ['pos'] as typeof availableModules[number][]
    };

    // For other roles, ensure they have access to required modules
    const roleModules = requiredModules[role] || [];
    return roleModules.filter(module => availableModules.includes(module));
  };

  const steps = [
    { 
      id: 1, 
      title: 'Basic Information', 
      description: 'Personal details and account setup',
      icon: <User className="h-5 w-5" />
    },
    { 
      id: 2, 
      title: 'Contact & Location', 
      description: 'Contact details and workplace location',
      icon: <MapPin className="h-5 w-5" />
    },
    { 
      id: 3, 
      title: 'Employment Details', 
      description: 'Work schedule and employment information',
      icon: <Briefcase className="h-5 w-5" />
    },
    { 
      id: 4, 
      title: 'Access & Permissions', 
      description: 'Module access and role-based permissions',
      icon: <Shield className="h-5 w-5" />
    },
    { 
      id: 5, 
      title: 'Additional Information', 
      description: 'Skills, benefits, and other details',
      icon: <FileText className="h-5 w-5" />
    },
    { 
      id: 6, 
      title: 'Review & Confirm', 
      description: 'Review all information before creating user',
      icon: <CheckCircle2 className="h-5 w-5" />
    }
  ];

  // Update handleSubmit to ensure proper module access
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate vendor selection for vendor roles
      if (isVendorRole(formData.role) && !formData.vendorId) {
        throw new Error('Vendor selection is required for vendor roles');
      }

      // Get the current user's organization ID
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        throw new Error('Failed to fetch current user data');
      }
      const userData = await userResponse.json();
      const organizationId = userData.organizationId;
      
      if (!organizationId) {
        throw new Error('No organization ID found for current user');
      }

      // Validate and set module access based on role
      const validatedModuleAccess = validateModuleAccess(formData.role, formData.moduleAccess);

      // Create the user with the current organization ID and module permissions
      const newUserData = {
        ...formData,
        organizationId,
        isOwner: formData.role === 'owner',
        moduleAccess: validatedModuleAccess,
        permissions: modulePermissions.map(p => ({
          module: p.module,
          role: p.role,
          actions: Object.entries(p.permissions)
            .filter(([_, value]) => value)
            .map(([key]) => key)
        })),
        // Include vendorId if it's a vendor role
        ...(isVendorRole(formData.role) && formData.vendorId && { vendorId: formData.vendorId }),
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
      setLocation('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleModuleToggle to handle permissions
  const handleModuleToggle = (module: typeof availableModules[number]) => {
    setModulePermissions(prev => {
      const exists = prev.find(p => p.module === module);
      if (exists) {
        // Remove module if it exists
        return prev.filter(p => p.module !== module);
      } else {
        // Add new module with default permissions
        return [...prev, {
          module,
          role: 'user',
          permissions: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            manage: false
          }
        }];
      }
    });
  };

  // Add function to update module role
  const handleModuleRoleChange = (module: typeof availableModules[number], role: 'admin' | 'user') => {
    setModulePermissions(prev => 
      prev.map(p => p.module === module ? {
        ...p,
        role,
        permissions: role === 'admin' ? {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manage: true
        } : {
          view: true,
          create: false,
          edit: false,
          delete: false,
          manage: false
        }
      } : p)
    );
  };

  // Add function to update specific permission
  const handlePermissionChange = (
    module: typeof availableModules[number],
    permission: keyof ModulePermission['permissions'],
    value: boolean
  ) => {
    setModulePermissions(prev =>
      prev.map(p => p.module === module ? {
        ...p,
        permissions: {
          ...p.permissions,
          [permission]: value
        }
      } : p)
    );
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    minLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                    placeholder="Set a password for this user"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'owner' | 'admin' | 'manager' | 'employee' | 'contractor' | 'vendor_admin' | 'vendor_manager' | 'vendor_employee' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor selection - only show for vendor roles */}
                {isVendorRole(formData.role) && (
                  <div className="space-y-2">
                    <Label htmlFor="vendorId">Vendor</Label>
                    <Select
                      value={formData.vendorId || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name} ({vendor.vendorCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isVendorRole(formData.role) && !formData.vendorId && (
                      <p className="text-sm text-red-500">Vendor selection is required for vendor roles</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value as typeof departments[number] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        );
      case 2:
        return (
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="office">Office</Label>
                  <Input
                    id="office"
                    value={formData.location?.office || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, office: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={formData.location?.floor || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, floor: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskNumber">Desk Number</Label>
                  <Input
                    id="deskNumber"
                    value={formData.location?.deskNumber || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, deskNumber: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 mt-6">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      case 3:
        return (
          <Card>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerId">Manager ID</Label>
                  <Input
                    id="managerId"
                    value={formData.managerId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <Input
                    id="team"
                    value={formData.team || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 mt-6">Work Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.workSchedule?.startTime || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workSchedule: { ...prev.workSchedule, startTime: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.workSchedule?.endTime || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workSchedule: { ...prev.workSchedule, endTime: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.workSchedule?.timezone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workSchedule: { ...prev.workSchedule, timezone: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      case 4:
        return (
          <Card>
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Module Access</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select which modules this user can access and define their role and permissions for each module.
                </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableModules.map((module) => {
                    const modulePermission = modulePermissions.find(p => p.module === module);
                    return (
                      <div key={module} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                    <Checkbox
                      id={module}
                              checked={!!modulePermission}
                      onCheckedChange={() => handleModuleToggle(module)}
                    />
                            <Label htmlFor={module} className="font-medium">
                      {module.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Label>
                          </div>
                        </div>
                        
                        {modulePermission && (
                          <div className="space-y-4 pl-6">
                            <div className="space-y-2">
                              <Label>Role in Module</Label>
                              <Select
                                value={modulePermission.role}
                                onValueChange={(value: 'admin' | 'user') => 
                                  handleModuleRoleChange(module, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Permissions</Label>
                              <div className="space-y-2">
                                {Object.entries(modulePermission.permissions).map(([key, value]) => (
                                  <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${module}-${key}`}
                                      checked={value}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(module, key as keyof ModulePermission['permissions'], checked as boolean)
                                      }
                                      disabled={modulePermission.role === 'admin'}
                                    />
                                    <Label htmlFor={`${module}-${key}`} className="text-sm">
                                      {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        );
      case 5:
        return (
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Skills & Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Enter skills separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Enter certifications separated by commas"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 mt-6">Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="healthInsurance"
                    checked={formData.benefits?.healthInsurance || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      benefits: { ...prev.benefits, healthInsurance: checked }
                    }))}
                  />
                  <Label htmlFor="healthInsurance">Health Insurance</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="dentalInsurance"
                    checked={formData.benefits?.dentalInsurance || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      benefits: { ...prev.benefits, dentalInsurance: checked }
                    }))}
                  />
                  <Label htmlFor="dentalInsurance">Dental Insurance</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="visionInsurance"
                    checked={formData.benefits?.visionInsurance || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      benefits: { ...prev.benefits, visionInsurance: checked }
                    }))}
                  />
                  <Label htmlFor="visionInsurance">Vision Insurance</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="retirementPlan"
                    checked={formData.benefits?.retirementPlan || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      benefits: { ...prev.benefits, retirementPlan: checked }
                    }))}
                  />
                  <Label htmlFor="retirementPlan">Retirement Plan</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="lifeInsurance"
                    checked={formData.benefits?.lifeInsurance || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      benefits: { ...prev.benefits, lifeInsurance: checked }
                    }))}
                  />
                  <Label htmlFor="lifeInsurance">Life Insurance</Label>
                </div>
              </div>
            </div>
          </Card>
        );
      case 6:
        return (
          <Card>
            <div className="p-6 space-y-6">
              <Alert>
                <AlertTitle>Review User Information</AlertTitle>
                <AlertDescription>
                  Please review all the information before creating the user. Once created, the user will receive an activation email and must activate their account to set their password and log in.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p>{formData.role}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p>{formData.department}</p>
                  </div>
                  {isVendorRole(formData.role) && formData.vendorId && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vendor</p>
                      <p>{vendors.find(v => v.id === formData.vendorId)?.name || 'Unknown Vendor'}</p>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mt-6">Module Access</h3>
                <div className="grid grid-cols-2 gap-2">
                  {formData.moduleAccess.map(module => (
                    <div key={module} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{module.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}</span>
                  </div>
                ))}
                </div>

                <h3 className="text-lg font-semibold mt-6">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{formData.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>{formData.location?.office || 'Not specified'}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6">Employment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Position</p>
                    <p>{formData.position}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p>{formData.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create New User</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {steps[currentStep - 1].title}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
                }`}>
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center w-24">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentStep === 1 ? setLocation('/users') : prevStep()}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create User
                  </>
              )}
            </Button>
            )}
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
} 