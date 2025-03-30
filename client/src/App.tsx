import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from './lib/protected-route';
import LandingPage from '@/pages/landing-page';
import AuthPage from '@/pages/auth-page';
import Dashboard from '@/pages/dashboard';
import SettingsPage from '@/pages/settings-page';
import NotFound from '@/pages/not-found';
import OrganizationSettingsPage from '@/pages/organization-settings-page';
import Book from '@/pages/book';
import ModulesPage from '@/pages/modules-page';
import ModuleInfoPage from '@/pages/module-info-page';
import POSPage from '@/pages/app/pos';
import UsersPage from '@/pages/users';
import UserEditPage from '@/pages/users/[id]';
import NewUserPage from '@/pages/users/new';
import BusinessPartnersPage from '@/pages/business-partners';
import BusinessPartnerEditPage from '@/pages/business-partners/[id]';
import NewBusinessPartnerPage from '@/pages/business-partners/new';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
            <ProtectedRoute path="/organization-settings" component={OrganizationSettingsPage} />
            <Route path="/book" component={Book} />
            <ProtectedRoute path="/dashboard/modules" component={ModulesPage} />
            <ProtectedRoute path="/pos" component={POSPage} />
            
            {/* User Management Routes */}
            <ProtectedRoute path="/users" component={UsersPage} />
            <ProtectedRoute path="/users/new" component={NewUserPage} />
            <ProtectedRoute path="/users/:id" component={UserEditPage} />
            
            {/* Business Partner Routes */}
            <ProtectedRoute path="/business-partners" component={BusinessPartnersPage} />
            <ProtectedRoute path="/business-partners/new" component={NewBusinessPartnerPage} />
            <ProtectedRoute path="/business-partners/:id" component={BusinessPartnerEditPage} />
            
            {/* Module Info Routes */}
            <ProtectedRoute path="/dashboard/pos/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/hr/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/inventory/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/finance/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/blockchain/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/accounting/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/manufacturing/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/warehouse/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/procurement/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/logistics/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/crm/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/projects/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/tasks/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/calendar/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/reports/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/analytics/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/audit/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/compliance/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/real-estate/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/security/info" component={ModuleInfoPage} />
            <ProtectedRoute path="/dashboard/workflow/info" component={ModuleInfoPage} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;