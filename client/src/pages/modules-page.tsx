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
import { useRoleAccess } from '@/hooks/use-role-access';
import { hasFullAccess } from '@/utils/access';

interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  icon: any;
  features: string[];
  benefits: string[];
  category: string;
  industry?: string[];
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
    description: 'Leverage blockchain technology for secure, transparent, and efficient business operations',
    icon: Wallet,
    features: [
      'Smart contract automation',
      'Digital asset management',
      'Supply chain tracking',
      'Secure payment processing',
      'Decentralized identity verification'
    ],
    benefits: [
      'Enhanced transaction security',
      'Improved supply chain transparency',
      'Reduced operational costs',
      'Automated compliance and auditing'
    ],
    category: 'finance'
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Streamline your accounting processes with our comprehensive system',
    icon: Receipt,
    features: [
      'Double-entry bookkeeping',
      'Financial statements',
      'Tax management',
      'Audit trails',
      'Multi-currency support'
    ],
    benefits: [
      'Accurate financial records',
      'Compliance with standards',
      'Efficient tax filing',
      'Better financial insights'
    ],
    category: 'finance'
  },
  {
    id: 'ai_analytics',
    name: 'AI Analytics',
    description: 'Harness the power of AI for business intelligence',
    icon: BarChart,
    features: [
      'Predictive analytics',
      'Business intelligence',
      'Data visualization',
      'Custom reports',
      'Real-time insights'
    ],
    benefits: [
      'Data-driven decisions',
      'Improved forecasting',
      'Competitive advantage',
      'Business growth'
    ],
    category: 'reporting'
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
    id: 'warehouse',
    name: 'Warehouse Management',
    description: 'Efficient warehouse operations management',
    icon: Package,
    features: [
      'Storage optimization',
      'Order fulfillment',
      'Inventory tracking',
      'Space utilization',
      'Shipping integration'
    ],
    benefits: [
      'Reduced operational costs',
      'Improved efficiency',
      'Better space utilization',
      'Faster order processing'
    ],
    category: 'operations'
  },
  {
    id: 'procurement',
    name: 'Procurement',
    description: 'Streamline your procurement processes',
    icon: ShoppingCart,
    features: [
      'Vendor management',
      'Purchase orders',
      'Supplier evaluation',
      'Contract management',
      'Spend analysis'
    ],
    benefits: [
      'Cost savings',
      'Better supplier relationships',
      'Process automation',
      'Improved compliance'
    ],
    category: 'operations'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Optimize your supply chain and logistics',
    icon: Truck,
    features: [
      'Route optimization',
      'Fleet management',
      'Delivery tracking',
      'Supply chain visibility',
      'Performance metrics'
    ],
    benefits: [
      'Reduced delivery times',
      'Lower transportation costs',
      'Better customer service',
      'Improved efficiency'
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
  },
  {
    id: 'projects',
    name: 'Project Management',
    description: 'Manage projects efficiently from start to finish',
    icon: Briefcase,
    features: [
      'Task management',
      'Resource allocation',
      'Timeline tracking',
      'Budget control',
      'Team collaboration'
    ],
    benefits: [
      'On-time delivery',
      'Cost control',
      'Better team coordination',
      'Improved project success'
    ],
    category: 'business'
  },
  {
    id: 'tasks',
    name: 'Task Management',
    description: 'Organize and track tasks effectively',
    icon: ClipboardList,
    features: [
      'Task assignment',
      'Priority management',
      'Deadline tracking',
      'Progress monitoring',
      'Team collaboration'
    ],
    benefits: [
      'Improved productivity',
      'Better organization',
      'Clear accountability',
      'Efficient workflow'
    ],
    category: 'business'
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'Manage schedules and appointments efficiently',
    icon: Calendar,
    features: [
      'Event scheduling',
      'Meeting management',
      'Resource booking',
      'Reminder system',
      'Calendar sharing'
    ],
    benefits: [
      'Better time management',
      'Reduced scheduling conflicts',
      'Improved coordination',
      'Enhanced productivity'
    ],
    category: 'business'
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Generate comprehensive business reports',
    icon: FileBarChart,
    features: [
      'Custom reports',
      'Data visualization',
      'Export capabilities',
      'Scheduled reports',
      'Interactive dashboards'
    ],
    benefits: [
      'Better decision making',
      'Improved insights',
      'Time savings',
      'Data-driven strategy'
    ],
    category: 'reporting'
  },
  {
    id: 'audit',
    name: 'Audit & Compliance',
    description: 'Ensure compliance and maintain audit trails',
    icon: FileCheck,
    features: [
      'Compliance tracking',
      'Audit logging',
      'Policy management',
      'Risk assessment',
      'Documentation'
    ],
    benefits: [
      'Regulatory compliance',
      'Risk reduction',
      'Better governance',
      'Improved accountability'
    ],
    category: 'reporting'
  },
  {
    id: 'compliance',
    name: 'Compliance Management',
    description: 'Manage regulatory compliance effectively',
    icon: FileWarning,
    features: [
      'Regulation tracking',
      'Policy enforcement',
      'Compliance reporting',
      'Risk management',
      'Document control'
    ],
    benefits: [
      'Regulatory adherence',
      'Risk mitigation',
      'Better governance',
      'Reduced penalties'
    ],
    category: 'reporting'
  },
  {
    id: 'workflow',
    name: 'Workflow Automation',
    description: 'Automate and optimize business processes',
    icon: Workflow,
    features: [
      'Process automation',
      'Workflow design',
      'Task routing',
      'Approval management',
      'Integration capabilities'
    ],
    benefits: [
      'Process efficiency',
      'Reduced errors',
      'Faster processing',
      'Better control'
    ],
    category: 'other'
  },
  {
    id: 'security',
    name: 'Security Management',
    description: 'Protect your business with advanced security',
    icon: Shield,
    features: [
      'Access control',
      'Security monitoring',
      'Threat detection',
      'Compliance management',
      'Incident response'
    ],
    benefits: [
      'Enhanced security',
      'Risk reduction',
      'Compliance assurance',
      'Better protection'
    ],
    category: 'other'
  }
];

export default function ModulesPage() {
  const { user } = useAuth();
  const organization = user?.organization;
  const currentUser = user;
  const { canAccessCompactSidebar } = useRoleAccess();
  const [, setLocation] = useLocation();
  
  // Check if user is admin or owner (case-insensitive, or isOwner flag)
  const isAdmin = hasFullAccess(currentUser);
  
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => setLocation('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Use enabledModules and industry from org context
  const enabledModules = organization?.activeModules || [];
  const orgIndustry = organization?.industry || '';
  const orgTier = (organization as any)?.tier;
  const aiEnabled = (organization as any)?.aiEnabled ?? false;

  // Filter modules by enabledModules and industry (if specified)
  const industryModules = allModules.filter(module => {
    // If module has industry restriction, check it
    if (module.industry && Array.isArray(module.industry)) {
      return module.industry.includes(orgIndustry);
    }
    return true;
  });
  const subscribedModules = industryModules.filter(module => enabledModules.includes(module.id));
  const unsubscribedModules = industryModules.filter(module => !enabledModules.includes(module.id));

  // Optionally, filter out AI modules if AI is disabled
  const finalSubscribedModules = aiEnabled ? subscribedModules : subscribedModules.filter(m => m.id !== 'ai_analytics');
  const finalUnsubscribedModules = aiEnabled ? unsubscribedModules : unsubscribedModules.filter(m => m.id !== 'ai_analytics');

  const handleModuleClick = (moduleId: string) => {
    setLocation(`/dashboard/${moduleId}/info`);
  };

  return (
    <div className="flex min-h-screen">
      {canAccessCompactSidebar() && <CompactSidebar />}
      <div className={`flex-1 p-8 ${canAccessCompactSidebar() ? 'ml-20' : ''}`}>
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-2">Available Modules for {organization?.name}</h1>
            <p className="text-gray-600">Explore and manage your organization's modules</p>
          </div>
        </div>

        {/* Subscribed Modules */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Your Active Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalSubscribedModules.map((module) => (
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
            {finalUnsubscribedModules.map((module) => (
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