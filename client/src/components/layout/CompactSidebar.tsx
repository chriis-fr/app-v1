import React, { useState } from 'react';
import {
  LayoutGrid,
  ShoppingBag,
  Users,
  DollarSign,
  Building2,
  Wallet,
  BarChart,
  Shield,
  Receipt,
  Building,
  PiggyBank,
  ArrowRightLeft,
  LineChart,
  Coins,
  FileText,
  Calculator,
  WalletCards,
  BuildingIcon,
  Handshake,
  Briefcase,
  FileCheck,
  FileWarning,
  Settings,
  HelpCircle,
  Landmark,
  CreditCard,
  Bitcoin,
  Target,
  AlertTriangle,
  LucideIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { chainslogo } from '@/assets';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useModuleAccess } from '@/hooks/use-module-access';
import { cn } from '@/lib/utils';
import { useRoleAccess } from '@/hooks/use-role-access';

interface SubItem {
  name: string;
  route: string;
  icon: LucideIcon;
  module?: string;
}

interface NavigationItem {
  name: string;
  icon: LucideIcon;
  route: string;
  module?: string;
  subItems?: SubItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard', 
    icon: LayoutGrid,
    route: '/dashboard'
  },
  // {
  //   name: 'Point of Sale', 
  //   icon: ShoppingBag,
  //   route: '/pos',
  //   module: 'pos'
  // },
  {
    name: 'Users', 
    icon: Users,
    route: '/users',
    subItems: [
      { name: 'All Users', route: '/users', icon: Users },
      { name: 'Business Partners', route: '/business-partners', icon: Building },
      { name: 'Roles & Permissions', route: '/users/roles', icon: FileCheck }
    ]
  },
  {
    name: 'Finance', 
    icon: Wallet,
    route: '/dashboard/finance',
    subItems: [
      { name: 'Overview', route: '/dashboard/finance', icon: BarChart },
      { name: 'Blockchain Wallets', route: '/dashboard/finance/wallets', icon: Wallet },
      { name: 'Bank Accounts', route: '/dashboard/finance/bank-accounts', icon: Landmark },
      { name: 'Transactions', route: '/dashboard/finance/transactions', icon: CreditCard },
      { name: 'Investments', route: '/dashboard/finance/investments', icon: DollarSign },
      { name: 'Cryptocurrency', route: '/dashboard/finance/crypto', icon: Bitcoin },
      { name: 'Financial Reports', route: '/dashboard/finance/reports', icon: Receipt },
      { name: 'Accounting', route: '/dashboard/finance/accounting', icon: Calculator },
      { name: 'Payments', route: '/dashboard/finance/payments', icon: WalletCards }
    ]
  },
  {
    name: 'Partners', 
    icon: Building,
    route: '/business-partners',
    subItems: [
      { name: 'All Partners', route: '/business-partners', icon: Building },
      { name: 'Agreements', route: '/business-partners/agreements', icon: FileText },
      { name: 'Projects', route: '/business-partners/projects', icon: Target },
      { name: 'Compliance', route: '/business-partners/compliance', icon: FileCheck },
      { name: 'Risk Assessment', route: '/business-partners/risk', icon: AlertTriangle }
    ]
  },
  {
    name: 'Analytics', 
    icon: BarChart,
    route: '/analytics'
  },
  {
    name: 'Security', 
    icon: Shield,
    route: '/security'
  },
  {
    name: 'Accounts', 
    icon: Receipt,
    route: '/dashboard/accounting'
  }
];

export default function CompactSidebar() {
  const [location, setLocation] = useLocation();
  const { canAccessCompactSidebar } = useRoleAccess();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!canAccessCompactSidebar()) {
    return null;
  }

  const renderModuleLinks = () => {
    return navigation.map((module) => (
      <div
        key={module.name}
        className="relative group"
        onMouseEnter={() => setHoveredItem(module.name)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Link
          href={module.route}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
            (location === module.route || (module.subItems && module.subItems.some(sub => location === sub.route))) && "bg-gray-400 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
          )}
        >
          <module.icon className="h-5 w-5 text-white" />
        </Link>
        
        {/* Tooltip */}
        {hoveredItem === module.name && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1  text-white px-2 py-1 rounded overflow-hidden text-[9.5px] font-medium whitespace-nowrap">
            {module.name}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="w-20 bg-[#282881]  h-screen fixed left-0 text-white flex flex-col items-center">
      {/* Logo Section */}
      <div
        className="p-4 border-b border-white/10 w-full flex justify-center cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setLocation('/dashboard')}
      >
        <img src={chainslogo} alt="logo" className="w-11 h-11 rounded-full" />
      </div>

      {/* Navigation Items */}
      <div className="py-6 space-y-2 overflow-hidden flex-1">
        {renderModuleLinks()}
      </div>

      {/* System Section */}
      <div className="border-t border-white/10 w-full p-4">
        <div className="space-y-2">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg mx-auto hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => setLocation('/organization-settings')}
          >
            <Settings className="h-5 w-5" />
          </div>
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg mx-auto hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => setLocation('/support')}
          >
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}