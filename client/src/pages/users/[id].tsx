import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { useAuth } from '@/hooks/use-auth';
import { userRoles, departments, availableModules } from '@shared/schema';
import { 
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Shield,
  Save,
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  Globe,
  Clock,
  Users,
  Key
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  department: string;
  organizationId: string;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields for UI compatibility
  position?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
  team?: string;
  location?: {
    office?: string;
    floor?: string;
    deskNumber?: string;
  };
  workSchedule?: {
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  skills?: string[];
  certifications?: string[];
  education?: {
    degree?: string;
    institution?: string;
    graduationYear?: string;
  }[];
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
  benefits?: {
    healthInsurance?: boolean;
    dentalInsurance?: boolean;
    visionInsurance?: boolean;
    retirementPlan?: boolean;
    lifeInsurance?: boolean;
  };
  equipment?: {
    laptop?: string;
    monitor?: string;
    phone?: string;
    accessories?: string[];
  };
  accessLevels?: {
    systems?: string[];
    buildings?: string[];
    rooms?: string[];
  };
  documents?: {
    id?: string;
    type?: string;
    url?: string;
    expiryDate?: string;
  }[];
  moduleAccess?: string[];
}

// Define module display names and descriptions
const moduleDisplayInfo = {
  accounting: { name: 'Accounting', description: 'Financial management and accounting' },
  procurement: { name: 'Procurement', description: 'Purchase and supplier management' },
  manufacturing: { name: 'Manufacturing', description: 'Production and manufacturing operations' },
  inventory: { name: 'Inventory', description: 'Stock and inventory management' },
  order_management: { name: 'Order Management', description: 'Order processing and fulfillment' },
  warehouse: { name: 'Warehouse', description: 'Warehouse operations and management' },
  supply_chain: { name: 'Supply Chain', description: 'Supply chain and logistics management' },
  crm: { name: 'CRM', description: 'Customer relationship management' },
  project_service: { name: 'Project Service', description: 'Project and service management' },
  workforce: { name: 'Workforce', description: 'Workforce and staff management' },
  hr: { name: 'HR', description: 'Human resources management' },
  ecommerce: { name: 'E-Commerce', description: 'Online store and sales management' },
  marketing: { name: 'Marketing', description: 'Marketing and campaign management' },
  pos: { name: 'POS', description: 'Point of sale system' },
  quality: { name: 'Quality', description: 'Quality control and assurance' },
  maintenance: { name: 'Maintenance', description: 'Equipment and asset maintenance' },
  project: { name: 'Project', description: 'Project management and tracking' },
  analytics: { name: 'Analytics', description: 'Business analytics and reporting' },
  global_finance: { name: 'Global Finance', description: 'International financial management' },
  international_trade: { name: 'International Trade', description: 'International trade and compliance' },
  customer_experience: { name: 'Customer Experience', description: 'Customer experience management' },
  vendor_management: { name: 'Vendor Management', description: 'Vendor and supplier management' },
  ai_analytics: { name: 'AI Analytics', description: 'AI-powered analytics and insights' },
  ecommerce_global: { name: 'Global E-Commerce', description: 'International e-commerce management' },
  localization: { name: 'Localization', description: 'Multi-language and regional support' },
  digital_currency: { name: 'Digital Currency', description: 'Digital currency and blockchain' }
};

export default function EditUserPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const params = useParams();
  const userId = params?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/mongodb/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      console.log('Raw user data from server:', data);
      console.log('Module access from server:', data.moduleAccess);
      
      // Set default values for UI fields if they don't exist in the database
      const userWithDefaults = {
        ...data,
        position: data.position || '',
        status: data.status || 'active',
        lastLogin: data.lastLogin || '',
        employeeId: data.employeeId || '',
        hireDate: data.hireDate || '',
        managerId: data.managerId || '',
        team: data.team || '',
        location: data.location || { office: '', floor: '', deskNumber: '' },
        workSchedule: data.workSchedule || { startTime: '', endTime: '', timezone: '' },
        emergencyContact: data.emergencyContact || { name: '', relationship: '', phone: '' },
        skills: data.skills || [],
        certifications: data.certifications || [],
        education: data.education || [],
        performance: data.performance || { lastReviewDate: '', nextReviewDate: '', rating: 0 },
        compensation: data.compensation || { baseSalary: 0, bonus: 0, stockOptions: 0, currency: 'USD' },
        benefits: data.benefits || { healthInsurance: false, dentalInsurance: false, visionInsurance: false, retirementPlan: false, lifeInsurance: false },
        equipment: data.equipment || { laptop: '', monitor: '', phone: '', accessories: [] },
        accessLevels: data.accessLevels || { systems: [], buildings: [], rooms: [] },
        documents: data.documents || [],
        // Ensure moduleAccess is an array of strings
        moduleAccess: Array.isArray(data.moduleAccess) ? data.moduleAccess : []
      };
      
      console.log('Processed user data:', userWithDefaults);
      console.log('Final module access:', userWithDefaults.moduleAccess);
      setUser(userWithDefaults);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Create a copy of the user data with only the fields that exist in the MongoDB schema
      const userDataToUpdate = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        department: user.department,
        organizationId: user.organizationId,
        isOwner: user.isOwner,
        // Include any additional fields that might be in the database
        position: user.position,
        status: user.status,
        lastLogin: user.lastLogin,
        employeeId: user.employeeId,
        hireDate: user.hireDate,
        managerId: user.managerId,
        team: user.team,
        location: user.location,
        workSchedule: user.workSchedule,
        emergencyContact: user.emergencyContact,
        skills: user.skills,
        certifications: user.certifications,
        education: user.education,
        performance: user.performance,
        compensation: user.compensation,
        benefits: user.benefits,
        equipment: user.equipment,
        accessLevels: user.accessLevels,
        documents: user.documents,
        // Ensure moduleAccess is an array of strings
        moduleAccess: Array.isArray(user.moduleAccess) ? user.moduleAccess : []
      };

      console.log('Sending update with moduleAccess:', userDataToUpdate.moduleAccess);

      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataToUpdate),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      console.log('Updated user data:', updatedUser);
      
      // Update the local user state with the response from the server
      setUser({
        ...user,
        ...updatedUser,
        // Preserve UI-specific fields that might not be in the response
        position: user.position,
        status: user.status,
        lastLogin: user.lastLogin,
        employeeId: user.employeeId,
        hireDate: user.hireDate,
        managerId: user.managerId,
        team: user.team,
        location: user.location,
        workSchedule: user.workSchedule,
        emergencyContact: user.emergencyContact,
        skills: user.skills,
        certifications: user.certifications,
        education: user.education,
        performance: user.performance,
        compensation: user.compensation,
        benefits: user.benefits,
        equipment: user.equipment,
        accessLevels: user.accessLevels,
        documents: user.documents,
        // Ensure moduleAccess is an array of strings
        moduleAccess: Array.isArray(updatedUser.moduleAccess) ? updatedUser.moduleAccess : []
      });

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Only owner and admin can access this page
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
    setLocation('/dashboard');
    return null;
  }

  if (isLoading) {
    return (
      <ModuleLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </ModuleLayout>
    );
  }

  if (!user) {
    return (
      <ModuleLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">User not found</p>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/users')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <h1 className="text-2xl font-bold">Edit User</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" />
                Basic Information
              </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={user.employeeId || ''}
                    onChange={(e) => setUser({ ...user, employeeId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
              <Input
                    id="lastName"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={user.phoneNumber || ''}
                    onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Professional Information */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                    value={user.role}
                    onValueChange={(value) => setUser({ ...user, role: value })}
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

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                    value={user.department}
                    onValueChange={(value) => setUser({ ...user, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept.charAt(0).toUpperCase() + dept.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                    value={user.position}
                    onChange={(e) => setUser({ ...user, position: e.target.value })}
              />
            </div>

              <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                <Input
                    id="team"
                    value={user.team || ''}
                    onChange={(e) => setUser({ ...user, team: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={user.hireDate || ''}
                    onChange={(e) => setUser({ ...user, hireDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerId">Manager ID</Label>
                  <Input
                    id="managerId"
                    value={user.managerId || ''}
                    onChange={(e) => setUser({ ...user, managerId: e.target.value })}
                  />
                </div>
            </div>
          </div>
        </Card>

          {/* Location Information */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Location Information
              </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="office">Office</Label>
              <Input
                    id="office"
                    value={user.location?.office || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      location: { ...user.location, office: e.target.value } 
                })}
              />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
              <Input
                    id="floor"
                    value={user.location?.floor || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      location: { ...user.location, floor: e.target.value } 
                })}
              />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="deskNumber">Desk Number</Label>
              <Input
                    id="deskNumber"
                    value={user.location?.deskNumber || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      location: { ...user.location, deskNumber: e.target.value } 
                })}
              />
            </div>
            </div>
          </div>
        </Card>

          {/* Work Schedule */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Work Schedule
              </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
              <Input
                    id="startTime"
                    type="time"
                    value={user.workSchedule?.startTime || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      workSchedule: { ...user.workSchedule, startTime: e.target.value } 
                })}
              />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
              <Input
                    id="endTime"
                    type="time"
                    value={user.workSchedule?.endTime || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      workSchedule: { ...user.workSchedule, endTime: e.target.value } 
                })}
              />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
              <Input
                    id="timezone"
                    value={user.workSchedule?.timezone || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      workSchedule: { ...user.workSchedule, timezone: e.target.value } 
                })}
              />
            </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
              <Input
                    id="emergencyName"
                    value={user.emergencyContact?.name || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      emergencyContact: { ...user.emergencyContact, name: e.target.value } 
                })}
              />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={user.emergencyContact?.relationship || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      emergencyContact: { ...user.emergencyContact, relationship: e.target.value } 
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone Number</Label>
                  <Input
                    id="emergencyPhone"
                    value={user.emergencyContact?.phone || ''}
                    onChange={(e) => setUser({ 
                      ...user, 
                      emergencyContact: { ...user.emergencyContact, phone: e.target.value } 
                    })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Access Levels */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Access Levels
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Systems Access</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.accessLevels?.systems?.map((system, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {system}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Building Access</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.accessLevels?.buildings?.map((building, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {building}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Room Access</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.accessLevels?.rooms?.map((room, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {room}
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        </Card>

          {/* Module Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Module Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableModules.map((moduleId) => {
                  const isChecked = Array.isArray(user.moduleAccess) && user.moduleAccess.includes(moduleId);
                  console.log(`Checking module ${moduleId}:`, {
                    moduleAccess: user.moduleAccess,
                    isChecked
                  });
                  return (
                    <div key={moduleId} className="flex items-center space-x-2">
                      <Checkbox
                        id={moduleId}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentModules = Array.isArray(user.moduleAccess) ? user.moduleAccess : [];
                          const newModuleAccess = checked
                            ? [...currentModules, moduleId]
                            : currentModules.filter(ma => ma !== moduleId);
                          console.log('Module access changed:', {
                            moduleId,
                            checked,
                            currentModules,
                            newModuleAccess
                          });
                          setUser({ ...user, moduleAccess: newModuleAccess });
                        }}
                      />
                      <Label htmlFor={moduleId} className="flex flex-col">
                        <span>{moduleDisplayInfo[moduleId].name}</span>
                        <span className="text-sm text-muted-foreground">{moduleDisplayInfo[moduleId].description}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Status
              </h2>
              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <Select
                  value={user.status}
                  onValueChange={(value) => setUser({ ...user, status: value as 'active' | 'inactive' })}
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
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
            Save Changes
                </>
              )}
          </Button>
        </div>
        </form>
      </div>
    </ModuleLayout>
  );
} 