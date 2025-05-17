import { useRoleAccess } from '@/hooks/use-role-access';
import { cn } from '@/lib/utils';
import CompactSidebar from './CompactSidebar';
import Header from './Header';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { canAccessCompactSidebar } = useRoleAccess();

  return (
    <div className="min-h-screen bg-gray-50">
      {canAccessCompactSidebar() && <CompactSidebar />}
      <div className={cn(
        "min-h-screen transition-all duration-300",
        canAccessCompactSidebar() ? "ml-20" : "ml-0"
      )}>
        <Header />
        <main className="container mx-auto py-6">
          {children}
        </main>
      </div>
    </div>
  );
} 