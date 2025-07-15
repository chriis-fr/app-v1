import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { vendorTypes, vendorAccessLevels } from '@shared/schema';

export default function NewVendorPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    type: vendorTypes[0],
    accessLevel: vendorAccessLevels[0],
    businessCategory: '',
    specialties: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specialties: formData.specialties.split(',').map((s: string) => s.trim()),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to create vendor');
        setLoading(false);
        return;
      }
      setLocation('/business-partners/vendor');
    } catch (err) {
      setError('Failed to create vendor');
      setLoading(false);
    }
  };

  return (
    <ModuleLayout title="Add Vendor" description="Create a new vendor profile for your organization.">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Vendor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name</Label>
              <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={formData.website} onChange={e => handleChange('website', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Vendor Type</Label>
              <Select value={formData.type} onValueChange={value => handleChange('type', value)}>
                {vendorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select value={formData.accessLevel} onValueChange={value => handleChange('accessLevel', value)}>
                {vendorAccessLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessCategory">Business Category</Label>
              <Input id="businessCategory" value={formData.businessCategory} onChange={e => handleChange('businessCategory', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma separated)</Label>
              <Input id="specialties" value={formData.specialties} onChange={e => handleChange('specialties', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={value => handleChange('status', value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setLocation('/business-partners/vendor')}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Vendor'}</Button>
          </div>
        </Card>
      </form>
    </ModuleLayout>
  );
} 