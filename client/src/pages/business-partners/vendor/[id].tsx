import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { vendorTypes, vendorAccessLevels } from '@shared/schema';

export default function EditVendorPage({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendor() {
      setLoading(true);
      try {
        const res = await fetch(`/api/vendors/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch vendor');
        const data = await res.json();
        setFormData({
          ...data,
          specialties: (data.specialties || []).join(', '),
        });
      } catch (e) {
        setError('Failed to load vendor');
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [params.id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/vendors/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specialties: formData.specialties.split(',').map((s: string) => s.trim()),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to update vendor');
        setSaving(false);
        return;
      }
      setLocation('/business-partners/vendor');
    } catch (err) {
      setError('Failed to update vendor');
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <ModuleLayout title="Edit Vendor" description="Update vendor profile.">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout title="Edit Vendor" description="Update vendor profile.">
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
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </Card>
      </form>
    </ModuleLayout>
  );
} 