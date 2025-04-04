import { useLocation } from "wouter";
import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Package2,
  Warehouse,
  ArrowLeftRight,
  Clipboard,
  Shield,
  BarChart,
  Settings,
  QrCode,
  AlertTriangle,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import axios from "axios";
import { usePermissions } from '@/utils/permissions';
import { Skeleton } from "@/components/ui/skeleton";
import UserProfileDropdown from '@/components/layout/UserProfileDropdown';

// Lazy load the CompactSidebar component
const CompactSidebar = lazy(() => import('@/components/layout/CompactSidebar'));

// Loading skeleton for the sidebar
const SidebarSkeleton = () => (
  <div className="py-6 pr-6 lg:py-8">
    <div className="mb-6 pb-4 border-b">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  </div>
);

interface InventoryLayoutProps {
  children: React.ReactNode;
}

export default function InventoryLayout({ children }: InventoryLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isCashier, setIsCashier] = useState(false);
  
  // Check if user is 'owner' or 'admin' to display the compact sidebar
  const { isOwner, isAdmin } = usePermissions();
  const hasCompactSidebar = isOwner || isAdmin;

  useEffect(() => {
    // Determine if user is a cashier
    if (user?.role === 'cashier') {
      setIsCashier(true);
    } else {
      setIsCashier(false);
    }
  }, [user]);

  // Define all nav items with admin restriction flags
  const allNavItems = [
    {
      title: "Dashboard",
      href: "/app/inventory",
      icon: Package2,
      adminOnly: false
    },
    {
      title: "Warehouses",
      href: "/app/inventory/warehouses",
      icon: Warehouse,
      adminOnly: false
    },
    {
      title: "Stock Movements",
      href: "/app/inventory/movements",
      icon: ArrowLeftRight,
      adminOnly: true
    },
    {
      title: "Inventory Audits",
      href: "/app/inventory/audits",
      icon: Clipboard,
      adminOnly: true
    },
    {
      title: "Supply Chain",
      href: "/app/inventory/supply-chain",
      icon: Shield,
      adminOnly: true
    },
    {
      title: "Barcode Scanner",
      href: "/app/inventory/barcode",
      icon: QrCode,
      adminOnly: false
    },
    {
      title: "Low Stock Alerts",
      href: "/app/inventory/alerts",
      icon: AlertTriangle,
      adminOnly: true
    },
    {
      title: "Reports",
      href: "/app/inventory/reports",
      icon: BarChart,
      adminOnly: true
    },
    {
      title: "Settings",
      href: "/app/inventory/settings",
      icon: Settings,
      adminOnly: true
    }
  ];

  // Filter nav items based on role
  const navItems = allNavItems.filter(item => !item.adminOnly || !isCashier);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      logout();
      setLocation('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Redirect cashiers if they try to access admin pages
  useEffect(() => {
    if (isCashier) {
      const currentPath = location;
      const restrictedPath = allNavItems
        .filter(item => item.adminOnly)
        .some(item => currentPath.startsWith(item.href));
      
      if (restrictedPath) {
        setLocation('/app/inventory');
      }
    }
  }, [location, isCashier, setLocation]);

  return (
    <div className="flex min-h-screen flex-col">
      {hasCompactSidebar && (
        <Suspense fallback={<div className="w-[5rem] h-screen bg-background border-r" />}>
          <CompactSidebar />
        </Suspense>
      )}
      <div className={cn(
        "flex flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10",
        hasCompactSidebar && "lg:ml-[6rem]"
      )}>
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            {/* Sidebar header (organization + user info) */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold">
                  {user?.organization?.name}
                  <br />
                  <span className="text-sm text-gray-500">Inventory</span>
                </h1>
                <UserProfileDropdown />
              </div>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    location === item.href
                      ? "bg-muted hover:bg-muted"
                      : "hover:bg-transparent hover:underline",
                    "justify-start"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start mt-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                )}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </aside>
        <main className="flex flex-col pr-4 flex-1 w-full overflow-hidden mt-4 md:mt-8">
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Skeleton className="h-8 w-8 rounded-full animate-spin" /></div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
} 