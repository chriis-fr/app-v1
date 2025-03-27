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
  Receipt
} from 'lucide-react';
import { clsx } from 'clsx';
import { chainslogo, chainsnobg } from '@/assets';

// Map to your existing modules from module-showcase.tsx
const navigation = [
  { name: 'Dashboard', icon: LayoutGrid, active: true },
  { name: 'Point of Sale', icon: ShoppingBag },
  { name: 'HR Management', icon: Users },
  { name: 'Inventory', icon: Package },
  { name: 'Finance', icon: DollarSign },
  { name: 'Real Estate', icon: Building2 },
  { name: 'Blockchain', icon: Wallet },
  { name: 'Analytics', icon: BarChart },
  { name: 'Security', icon: Shield },
  { name: 'Accounting', icon: Receipt }
];

export default function CompactSidebar() {
  return (
    <div className="w-20 bg-[#282881] h-screen fixed left-0 text-white flex flex-col items-center">
      <div className="p-4 border-b border-white/10 w-full flex justify-center">
        <img src={chainslogo} alt="logo" className="w-11 h-11 rounded-full" />
      </div>

      <div className="py-6 space-y-2 overflow-y-auto flex-1">
        {navigation.map((item) => (
          <div
            key={item.name}
            className={clsx(
              'w-12 h-12 flex items-center justify-center rounded-lg mx-auto transition-colors',
              item.active ? 'bg-white/10' : 'hover:bg-white/5'
            )}
            title={item.name}
          >
            <item.icon className="h-5 w-5" />
          </div>
        ))}
      </div>
    </div>
  );
} 