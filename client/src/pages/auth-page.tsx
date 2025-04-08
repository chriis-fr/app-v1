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
import { insertUserSchema, registerOrganizationSchema, availableModules, organizationTypes, accountingTypes } from '@shared/schema';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Box, 
  ArrowRight, 
  ArrowLeft,
  LogOut,
  LayoutGrid,
  BarChart,
  Wallet,
  Database,
  Network,
  Workflow,
  CheckCircle,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import type { RegisterOrganization } from '@shared/schema';
import { useState, useEffect } from 'react';
import React from 'react';

interface LoginData {
  username: string;
  password: string;
}

type RegistrationStep = 'organization' | 'accounting' | 'modules' | 'review';

export default function AuthPage() {
  const { user, loginMutation, registerMutation, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('organization');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already logged in, but only once
  useEffect(() => {
    if (user && !isRedirecting) {
      setIsRedirecting(true);
      setLocation('/dashboard');
    }
  }, [user, setLocation, isRedirecting]);

  // If redirecting, show nothing
  if (isRedirecting) {
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
      accountingSettings: {
        fiscalYearStart: new Date().toISOString().split('T')[0],
        fiscalPeriod: 'monthly',
        defaultCurrency: 'USD',
        taxTypes: ['VAT'],
        chartOfAccounts: []
      }
    }
  });

  const handleNext = () => {
    switch (currentStep) {
      case 'organization':
        setCurrentStep('accounting');
        break;
      case 'accounting':
        setCurrentStep('modules');
        break;
      case 'modules':
        setCurrentStep('review');
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'accounting':
        setCurrentStep('organization');
        break;
      case 'modules':
        setCurrentStep('accounting');
        break;
      case 'review':
        setCurrentStep('modules');
        break;
      default:
        break;
    }
  };

  const renderRegistrationStep = () => {
    switch (currentStep) {
      case 'organization':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Organization Details</h3>
            <div className="space-y-2">
              <Label>Organization Name</Label>
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
            <Button onClick={handleNext} className="w-full">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'accounting':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Accounting Settings</h3>
            <div className="space-y-2">
              <Label>Fiscal Year Start</Label>
              <Input 
                type="date" 
                {...registerForm.register('accountingSettings.fiscalYearStart')} 
              />
              <Label>Fiscal Period</Label>
              <Select onValueChange={value => registerForm.setValue('accountingSettings.fiscalPeriod', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Fiscal Period" />
                </SelectTrigger>
                <SelectContent>
                  {accountingTypes.fiscalPeriods.map(period => (
                    <SelectItem key={period} value={period}>{period.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label>Default Currency</Label>
              <Select onValueChange={value => registerForm.setValue('accountingSettings.defaultCurrency', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  {accountingTypes.currencies.map(currency => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label>Tax Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {accountingTypes.taxTypes.map((tax) => (
                  <label key={tax} className="flex items-center space-x-2">
                    <Checkbox
                      checked={registerForm.watch('accountingSettings.taxTypes')?.includes(tax)}
                      onCheckedChange={(checked) => {
                        const current = registerForm.getValues('accountingSettings.taxTypes') || [];
                        if (checked) {
                          registerForm.setValue('accountingSettings.taxTypes', [...current, tax]);
                        } else {
                          registerForm.setValue(
                            'accountingSettings.taxTypes',
                            current.filter(t => t !== tax)
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{tax}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'modules':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Additional Modules</h3>
            <p className="text-sm text-gray-500">Choose up to 2 additional modules (Finance module is included by default)</p>
            <div className="grid grid-cols-2 gap-2">
              {availableModules.filter(module => module !== 'accounting').map((module) => (
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Your Registration</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Organization Details</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Name: {registerForm.watch('name')}</p>
                  <p>Type: {registerForm.watch('type')?.toUpperCase()}</p>
                  <p>Industry: {registerForm.watch('industry')}</p>
                  <p>Address: {registerForm.watch('address')}</p>
                  <p>Country: {registerForm.watch('country')}</p>
                  <p>Website: {registerForm.watch('website')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Accounting Settings</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Fiscal Year Start: {registerForm.watch('accountingSettings.fiscalYearStart')}</p>
                  <p>Fiscal Period: {registerForm.watch('accountingSettings.fiscalPeriod')?.toUpperCase()}</p>
                  <p>Default Currency: {registerForm.watch('accountingSettings.defaultCurrency')}</p>
                  <p>Tax Types: {registerForm.watch('accountingSettings.taxTypes')?.join(', ')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Selected Modules</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Finance (Default)</p>
                  {registerForm.watch('selectedModules')?.map(module => (
                    <p key={module}>{module.replace('_', ' ').toUpperCase()}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={() => {
                  const formData = registerForm.getValues();
                  registerMutation.mutate({
                    ...formData,
                    organizationName: formData.name
                  });
                }} 
                className="flex-1"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Creating Organization...' : 'Create Organization'}
              </Button>
            </div>
          </div>
        );
    }
  };

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
                <form onSubmit={loginForm.handleSubmit((data) => {
                  loginMutation.mutate(data, {
                    onSuccess: () => {
                      setLocation('/dashboard');
                    }
                  });
                })} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input id="login-username" {...loginForm.register('username')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" {...loginForm.register('password')} />
                  </div>
                  {loginMutation.error && (
                    <div className="text-sm text-red-500">
                      {loginMutation.error.message}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                {renderRegistrationStep()}
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

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Intuitive Interface</h3>
                <p className="text-muted-foreground">
                  Modern, user-friendly design that makes complex operations simple
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                <p className="text-muted-foreground">
                  Powerful reporting and analytics tools for data-driven decision making
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Blockchain Integration</h3>
                <p className="text-muted-foreground">
                  Secure, transparent transactions with blockchain technology
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}