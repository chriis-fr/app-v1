import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { usePermissions } from '@/utils/permissions';
import {
  Home,
  ShoppingCart,
  Users,
  Settings,
  User,
  Package,
  BarChart2,
  Receipt,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// You may need to define 'ml-84' or another custom spacing in your tailwind.config.js if you prefer that naming.
// For clarity, I'm using inline Tailwind style 'lg:ml-[21rem]' below, which equals 84 in tailwind spacing.

interface POSLayoutProps {
  children: React.ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user is 'owner' to display the compact sidebar
  const { isOwner } = usePermissions();
  const hasCompactSidebar = isOwner;
  
  // Determine if user is a cashier based on role
  const isCashier = user?.role === 'cashier';

  // Navigation items - full list
  const allNavItems = [
    { icon: Home, label: 'Dashboard', path: '/pos/dashboard', adminOnly: true },
    { icon: ShoppingCart, label: 'POS', path: '/pos', adminOnly: false },
    { icon: Users, label: 'Customers', path: '/pos/customers', adminOnly: true },
    { icon: User, label: 'Staff', path: '/pos/users', adminOnly: true },
    { icon: Package, label: 'Products', path: '/pos/products', adminOnly: true },
    { icon: BarChart2, label: 'Reports', path: '/pos/reports', adminOnly: true },
    { icon: Receipt, label: 'Orders', path: '/pos/orders', adminOnly: true },
    { icon: Settings, label: 'Settings', path: '/pos/settings', adminOnly: true },
  ];
  
  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => !isCashier || !item.adminOnly);

  // Logout function
  const handleLogout = () => {
    logout();
    setLocation('/login');
  };
  
  // Redirect cashiers to POS page if they try to access restricted pages
  useEffect(() => {
    if (isCashier) {
      const currentPath = location;
      const isRestrictedPage = allNavItems.some(item => 
        item.adminOnly && currentPath === item.path
      );
      
      if (isRestrictedPage) {
        setLocation('/pos');
      }
    }
  }, [location, isCashier, setLocation]);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/*
        1) COMPACT SIDEBAR (for owners only)
           -----------------------------------------------------------
           Width = 20 (5rem).
           This is always visible on large screens if hasCompactSidebar=true,
           but on mobile, it slides out with -translate-x-full if isSidebarOpen=false.
       */}
      {hasCompactSidebar && (
        <div
          className={`
            fixed top-0 left-0
            z-20
            h-screen w-20
            bg-white border-r
            transition-transform duration-200 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          {/* You can put compact navigation icons or anything needed here */}
          <CompactSidebar />
        </div>
      )}

      {/*
        2) MAIN SIDEBAR
           -----------------------------------------------------------
           Width = 64 (16rem).
           If the compact sidebar is also present, we shift this main sidebar to the right
           by w-20 so they stand side-by-side on larger screens (lg).
      */}
      <div
        className={`
          fixed top-0
          bg-white border-r
          z-30
          h-screen w-64
          transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${hasCompactSidebar ? 'lg:left-20' : 'lg:left-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header (organization + user info) */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">
              {user?.organization?.name}
              <br />
              <span className="text-sm text-gray-500">POS</span>
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          {/* Scrollable nav items */}
          <ScrollArea className="flex-1">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={location === item.path ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setLocation(item.path);
                      // Close the sidebar on mobile once a nav item is selected
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Logout button at bottom */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/*
        3) MOBILE TOGGLE BUTTON
           -----------------------------------------------------------
           Appears only on smaller devices (hidden on lg:).
           If we have a compact sidebar, place the toggle to the right of that area; otherwise place it near the left edge.
      */}
      <div
        className={`
          lg:hidden fixed top-4 z-50
          ${hasCompactSidebar ? 'left-24' : 'left-4'}
        `}
      >
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/*
        4) MAIN CONTENT
           -----------------------------------------------------------
           Offset depends on whether we have the compact sidebar (20) + main sidebar (64)
           or just the main sidebar (64).
           20 + 64 = 84 => 21rem in Tailwind => 'ml-[21rem]'
      */}
      <div
        className={`
          flex-1 overflow-auto
          transition-all duration-200
          ${
            hasCompactSidebar
              ? 'lg:ml-[21rem]' /* 5rem + 16rem = 21rem total offset */
              : 'lg:ml-64'      /* 16rem offset if only main sidebar */
          }
        `}
      >
        <div className="p-6 max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
