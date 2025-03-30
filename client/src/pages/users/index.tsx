import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { 
  Search,
  Plus,
  Edit,
  Trash,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Wallet,
  CreditCard,
  Shield,
  User,
  Users,
  Briefcase,
  Calendar,
  FileCheck,
  FileWarning,
  Workflow,
  Database,
  Network,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  ChevronDown
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
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
    businessRegistration: string;
    incorporationDate: string;
    businessType: string;
    registrationNumber: string;
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
}

// Dummy data
const dummyUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Administrator',
    department: 'Engineering',
    position: 'Senior Developer',
    status: 'active',
    lastLogin: '2024-03-28T10:30:00Z',
    wallet: {
      balance: 5000,
      currency: 'USD',
      bankAccounts: [
        {
          id: '1',
          bankName: 'Chase Bank',
          accountNumber: '****1234',
          accountType: 'Checking',
          isDefault: true
        }
      ]
    },
    legalDetails: {
      taxId: '12-3456789',
      businessRegistration: 'REG123456',
      incorporationDate: '2023-01-01',
      businessType: 'LLC',
      registrationNumber: 'REG789012'
    },
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      isBillingAddress: true,
      isShippingAddress: true
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Manager',
    department: 'Sales',
    position: 'Sales Manager',
    status: 'active',
    lastLogin: '2024-03-28T09:15:00Z'
  }
];

const departments = [
  'All Departments',
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations'
];

export default function UsersPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (userId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const filteredUsers = dummyUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = 
      selectedDepartment === 'All Departments' || 
      user.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleEdit = (userId: string) => {
    setLocation(`/users/${userId}`);
  };

  const handleDelete = (userId: string) => {
    // TODO: Implement delete functionality
    console.log('Deleting user:', userId);
  };

  return (
    <ModuleLayout
      title="Users"
      description="Manage users and their permissions"
    >
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex gap-2">
            {departments.map((dept) => (
              <Button
                key={dept}
                variant={selectedDepartment === dept ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept}
              </Button>
            ))}
          </div>
          <Button onClick={() => setLocation('/users/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-base">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(user.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-3.5 w-3.5 text-gray-400" />
                  <span>{user.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-3.5 w-3.5 text-gray-400" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                  <span>{user.position}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="capitalize">{user.status}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center justify-between"
                  onClick={() => toggleCard(user.id)}
                >
                  <span className="text-sm">View Details</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    expandedCards.has(user.id) ? 'transform rotate-180' : ''
                  }`} />
                </Button>
              </div>

              {expandedCards.has(user.id) && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  {user.lastLogin && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                    </div>
                  )}

                  {user.wallet && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Wallet className="h-3.5 w-3.5 text-gray-400" />
                        <span>Balance: {user.wallet.balance} {user.wallet.currency}</span>
                      </div>
                      {user.wallet.bankAccounts.map(account => (
                        <div key={account.id} className="flex items-center gap-2 text-sm">
                          <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                          <span>{account.bankName} - {account.accountNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {user.legalDetails && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span>Legal Details</span>
                      </div>
                      <div className="text-sm">
                        <div>Tax ID: {user.legalDetails.taxId}</div>
                        <div>Type: {user.legalDetails.businessType}</div>
                        <div>Reg: {user.legalDetails.registrationNumber}</div>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>Address</span>
                      </div>
                      <div className="text-sm">
                        <div>{user.address.street}</div>
                        <div>{user.address.city}, {user.address.state} {user.address.postalCode}</div>
                        <div className="flex gap-2 mt-1">
                          {user.address.isBillingAddress && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              Billing
                            </span>
                          )}
                          {user.address.isShippingAddress && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                              Shipping
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </ModuleLayout>
  );
} 