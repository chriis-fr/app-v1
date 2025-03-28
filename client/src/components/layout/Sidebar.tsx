import { 
  LayoutGrid, 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  Building2,
  Wallet,
  BarChart,
  Shield,
  Receipt,
  Settings,
  HelpCircle,
  Plus,
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
  Database,
  Network,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Define all available modules
  const allModules = {
    main: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutGrid, route: '/dashboard' },
      { id: 'pos', name: 'Point of Sale', icon: ShoppingBag, route: '/pos' },
      { id: 'hr', name: 'HR Management', icon: Users, route: '/hr' },
      { id: 'inventory', name: 'Inventory', icon: Package, route: '/inventory' }
    ],
    finance: [
      { id: 'finance', name: 'Finance', icon: DollarSign, route: '/finance' },
      { id: 'blockchain', name: 'Blockchain', icon: Wallet, route: '/blockchain' },
      { id: 'accounting', name: 'Accounting', icon: Receipt, route: '/accounting' }
    ],
    operations: [
      { id: 'manufacturing', name: 'Manufacturing', icon: Factory, route: '/manufacturing' },
      { id: 'warehouse', name: 'Warehouse', icon: Package, route: '/warehouse' },
      { id: 'procurement', name: 'Procurement', icon: ShoppingCart, route: '/procurement' },
      { id: 'logistics', name: 'Logistics', icon: Truck, route: '/logistics' }
    ],
    business: [
      { id: 'crm', name: 'CRM', icon: Users2, route: '/crm' },
      { id: 'projects', name: 'Projects', icon: Briefcase, route: '/projects' },
      { id: 'tasks', name: 'Tasks', icon: ClipboardList, route: '/tasks' },
      { id: 'calendar', name: 'Calendar', icon: Calendar, route: '/calendar' }
    ],
    reporting: [
      { id: 'reports', name: 'Reports', icon: FileBarChart, route: '/reports' },
      { id: 'analytics', name: 'Analytics', icon: PieChart, route: '/analytics' },
      { id: 'audit', name: 'Audit', icon: FileCheck, route: '/audit' },
      { id: 'compliance', name: 'Compliance', icon: FileWarning, route: '/compliance' }
    ],
    other: [
      { id: 'real-estate', name: 'Real Estate', icon: Building2, route: '/real-estate' },
      { id: 'security', name: 'Security', icon: Shield, route: '/security' },
      { id: 'workflow', name: 'Workflow', icon: Workflow, route: '/workflow' }
    ]
  };

  // Get active modules from organization
  const activeModules = user?.organization?.activeModules || [];

  // Filter modules based on active subscriptions
  const getActiveModules = (moduleList: typeof allModules.main) => {
    return moduleList.filter(module => activeModules.includes(module.id as any));
  };

  // Get active modules for each category
  const activeMainModules = getActiveModules(allModules.main);
  const activeFinanceModules = getActiveModules(allModules.finance);
  const activeOperationsModules = getActiveModules(allModules.operations);
  const activeBusinessModules = getActiveModules(allModules.business);
  const activeReportingModules = getActiveModules(allModules.reporting);
  const activeOtherModules = getActiveModules(allModules.other);

  // Check if there are any inactive modules
  const hasInactiveModules = 
    allModules.main.some(m => !activeModules.includes(m.id as any)) ||
    allModules.finance.some(m => !activeModules.includes(m.id as any)) ||
    allModules.operations.some(m => !activeModules.includes(m.id as any)) ||
    allModules.business.some(m => !activeModules.includes(m.id as any)) ||
    allModules.reporting.some(m => !activeModules.includes(m.id as any)) ||
    allModules.other.some(m => !activeModules.includes(m.id as any));

  return (
    <div className="w-64 bg-white h-screen fixed left-20 border-r overflow-y-auto flex flex-col">
      <div className="flex items-center gap-2 px-5 py-3 border-b">
        <div>
          <div className="text-xl text-gray-500">Chains ERP&trade;</div>
          <div className="font-semibold">{user?.organization?.name.toUpperCase() || 'Enterprise Suite'}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div>
          <div className="text-xs text-gray-400 mb-3">YOUR MODULES</div>
          {activeMainModules.map((item) => (
            <div
              key={item.id}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors cursor-pointer',
                'hover:bg-gray-50'
              )}
              onClick={() => setLocation(item.route)}
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
          {hasInactiveModules && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setLocation('/modules')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More Modules
            </Button>
          )}
        </div>

        {activeFinanceModules.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-3">FINANCE & ACCOUNTING</div>
            {activeFinanceModules.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setLocation(item.route)}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeOperationsModules.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-3">OPERATIONS</div>
            {activeOperationsModules.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setLocation(item.route)}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeBusinessModules.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-3">BUSINESS</div>
            {activeBusinessModules.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setLocation(item.route)}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeReportingModules.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-3">REPORTING</div>
            {activeReportingModules.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setLocation(item.route)}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeOtherModules.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-3">OTHER MODULES</div>
            {activeOtherModules.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setLocation(item.route)}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-5">
        <div className="text-xs text-gray-400 mb-3">SYSTEM</div>
        <div className="space-y-1">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/settings')}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Settings</span>
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/support')}
          >
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Help & Support</span>
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/dashboard/modules')}
          >
            <LayoutGrid className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Modules</span>
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/database')}
          >
            <Database className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Database</span>
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/network')}
          >
            <Network className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Network</span>
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/security')}
          >
            <Shield className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Security</span>
          </div>
        </div>
      </div>
    </div>
  );
} 