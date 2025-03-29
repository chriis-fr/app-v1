import { useAuth } from '@/hooks/use-auth';
import CompactSidebar from './CompactSidebar';

interface ModuleLayoutProps {
  children: React.ReactNode;
}

export default function ModuleLayout({ children }: ModuleLayoutProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="flex min-h-screen">
      {isAdmin && <CompactSidebar />}
      <div className={`flex-1 ${isAdmin ? 'ml-20' : ''}`}>
        {children}
      </div>
    </div>
  );
} 