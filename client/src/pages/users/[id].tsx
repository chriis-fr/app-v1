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
  Key,
  Copy,
  Trash,
  Wallet,
  Cpu
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { CredentialVerification } from '@/components/hr/CredentialVerification';
import { SkillMatching } from '@/components/hr/SkillMatching';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  username: string;
  password?: string;
  role: string;
  department: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  organizationId: string;
  isOwner: boolean;
  moduleAccess: string[];
  position?: string;
  status: 'active' | 'inactive';
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
  education?: Array<{
    degree?: string;
    institution?: string;
    graduationYear?: string;
  }>;
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
  documents?: Array<{
    id?: string;
    type?: string;
    url?: string;
    expiryDate?: string;
  }>;
  wallet?: {
    balance: number;
    currency: string;
    bankAccounts: Array<{
      id: string;
      bankName: string;
      accountNumber: string;
      accountType: string;
      isDefault: boolean;
    }>;
  };
  legalDetails?: {
    taxId: string;
    businessType: string;
    registrationNumber: string;
    incorporationDate: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isBillingAddress: boolean;
    isShippingAddress: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  credentials?: Array<{
    id: string;
    type: 'education' | 'certification' | 'experience';
    title: string;
    issuer: string;
    date: string;
    verified: boolean;
    blockchainHash?: string;
  }>;
  permissions?: Array<{
    module: string;
    role?: 'admin' | 'user';
    actions: string[];
  }>;
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

// Modern horizontal stepper with icons and progress
const stepIcons = [
  User, Briefcase, MapPin, Users, CreditCard, FileText, Globe, Key, Building, Save, Shield
];

const steps = [
  'Basic & Professional Info',
  'Location, Work & Emergency',
  'Compensation, Benefits & Wallet',
  'Wallet & Legal',
  'Skills, Certifications, Education & Equipment',
  'Address & Documents',
  'Status, Verification & Executive Info',
  'Module Access',
  'Blockchain & AI',
];

/* Hide horizontal scrollbar utility */
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .hide-scrollbar {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none; /* Chrome/Safari/Webkit */
    }
  `;
  document.head.appendChild(style);
}

export default function EditUserPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const params = useParams();
  const userId = params?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [basicInfo, setBasicInfo] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
  });
  const [professionalInfo, setProfessionalInfo] = useState({
    role: '',
    department: '',
    position: '',
    team: '',
    hireDate: '',
    managerId: '',
  });
  const [locationInfo, setLocationInfo] = useState({
    office: '',
    floor: '',
    deskNumber: '',
  });
  const [workSchedule, setWorkSchedule] = useState({
    startTime: '',
    endTime: '',
    timezone: '',
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
  });
  const [status, setStatus] = useState('active');
  const [step, setStep] = useState(0);
  const [moduleAccess, setModuleAccess] = useState<string[]>([]);
  const [modulePermissions, setModulePermissions] = useState<{
    module: string;
    role: 'admin' | 'user';
    permissions: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      manage: boolean;
    };
  }[]>([]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      setBasicInfo({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        employeeId: user.id || '',
      });
      setProfessionalInfo({
        role: user.role,
        department: user.department,
        position: user.position || '',
        team: user.team || '',
        hireDate: user.hireDate || '',
        managerId: user.managerId || '',
      });
      setLocationInfo({
        office: user.location?.office || '',
        floor: user.location?.floor || '',
        deskNumber: user.location?.deskNumber || '',
      });
      setWorkSchedule({
        startTime: user.workSchedule?.startTime || '',
        endTime: user.workSchedule?.endTime || '',
        timezone: user.workSchedule?.timezone || '',
      });
      setEmergencyContact({
        name: user.emergencyContact?.name || '',
        relationship: user.emergencyContact?.relationship || '',
        phone: user.emergencyContact?.phone || '',
      });
      setStatus(user.status || 'active');
      setModuleAccess(Array.isArray(user.moduleAccess) ? user.moduleAccess : []);
    }
  }, [user]);

  useEffect(() => {
    if (user && Array.isArray(user.permissions)) {
      setModulePermissions(
        (currentUser?.organization?.activeModules || []).map((module) => {
          const found = user.permissions && user.permissions.find((p: any) => p.module === module);
          return found
            ? {
                module,
                role: found.role || 'user',
                permissions: {
                  view: found.actions?.includes('view') || false,
                  create: found.actions?.includes('create') || false,
                  edit: found.actions?.includes('edit') || false,
                  delete: found.actions?.includes('delete') || false,
                  manage: found.actions?.includes('manage') || false,
                },
              }
            : {
                module,
                role: 'user',
                permissions: {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                  manage: false,
                },
              };
        })
      );
    }
  }, [user, currentUser]);

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
        moduleAccess: Array.isArray(data.moduleAccess) ? data.moduleAccess : [],
        // Ensure createdAt and updatedAt are Date objects
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        // Add any missing fields from Prisma schema
        wallet: data.wallet || { balance: 0, currency: 'USD', bankAccounts: [] },
        legalDetails: data.legalDetails || { taxId: '', businessType: '', registrationNumber: '', incorporationDate: '' },
        address: data.address || { street: '', city: '', state: '', country: '', postalCode: '', isBillingAddress: false, isShippingAddress: false },
        credentials: data.credentials || []
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
      const updateData: Partial<User> = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        department: user.department,
        organizationId: user.organizationId,
        isOwner: user.isOwner,
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
        moduleAccess: Array.isArray(user.moduleAccess) ? user.moduleAccess : [],
        wallet: user.wallet,
        legalDetails: user.legalDetails,
        address: user.address,
        credentials: user.credentials
      };

      // Add password if it's been changed
      if (user.password && user.password !== '') {
        updateData.password = user.password;
      }

      // Convert dates to ISO strings for JSON serialization
      if (updateData.lastLogin) {
        updateData.lastLogin = updateData.lastLogin.toString();
      }

      console.log('Sending update with data:', updateData);

      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt)
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

  const handleBasicInfoSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updateData = {
        username: basicInfo.username,
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        email: basicInfo.email,
        phoneNumber: basicInfo.phoneNumber,
      };
      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      toast({ title: 'Success', description: 'Basic info updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update basic info', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfessionalInfoSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updateData = { ...professionalInfo };
      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      toast({ title: 'Success', description: 'Professional info updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update professional info', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLocationInfoSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updateData = { location: locationInfo };
      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      toast({ title: 'Success', description: 'Location info updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update location info', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkScheduleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updateData = { workSchedule };
      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      toast({ title: 'Success', description: 'Work schedule updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update work schedule', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmergencyContactSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updateData = { emergencyContact };
      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      toast({ title: 'Success', description: 'Emergency contact updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update emergency contact', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updateData = { status };
      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      toast({ title: 'Success', description: 'Status updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleModuleToggle = (module: string) => {
    setModulePermissions((prev) => {
      const exists = prev.find((p) => p.module === module);
      if (exists) {
        return prev.filter((p) => p.module !== module);
      } else {
        return [
          ...prev,
          {
            module,
            role: 'user',
            permissions: {
              view: true,
              create: false,
              edit: false,
              delete: false,
              manage: false,
            },
          },
        ];
      }
    });
    setModuleAccess((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  const handleModuleRoleChange = (module: string, role: 'admin' | 'user') => {
    setModulePermissions((prev) =>
      prev.map((p) =>
        p.module === module
          ? {
              ...p,
              role,
              permissions:
                role === 'admin'
                  ? { view: true, create: true, edit: true, delete: true, manage: true }
                  : p.permissions,
            }
          : p
      )
    );
  };

  const handlePermissionChange = (
    module: string,
    permission: keyof typeof modulePermissions[0]['permissions'],
    value: boolean
  ) => {
    setModulePermissions((prev) =>
      prev.map((p) =>
        p.module === module
          ? { ...p, permissions: { ...p.permissions, [permission]: value } }
          : p
      )
    );
  };

  const handleModuleAccessSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updateData = {
        moduleAccess,
        permissions: modulePermissions.map((p) => ({
          module: p.module,
          role: p.role,
          actions: Object.entries(p.permissions)
            .filter(([_, v]) => v)
            .map(([k]) => k),
        })),
      };
      const response = await fetch(`/api/mongodb/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update module access');
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      setModuleAccess(Array.isArray(updatedUser.moduleAccess) ? updatedUser.moduleAccess : []);
      toast({ title: 'Success', description: 'Module access updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update module access', variant: 'destructive' });
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

  const educationList = Array.isArray(user?.education) ? user.education : [];
  const walletData = user?.wallet && typeof user.wallet === 'object'
    ? {
        balance: typeof user.wallet.balance === 'number' ? user.wallet.balance : 0,
        currency: typeof user.wallet.currency === 'string' ? user.wallet.currency : '',
        bankAccounts: Array.isArray(user.wallet.bankAccounts) ? user.wallet.bankAccounts : []
      }
    : { balance: 0, currency: '', bankAccounts: [] };

  const legalDetailsData = user?.legalDetails && typeof user.legalDetails === 'object'
    ? {
        taxId: typeof user.legalDetails.taxId === 'string' ? user.legalDetails.taxId : '',
        businessType: typeof user.legalDetails.businessType === 'string' ? user.legalDetails.businessType : '',
        registrationNumber: typeof user.legalDetails.registrationNumber === 'string' ? user.legalDetails.registrationNumber : '',
        incorporationDate: typeof user.legalDetails.incorporationDate === 'string' ? user.legalDetails.incorporationDate : ''
      }
    : { taxId: '', businessType: '', registrationNumber: '', incorporationDate: '' };

  const addressData = user?.address && typeof user.address === 'object'
    ? {
        street: typeof user.address.street === 'string' ? user.address.street : '',
        city: typeof user.address.city === 'string' ? user.address.city : '',
        state: typeof user.address.state === 'string' ? user.address.state : '',
        country: typeof user.address.country === 'string' ? user.address.country : '',
        postalCode: typeof user.address.postalCode === 'string' ? user.address.postalCode : '',
        isBillingAddress: typeof user.address.isBillingAddress === 'boolean' ? user.address.isBillingAddress : false,
        isShippingAddress: typeof user.address.isShippingAddress === 'boolean' ? user.address.isShippingAddress : false
      }
    : { street: '', city: '', state: '', country: '', postalCode: '', isBillingAddress: false, isShippingAddress: false };

  const documentsList = Array.isArray(user?.documents) ? user.documents : [];

  // Fix for accessLevels (step 4)
  const safeAccessLevels = user.accessLevels || { systems: [], buildings: [], rooms: [] };

  // Fix for documents (step 5)
  const safeDocuments = Array.isArray(user.documents) ? user.documents : [];

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        {/* Modern Stepper Navigation */}
        <div className="sticky top-0 z-10 bg-white pb-4 mb-6 border-b border-gray-200 shadow-sm">
          <div className="overflow-x-auto hide-scrollbar w-full">
            <div className="flex items-center gap-x-2 md:gap-x-4 lg:gap-x-6 whitespace-nowrap px-2 md:px-6">
              {steps.map((label: string, idx: number) => {
                const Icon = stepIcons[idx] || User;
                const isActive = step === idx;
                const isCompleted = step > idx;
                return (
                  <div key={label} className="flex-shrink-0 flex flex-col items-center min-w-[110px] max-w-[140px] px-1 md:px-2 relative">
                    <button
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200
                        ${isActive ? 'bg-primary text-white border-primary shadow-lg' : isCompleted ? 'bg-primary/10 text-primary border-primary/50' : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-primary/10 hover:text-primary'}
                      `}
                      onClick={() => setStep(idx)}
                      aria-label={label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                    <span
                      className={`mt-2 text-xs font-medium text-center break-words truncate max-w-[100px] md:max-w-[120px] ${isActive ? 'text-primary' : 'text-gray-500'}`}
                      title={label}
                    >
                      {label}
                    </span>
                    {/* Progress bar */}
                    {idx < steps.length - 1 && (
                      <div className={`absolute top-5 left-full w-full h-1 z-0 ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`} style={{ right: '-50%', left: '50%' }} />
                    )}
        </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Step Content */}
        {step === 0 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" />
                Basic & Professional Information
              </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={basicInfo.username}
                    onChange={(e) => setBasicInfo({ ...basicInfo, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={basicInfo.employeeId}
                    readOnly
                    disabled
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-7"
                    onClick={() => {
                      navigator.clipboard.writeText(basicInfo.employeeId);
                      toast({ title: 'Copied', description: 'Employee ID copied to clipboard.' });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={basicInfo.firstName}
                    onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
              <Input
                    id="lastName"
                    value={basicInfo.lastName}
                    onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
                    required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={basicInfo.phoneNumber}
                    onChange={(e) => setBasicInfo({ ...basicInfo, phoneNumber: e.target.value })}
                  />
                </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                    value={professionalInfo.role}
                    onValueChange={(value) => setProfessionalInfo({ ...professionalInfo, role: value })}
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
                    value={professionalInfo.department}
                    onValueChange={(value) => setProfessionalInfo({ ...professionalInfo, department: value })}
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
                    value={professionalInfo.position}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, position: e.target.value })}
              />
            </div>
              <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                <Input
                    id="team"
                    value={professionalInfo.team}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, team: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={professionalInfo.hireDate}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, hireDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerId">Manager ID</Label>
                  <Input
                    id="managerId"
                    value={professionalInfo.managerId}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, managerId: e.target.value })}
                  />
                </div>
            </div>
              <div className="flex justify-between pt-4">
                <div />
                <Button type="button" onClick={handleBasicInfoSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
            </div>
          </div>
        </Card>
        )}
        {step === 1 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Location, Work & Emergency
              </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="office">Office</Label>
              <Input
                    id="office"
                    value={locationInfo.office}
                    onChange={(e) => setLocationInfo({ ...locationInfo, office: e.target.value })}
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
              <Input
                    id="floor"
                    value={locationInfo.floor}
                    onChange={(e) => setLocationInfo({ ...locationInfo, floor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="deskNumber">Desk Number</Label>
              <Input
                    id="deskNumber"
                    value={locationInfo.deskNumber}
                    onChange={(e) => setLocationInfo({ ...locationInfo, deskNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
              <Input
                    id="startTime"
                    type="time"
                    value={workSchedule.startTime}
                    onChange={(e) => setWorkSchedule({ ...workSchedule, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
              <Input
                    id="endTime"
                    type="time"
                    value={workSchedule.endTime}
                    onChange={(e) => setWorkSchedule({ ...workSchedule, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
              <Input
                    id="timezone"
                    value={workSchedule.timezone}
                    onChange={(e) => setWorkSchedule({ ...workSchedule, timezone: e.target.value })}
              />
            </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <Button type="button" onClick={handleLocationInfoSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
        {step === 2 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Compensation, Benefits & Wallet
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary</Label>
              <Input
                    id="baseSalary"
                    type="number"
                    value={user.compensation?.baseSalary}
                    onChange={(e) => setUser({ ...user, compensation: { ...user.compensation, baseSalary: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={user.compensation?.bonus}
                    onChange={(e) => setUser({ ...user, compensation: { ...user.compensation, bonus: Number(e.target.value) } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockOptions">Stock Options</Label>
                  <Input
                    id="stockOptions"
                    type="number"
                    value={user.compensation?.stockOptions}
                    onChange={(e) => setUser({ ...user, compensation: { ...user.compensation, stockOptions: Number(e.target.value) } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={user.compensation?.currency}
                    onChange={(e) => setUser({ ...user, compensation: { ...user.compensation, currency: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthInsurance">Health Insurance</Label>
                  <Input
                    id="healthInsurance"
                    type="checkbox"
                    checked={user.benefits?.healthInsurance}
                    onChange={(e) => setUser({ ...user, benefits: { ...user.benefits, healthInsurance: e.target.checked } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dentalInsurance">Dental Insurance</Label>
                  <Input
                    id="dentalInsurance"
                    type="checkbox"
                    checked={user.benefits?.dentalInsurance}
                    onChange={(e) => setUser({ ...user, benefits: { ...user.benefits, dentalInsurance: e.target.checked } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visionInsurance">Vision Insurance</Label>
                  <Input
                    id="visionInsurance"
                    type="checkbox"
                    checked={user.benefits?.visionInsurance}
                    onChange={(e) => setUser({ ...user, benefits: { ...user.benefits, visionInsurance: e.target.checked } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementPlan">Retirement Plan</Label>
                  <Input
                    id="retirementPlan"
                    type="checkbox"
                    checked={user.benefits?.retirementPlan}
                    onChange={(e) => setUser({ ...user, benefits: { ...user.benefits, retirementPlan: e.target.checked } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsurance">Life Insurance</Label>
                  <Input
                    id="lifeInsurance"
                    type="checkbox"
                    checked={user.benefits?.lifeInsurance}
                    onChange={(e) => setUser({ ...user, benefits: { ...user.benefits, lifeInsurance: e.target.checked } })}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
        {step === 3 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Wallet className="mr-2 h-5 w-5" />
                Wallet & Legal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={walletData.balance}
                    onChange={(e) => setUser({ ...user, wallet: { ...walletData, balance: Number(e.target.value) } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={walletData.currency}
                    onChange={(e) => setUser({ ...user, wallet: { ...walletData, currency: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccounts">Bank Accounts</Label>
                  {walletData.bankAccounts.map((account, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        id={`bankAccounts.${index}.id`}
                        value={account.id}
                        onChange={(e) => {
                          const updatedBankAccounts = [...walletData.bankAccounts];
                          updatedBankAccounts[index].id = e.target.value;
                          setUser({ ...user, wallet: { ...walletData, bankAccounts: updatedBankAccounts } });
                        }}
                      />
                      <Input
                        id={`bankAccounts.${index}.bankName`}
                        value={account.bankName}
                        onChange={(e) => {
                          const updatedBankAccounts = [...walletData.bankAccounts];
                          updatedBankAccounts[index].bankName = e.target.value;
                          setUser({ ...user, wallet: { ...walletData, bankAccounts: updatedBankAccounts } });
                        }}
                      />
                      <Input
                        id={`bankAccounts.${index}.accountNumber`}
                        value={account.accountNumber}
                        onChange={(e) => {
                          const updatedBankAccounts = [...walletData.bankAccounts];
                          updatedBankAccounts[index].accountNumber = e.target.value;
                          setUser({ ...user, wallet: { ...walletData, bankAccounts: updatedBankAccounts } });
                        }}
                      />
                      <Input
                        id={`bankAccounts.${index}.accountType`}
                        value={account.accountType}
                        onChange={(e) => {
                          const updatedBankAccounts = [...walletData.bankAccounts];
                          updatedBankAccounts[index].accountType = e.target.value;
                          setUser({ ...user, wallet: { ...walletData, bankAccounts: updatedBankAccounts } });
                        }}
                      />
                      <Input
                        id={`bankAccounts.${index}.isDefault`}
                        type="checkbox"
                        checked={account.isDefault}
                        onChange={(e) => {
                          const updatedBankAccounts = [...walletData.bankAccounts];
                          updatedBankAccounts[index].isDefault = e.target.checked;
                          setUser({ ...user, wallet: { ...walletData, bankAccounts: updatedBankAccounts } });
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="ml-2"
                        onClick={() => {
                          const updatedBankAccounts = walletData.bankAccounts.filter((_, i) => i !== index);
                          setUser({ ...user, wallet: { ...walletData, bankAccounts: updatedBankAccounts } });
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={legalDetailsData.taxId}
                    onChange={(e) => setUser({ ...user, legalDetails: { ...legalDetailsData, taxId: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    value={legalDetailsData.businessType}
                    onChange={(e) => setUser({ ...user, legalDetails: { ...legalDetailsData, businessType: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={legalDetailsData.registrationNumber}
                    onChange={(e) => setUser({ ...user, legalDetails: { ...legalDetailsData, registrationNumber: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incorporationDate">Incorporation Date</Label>
                  <Input
                    id="incorporationDate"
                    value={legalDetailsData.incorporationDate}
                    onChange={(e) => setUser({ ...user, legalDetails: { ...legalDetailsData, incorporationDate: e.target.value } })}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
        {step === 4 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Skills, Certifications, Education & Equipment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.skills?.map((skill, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.certifications?.map((cert, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  {educationList.map((edu, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        id={`education.${index}.degree`}
                        value={edu.degree}
                        onChange={(e) => {
                          const updatedEducation = [...educationList];
                          updatedEducation[index].degree = e.target.value;
                          setUser({ ...user, education: updatedEducation });
                        }}
                      />
                      <Input
                        id={`education.${index}.institution`}
                        value={edu.institution}
                        onChange={(e) => {
                          const updatedEducation = [...educationList];
                          updatedEducation[index].institution = e.target.value;
                          setUser({ ...user, education: updatedEducation });
                        }}
                      />
                      <Input
                        id={`education.${index}.graduationYear`}
                        value={edu.graduationYear}
                        onChange={(e) => {
                          const updatedEducation = [...educationList];
                          updatedEducation[index].graduationYear = e.target.value;
                          setUser({ ...user, education: updatedEducation });
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="ml-2"
                        onClick={() => {
                          const updatedEducation = educationList.filter((_, i) => i !== index);
                          setUser({ ...user, education: updatedEducation });
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="laptop">Laptop</Label>
                  <Input
                    id="laptop"
                    value={user.equipment?.laptop}
                    onChange={(e) => setUser({ ...user, equipment: { ...user.equipment, laptop: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monitor">Monitor</Label>
                  <Input
                    id="monitor"
                    value={user.equipment?.monitor}
                    onChange={(e) => setUser({ ...user, equipment: { ...user.equipment, monitor: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={user.equipment?.phone}
                    onChange={(e) => setUser({ ...user, equipment: { ...user.equipment, phone: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessLevels">Access Levels</Label>
                  <div className="flex flex-wrap gap-2">
                    {(safeAccessLevels.systems ?? []).map((system, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {system}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildings">Building Access</Label>
                  <div className="flex flex-wrap gap-2">
                    {(safeAccessLevels.buildings ?? []).map((building, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {building}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">Room Access</Label>
                  <div className="flex flex-wrap gap-2">
                    {(safeAccessLevels.rooms ?? []).map((room, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {room}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Performance Section */}
              <div className="mt-8">
                <h3 className="text-md font-semibold mb-2">Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastReviewDate">Last Review Date</Label>
                    <Input
                      id="lastReviewDate"
                      type="date"
                      value={user.performance?.lastReviewDate || ''}
                      onChange={e => setUser({
                        ...user,
                        performance: { ...user.performance, lastReviewDate: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextReviewDate">Next Review Date</Label>
                    <Input
                      id="nextReviewDate"
                      type="date"
                      value={user.performance?.nextReviewDate || ''}
                      onChange={e => setUser({
                        ...user,
                        performance: { ...user.performance, nextReviewDate: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min={0}
                      max={10}
                      value={user.performance?.rating || ''}
                      onChange={e => setUser({
                        ...user,
                        performance: { ...user.performance, rating: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>
              {/* Access Levels Section */}
              <div className="mt-8">
                <h3 className="text-md font-semibold mb-2">Access Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Systems */}
                  <div className="space-y-2">
                    <Label>Systems</Label>
                    <div className="flex flex-wrap gap-2">
                      {(safeAccessLevels.systems ?? []).map((system, idx) => (
                        <div key={idx} className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <span>{system}</span>
                          <Button type="button" size="icon" variant="ghost" className="ml-1" onClick={() => setUser({
                            ...user,
                            accessLevels: {
                              ...user.accessLevels,
                              systems: (safeAccessLevels.systems ?? []).filter((_, i) => i !== idx)
                            }
                          })}><Trash className="h-3 w-3" /></Button>
                        </div>
                      ))}
                      <Input
                        className="w-24"
                        placeholder="Add system"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setUser({
                              ...user,
                              accessLevels: {
                                ...user.accessLevels,
                                systems: [...(safeAccessLevels.systems ?? []), e.currentTarget.value.trim()]
                              }
                            });
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* Buildings */}
                  <div className="space-y-2">
                    <Label>Buildings</Label>
                    <div className="flex flex-wrap gap-2">
                      {(safeAccessLevels.buildings ?? []).map((building, idx) => (
                        <div key={idx} className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <span>{building}</span>
                          <Button type="button" size="icon" variant="ghost" className="ml-1" onClick={() => setUser({
                            ...user,
                            accessLevels: {
                              ...user.accessLevels,
                              buildings: (safeAccessLevels.buildings ?? []).filter((_, i) => i !== idx)
                            }
                          })}><Trash className="h-3 w-3" /></Button>
                        </div>
                      ))}
                      <Input
                        className="w-24"
                        placeholder="Add building"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setUser({
                              ...user,
                              accessLevels: {
                                ...user.accessLevels,
                                buildings: [...(safeAccessLevels.buildings ?? []), e.currentTarget.value.trim()]
                              }
                            });
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* Rooms */}
                  <div className="space-y-2">
                    <Label>Rooms</Label>
                    <div className="flex flex-wrap gap-2">
                      {(safeAccessLevels.rooms ?? []).map((room, idx) => (
                        <div key={idx} className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <span>{room}</span>
                          <Button type="button" size="icon" variant="ghost" className="ml-1" onClick={() => setUser({
                            ...user,
                            accessLevels: {
                              ...user.accessLevels,
                              rooms: (safeAccessLevels.rooms ?? []).filter((_, i) => i !== idx)
                            }
                          })}><Trash className="h-3 w-3" /></Button>
                        </div>
                      ))}
                      <Input
                        className="w-24"
                        placeholder="Add room"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setUser({
                              ...user,
                              accessLevels: {
                                ...user.accessLevels,
                                rooms: [...(safeAccessLevels.rooms ?? []), e.currentTarget.value.trim()]
                              }
                            });
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  </div>
              </div>
            </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
          </div>
        </Card>
        )}
        {step === 5 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Address & Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={addressData.street}
                    onChange={(e) => setUser({ ...user, address: { ...addressData, street: e.target.value } })}
                  />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={addressData.city}
                    onChange={(e) => setUser({ ...user, address: { ...addressData, city: e.target.value } })}
                  />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={addressData.state}
                    onChange={(e) => setUser({ ...user, address: { ...addressData, state: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={addressData.country}
                    onChange={(e) => setUser({ ...user, address: { ...addressData, country: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={addressData.postalCode}
                    onChange={(e) => setUser({ ...user, address: { ...addressData, postalCode: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isBillingAddress">Is Billing Address</Label>
                  <Input
                    id="isBillingAddress"
                    type="checkbox"
                    checked={addressData.isBillingAddress}
                    onChange={(e) => setUser({ ...user, address: { ...addressData, isBillingAddress: e.target.checked } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isShippingAddress">Is Shipping Address</Label>
                  <Input
                    id="isShippingAddress"
                    type="checkbox"
                    checked={addressData.isShippingAddress}
                    onChange={(e) => setUser({ ...user, address: { ...addressData, isShippingAddress: e.target.checked } })}
                  />
                </div>
              </div>
              {/* Editable Documents Section */}
              <div className="mt-8">
                <h3 className="text-md font-semibold mb-2">Documents</h3>
                <div className="space-y-4">
                  {safeDocuments.map((doc, idx) => (
                    <div key={idx} className="flex flex-wrap items-end gap-2 bg-gray-50 p-3 rounded-lg border">
                      <div className="flex-1 min-w-[120px]">
                        <Label>ID</Label>
                        <Input
                          value={doc.id || ''}
                          onChange={e => {
                            const docs = [...safeDocuments];
                            docs[idx].id = e.target.value;
                            setUser({ ...user, documents: docs });
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label>Type</Label>
                        <Input
                          value={doc.type || ''}
                          onChange={e => {
                            const docs = [...safeDocuments];
                            docs[idx].type = e.target.value;
                            setUser({ ...user, documents: docs });
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label>URL</Label>
                        <Input
                          value={doc.url || ''}
                          onChange={e => {
                            const docs = [...safeDocuments];
                            docs[idx].url = e.target.value;
                            setUser({ ...user, documents: docs });
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={doc.expiryDate || ''}
                          onChange={e => {
                            const docs = [...safeDocuments];
                            docs[idx].expiryDate = e.target.value;
                            setUser({ ...user, documents: docs });
                          }}
                        />
                      </div>
                      <Button type="button" size="icon" variant="destructive" className="ml-2" onClick={() => {
                        setUser({ ...user, documents: safeDocuments.filter((_, i) => i !== idx) });
                      }}><Trash className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setUser({
                    ...user,
                    documents: [...safeDocuments, { id: '', type: '', url: '', expiryDate: '' }]
                  })}>
                    Add Document
                  </Button>
                </div>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
            </div>
          </Card>
        )}
        {step === 6 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Module Access
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentUser?.organization?.activeModules || []).map((module) => {
                  const modulePermission = modulePermissions.find((p) => p.module === module);
                  return (
                    <div key={module} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                    <Checkbox
                            id={`module-access-${module}`}
                            checked={!!modulePermission}
                            onCheckedChange={() => handleModuleToggle(module)}
                          />
                          <Label htmlFor={`module-access-${module}`} className="font-medium">
                            {moduleDisplayInfo[module]?.name || module.charAt(0).toUpperCase() + module.slice(1)}
                    </Label>
                        </div>
                      </div>
                      {modulePermission && (
                        <div className="space-y-4 pl-6">
                          <div className="space-y-2">
                            <Label>Role in Module</Label>
                            <Select
                              value={modulePermission.role}
                              onValueChange={(value: 'admin' | 'user') => handleModuleRoleChange(module, value)}
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
                                    onCheckedChange={(checked) => handlePermissionChange(module, key as any, checked as boolean)}
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
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <Button type="button" onClick={handleModuleAccessSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
        {step === 7 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Cpu className="mr-2 h-5 w-5" />
                Blockchain & AI
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastReviewDate">Last Review Date</Label>
                  <Input
                    id="lastReviewDate"
                    type="date"
                    value={user.performance?.lastReviewDate || ''}
                    onChange={e => setUser({
                    ...user,
                      performance: { ...user.performance, lastReviewDate: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextReviewDate">Next Review Date</Label>
                  <Input
                    id="nextReviewDate"
                    type="date"
                    value={user.performance?.nextReviewDate || ''}
                    onChange={e => setUser({
                      ...user,
                      performance: { ...user.performance, nextReviewDate: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={0}
                    max={10}
                    value={user.performance?.rating || ''}
                    onChange={e => setUser({
                      ...user,
                      performance: { ...user.performance, rating: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
              {/* Editable Credentials Section */}
              <div className="mt-8">
                <h3 className="text-md font-semibold mb-2">Credentials</h3>
                <div className="space-y-4">
                  {(user.credentials ?? []).map((cred, idx) => (
                    <div key={idx} className="flex flex-wrap items-end gap-2 bg-gray-50 p-3 rounded-lg border">
                      <div className="flex-1 min-w-[100px]">
                        <Label>ID</Label>
                        <Input
                          value={cred.id || ''}
                          onChange={e => {
                            const creds = [...(user.credentials ?? [])];
                            creds[idx].id = e.target.value;
                            setUser({ ...user, credentials: creds });
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <Label>Type</Label>
                        <select
                          className="input"
                          value={cred.type}
                          onChange={e => {
                            const creds = [...(user.credentials ?? [])];
                            creds[idx].type = e.target.value as 'education' | 'certification' | 'experience';
                            setUser({ ...user, credentials: creds });
                          }}
                        >
                          <option value="education">Education</option>
                          <option value="certification">Certification</option>
                          <option value="experience">Experience</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label>Title</Label>
                        <Input
                          value={cred.title || ''}
                          onChange={e => {
                            const creds = [...(user.credentials ?? [])];
                            creds[idx].title = e.target.value;
                            setUser({ ...user, credentials: creds });
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label>Issuer</Label>
                        <Input
                          value={cred.issuer || ''}
                          onChange={e => {
                            const creds = [...(user.credentials ?? [])];
                            creds[idx].issuer = e.target.value;
                            setUser({ ...user, credentials: creds });
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={cred.date || ''}
                          onChange={e => {
                            const creds = [...(user.credentials ?? [])];
                            creds[idx].date = e.target.value;
                            setUser({ ...user, credentials: creds });
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <Label>Verified</Label>
                        <select
                          className="input"
                          value={cred.verified ? 'true' : 'false'}
                          onChange={e => {
                            const creds = [...(user.credentials ?? [])];
                            creds[idx].verified = e.target.value === 'true';
                            setUser({ ...user, credentials: creds });
                          }}
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <Label>Blockchain Hash</Label>
                        <Input
                          value={cred.blockchainHash || ''}
                          onChange={e => {
                            const creds = [...(user.credentials ?? [])];
                            creds[idx].blockchainHash = e.target.value;
                            setUser({ ...user, credentials: creds });
                          }}
                        />
                      </div>
                      <Button type="button" size="icon" variant="destructive" className="ml-2" onClick={() => {
                        setUser({ ...user, credentials: (user.credentials ?? []).filter((_, i) => i !== idx) });
                      }}><Trash className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setUser({
                    ...user,
                    credentials: [...(user.credentials ?? []), { id: '', type: 'education', title: '', issuer: '', date: '', verified: false, blockchainHash: '' }]
                  })}>
                    Add Credential
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button type="button" onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(step + 1)}>
                Next
              </Button>
              </div>
            </Card>
          )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-end mt-8">
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