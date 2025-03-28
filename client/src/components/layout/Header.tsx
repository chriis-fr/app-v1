import { Search, Bell, Settings, User, HelpCircle, Building2, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { chainslogo } from '@/assets';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Header() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to get user's initials for avatar
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 fixed top-0 left-0 sm:left-[336px] right-0 z-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search modules, reports, etc..."
            className="pl-10 pr-4 py-2 border rounded-lg w-48 sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        
        {user?.organization && (
          <div className="hidden sm:block">
            <span className="font-medium">{user.organization.name}</span>
            <span className="text-xs text-gray-500 ml-2">{user.organization.plan || 'Enterprise'} Plan</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </button>
        {isAdmin && (
          <button 
            onClick={() => setLocation('/organization-settings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Organization Settings"
          >
            <Building2 className="h-5 w-5 text-gray-600" />
          </button>
        )}
        <button 
          onClick={() => setLocation('/settings')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center ml-2">
          {isLoading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : user ? (
            <>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    {getUserInitials(user.firstName, user.lastName)}
                  </span>
                )}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className="text-sm font-medium">{user.username}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Sign in</div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <img src={chainslogo} alt="logo" className="h-8" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {user?.organization && (
                <div className="mb-4">
                  <div className="font-medium">{user.organization.name}</div>
                  <div className="text-sm text-gray-500">{user.organization.plan || 'Enterprise'} Plan</div>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-sm font-medium">{user?.username}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 