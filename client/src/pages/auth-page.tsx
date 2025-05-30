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
import { getAvailableCountries } from '@/config/countries';
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
import { toast } from '@/components/ui/use-toast';

interface LoginData {
  email: string;
  password: string;
}

type RegistrationStep = 'owner' | 'organization' | 'accounting' | 'modules' | 'review';

export default function AuthPage() {
  const { user, loginMutation, registerMutation, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('owner');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(insertUserSchema.pick({ email: true, password: true })),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const registerForm = useForm<RegisterOrganization>({
    resolver: zodResolver(registerOrganizationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      username: '',
      password: '',
      name: '',
      type: 'business',
      industry: '',
      address: '',
      country: '',
      website: '',
      selectedModules: [],
      accountingSettings: {
        fiscalYearStart: new Date().toISOString().split('T')[0],
        fiscalPeriod: 'monthly',
        defaultCurrency: 'USD',
        taxTypes: ['VAT'],
        chartOfAccounts: []
      }
    }
  });

  // Redirect if already logged in, but only once
  useEffect(() => {
    if (user && !isRedirecting) {
      setIsRedirecting(true);
      setIsLoading(true);
      // Add a small delay to show the loading animation
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    }
  }, [user, setLocation, isRedirecting]);

  const handleNext = () => {
    switch (currentStep) {
      case 'owner':
        setCurrentStep('organization');
        break;
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
      case 'organization':
        setCurrentStep('owner');
        break;
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
      case 'owner':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Owner Information</h3>
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="First Name" {...registerForm.register('firstName')} />
              <Label>Last Name</Label>
              <Input placeholder="Last Name" {...registerForm.register('lastName')} />
              <Label>Email</Label>
              <Input type="email" placeholder="Email" {...registerForm.register('email')} />
              <Label>Phone Number</Label>
              <Input placeholder="Phone Number" {...registerForm.register('phoneNumber')} />
              <Label>Username</Label>
              <Input placeholder="Username" {...registerForm.register('username')} />
              <Label>Password</Label>
              <Input type="password" placeholder="Password" {...registerForm.register('password')} />
            </div>
            <Button onClick={handleNext} className="w-full">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

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
              <div className="space-y-2">
                <Label>Country</Label>
                <Select onValueChange={value => registerForm.setValue('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCountries().map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Website" {...registerForm.register('website')} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
              <Select 
                onValueChange={value => registerForm.setValue('accountingSettings.fiscalPeriod', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fiscal Period" />
                </SelectTrigger>
                <SelectContent>
                  {accountingTypes.fiscalPeriods.map(period => (
                    <SelectItem key={period} value={period}>{period.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                onValueChange={value => registerForm.setValue('accountingSettings.defaultCurrency', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default Currency" />
                </SelectTrigger>
                <SelectContent>
                  {accountingTypes.currencies.map(currency => (
                    <SelectItem key={currency} value={currency}>{currency.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleNext} className="w-full">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'modules':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Modules</h3>
            <div className="space-y-2">
              {availableModules
                .filter(module => ['HR', 'Accounting', 'AI'].includes(module))
                .map(module => (
                  <div key={module} className="flex items-center space-x-2">
                    <Checkbox
                      id={module}
                      checked={registerForm.watch('selectedModules').includes(module)}
                      onCheckedChange={(checked) => {
                        const modules = registerForm.watch('selectedModules');
                        if (checked) {
                          registerForm.setValue('selectedModules', [...modules, module]);
                        } else {
                          registerForm.setValue('selectedModules', modules.filter(m => m !== module));
                        }
                      }}
                    />
                    <Label htmlFor={module}>{module}</Label>
                  </div>
                ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext}>
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
                <h4 className="font-medium">Owner Information</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>First Name: {registerForm.watch('firstName')}</p>
                  <p>Last Name: {registerForm.watch('lastName')}</p>
                  <p>Email: {registerForm.watch('email')}</p>
                  <p>Phone: {registerForm.watch('phoneNumber')}</p>
                  <p>Username: {registerForm.watch('username')}</p>
                </div>
              </div>
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
                    organization: {
                      name: formData.name,
                      type: formData.type,
                      industry: formData.industry
                    },
                    owner: {
                      username: formData.username,
                      password: formData.password,
                      email: formData.email,
                      firstName: formData.firstName,
                      lastName: formData.lastName
                    }
                  }, {
                    onSuccess: () => {
                      setLocation('/dashboard');
                    },
                    onError: (error) => {
                      toast({
                        title: "Registration Failed",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  });
                }} 
                className="flex-1"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Organization...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
          <div className="text-center space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-4 border-4 border-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="absolute inset-8 border-4 border-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              <div className="absolute inset-12 border-4 border-primary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome to Chains ERP
              </h2>
              <p className="text-muted-foreground">
                Loading your personalized dashboard...
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      );
    }

    if (isRedirecting) {
      return null;
    }

    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-4 sm:p-8">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Welcome to Chains ERP</CardTitle>
              <CardDescription>
                {user ? 'You are already logged in' : 'Please sign in to continue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <p>You are logged in as {user.email}</p>
                  <Button onClick={logout} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate({ email: data.email, password: data.password }))} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="Email" {...loginForm.register('email')} />
                        <Label>Password</Label>
                        <Input type="password" placeholder="Password" {...loginForm.register('password')} />
                      </div>
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="register">
                    {renderRegistrationStep()}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side - Info */}
        <div className="w-full lg:w-1/2 bg-muted p-4 sm:p-8 flex items-center">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Streamline Your Business Operations
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Chains ERP provides a comprehensive suite of tools to manage your organization efficiently.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Unified Dashboard</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get a complete overview of your business operations in one place.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Advanced Analytics</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Make data-driven decisions with comprehensive reporting tools.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Financial Management</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Streamline your accounting and financial operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Inventory Control</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Track and manage your inventory in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Network className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Supply Chain</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Optimize your supply chain and logistics operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Workflow className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Process Automation</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Automate repetitive tasks and workflows.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 border-t">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Secure and reliable</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mt-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>24/7 support available</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mt-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span>Regular updates and improvements</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
} 