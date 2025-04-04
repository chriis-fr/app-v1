import { useLocation } from "wouter";
import { useState, useEffect } from "react";
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
  LogOut
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import axios from "axios";
import CompactSidebar from '@/components/layout/CompactSidebar';
import { usePermissions } from '@/utils/permissions';

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
      {hasCompactSidebar && <CompactSidebar />}
      <div className={cn(
        "flex flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10",
        hasCompactSidebar && "lg:ml-[6rem]"
      )}>
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            {/* Sidebar header (organization + user info) */}
            <div className="mb-6 pb-4 border-b">
              <h1 className="text-xl font-semibold">
                {user?.organization?.name}
                <br />
                <span className="text-sm text-gray-500">Inventory</span>
              </h1>
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
        <main className="flex flex-col flex-1 w-full overflow-hidden mt-4 md:mt-8">
          {children}
        </main>
      </div>
    </div>
  );
} 