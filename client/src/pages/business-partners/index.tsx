import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { 
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
  ChevronDown,
  Handshake,
  Target,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

interface BusinessPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  type: string;
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
}

// Dummy data
const dummyPartners: BusinessPartner[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    website: 'www.acme.com',
    type: 'Vendor',
    status: 'active',
    wallet: {
      balance: 15000,
      currency: 'USD',
      bankAccounts: [
        {
          id: '1',
          bankName: 'Chase Bank',
          accountNumber: '****1234',
          accountType: 'Business',
          isDefault: true
        }
      ]
    },
    legalDetails: {
      taxId: '12-3456789',
      businessType: 'Corporation',
      registrationNumber: 'REG123456',
      incorporationDate: '2023-01-01'
    },
    address: {
      street: '123 Business Ave',
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
    name: 'Tech Solutions Inc',
    email: 'info@techsolutions.com',
    phone: '+1 (555) 987-6543',
    website: 'www.techsolutions.com',
    type: 'Client',
    status: 'active'
  }
];

const partnerTypes = [
  'All Types',
  'Vendor',
  'Client',
  'Supplier',
  'Distributor',
  'Contractor'
];

export default function BusinessPartnersPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (partnerId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(partnerId)) {
        newSet.delete(partnerId);
      } else {
        newSet.add(partnerId);
      }
      return newSet;
    });
  };

  const filteredPartners = dummyPartners.filter(partner => {
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = 
      selectedType === 'All Types' || 
      partner.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleEdit = (partnerId: string) => {
    setLocation(`/business-partners/${partnerId}`);
  };

  const handleDelete = (partnerId: string) => {
    // TODO: Implement delete functionality
    console.log('Deleting partner:', partnerId);
  };

  return (
    <ModuleLayout
      title="Business Partners"
      description="Manage your business partners and their information"
    >
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex gap-2">
            {partnerTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <Button onClick={() => setLocation('/business-partners/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-base">{partner.name}</h3>
                  <p className="text-sm text-gray-500">{partner.email}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(partner.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(partner.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Handshake className="h-3.5 w-3.5 text-gray-400" />
                  <span>{partner.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{partner.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  <span>{partner.website}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    partner.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="capitalize">{partner.status}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center justify-between"
                  onClick={() => toggleCard(partner.id)}
                >
                  <span className="text-sm">View Details</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    expandedCards.has(partner.id) ? 'transform rotate-180' : ''
                  }`} />
                </Button>
              </div>

              {expandedCards.has(partner.id) && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  {partner.wallet && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Wallet className="h-3.5 w-3.5 text-gray-400" />
                        <span>Balance: {partner.wallet.balance} {partner.wallet.currency}</span>
                      </div>
                      {partner.wallet.bankAccounts.map(account => (
                        <div key={account.id} className="flex items-center gap-2 text-sm">
                          <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                          <span>{account.bankName} - {account.accountNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {partner.legalDetails && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span>Legal Details</span>
                      </div>
                      <div className="text-sm">
                        <div>Tax ID: {partner.legalDetails.taxId}</div>
                        <div>Type: {partner.legalDetails.businessType}</div>
                        <div>Reg: {partner.legalDetails.registrationNumber}</div>
                      </div>
                    </div>
                  )}

                  {partner.address && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>Address</span>
                      </div>
                      <div className="text-sm">
                        <div>{partner.address.street}</div>
                        <div>{partner.address.city}, {partner.address.state} {partner.address.postalCode}</div>
                        <div className="flex gap-2 mt-1">
                          {partner.address.isBillingAddress && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              Billing
                            </span>
                          )}
                          {partner.address.isShippingAddress && (
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