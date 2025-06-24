import { useRoleAccess } from '@/hooks/use-role-access';
import { cn } from '@/lib/utils';
import CompactSidebar from './CompactSidebar';
import Header from './Header';
import { useOrganization } from '@/contexts/OrganizationContext';
import { industryThemes } from '@/config/industryThemes';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { canAccessCompactSidebar } = useRoleAccess();
  const { organization } = useOrganization();
  const theme = organization?.industry ? industryThemes[organization.industry as keyof typeof industryThemes] : undefined;

  return (
    <div className="min-h-screen" style={{ background: theme?.primaryColor || '#f9fafb' }}>
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