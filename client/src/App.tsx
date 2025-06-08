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
import POSDashboard from '@/pages/app/pos/dashboard';
import POSCustomers from '@/pages/app/pos/customers';
import POSUsers from '@/pages/app/pos/users';
import POSProducts from '@/pages/app/pos/products';
import POSReports from '@/pages/app/pos/reports';
import POSOrders from '@/pages/app/pos/orders';
import POSSettings from '@/pages/app/pos/settings';
import UsersPage from '@/pages/users';
import UserEditPage from '@/pages/users/[id]';
import NewUserPage from '@/pages/users/new';
import BusinessPartnersPage from '@/pages/business-partners';
import BusinessPartnerEditPage from '@/pages/business-partners/[id]';
import NewBusinessPartnerPage from '@/pages/business-partners/new';
import InventoryPage from '@/pages/app/inventory';
import InventorySettings from '@/pages/app/inventory/settings';
import InventoryReports from '@/pages/app/inventory/reports';
import InventoryWarehouses from '@/pages/app/inventory/warehouses';
import InventoryMovements from '@/pages/app/inventory/movements';
import InventoryAudits from '@/pages/app/inventory/audits';
import InventorySupplyChain from '@/pages/app/inventory/supply-chain';
import InventoryBarcode from '@/pages/app/inventory/barcode';
import InventoryAlerts from '@/pages/app/inventory/alerts';
import CRMPage from '@/pages/app/crm';
import AccountingPage from '@/pages/accounting';
import AccountingModulePage from '@/pages/accounting/module';
import FinancePage from '@/pages/finance';
import FinanceModulePage from '@/pages/finance/module';
import SupportPage from '@/pages/support-page';
import HRPage from '@/pages/hr';
import HRInfoPage from '@/pages/modules/hr-info';
import { HRReports } from './components/hr/HRReports';
import AnalyticsPage from '@/pages/analytics';
import EmployeeHRDetail from '@/pages/hr/employees/[id]';
import NewEmployeePage from '@/pages/hr/new';
import HRSettingsPage from '@/pages/hr/settings';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/support" component={SupportPage} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
            <ProtectedRoute path="/organization-settings" component={OrganizationSettingsPage} />
            <Route path="/book" component={Book} />
            <ProtectedRoute path="/dashboard/modules" component={ModulesPage} />
            
            {/* POS Routes */}
            <ProtectedRoute path="/pos" component={POSPage} />
            <ProtectedRoute path="/pos/dashboard" component={POSDashboard} />
            <ProtectedRoute path="/pos/customers" component={POSCustomers} />
            <ProtectedRoute path="/pos/users" component={POSUsers} />
            <ProtectedRoute path="/pos/products" component={POSProducts} />
            <ProtectedRoute path="/pos/reports" component={POSReports} />
            <ProtectedRoute path="/pos/orders" component={POSOrders} />
            <ProtectedRoute path="/pos/settings" component={POSSettings} />
            
            {/* HR Routes */}
            <ProtectedRoute path="/hr/settings" component={HRSettingsPage} />
            <ProtectedRoute path="/hr" component={HRPage} requiredModule="hr" />
            <ProtectedRoute path="/dashboard/hr" component={HRPage} requiredModule="hr" />
            <ProtectedRoute path="/dashboard/hr/info" component={HRInfoPage} requiredModule="hr" />
            <ProtectedRoute path="/dashboard/hr/reports" component={HRReports} requiredModule="hr" />
            <Route path="/hr/employees/:id" component={EmployeeHRDetail} />
            <ProtectedRoute path="/hr/new" component={NewEmployeePage} requiredModule="hr" />
            
            {/* Inventory Routes */}
            <ProtectedRoute path="/inventory" component={InventoryPage} />
            <ProtectedRoute path="/inventory/settings" component={InventorySettings} />
            <ProtectedRoute path="/inventory/reports" component={InventoryReports} />
            <ProtectedRoute path="/inventory/warehouses" component={InventoryWarehouses} />
            <ProtectedRoute path="/inventory/movements" component={InventoryMovements} />
            <ProtectedRoute path="/inventory/audits" component={InventoryAudits} />
            <ProtectedRoute path="/inventory/supply-chain" component={InventorySupplyChain} />
            <ProtectedRoute path="/inventory/barcode" component={InventoryBarcode} />
            <ProtectedRoute path="/inventory/alerts" component={InventoryAlerts} />
            
            {/* CRM Routes */}
            <ProtectedRoute path="/crm" component={CRMPage} />
            
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
            <ProtectedRoute path="/dashboard/accounting" component={AccountingPage} />
            <ProtectedRoute path="/dashboard/accounting/:module" component={AccountingModulePage} />
            <ProtectedRoute path="/dashboard/finance" component={FinancePage} />
            <ProtectedRoute path="/dashboard/finance/:module" component={FinanceModulePage} />
            <ProtectedRoute path="/analytics" component={AnalyticsPage} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;