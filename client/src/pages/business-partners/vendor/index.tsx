import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Building, Users, FileText, Network, Shield, BarChart, Settings, Briefcase } from 'lucide-react';

interface Vendor {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  type: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  organizationId: string;
  clientOrganizations: string[];
  accessLevel: string;
  vendorCode: string;
  businessCategory: string;
  specialties: string[];
  // ...other fields as per shared/schema.ts
}

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/vendors');
        const data = await res.json();
        setVendors(data);
      } catch (e) {
        setVendors([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(search.toLowerCase()) ||
    vendor.vendorCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ModuleLayout
      title="Vendor Dashboard"
      description="Manage your vendor profile, see your organizations, and access your operations."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => setLocation('/business-partners/new')}>Add Vendor</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVendors.map(vendor => (
              <Card key={vendor.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-base">{vendor.name}</h3>
                    <p className="text-sm text-gray-500">{vendor.email}</p>
                    <p className="text-xs text-gray-400">Vendor Code: {vendor.vendorCode}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setLocation(`/business-partners/vendor/${vendor.id}`)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building className="h-4 w-4" /> {vendor.businessCategory}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Network className="h-4 w-4" /> {vendor.type}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="h-4 w-4" /> {vendor.status}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BarChart className="h-4 w-4" /> Access: {vendor.accessLevel}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
} 