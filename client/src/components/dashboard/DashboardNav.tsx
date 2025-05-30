import { useRoleAccess } from '@/hooks/use-role-access';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  BarChart3,
  Briefcase,
  DollarSign,
  Clock,
  UserPlus,
  Shield,
  Building,
  FileSpreadsheet,
  Calendar,
  Mail,
  MessageSquare,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react';

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const {
    isOwner,
    isAdmin,
    isHR,
    canAccessDashboard,
    canAccessCompactSidebar,
    canAccessDepartment,
    canManageUsers,
    canAccessModule
  } = useRoleAccess();

  const getDepartmentRoutes = () => {
    if (!user?.department) return [];

    const routes = {
      'HR': [
        {
          title: 'HR Dashboard',
          href: '/dashboard/hr',
          icon: Briefcase,
        },
        {
          title: 'Employees',
          href: '/dashboard/hr/employees',
          icon: Users,
        },
        {
          title: 'Payroll',
          href: '/dashboard/hr/payroll',
          icon: DollarSign,
        },
        {
          title: 'Attendance',
          href: '/dashboard/hr/attendance',
          icon: Clock,
        },
      ],
      'Finance': [
        {
          title: 'Finance Dashboard',
          href: '/dashboard/finance',
          icon: DollarSign,
        },
        {
          title: 'Accounting',
          href: '/dashboard/finance/accounting',
          icon: FileSpreadsheet,
        },
        {
          title: 'Payroll',
          href: '/dashboard/finance/payroll',
          icon: DollarSign,
        },
      ],
      'IT': [
        {
          title: 'IT Dashboard',
          href: '/dashboard/it',
          icon: Shield,
        },
        {
          title: 'System',
          href: '/dashboard/it/system',
          icon: Settings,
        },
        {
          title: 'Security',
          href: '/dashboard/it/security',
          icon: Shield,
        },
      ],
    };

    return routes[user.department as keyof typeof routes] || [];
  };

  const getGlobalRoutes = () => {
    const routes = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        show: canAccessDashboard(),
      },
      {
        title: 'Organization',
        href: '/dashboard/organization',
        icon: Building2,
        show: isOwner() || isAdmin(),
      },
      {
        title: 'Users',
        href: '/dashboard/users',
        icon: Users,
        show: canManageUsers(),
      },
      {
        title: 'Documents',
        href: '/dashboard/documents',
        icon: FileText,
        show: true,
      },
      {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        show: canAccessDashboard(),
      },
      {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        show: isOwner() || isAdmin(),
      },
    ];

    return routes.filter(route => route.show);
  };

  const departmentRoutes = getDepartmentRoutes();
  const globalRoutes = getGlobalRoutes();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Building className="h-6 w-6" />
          <span className="text-lg">Company</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Overview
            </h2>
            <div className="space-y-1">
              {globalRoutes.map((route) => (
                <Button
                  key={route.href}
                  variant={pathname === route.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          {departmentRoutes.length > 0 && (
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                {user?.department}
              </h2>
              <div className="space-y-1">
                {departmentRoutes.map((route) => (
                  <Button
                    key={route.href}
                    variant={pathname === route.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 