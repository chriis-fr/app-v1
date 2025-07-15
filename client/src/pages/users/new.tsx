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
import { 
  userRoles,
  departments,
  availableModules,
  departmentPositions,
  officeLocations,
  timezones,
  getTimezoneOffset
} from '@shared/schema';
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
  department: string;
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
  moduleAccess: string[];
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
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

export default function NewUserPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [vendors, setVendors] = useState<Array<{ id: string; name: string; vendorCode: string }>>([]);
  
  // Organization data state
  const [organizationData, setOrganizationData] = useState<{
    activeModules: string[];
    departmentManagers: Record<string, Array<{id: string, name: string, position: string, role: string}>>;
    departments: string[];
    departmentPositions: Record<string, string[]>;
    officeLocations: string[];
    timezones: string[];
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'admin', // Default to admin for department management
    department: 'Engineering',
    position: '',
    status: 'active',
    moduleAccess: [],
    permissions: [],
    // New fields
    location: {
      office: 'onsite'
    },
    workSchedule: {
      timezone: 'UTC'
    }
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

  // Fetch organization data when component mounts
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await fetch('/api/organization/user-creation-data');
        if (response.ok) {
          const data = await response.json();
          setOrganizationData(data);
          
          // Set default department and position
          if (data.departments.length > 0) {
            setFormData(prev => ({
              ...prev,
              department: data.departments[0],
              position: data.departmentPositions[data.departments[0]]?.[0] || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load organization data',
          variant: 'destructive',
        });
      }
    };
    fetchOrganizationData();
  }, [toast]);

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

  // Handle department change
  const handleDepartmentChange = (department: string) => {
    const positions = organizationData?.departmentPositions[department] || [];
    const firstPosition = positions[0] || '';
    
    // Auto-generate manager ID based on department and position
    const managerId = generateManagerId(department, firstPosition);
    
    setFormData(prev => ({
      ...prev,
      department,
      position: firstPosition,
      managerId
    }));
  };

  // Handle position change
  const handlePositionChange = (position: string) => {
    // Auto-generate manager ID based on department and position
    const managerId = generateManagerId(formData.department, position);
    
    setFormData(prev => ({
      ...prev,
      position,
      managerId
    }));
  };

  // Generate manager ID based on department and position
  const generateManagerId = (department: string, position: string) => {
    if (!organizationData) return '';
    
    const departmentUsers = organizationData.departmentManagers[department] || [];
    
    // Find existing manager for this department
    const existingManager = departmentUsers.find(user => 
      user.role === 'admin' || user.role === 'manager'
    );
    
    if (existingManager) {
      return existingManager.id;
    }
    
    // If no manager exists, find the first user in the department
    if (departmentUsers.length > 0) {
      return departmentUsers[0].id;
    }
    
    return '';
  };

  // Get available positions for selected department
  const getAvailablePositions = (department: string) => {
    return organizationData?.departmentPositions[department] || [];
  };

  // Get available modules (only organization's active modules)
  const getAvailableModules = () => {
    return organizationData?.activeModules || [];
  };

  // Format timezone name for display
  const formatTimezoneName = (timezone: string) => {
    const timezoneMap: Record<string, string> = {
      'UTC': 'UTC (Coordinated Universal Time)',
      'GMT': 'GMT (Greenwich Mean Time)',
      'EAT': 'EAT (East Africa Time)',
      'WAT': 'WAT (West Africa Time)',
      'CAT': 'CAT (Central Africa Time)',
      'SAST': 'SAST (South Africa Standard Time)',
      'EET': 'EET (Eastern European Time)',
      'CET': 'CET (Central European Time)',
      'WET': 'WET (Western European Time)',
      'EST': 'EST (Eastern Standard Time)',
      'CST': 'CST (Central Standard Time)',
      'MST': 'MST (Mountain Standard Time)',
      'PST': 'PST (Pacific Standard Time)',
      'AST': 'AST (Atlantic Standard Time)',
      'HST': 'HST (Hawaii Standard Time)',
      'IST': 'IST (India Standard Time)',
      'PKT': 'PKT (Pakistan Standard Time)',
      'BST': 'BST (Bangladesh Standard Time)',
      'JST': 'JST (Japan Standard Time)',
      'KST': 'KST (Korea Standard Time)',
      'CST_CN': 'CST (China Standard Time)',
      'SGT': 'SGT (Singapore Time)',
      'PHT': 'PHT (Philippines Time)',
      'WIB': 'WIB (Western Indonesian Time)',
      'WITA': 'WITA (Central Indonesian Time)',
      'WIT': 'WIT (Eastern Indonesian Time)',
      'AEST': 'AEST (Australian Eastern Standard Time)',
      'ACST': 'ACST (Australian Central Standard Time)',
      'AWST': 'AWST (Australian Western Standard Time)',
      'NZST': 'NZST (New Zealand Standard Time)',
      'FJT': 'FJT (Fiji Time)',
      'SST': 'SST (Samoa Standard Time)',
      'CHST': 'CHST (Chamorro Standard Time)',
      'GST': 'GST (Gulf Standard Time)',
      'MSK': 'MSK (Moscow Standard Time)',
      'TRT': 'TRT (Turkey Time)',
      'IRST': 'IRST (Iran Standard Time)',
      'AST_SA': 'AST (Saudi Arabia Standard Time)',
      'AST_EG': 'AST (Egypt Standard Time)',
      'AST_IL': 'AST (Israel Standard Time)',
      'AST_JO': 'AST (Jordan Standard Time)',
      'AST_LB': 'AST (Lebanon Standard Time)',
      'AST_IQ': 'AST (Iraq Standard Time)',
      'AST_PS': 'AST (Palestine Standard Time)',
      'AST_SY': 'AST (Syria Standard Time)',
      'AST_YE': 'AST (Yemen Standard Time)',
      'AST_QA': 'AST (Qatar Standard Time)',
      'AST_KW': 'AST (Kuwait Standard Time)',
      'AST_BH': 'AST (Bahrain Standard Time)',
      'AST_OM': 'AST (Oman Standard Time)',
      'AST_AE': 'AST (UAE Standard Time)',
      'AST_IR': 'AST (Iran Standard Time)',
      'AST_TR': 'AST (Turkey Standard Time)',
      'AST_RU': 'AST (Russia Standard Time)',
    };
    
    const baseName = timezoneMap[timezone] || timezone;
    const offset = getTimezoneOffset(timezone);
    return `${baseName} - ${offset}`;
  };

  // Update validation function for module access
  const validateModuleAccess = (role: string, modules: string[]) => {
    const availableModules = getAvailableModules();
    
    if (role === 'owner') {
      return availableModules;
    }
    
    // Vendor roles get limited access
    if (isVendorRole(role)) {
      return availableModules.filter(module => ['inventory', 'pos'].includes(module));
    }
    
    const requiredModules: Record<string, string[]> = {
      'admin': ['hr', 'inventory', 'pos', 'reports', 'settings'],
      'manager': ['hr', 'inventory', 'pos', 'reports'],
      'employee': ['pos'],
      'contractor': ['pos']
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
  const handleModuleToggle = (module: string) => {
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
  const handleModuleRoleChange = (module: string, role: 'admin' | 'user') => {
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
    module: string,
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
                    onValueChange={handleDepartmentChange}
                    disabled={!organizationData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={organizationData ? "Select department" : "Loading..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationData?.departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={handlePositionChange}
                    disabled={!organizationData || !formData.department}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={organizationData ? "Select position" : "Loading..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePositions(formData.department).map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <h3 className="text-lg font-semibold mb-4">Location & Work Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officeLocation">Office Location</Label>
                  <Select
                    value={formData.location?.office || 'onsite'}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, office: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select office location" />
                    </SelectTrigger>
                    <SelectContent>
                      {officeLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location.charAt(0).toUpperCase() + location.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.workSchedule?.timezone || 'UTC'}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      workSchedule: { ...prev.workSchedule, timezone: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {formatTimezoneName(timezone)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Only show office-specific fields for onsite workers */}
                {formData.location?.office === 'onsite' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        value={formData.location?.floor || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, floor: e.target.value }
                        }))}
                        placeholder="e.g., 3rd Floor"
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
                        placeholder="e.g., A-15"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="startTime">Work Start Time</Label>
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
                  <Label htmlFor="endTime">Work End Time</Label>
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
                  <Label htmlFor="managerId">Manager ID (Auto-generated)</Label>
                  <Input
                    id="managerId"
                    value={formData.managerId || ''}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Will be auto-generated based on department"
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
                  Only modules subscribed by your organization are shown.
                </p>
              </div>
              
              {!organizationData ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading organization modules...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAvailableModules().map((module) => {
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
              )}
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