import { Search, Bell, Settings, User, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Header() {
  const { user, isLoading } = useAuth();

  // Function to get user's initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6 fixed top-0 left-[336px] right-0 z-10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search modules, reports, etc..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        
        {user?.organization && (
          <div className="ml-4 hidden md:block">
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
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center ml-2">
          {isLoading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : user ? (
            <>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                  {getUserInitials(user.name)}
                </div>
              )}
              <div className="ml-2">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Sign in</div>
          )}
        </div>
      </div>
    </div>
  );
} 