import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';

export default function NewEmployeePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    department: '',
    position: '',
    canLogin: false,
  });
  const [loading, setLoading] = useState(false);

  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin' && currentUser.role !== 'hr_admin')) {
    setLocation('/dashboard');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (checked: boolean) => {
    setForm({ ...form, canLogin: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!form.canLogin) {
        delete payload.email;
        delete payload.username;
        delete payload.password;
      }
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create employee');
      toast({ title: 'Success', description: 'Employee created successfully' });
      setLocation('/hr');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create employee', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Add Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>First Name</Label>
                  <Input name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="flex-1">
                  <Label>Last Name</Label>
                  <Input name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <Label>Department</Label>
                <Input name="department" value={form.department} onChange={handleChange} required />
              </div>
              <div>
                <Label>Position</Label>
                <Input name="position" value={form.position} onChange={handleChange} required />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.canLogin} onCheckedChange={handleToggle} id="canLogin" />
                <Label htmlFor="canLogin">Allow login for this employee</Label>
              </div>
              {form.canLogin && (
                <>
                  <div>
                    <Label>Email</Label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} required={form.canLogin} />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input name="username" value={form.username} onChange={handleChange} required={form.canLogin} />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input name="password" type="password" value={form.password} onChange={handleChange} required={form.canLogin} />
                  </div>
                </>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Employee'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
} 