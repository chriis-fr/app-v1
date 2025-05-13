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
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

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
  {
    name: 'Point of Sale', 
    icon: ShoppingBag,
    route: '/pos',
    module: 'pos'
  },
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
    name: 'Finance Activity', 
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
    name: 'Business Partners', 
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
    name: 'Accounting', 
    icon: Receipt,
    route: '/dashboard/accounting'
  }
];

export default function CompactSidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filter navigation items based on user's module access
  const filteredNavigation = navigation.filter(item => {
    // If item requires a specific module
    if (item.module) {
      return user?.moduleAccess?.includes(item.module);
    }
    // If item has subItems, check if any subItem requires a specific module
    if (item.subItems) {
      return item.subItems.some(subItem => {
        if (subItem.module) {
          return user?.moduleAccess?.includes(subItem.module);
        }
        return true;
      });
    }
    // If no module requirement, show the item
    return true;
  });

  return (
    <div className="w-20 bg-[#282881] h-screen fixed left-0 text-white flex flex-col items-center">
      {/* Logo Section */}
      <div
        className="p-4 border-b border-white/10 w-full flex justify-center cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setLocation('/dashboard')}
      >
        <img src={chainslogo} alt="logo" className="w-11 h-11 rounded-full" />
      </div>

      {/* Navigation Items */}
      <div className="py-6 space-y-2 overflow-y-auto flex-1">
        {filteredNavigation.map((item) => {
          const isActive = location.startsWith(item.route);
          const isHovered = hoveredItem === item.name;

          return (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Label positioned to the top right of the icon */}
              {isHovered && (
                <div className="absolute top-0 right-6 text-[8px] text-white translate-x-1/2 -translate-y-1/2">
                  {item.name}
                </div>
              )}

              <div
                className={clsx(
                  'w-12 h-12 flex items-center justify-center rounded-lg mx-auto transition-colors cursor-pointer',
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                )}
                onClick={() => setLocation(item.route)}
              >
                <item.icon className="h-5 w-5" />
              </div>

              {/* Sub-items tooltip */}
              {isHovered && item.subItems && (
                <div className="absolute left-16 top-0 bg-[#282881] text-white shadow-lg rounded-md p-2 min-w-[200px] z-50">
                  <div className="space-y-1">
                    {item.subItems.map((subItem) => (
                      <div
                        key={subItem.route}
                        className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-white/5 cursor-pointer"
                        onClick={() => setLocation(subItem.route)}
                      >
                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                        {subItem.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
