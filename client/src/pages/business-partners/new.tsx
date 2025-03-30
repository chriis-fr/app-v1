import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
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
  Info
} from 'lucide-react';

interface NewBusinessPartner {
  name: string;
  type: 'customer' | 'supplier' | 'vendor' | 'partner';
  email: string;
  phone: string;
  website?: string;
  status: 'active' | 'inactive';
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

const partnerTypes = [
  'Customer',
  'Supplier',
  'Vendor',
  'Partner'
];

const businessTypes = [
  'Corporation',
  'LLC',
  'Partnership',
  'Sole Proprietorship',
  'Non-Profit'
];

export default function NewBusinessPartnerPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<NewBusinessPartner>({
    name: '',
    type: 'customer',
    email: '',
    phone: '',
    website: '',
    status: 'active'
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving new partner:', formData);
  };

  return (
    <ModuleLayout
      title="New Business Partner"
      description="Create a new business partner"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Partner Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                {partnerTypes.map(type => (
                  <option key={type} value={type.toLowerCase()}>{type}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Wallet Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="walletBalance">Initial Balance</Label>
                <Input
                  id="walletBalance"
                  type="number"
                  value={formData.wallet?.balance || 0}
                  onChange={(e) => handleChange('wallet', {
                    ...formData.wallet,
                    balance: parseFloat(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletCurrency">Currency</Label>
                <Input
                  id="walletCurrency"
                  value={formData.wallet?.currency || 'USD'}
                  onChange={(e) => handleChange('wallet', {
                    ...formData.wallet,
                    currency: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bank Accounts</Label>
              {formData.wallet?.bankAccounts.map((account, index) => (
                <div key={account.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Bank Name"
                    value={account.bankName}
                    onChange={(e) => {
                      const newAccounts = [...(formData.wallet?.bankAccounts || [])];
                      newAccounts[index] = { ...account, bankName: e.target.value };
                      handleChange('wallet', { ...formData.wallet, bankAccounts: newAccounts });
                    }}
                  />
                  <Input
                    placeholder="Account Number"
                    value={account.accountNumber}
                    onChange={(e) => {
                      const newAccounts = [...(formData.wallet?.bankAccounts || [])];
                      newAccounts[index] = { ...account, accountNumber: e.target.value };
                      handleChange('wallet', { ...formData.wallet, bankAccounts: newAccounts });
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newAccount = {
                    id: Date.now().toString(),
                    bankName: '',
                    accountNumber: '',
                    accountType: 'Business',
                    isDefault: false
                  };
                  handleChange('wallet', {
                    ...formData.wallet,
                    bankAccounts: [...(formData.wallet?.bankAccounts || []), newAccount]
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Legal Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Legal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={formData.legalDetails?.taxId || ''}
                onChange={(e) => handleChange('legalDetails', {
                  ...formData.legalDetails,
                  taxId: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={formData.legalDetails?.businessType || ''}
                onValueChange={(value) => handleChange('legalDetails', {
                  ...formData.legalDetails,
                  businessType: value
                })}
              >
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.legalDetails?.registrationNumber || ''}
                onChange={(e) => handleChange('legalDetails', {
                  ...formData.legalDetails,
                  registrationNumber: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incorporationDate">Incorporation Date</Label>
              <Input
                id="incorporationDate"
                type="date"
                value={formData.legalDetails?.incorporationDate || ''}
                onChange={(e) => handleChange('legalDetails', {
                  ...formData.legalDetails,
                  incorporationDate: e.target.value
                })}
              />
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address?.street || ''}
                onChange={(e) => handleChange('address', {
                  ...formData.address,
                  street: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.address?.city || ''}
                onChange={(e) => handleChange('address', {
                  ...formData.address,
                  city: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.address?.state || ''}
                onChange={(e) => handleChange('address', {
                  ...formData.address,
                  state: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address?.country || ''}
                onChange={(e) => handleChange('address', {
                  ...formData.address,
                  country: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.address?.postalCode || ''}
                onChange={(e) => handleChange('address', {
                  ...formData.address,
                  postalCode: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.address?.isBillingAddress || false}
                    onChange={(e) => handleChange('address', {
                      ...formData.address,
                      isBillingAddress: e.target.checked
                    })}
                  />
                  Billing Address
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.address?.isShippingAddress || false}
                    onChange={(e) => handleChange('address', {
                      ...formData.address,
                      isShippingAddress: e.target.checked
                    })}
                  />
                  Shipping Address
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button onClick={handleSave}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Create Partner
          </Button>
        </div>
      </div>
    </ModuleLayout>
  );
} 