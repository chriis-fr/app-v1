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
            <ProtectedRoute path="/dashboard/:module/info" component={ModuleInfoPage} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;