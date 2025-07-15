import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Plus, 
  Search, 
  Filter,
  Bell,
  User,
  Settings,
  Home,
  FileText,
  DollarSign,
  Building2,
  Users,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';

interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications?: number;
}

export default function ProcurementMobileLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  notifications = 0 
}: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: MobileNavItem[] = [
    { id: 'requests', label: 'Requests', icon: <FileText className="h-5 w-5" /> },
    { id: 'rfps', label: 'RFPs', icon: <FileText className="h-5 w-5" /> },
    { id: 'contracts', label: 'Contracts', icon: <FileText className="h-5 w-5" /> },
    { id: 'orders', label: 'Orders', icon: <FileText className="h-5 w-5" /> },
    { id: 'grns', label: 'GRNs', icon: <FileText className="h-5 w-5" /> },
    { id: 'suppliers', label: 'Suppliers', icon: <Building2 className="h-5 w-5" /> },
    { id: 'vendors', label: 'Vendors', icon: <Building2 className="h-5 w-5" /> },
    { id: 'expenses', label: 'Expenses', icon: <DollarSign className="h-5 w-5" /> },
    { id: 'budgets', label: 'Budgets', icon: <DollarSign className="h-5 w-5" /> },
    { id: 'policies', label: 'Policies', icon: <Shield className="h-5 w-5" /> },
    { id: 'committee', label: 'Committee', icon: <Users className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" />, badge: notifications },
    { id: 'audit', label: 'Audit', icon: <Clock className="h-5 w-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Procurement</h1>
            <p className="text-xs text-muted-foreground">Mobile Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 text-xs">
                {notifications}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:border-r
        `}>
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Navigation</h2>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-sm font-medium mb-3">Settings</h3>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                <Settings className="h-4 w-4" />
                Preferences
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-4">
            {/* Mobile Tab Navigation */}
            <div className="md:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {navItems.slice(0, 6).map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className="whitespace-nowrap"
                  >
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized card component
export function MobileCard({ title, children, actions }: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Card className="md:hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{title}</CardTitle>
          {actions && (
            <div className="flex gap-1">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

// Mobile-optimized list item component
export function MobileListItem({ 
  title, 
  subtitle, 
  badge, 
  actions,
  onClick 
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`
        p-4 border-b border-gray-100 last:border-b-0
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex gap-1 ml-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized stats card
export function MobileStatsCard({ 
  title, 
  value, 
  change, 
  icon 
}: {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="md:hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-muted-foreground">{change}</p>
            )}
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 