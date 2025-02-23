import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Home, Store, Users, Calculator, Users2, Wallet,
  Settings, LogOut
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Store, label: 'POS', path: '/dashboard/pos' },
  { icon: Users, label: 'HR', path: '/dashboard/hr' },
  { icon: Calculator, label: 'Accounting', path: '/dashboard/accounting' },
  { icon: Users2, label: 'CRM', path: '/dashboard/crm' },
  { icon: Wallet, label: 'Blockchain', path: '/dashboard/blockchain' },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { logoutMutation } = useAuth();

  return (
    <div className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      <div className="p-4">
        <h2 className="text-xl font-bold text-sidebar-foreground mb-6">
          Chain ERP
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location === item.path ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setLocation(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setLocation('/dashboard/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
