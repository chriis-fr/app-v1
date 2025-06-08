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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableModules, userRoles, departments } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

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
    employmentType: '',
    salary: '',
    benefits: '',
    supervisor: '',
    canLogin: false,
    role: '',
    moduleAccess: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Steps for login-enabled (user) flow
  const userSteps = [
    { id: 1, title: 'Basic Information' },
    { id: 2, title: 'Contact & Location' },
    { id: 3, title: 'Employment Details' },
    { id: 4, title: 'Access & Permissions' },
    { id: 5, title: 'Additional Information' },
    { id: 6, title: 'Review & Confirm' },
  ];
  // Steps for employee-only flow
  const employeeSteps = [
    { id: 1, title: 'Basic Information' },
    { id: 2, title: 'Employment Details' },
    { id: 3, title: 'Review & Confirm' },
  ];

  console.log('currentUser.role', currentUser?.role);
  if (!currentUser || !['owner', 'admin'].includes(currentUser.role?.toLowerCase())) {
    setLocation('/dashboard');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (checked: boolean) => {
    setForm({ ...form, canLogin: checked });
  };

  const handleModuleToggle = (module: string) => {
    setForm((prev) => ({
      ...prev,
      moduleAccess: prev.moduleAccess.includes(module)
        ? prev.moduleAccess.filter((m) => m !== module)
        : [...prev.moduleAccess, module],
    }));
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
        delete payload.moduleAccess;
        delete payload.role;
      } else {
        if (!form.email || !form.username || !form.password || !form.role || form.moduleAccess.length === 0) {
          toast({ title: 'Error', description: 'All login and module fields are required.', variant: 'destructive' });
          setLoading(false);
          return;
        }
      }
      if (!form.firstName || !form.lastName || !form.department || !form.position || !form.employmentType || !form.salary) {
        toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const response = await fetch('/api/users', {
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
      <div className="container mx-auto py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add Employee</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stepper Navigation */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Switch checked={form.canLogin} onCheckedChange={handleToggle} id="canLogin" />
                <Label htmlFor="canLogin">Allow login for this employee</Label>
              </div>
              <div className="flex gap-2">
                {(form.canLogin ? userSteps : employeeSteps).map((stepObj, idx) => (
                  <div
                    key={stepObj.id}
                    className={`flex-1 text-center py-2 rounded ${currentStep === Number(stepObj.id) ? 'bg-blue-100 font-bold' : 'bg-gray-100'}`}
                  >
                    {stepObj.title}
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Render step content based on canLogin and currentStep */}
              {form.canLogin ? (
                <>
                  {Number(currentStep) === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={form.firstName} onChange={handleChange} name="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={form.lastName} onChange={handleChange} name="lastName" required />
                      </div>
                      {form.canLogin && <>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" value={form.username} onChange={handleChange} name="username" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={form.email} onChange={handleChange} name="email" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" value={form.password} onChange={handleChange} name="password" required />
                        </div>
                      </>}
                    </div>
                  )}
                  {Number(currentStep) === 2 && (
                    <div>
                      {/* Contact & Location fields */}
                      {/* ...reuse code from users/new.tsx... */}
                    </div>
                  )}
                  {Number(currentStep) === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={form.department} onValueChange={value => setForm(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={form.position} onChange={handleChange} name="position" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">Employment Type</Label>
                        <Input id="employmentType" value={form.employmentType} onChange={handleChange} name="employmentType" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input id="salary" value={form.salary} onChange={handleChange} name="salary" required />
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 4 && (
                    <div>
                      {/* Access & Permissions (role, module access, permissions, etc.) */}
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={form.role} onValueChange={value => setForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {userRoles.map((role) => (
                              <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Module Access</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableModules.map((module) => (
                            <div key={module} className="flex items-center space-x-2">
                              <Checkbox
                                id={`module-access-${module}`}
                                checked={form.moduleAccess.includes(module)}
                                onCheckedChange={() => handleModuleToggle(module)}
                              />
                              <Label htmlFor={`module-access-${module}`}>{module}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 5 && (
                    <div>
                      {/* Additional Information (skills, benefits, equipment, etc.) */}
                      {/* ...reuse code from users/new.tsx... */}
                    </div>
                  )}
                  {Number(currentStep) === 6 && (
                    <div>
                      {/* Review & Confirm step */}
                      {/* ...reuse code from users/new.tsx... */}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {Number(currentStep) === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={form.firstName} onChange={handleChange} name="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={form.lastName} onChange={handleChange} name="lastName" required />
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={form.department} onValueChange={value => setForm(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={form.position} onChange={handleChange} name="position" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">Employment Type</Label>
                        <Input id="employmentType" value={form.employmentType} onChange={handleChange} name="employmentType" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input id="salary" value={form.salary} onChange={handleChange} name="salary" required />
                      </div>
                    </div>
                  )}
                  {Number(currentStep) === 3 && (
                    <div>
                      {/* Optionally, show a review/confirmation step here */}
                      <p>Review the information and click Create Employee to submit.</p>
                    </div>
                  )}
                </>
              )}
              {/* Step navigation buttons */}
              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" disabled={Number(currentStep) === 1} onClick={() => setCurrentStep(s => Number(s) - 1)}>Previous</Button>
                {((form.canLogin && Number(currentStep) < 6) || (!form.canLogin && Number(currentStep) < 3)) ? (
                  <Button type="button" onClick={() => setCurrentStep(s => Number(s) + 1)}>Next</Button>
                ) : (
                  <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
} 