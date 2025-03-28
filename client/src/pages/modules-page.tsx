import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  Building2,
  Wallet,
  BarChart,
  Shield,
  Receipt,
  Briefcase,
  Calendar,
  Factory,
  Truck,
  ShoppingCart,
  Users2,
  ClipboardList,
  FileBarChart,
  PieChart,
  FileCheck,
  FileWarning,
  Workflow,
  CheckCircle,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  icon: any;
  features: string[];
  benefits: string[];
  category: string;
}

const allModules: ModuleInfo[] = [
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'Streamline your retail operations with our comprehensive POS system',
    icon: ShoppingBag,
    features: [
      'Real-time inventory tracking',
      'Multiple payment methods',
      'Sales analytics',
      'Customer management',
      'Receipt generation'
    ],
    benefits: [
      'Increase sales efficiency',
      'Reduce human error',
      'Better customer experience',
      'Improved inventory control'
    ],
    category: 'main'
  },
  {
    id: 'hr',
    name: 'HR Management',
    description: 'Manage your workforce efficiently with our HR management system',
    icon: Users,
    features: [
      'Employee records',
      'Attendance tracking',
      'Leave management',
      'Performance reviews',
      'Payroll integration'
    ],
    benefits: [
      'Streamlined HR processes',
      'Better employee engagement',
      'Compliance management',
      'Cost reduction'
    ],
    category: 'main'
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Take control of your inventory with our advanced management system',
    icon: Package,
    features: [
      'Stock tracking',
      'Warehouse management',
      'Reorder alerts',
      'Barcode scanning',
      'Stock valuation'
    ],
    benefits: [
      'Reduced stockouts',
      'Lower holding costs',
      'Better forecasting',
      'Improved efficiency'
    ],
    category: 'main'
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    description: 'Comprehensive financial management for your business',
    icon: DollarSign,
    features: [
      'General ledger',
      'Accounts payable/receivable',
      'Financial reporting',
      'Budget management',
      'Tax compliance'
    ],
    benefits: [
      'Better financial control',
      'Improved cash flow',
      'Compliance assurance',
      'Strategic planning'
    ],
    category: 'finance'
  },
  {
    id: 'blockchain',
    name: 'Blockchain Integration',
    description: 'Leverage blockchain technology for secure transactions',
    icon: Wallet,
    features: [
      'Smart contracts',
      'Digital assets',
      'Transaction tracking',
      'Security protocols',
      'Integration APIs'
    ],
    benefits: [
      'Enhanced security',
      'Transparency',
      'Automated processes',
      'Cost reduction'
    ],
    category: 'finance'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Optimize your production processes',
    icon: Factory,
    features: [
      'Production planning',
      'Quality control',
      'Resource allocation',
      'Machine maintenance',
      'Cost tracking'
    ],
    benefits: [
      'Increased productivity',
      'Quality improvement',
      'Cost optimization',
      'Better resource utilization'
    ],
    category: 'operations'
  },
  {
    id: 'crm',
    name: 'Customer Relationship Management',
    description: 'Build and maintain strong customer relationships',
    icon: Users2,
    features: [
      'Contact management',
      'Sales pipeline',
      'Customer support',
      'Marketing automation',
      'Analytics'
    ],
    benefits: [
      'Improved customer satisfaction',
      'Increased sales',
      'Better customer retention',
      'Data-driven decisions'
    ],
    category: 'business'
  }
];

export default function ModulesPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen">
        <CompactSidebar />
        <div className="flex-1 p-8 ml-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => setLocation('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }
  
  const activeModules = user?.organization?.activeModules || [];
  
  const subscribedModules = allModules.filter(module => 
    activeModules.includes(module.id as any)
  );
  
  const unsubscribedModules = allModules.filter(module => 
    !activeModules.includes(module.id as any)
  );

  const handleModuleClick = (moduleId: string) => {
    setLocation(`/dashboard/${moduleId}/info`);
  };

  return (
    <div className="flex min-h-screen">
      <CompactSidebar />
      <div className="flex-1 p-8 ml-20">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-2">Available Modules for {user?.organization?.name}</h1>
            <p className="text-gray-600">Explore and manage your organization's modules</p>
          </div>
        </div>

        {/* Subscribed Modules */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Your Active Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscribedModules.map((module) => (
              <Card 
                key={module.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <module.icon className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-lg">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {module.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Benefits</h4>
                    <ul className="space-y-1">
                      {module.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Unsubscribed Modules */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Available Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unsubscribedModules.map((module) => (
              <Card 
                key={module.id}
                className="p-6 opacity-75 cursor-not-allowed"
              >
                <div className="flex items-center gap-4 mb-4">
                  <module.icon className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{module.name}</h3>
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {module.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Benefits</h4>
                    <ul className="space-y-1">
                      {module.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setLocation('/dashboard/modules')}
                >
                  Subscribe to Module
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 