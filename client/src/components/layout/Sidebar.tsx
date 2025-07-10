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
  Info,
  ChevronDown,
  Home,
  CheckSquare,
  UserPlus,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';

export default function Sidebar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Define all available modules
  const allModules = {
    main: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutGrid, route: '/dashboard' },
      { id: 'pos', name: 'Point of Sale', icon: ShoppingBag, route: '/dashboard/pos/info' },
      {
        id: 'hr',
        name: 'HR Management',
        icon: Users,
        route: '/hr'
      },
      { id: 'inventory', name: 'Inventory', icon: Package, route: '/dashboard/inventory/info' }
    ],
    finance: [
      { id: 'finance', name: 'Finance', icon: DollarSign, route: '/dashboard/finance/info' },
      { id: 'blockchain', name: 'Blockchain', icon: Wallet, route: '/dashboard/blockchain/info' },
      { id: 'accounting', name: 'Accounting', icon: Receipt, route: '/dashboard/accounting/info' }
    ],
    operations: [
      { id: 'manufacturing', name: 'Manufacturing', icon: Factory, route: '/dashboard/manufacturing/info' },
      { id: 'warehouse', name: 'Warehouse', icon: Package, route: '/dashboard/warehouse/info' },
      { id: 'procurement', name: 'Procurement', icon: ShoppingCart, route: '/dashboard/procurement' },
      { id: 'logistics', name: 'Logistics', icon: Truck, route: '/dashboard/logistics/info' }
    ],
    business: [
      { id: 'crm', name: 'CRM', icon: Users2, route: '/dashboard/crm/info' },
      { id: 'projects', name: 'Projects', icon: Briefcase, route: '/dashboard/projects/info' },
      { id: 'tasks', name: 'Tasks', icon: ClipboardList, route: '/dashboard/tasks/info' },
      { id: 'calendar', name: 'Calendar', icon: Calendar, route: '/dashboard/calendar/info' }
    ],
    reporting: [
      { id: 'reports', name: 'Reports', icon: FileBarChart, route: '/dashboard/reports/info' },
      { id: 'analytics', name: 'Analytics', icon: PieChart, route: '/dashboard/analytics/info' },
      { id: 'audit', name: 'Audit', icon: FileCheck, route: '/dashboard/audit/info' },
      { id: 'compliance', name: 'Compliance', icon: FileWarning, route: '/dashboard/compliance/info' }
    ],
    other: [
      { id: 'real-estate', name: 'Real Estate', icon: Building2, route: '/dashboard/real-estate/info' },
      { id: 'security', name: 'Security', icon: Shield, route: '/dashboard/security/info' },
      { id: 'workflow', name: 'Workflow', icon: Workflow, route: '/dashboard/workflow/info' }
    ]
  };

  // Get active modules from organization
  const activeModules = user?.organization?.activeModules || [];

  // If moduleAccess is missing, derive it from permissions
  let userModuleAccess = user?.moduleAccess;
  if (
    (!userModuleAccess || userModuleAccess.length === 0) &&
    Array.isArray(user?.permissions)
  ) {
    userModuleAccess = user.permissions.map((p: any) => p.module);
  }

  // Filter modules based on active subscriptions and user access
  const getActiveModules = (moduleList: typeof allModules.main) => {
    const normalizedActiveModules = activeModules.map((m: string) => m.toLowerCase());
    // Robustly handle moduleAccess as array of strings or array of objects
    const normalizedUserModuleAccess = (userModuleAccess || []).map(
      (m: any) => typeof m === 'string' ? m.toLowerCase() : (m && m.module ? m.module.toLowerCase() : undefined)
    ).filter(Boolean);

    if (user?.isOwner) {
      // Owner: show all organization modules
      return moduleList.filter(module => normalizedActiveModules.includes(module.id.toLowerCase()));
    }
    if (user?.role === 'hr_admin' && (!userModuleAccess || userModuleAccess.length === 0)) {
      // HR admin fallback: show all organization modules
      return moduleList.filter(module => normalizedActiveModules.includes(module.id.toLowerCase()));
    }
    // All others: intersection of org modules and user.moduleAccess
    return moduleList.filter(module =>
      normalizedActiveModules.includes(module.id.toLowerCase()) &&
      normalizedUserModuleAccess.includes(module.id.toLowerCase())
    );
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

  // Mapping from module name to settings route
  const moduleSettingsRoutes: Record<string, string> = {
    hr: '/hr/settings',
    pos: '/app/pos/settings',
    inventory: '/app/inventory/settings',
    // Add more as needed
  };

  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null);

  // Get normalized module access
  const normalizedModuleAccess = (userModuleAccess || []).map(
    (m: any) => typeof m === 'string' ? m.toLowerCase() : (m && m.module ? m.module.toLowerCase() : undefined)
  ).filter(Boolean);

  const handleSettingsClick = () => {
    if (user?.isOwner) {
      setLocation('/organization-settings');
      return;
    }
    if (user?.role === 'admin' && normalizedModuleAccess.length > 1) {
      setShowSettingsDropdown((v) => !v);
      return;
    }
    if (user?.role === 'admin' && normalizedModuleAccess.length === 1) {
      const route = moduleSettingsRoutes[normalizedModuleAccess[0]] || '/organization-settings';
      setLocation(route);
      return;
    }
    // HR admin special case
    if (user?.role === 'hr_admin') {
      setLocation('/hr/settings');
      return;
    }
    setLocation('/organization-settings');
  };

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'Time Tracking', href: '/app/time-tracking', icon: Clock },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'HR', href: '/app/hr', icon: Users },
    { name: 'Inventory', href: '/app/inventory', icon: Package },
    { name: 'CRM', href: '/app/crm', icon: UserPlus },
    { name: 'POS', href: '/app/pos', icon: CreditCard },
    { name: 'Accounting', href: '/app/accounting', icon: DollarSign },
    { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white h-screen left-20 border-r overflow-y-auto flex flex-col">
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
                'flex flex-col',
                (item as any).subItems ? 'relative group' : ''
              )}
              onMouseEnter={() => (item as any).subItems && setOpenDropdown(item.id)}
              onMouseLeave={() => (item as any).subItems && setOpenDropdown(null)}
            >
              <div
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors cursor-pointer hover:bg-gray-50',
                  openDropdown === item.id && 'bg-gray-100'
                )}
                onClick={() => {
                  if (item.id === 'hr' && user?.isOwner) {
                    setLocation('/dashboard/hr/info');
                  } else {
                    setLocation(item.route);
                  }
                }}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{item.name}</span>
                {(item as any).subItems && <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />}
              </div>
              {/* For admins, show shortcuts to subItems/components below the module name */}
              {user?.role === 'admin' && (item as any).subItems && (
                <div className="ml-8 mt-1 space-y-1">
                  {(item as any).subItems.map((sub: any) => (
                    <div
                      key={sub.route}
                      className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-gray-600 text-xs"
                      onClick={() => setLocation(sub.route)}
                    >
                      <sub.icon className="h-4 w-4 text-gray-400" />
                      <span>{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {(item as any).subItems && openDropdown === item.id && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
                  {(item as any).subItems.map((sub: any) => (
                    <div
                      key={sub.route}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setLocation(sub.route)}
                    >
                      <sub.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* {hasInactiveModules && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setLocation('/dashboard/modules')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More Modules
            </Button>
          )} */}
        </div>

        {activeFinanceModules.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-3">FINANCE & ACCOUNTING</div>
            {activeFinanceModules.map((item) => (
              <div
                key={item.id}
                className={clsx(
                  'flex flex-col',
                  (item as any).subItems ? 'relative group' : ''
                )}
                onMouseEnter={() => (item as any).subItems && setOpenDropdown(item.id)}
                onMouseLeave={() => (item as any).subItems && setOpenDropdown(null)}
              >
                <div
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer',
                    openDropdown === item.id && 'bg-gray-100'
                  )}
                  onClick={() => setLocation(item.route)}
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  {(item as any).subItems && <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />}
                </div>
                {(item as any).subItems && openDropdown === item.id && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
                    {(item as any).subItems.map((sub: any) => (
                      <div
                        key={sub.route}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setLocation(sub.route)}
                      >
                        <sub.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                className={clsx(
                  'flex flex-col',
                  (item as any).subItems ? 'relative group' : ''
                )}
                onMouseEnter={() => (item as any).subItems && setOpenDropdown(item.id)}
                onMouseLeave={() => (item as any).subItems && setOpenDropdown(null)}
              >
                <div
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer',
                    openDropdown === item.id && 'bg-gray-100'
                  )}
                  onClick={() => setLocation(item.route)}
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  {(item as any).subItems && <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />}
                </div>
                {(item as any).subItems && openDropdown === item.id && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
                    {(item as any).subItems.map((sub: any) => (
                      <div
                        key={sub.route}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setLocation(sub.route)}
                      >
                        <sub.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                className={clsx(
                  'flex flex-col',
                  (item as any).subItems ? 'relative group' : ''
                )}
                onMouseEnter={() => (item as any).subItems && setOpenDropdown(item.id)}
                onMouseLeave={() => (item as any).subItems && setOpenDropdown(null)}
              >
                <div
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer',
                    openDropdown === item.id && 'bg-gray-100'
                  )}
                  onClick={() => setLocation(item.route)}
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  {(item as any).subItems && <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />}
                </div>
                {(item as any).subItems && openDropdown === item.id && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
                    {(item as any).subItems.map((sub: any) => (
                      <div
                        key={sub.route}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setLocation(sub.route)}
                      >
                        <sub.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                className={clsx(
                  'flex flex-col',
                  (item as any).subItems ? 'relative group' : ''
                )}
                onMouseEnter={() => (item as any).subItems && setOpenDropdown(item.id)}
                onMouseLeave={() => (item as any).subItems && setOpenDropdown(null)}
              >
                <div
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer',
                    openDropdown === item.id && 'bg-gray-100'
                  )}
                  onClick={() => setLocation(item.route)}
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  {(item as any).subItems && <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />}
                </div>
                {(item as any).subItems && openDropdown === item.id && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
                    {(item as any).subItems.map((sub: any) => (
                      <div
                        key={sub.route}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setLocation(sub.route)}
                      >
                        <sub.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                className={clsx(
                  'flex flex-col',
                  (item as any).subItems ? 'relative group' : ''
                )}
                onMouseEnter={() => (item as any).subItems && setOpenDropdown(item.id)}
                onMouseLeave={() => (item as any).subItems && setOpenDropdown(null)}
              >
                <div
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors cursor-pointer',
                    openDropdown === item.id && 'bg-gray-100'
                  )}
                  onClick={() => setLocation(item.route)}
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  {(item as any).subItems && <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />}
                </div>
                {(item as any).subItems && openDropdown === item.id && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
                    {(item as any).subItems.map((sub: any) => (
                      <div
                        key={sub.route}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setLocation(sub.route)}
                      >
                        <sub.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Meeting button for high-rank users */}
      {(user?.role === 'owner' || user?.role === 'executive' || user?.role === 'board' || user?.role === 'admin') && (
        <div className="p-5">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
            onClick={() => setLocation('/meetings?schedule=1')}
          >
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-sm">Schedule Meeting</span>
          </div>
        </div>
      )}

      <div className="border-t p-5">
        <div className="text-xs text-gray-400 mb-3">SYSTEM</div>
        <div className="space-y-1">
          <div
            ref={settingsButtonRef}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Settings</span>
            {user?.role === 'admin' && normalizedModuleAccess.length > 1 && (
              <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
            )}
            {showSettingsDropdown && user?.role === 'admin' && normalizedModuleAccess.length > 1 && (
              <div style={{ minWidth: 180 }} className="absolute left-0 top-full mt-1 w-56 bg-white border rounded-lg shadow-lg z-50 py-2">
                {normalizedModuleAccess.map((mod: string) => (
                  <div
                    key={mod}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettingsDropdown(false);
                      setLocation(moduleSettingsRoutes[mod] || '/organization-settings');
                    }}
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 capitalize">{mod} Settings</span>
                  </div>
                ))}
              </div>
            )}
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