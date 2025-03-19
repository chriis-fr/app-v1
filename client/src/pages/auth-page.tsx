import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema, registerOrganizationSchema, availableModules, organizationTypes } from '@shared/schema';
import { ShieldCheck, Building2, Users, Box } from 'lucide-react';
import type { RegisterOrganization } from '@shared/schema';

interface LoginData {
  username: string;
  password: string;
}

// export interface RegisterOrganizationData {
//   id?: string;
//   username: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   type: 'business' | 'ngo';       // belongs to the organization
//   name: string;                   // organization name
//   industry: string;               // organization field
//   selectedModules: string[];      // chosen modules
//   address?: string;
//   country?: string;
//   website?: string;
//   role: "owner" | "admin" | "manager" | "employee";
//   isOwner: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation('/dashboard');
    return null;
  }

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  const registerForm = useForm<RegisterOrganization>({
    resolver: zodResolver(registerOrganizationSchema),
    defaultValues: {
      selectedModules: [],
      type: 'business',
      // ...
    }
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-gradient-to-b from-background to-muted">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Box className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Chains ERP
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register Organization</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input id="login-username" {...loginForm.register('username')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" {...loginForm.register('password')} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Organization Details</Label>
                    <Input placeholder="Organization Name" {...registerForm.register('name')} />
                    <Select onValueChange={value => registerForm.setValue('type', value as RegisterOrganization['type'])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Organization Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationTypes.map(type => (
                          <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Industry" {...registerForm.register('industry')} />
                    <Input placeholder="Address" {...registerForm.register('address')} />
                    <Input placeholder="Country" {...registerForm.register('country')} />
                    <Input placeholder="Website" {...registerForm.register('website')} />
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Account</Label>
                    <Input placeholder="First Name" {...registerForm.register('firstName')} />
                    <Input placeholder="Last Name" {...registerForm.register('lastName')} />
                    <Input placeholder="Email" type="email" {...registerForm.register('email')} />
                    <Input placeholder="Phone Number" {...registerForm.register('phoneNumber')} />
                    <Input placeholder="Username" {...registerForm.register('username')} />
                    <Input placeholder="Password" type="password" {...registerForm.register('password')} />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Initial Modules (Max 2)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableModules.map((module) => (
                        <label key={module} className="flex items-center space-x-2">
                          <Checkbox
                            checked={registerForm.watch('selectedModules')?.includes(module)}
                            onCheckedChange={(checked) => {
                              const current = registerForm.getValues('selectedModules') || [];
                              if (checked && current.length < 2) {
                                registerForm.setValue('selectedModules', [...current, module]);
                              } else if (!checked) {
                                registerForm.setValue(
                                  'selectedModules',
                                  current.filter(m => m !== module)
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{module.replace('_', ' ').toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? 'Creating Organization...' : 'Create Organization'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col justify-center bg-muted p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative max-w-xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            The Complete ERP Solution for Modern Business
          </h1>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Enterprise-Grade Security</h3>
                <p className="text-muted-foreground">
                  Advanced encryption and blockchain integration for secure transactions and data management
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Comprehensive Modules</h3>
                <p className="text-muted-foreground">
                  From POS to HR, accounting to blockchain - everything you need in one platform
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multi-Tenant Architecture</h3>
                <p className="text-muted-foreground">
                  Scalable solution perfect for businesses of all sizes and NGOs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}