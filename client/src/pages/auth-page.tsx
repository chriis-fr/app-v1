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
import { insertUserSchema, registerOrganizationSchema, availableModules, organizationTypes, accountingTypes, industries } from '@shared/schema';
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
  Info,
  ShoppingCart,
  Stethoscope,
  Banknote,
  Factory,
  GraduationCap,
  Cpu,
  Truck,
  Leaf,
  Flame,
  Hotel,
  Home,
  Camera,
  Bus,
  Hammer,
  Landmark,
  HeartHandshake,
  Briefcase,
  Utensils,
  Phone,
  Car,
  Pill,
  Star,
  Rocket,
  Crown,
  PieChart,
  Wrench,
  Globe,
  ShoppingBag,
  Languages,
  Bitcoin,
  Settings,
  Zap
} from 'lucide-react';
import type { RegisterOrganization, OrganizationSettings, AvailableModule } from '@shared/schema';
import { useState, useEffect } from 'react';
import React from 'react';
import { toast } from '@/components/ui/use-toast';
import { industryThemes } from '@/config/industryThemes';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LoginData {
  email: string;
  password: string;
}

type RegistrationStep = 'owner' | 'organization' | 'accounting' | 'modules' | 'review';

// Tiers and their module limits
const tiers = [
  { id: 'free', name: 'Free', description: 'Basic features for small teams', maxModules: 2, tooltip: 'Best for individuals or very small teams.' },
  { id: 'pro', name: 'Pro', description: 'Advanced features for growing businesses', maxModules: 5, tooltip: 'For growing businesses that need more power.' },
  { id: 'enterprise', name: 'Enterprise', description: 'Full suite for large organizations', maxModules: Infinity, tooltip: 'Unlimited modules and premium support.' },
];

// Map industries to Lucide icons
const industryIcons = {
  retail: ShoppingCart,
  healthcare: Stethoscope,
  finance: Banknote,
  manufacturing: Factory,
  education: GraduationCap,
  technology: Cpu,
  logistics: Truck,
  agriculture: Leaf,
  energy: Flame,
  hospitality: Hotel,
  real_estate: Home,
  media: Camera,
  transportation: Bus,
  construction: Hammer,
  government: Landmark,
  nonprofit: HeartHandshake,
  professional_services: Briefcase,
  food_beverage: Utensils,
  telecommunications: Phone,
  automotive: Car,
  pharmaceuticals: Pill,
};

// Dummy compliance requirements by country
const complianceRequirements: Record<string, { title: string; requirements: string[] }> = {
  KE: {
    title: 'Kenya Compliance Requirements',
    requirements: [
      'KRA PIN registration',
      'VAT registration (if applicable)',
      'iTax system integration',
      'NHIF and NSSF registration',
      'Annual tax return filing',
      'Electronic Tax Invoice Management System (eTIMS) compliance',
      'Withholding tax compliance',
      'Data protection compliance (Kenya Data Protection Act)',
    ],
  },
  // Add more countries as needed
};

// Tier icons and colors
const tierIcons = {
  free: Star,
  pro: Rocket,
  enterprise: Crown,
};
const tierColors = {
  free: 'border-blue-400 bg-blue-50',
  pro: 'border-green-400 bg-green-50',
  enterprise: 'border-yellow-400 bg-yellow-50',
};

const moduleDescriptions: Record<string, string> = {
  procurement: 'Manage purchase orders, supplier relationships, and procurement processes.',
  manufacturing: 'Production planning, work orders, and manufacturing operations.',
  order_management: 'Order processing, fulfillment, and tracking.',
  warehouse: 'Warehouse operations, layout, and inventory placement.',
  supply_chain: 'Supply chain planning, logistics, and distribution management.',
  project_service: 'Service project planning, execution, and delivery.',
  workforce: 'Staff scheduling, time tracking, and capacity planning.',
  ecommerce: 'Online store management, product listings, and order processing.',
  marketing: 'Campaign management, lead generation, and marketing analytics.',
  quality: 'Quality control, inspections, and compliance management.',
  maintenance: 'Equipment maintenance, work orders, and asset management.',
  project: 'Project planning, tracking, and resource management.',
  analytics: 'Business intelligence, reporting, and data analytics.',
  global_finance: 'Multi-currency handling, international tax compliance, and regional financial regulations.',
  international_trade: 'Import/export regulations, tariffs, customs procedures, and trade compliance.',
  customer_experience: 'Customer feedback, sentiment analysis, and service quality tracking.',
  vendor_management: 'Global supplier networks, international logistics, and supply chain optimization.',
  ecommerce_global: 'Integration with global marketplaces and localized payment gateways.',
  localization: 'Multiple languages, currencies, and region-specific compliance.',
  digital_currency: 'Blockchain for secure transactions and digital currency payment options.',
};

// Add this mapping near the top, after imports
const comingModuleMeta: Record<string, { icon: React.ElementType; color: string }> = {
  procurement: { icon: Briefcase, color: 'bg-slate-500' },
  manufacturing: { icon: Factory, color: 'bg-amber-500' },
  order_management: { icon: ShoppingCart, color: 'bg-blue-500' },
  warehouse: { icon: Database, color: 'bg-blue-600' },
  supply_chain: { icon: Truck, color: 'bg-cyan-500' },
  project_service: { icon: Workflow, color: 'bg-lime-500' },
  workforce: { icon: Users, color: 'bg-green-500' },
  ecommerce: { icon: ShoppingCart, color: 'bg-fuchsia-500' },
  marketing: { icon: PieChart, color: 'bg-red-600' },
  quality: { icon: ShieldCheck, color: 'bg-green-600' },
  maintenance: { icon: Wrench, color: 'bg-zinc-500' },
  project: { icon: Workflow, color: 'bg-lime-500' },
  analytics: { icon: BarChart, color: 'bg-red-500' },
  global_finance: { icon: Wallet, color: 'bg-emerald-500' },
  international_trade: { icon: Globe, color: 'bg-sky-500' },
  customer_experience: { icon: HeartHandshake, color: 'bg-rose-500' },
  vendor_management: { icon: Truck, color: 'bg-cyan-500' },
  ecommerce_global: { icon: ShoppingBag, color: 'bg-fuchsia-500' },
  localization: { icon: Languages, color: 'bg-orange-500' },
  digital_currency: { icon: Bitcoin, color: 'bg-amber-400' },
};

export default function AuthPage() {
  const { user, loginMutation, registerMutation, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('owner');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [activationError, setActivationError] = useState<string | null>(null);

  // Move registerForm declaration up
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
      industry: 'retail', // Set default to a valid industry
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

  // Add local state for tier and theme
  const [selectedTier, setSelectedTier] = useState('free');
  const [selectedTheme, setSelectedTheme] = useState(industryThemes['retail']);

  // Update theme when industry changes
  useEffect(() => {
    const industry = registerForm.watch('industry');
    if (industry && industryThemes[industry]) {
      setSelectedTheme(industryThemes[industry]);
    }
  }, [registerForm]);

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

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(insertUserSchema.pick({ email: true, password: true })),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Add effect to clear activation error when switching tabs
  useEffect(() => {
    const subscription = loginForm.watch(() => {
      if (activationError) setActivationError(null);
    });
    return () => subscription.unsubscribe();
  }, [loginForm, activationError]);

  // Custom login submit handler to catch activation errors
  const handleLoginSubmit = async (data: LoginData) => {
    setActivationError(null);
    try {
      await loginMutation.mutateAsync({ email: data.email, password: data.password });
    } catch (error: any) {
      // Check for activation error from backend
      if (error instanceof Error && error.message === 'Account not activated') {
        setActivationError('Your account is not activated. Please check your email for the activation link.');
      } else {
        setActivationError(error.message || 'Login failed');
      }
    }
  };

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

  const readyModules: AvailableModule[] = [
    'accounting',
    'hr',
    'pos',
    'inventory',
    'crm',
  ];

  const comingSoonModules: AvailableModule[] = availableModules.filter(
    m => !readyModules.includes(m) && m !== 'ai_analytics'
  );

  const moduleLabels: Record<string, string> = {
    ai_analytics: "AI",
    hr: "HR",
    accounting: "Accounting",
    pos: "POS",
    inventory: "Inventory",
    crm: "CRM",
    procurement: "Procurement",
    manufacturing: "Manufacturing",
    order_management: "Order Management",
    warehouse: "Warehouse",
    supply_chain: "Supply Chain",
    project_service: "Project Service",
    workforce: "Workforce",
    ecommerce: "E-Commerce",
    marketing: "Marketing",
    quality: "Quality",
    maintenance: "Maintenance",
    project: "Project",
    analytics: "Analytics",
    global_finance: "Global Finance",
    international_trade: "International Trade",
    customer_experience: "Customer Experience",
    vendor_management: "Vendor Management",
    ecommerce_global: "E-Commerce Global",
    localization: "Localization",
    digital_currency: "Digital Currency"
  };

  // Calculate selectedIndustry and Icon at the top of the component so they are available in all steps
  const selectedIndustry = registerForm.watch('industry');
  const Icon = industryIcons[selectedIndustry] || Briefcase;

  const selectedCountry = registerForm.watch('country');
  const compliance = selectedCountry ? complianceRequirements[selectedCountry.toUpperCase()] : undefined;

  // Add step indicator at the top
  const stepLabels: Record<RegistrationStep, string> = {
    owner: 'Step 1 of 5: Owner Information',
    organization: 'Step 2 of 5: Organization Details',
    accounting: 'Step 3 of 5: Accounting Settings',
    modules: 'Step 4 of 5: Select Tier & Modules',
    review: 'Step 5 of 5: Review & Confirm',
  };

  const [waitlistedModules, setWaitlistedModules] = useState<AvailableModule[]>([]);

  const renderRegistrationStep = () => {
    switch (currentStep) {
      case 'owner':
        return (
          <div className="space-y-4">
            <div className="text-xs text-primary font-semibold mb-2">
              {stepLabels[currentStep]}
            </div>
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
            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-4">
            <div className="text-xs text-primary font-semibold mb-2">
              {stepLabels[currentStep]}
            </div>
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
              <Select onValueChange={value => registerForm.setValue('industry', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind.replace('_', ' ').toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="text-xs text-primary font-semibold mb-2">
              {stepLabels[currentStep]}
            </div>
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

      case 'modules':
        return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center  justify-center overflow-auto p-8 animate-fade-in">
            <div className="w-full max-w-4xl mx-auto space-y-6 h-full p-4 mb-8">
              <div className="text-xs text-primary font-semibold mb-2 flex items-center gap-2">
                {stepLabels[currentStep]}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="ml-2 text-primary/70 hover:text-primary focus:outline-none" aria-label="Help">
                      <Info size={18} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs text-sm">
                    Select your plan and the modules you want to start with. You can always add more later (within your tier limits).
                  </PopoverContent>
                </Popover>
              </div>
              <h3 className="text-2xl font-bold mb-4">Select Tier & Modules</h3>
              {/* Tier card selection with animation and tooltips */}
              <TooltipProvider>
                <div className="flex gap-6 my-6">
                  {tiers.map(tier => {
                    const key = tier.id as 'free' | 'pro' | 'enterprise';
                    const Icon = tierIcons[key];
                    const isSelected = selectedTier === tier.id;
                    return (
                      <Tooltip key={tier.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={`flex-1 rounded-xl border-2 p-6 flex flex-col items-center transition-all duration-200 shadow-sm
                              ${tierColors[key]} ${isSelected ? 'ring-4 ring-primary border-primary scale-105' : 'hover:border-primary/60 hover:scale-102'} focus:outline-none`}
                            onClick={() => setSelectedTier(tier.id)}
                            aria-pressed={isSelected}
                            tabIndex={0}
                          >
                            <Icon size={44} className="mb-2" />
                            <span className="font-bold text-xl mb-1">{tier.name}</span>
                            <span className="text-base text-gray-600 mb-2">{tier.description}</span>
                            <span className="text-xs text-gray-500">
                              {tier.id === 'enterprise' ? 'Unlimited modules' : `Up to ${tier.maxModules} modules`}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{tier.tooltip}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
              <div className="text-xs text-gray-500 mb-2">
                {`You can select ${selectedTier === 'enterprise' ? 'as many modules as you want' : `up to ${tiers.find(t => t.id === selectedTier)?.maxModules || 2} modules`} for the ${tiers.find(t => t.id === selectedTier)?.name} tier.`}
              </div>
              {/* Onboarding tip for modules */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="mb-2 text-primary/70 hover:text-primary focus:outline-none flex items-center gap-1" aria-label="Modules Help">
                    <Info size={16} /> <span>How do I choose modules?</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-xs text-sm">
                  Pick the modules that match your business needs. You can always add or remove modules later from your dashboard settings.
                </PopoverContent>
              </Popover>
            <div className="space-y-2">
                {readyModules.map(module => (
                  <div key={module} className="flex items-center space-x-2">
                    <Checkbox
                      id={module}
                      checked={registerForm.watch('selectedModules').includes(module)}
                      onCheckedChange={(checked) => {
                        const modules = registerForm.watch('selectedModules');
                        const maxModules = tiers.find(t => t.id === selectedTier)?.maxModules || 2;
                        if (checked && selectedTier !== 'enterprise' && modules.length >= maxModules) {
                          toast({ title: 'Module Limit', description: `You can only select up to ${maxModules} modules for the ${selectedTier} tier.`, variant: 'destructive' });
                          return;
                        }
                        if (checked) {
                          registerForm.setValue('selectedModules', [...modules, module]);
                        } else {
                          registerForm.setValue('selectedModules', modules.filter(m => m !== module));
                        }
                      }}
                      disabled={!readyModules.includes(module)}
                    />
                    <Label htmlFor={module} className={!readyModules.includes(module) ? 'text-gray-400' : ''}>
                      {moduleLabels[module] || module}
                      {!readyModules.includes(module) && (
                        <span className="ml-2 text-xs text-gray-400">(Coming soon)</span>
                      )}
                    </Label>
                  </div>
                ))}
            </div>
              <div className="mb-4 p-3 rounded bg-blue-50 border border-blue-200 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                <span className="text-blue-800 text-sm">
                  <b>AI Capabilities:</b> AI is built into every module and is always available for your organization. You can manage AI features from your dashboard after registration.
                </span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="mt-6">Explore Coming Modules</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogTitle>Coming Soon Modules</DialogTitle>
                  <DialogDescription>
                    These modules are underway and will be available soon. Join the waitlist to get early access and influence our roadmap!
                  </DialogDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                    {comingSoonModules.map(module => {
                      const meta = comingModuleMeta[module] || { icon: Box, color: 'bg-gray-300' };
                      const Icon = meta.icon;
                      return (
                        <div key={module} className="border rounded-lg p-4 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`rounded-full p-2 ${meta.color} text-white flex items-center justify-center`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="font-semibold text-lg">{moduleLabels[module] || module}</div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{moduleDescriptions[module] || 'More info coming soon.'}</div>
                          <Button
                            variant={waitlistedModules.includes(module) ? 'secondary' : 'outline'}
                            disabled={waitlistedModules.includes(module)}
                            onClick={() => setWaitlistedModules(prev => [...prev, module])}
                          >
                            {waitlistedModules.includes(module) ? 'Added to Waitlist' : 'Join Waitlist'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
              <div className="text-xs text-gray-500 mt-2">
                Want a module sooner? Join the waitlist and help us prioritize what matters most for your business!
              </div>
              <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
                <Button onClick={handleNext} size="lg">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <div className="text-xs text-primary font-semibold mb-2">
              {stepLabels[currentStep]}
            </div>
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
              <div>
                <h4 className="font-medium">Tier</h4>
                <p>Tier: {tiers.find(t => t.id === selectedTier)?.name}</p>
              </div>
              <div>
                <h4 className="font-medium">Theme</h4>
                <div className="my-2 p-4 rounded flex items-center gap-2" style={{ background: selectedTheme.primaryColor, color: selectedTheme.secondaryColor }}>
                  <Icon size={32} />
                  <span>Theme Preview (Primary: {selectedTheme.primaryColor})</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">Enter activation key</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={e => setConfirmationText(e.target.value)}
                placeholder="Enter activation key"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={() => {
                  const formData = registerForm.getValues();
                  const theme = {
                    primaryColor: selectedTheme.primaryColor,
                    secondaryColor: selectedTheme.secondaryColor,
                    darkMode: selectedTheme.darkMode,
                  };
                  const orgSettings: OrganizationSettings = {
                    theme,
                    branding: {
                      logo: null,
                      favicon: null,
                      companyName: formData.name,
                    },
                    modules: {
                      enabled: formData.selectedModules,
                      defaultModule: formData.selectedModules[0] || 'accounting',
                    },
                    notifications: {
                      email: true,
                      push: true,
                      sms: false,
                    },
                    security: {
                      twoFactorAuth: false,
                      sessionTimeout: 30,
                      passwordPolicy: {
                        minLength: 8,
                        requireSpecialChars: true,
                        requireNumbers: true,
                      },
                    },
                    integrations: {
                      paymentGateways: [],
                    },
                    backup: {
                      frequency: 'daily',
                      retention: 30,
                      autoBackup: true,
                    },
                    workingDays: [],
                    workingHours: { start: '09:00', end: '17:00' },
                    holidays: [],
                    customSettings: {},
                    ai: {
                      isEnabled: true,
                      allowPersonalAI: true,
                      allowOrganizationAI: true,
                      model: 'gpt-3.5-turbo',
                      temperature: 0.7,
                      maxTokens: 1000,
                      moduleSettings: {
                        hr: {
                          enabled: true,
                          canAccessEmployeeData: true,
                          canAccessPayrollData: true,
                          canAccessHiringData: true,
                          canAccessPerformanceData: true
                        },
                        finance: {
                          enabled: true,
                          canAccessFinancialData: true,
                          canAccessAccountingData: true,
                          canAccessBudgetData: true,
                          canAccessTaxData: true
                        },
                        inventory: {
                          enabled: true,
                          canAccessStockData: true,
                          canAccessWarehouseData: true,
                          canAccessSupplyChainData: true
                        },
                        sales: {
                          enabled: true,
                          canAccessCustomerData: true,
                          canAccessSalesData: true,
                          canAccessCRMData: true
                        },
                        general: {
                          enabled: true,
                          canAccessGeneralData: true,
                          canAccessAnalyticsData: true
                        }
                      }
                    },
                    accounting: undefined,
                    payroll: undefined,
                    benefits: undefined,
                  };
                  const orgSettingsWithTier = { ...orgSettings, tier: selectedTier };
                  registerMutation.mutate({
                    organization: {
                      ...formData,
                      settings: orgSettingsWithTier,
                    },
                    owner: {
                      username: formData.username,
                      password: formData.password,
                      email: formData.email,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                    },
                    waitlistedModules: waitlistedModules,
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
                disabled={registerMutation.isPending || confirmationText !== 'chains-erp2025'}
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
            {compliance && (
              <div className="mt-4 p-4 rounded border border-yellow-400 bg-yellow-50">
                <h4 className="font-medium text-yellow-800 mb-2">{compliance.title}</h4>
                <ul className="list-disc pl-5 text-sm text-yellow-900">
                  {compliance.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-yellow-700">(This is a sample. More compliance requirements will be shown as you select other countries.)</p>
              </div>
            )}
          </div>
        );
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
          {/* Background Icons */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 text-blue-200/30">
              <Database size={60} />
            </div>
            <div className="absolute top-40 right-20 text-indigo-200/30">
              <BarChart size={50} />
            </div>
            <div className="absolute bottom-40 left-20 text-purple-200/30">
              <Users size={70} />
            </div>
            <div className="absolute bottom-20 right-10 text-blue-200/30">
              <Settings size={40} />
            </div>
            <div className="absolute top-1/2 left-1/4 text-indigo-200/20">
              <Globe size={80} />
            </div>
            <div className="absolute top-1/3 right-1/3 text-purple-200/20">
              <Zap size={45} />
            </div>
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-8">
              {/* Logo */}
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <img src="https://chains-erp.com/chainsnobg.png" 
                      alt="Chains ERP Logo" 
                      className='border rounded-2xl'
                     />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Chains ERP&trade;
                </h1>
                <p className="text-gray-600 text-sm">Enterprise Resource Planning</p>
              </div>

              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse" />
                <div className="absolute inset-4 border-4 border-blue-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="absolute inset-8 border-4 border-blue-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <div className="absolute inset-12 border-4 border-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome to Chains ERP
                </h2>
                <p className="text-gray-600">
                  Loading your personalized dashboard...
                </p>
              </div>
              
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
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
                    {activationError && (
                      <div className="mb-2 p-2 rounded bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm">
                        {activationError}
                      </div>
                    )}
                    <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
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