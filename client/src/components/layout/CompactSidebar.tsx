import React from 'react';
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
} from 'lucide-react';
import { clsx } from 'clsx';
import { chainslogo } from '@/assets'; // adjust import to your own assets
import { useLocation } from 'wouter';

// Define your sidebar items
const navigation = [
  { name: 'Dashboard', icon: LayoutGrid },
  { name: 'Point of Sale', icon: ShoppingBag },
  { name: 'HR Management', icon: Users },
  { name: 'Inventory', icon: Package },
  { name: 'Finance', icon: DollarSign },
  { name: 'Real Estate', icon: Building2 },
  { name: 'Blockchain', icon: Wallet },
  { name: 'Analytics', icon: BarChart },
  { name: 'Security', icon: Shield },
  { name: 'Accounting', icon: Receipt },
];

// Sidebar component
export default function CompactSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <div className="w-20 bg-[#282881] h-screen fixed left-0 text-white flex flex-col items-center">
      {/* Logo Section */}
      <div
        className="p-4 border-b border-white/10 w-full flex justify-center cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => {
          // If we're not on /dashboard, go there. If we are, do nothing.
          if (location !== '/dashboard') {
            setLocation('/dashboard');
          }
        }}
      >
        <img src={chainslogo} alt="logo" className="w-11 h-11 rounded-full" />
      </div>

      {/* Navigation Items */}
      <div className="py-6 space-y-2 overflow-y-auto flex-1">
        {navigation.map((item) => {
          // Check if this item is "active"
          // e.g., if location includes the route name:
          const normalizedName = item.name.toLowerCase().replace(/\s+/g, '-');

          // We consider it active if the current path is exactly /dashboard for "Dashboard",
          // or if it includes /dashboard/<name> for the others
          let isActive = false;
          if (item.name === 'Dashboard') {
            isActive = location === '/dashboard';
          } else {
            isActive = location.includes(`/dashboard/${normalizedName}`);
          }

          return (
            <div
              key={item.name}
              className={clsx(
                'w-12 h-12 flex items-center justify-center rounded-lg mx-auto transition-colors cursor-pointer',
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              )}
              title={item.name}
              onClick={() => {
                if (item.name === 'Dashboard') {
                  // If user is already on /dashboard, do nothing:
                  if (location === '/dashboard') return;
                  // Otherwise, navigate to /dashboard
                  setLocation('/dashboard');
                } else {
                  // For other items, navigate to /dashboard/<item-name>
                  setLocation(`/dashboard/${normalizedName}`);
                }
              }}
            >
              <item.icon className="h-5 w-5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
