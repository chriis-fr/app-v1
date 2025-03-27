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
  HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/use-auth';

export default function Sidebar() {
  const { user } = useAuth();
  
  const navigation = {
    main: [
      { name: 'Dashboard', icon: LayoutGrid, active: true },
      { name: 'Point of Sale', icon: ShoppingBag, route: '/pos' },
      { name: 'HR Management', icon: Users, route: '/hr' },
      { name: 'Inventory', icon: Package, route: '/inventory' }
    ],
    finance: [
      { name: 'Finance', icon: DollarSign, route: '/finance' },
      { name: 'Blockchain', icon: Wallet, route: '/blockchain' },
      { name: 'Accounting', icon: Receipt, route: '/accounting' }
    ],
    other: [
      { name: 'Analytics', icon: BarChart, route: '/analytics' },
      { name: 'Real Estate', icon: Building2, route: '/real-estate' },
      { name: 'Security', icon: Shield, route: '/security' }
    ],
    settings: [
      { name: 'Settings', icon: Settings, route: '/settings' },
      { name: 'Help & Support', icon: HelpCircle, route: '/support' }
    ]
  };

  return (
    <div className="w-64 bg-white h-screen fixed left-20 border-r overflow-y-auto">
      <div className="flex items-center gap-2 px-5 py-3 border-b">
        <div>
          <div className="text-lg text-gray-500">Chains ERP</div>
          <div className="font-semibold">{user?.organization?.name || 'Enterprise Suite'}</div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <div className="text-xs text-gray-400 mb-3">YOUR MODULES</div>
          {navigation.main.map((item) => (
            <div
              key={item.name}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors',
                item.active ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}
            >
              <item.icon className={clsx(
                'h-5 w-5',
                item.active ? 'text-purple-600' : 'text-gray-400'
              )} />
              <span className={clsx(
                'text-sm',
                item.active ? 'text-purple-600 font-medium' : 'text-gray-600'
              )}>{item.name}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-3">FINANCE & ACCOUNTING</div>
          {navigation.finance.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-3">OTHER MODULES</div>
          {navigation.other.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
        
        <div>
          <div className="text-xs text-gray-400 mb-3">SYSTEM</div>
          {navigation.settings.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 