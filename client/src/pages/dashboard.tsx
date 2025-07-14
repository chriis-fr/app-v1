import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staticData } from '@/data/static';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { AIDepartmentInsights } from '@/components/dashboard/AIDepartmentInsights';
import { BusinessHealth } from '@/components/dashboard/BusinessHealth';
import { AIAnalytics } from '@/components/dashboard/AIAnalytics';
import { AssetsAtWork } from '@/components/dashboard/AssetsAtWork';
import { OngoingOperations } from '@/components/dashboard/OngoingOperations';
import { Web3Features } from '@/components/dashboard/Web3Features';
import ProcurementApprovals from '@/components/dashboard/ProcurementApprovals';
import POSMain from '@/components/modules/pos/POSMain';
import HRMain from '@/components/modules/hr/HRMain';
import AccountingMain from '@/components/modules/accounting/AccountingMain';
import BlockchainMain from '@/components/modules/blockchain/BlockchainMain';
import CRMMain from '@/components/modules/crm/CRMMain';
import ProcurementMain from '@/components/modules/procurement/ProcurementMain';
import { BarChart3, Users, DollarSign, Package, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, UserPlus, Calendar, Briefcase, Building2, ShoppingCart, FileText, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

// Map module IDs to their main components
const moduleComponentMap: Record<string, React.ComponentType<any>> = {
  accounting: AccountingMain,
  hr: HRMain,
  pos: POSMain,
  blockchain: BlockchainMain,
  crm: CRMMain,
  procurement: ProcurementMain,
};

export default function Dashboard() {
  const { user } = useAuth();
  const { canAccessDashboard } = useRoleAccess();
  const [, setLocation] = useLocation();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const orgModules: string[] = (user?.organization && (user.organization as any).enabledModules)
    ? (user.organization as any).enabledModules
    : user?.organization?.activeModules || [];

  useEffect(() => {
    if (!canAccessDashboard()) {
      setLocation('/');
      return;
    }
  }, [canAccessDashboard, setLocation]);

  // Fetch organization analytics and stats
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['org-analytics'],
    queryFn: () => api.get('/analytics/organization/metrics'),
  });

  // Fetch HR stats (employees)
  const { data: employees = [] } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: () => api.get('/hr/employees'),
    enabled: orgModules.includes('hr'),
  });

  // Fetch POS stats (sales/orders)
  const { data: posOrders = [] } = useQuery({
    queryKey: ['pos-orders'],
    queryFn: () => api.get('/pos/orders'),
    enabled: orgModules.includes('pos'),
  });

  // Fetch inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ['pos-inventory'],
    queryFn: () => api.get('/pos/inventory'),
    enabled: orgModules.includes('pos'),
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: () => api.get('/pos/customers'),
    enabled: orgModules.includes('pos'),
  });

  // Fetch attendance data for HR module
  const { data: attendanceData } = useQuery({
    queryKey: ['attendance-live'],
    queryFn: () => api.get('/attendance/live'),
    enabled: orgModules.includes('hr'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!canAccessDashboard()) {
    return null;
  }

  // Show module dashboard for module managers/employees
  if (user?.department) {
    switch(user.department.toLowerCase()) {
    case 'pos':
      return <POSMain />;
    case 'hr':
      return <HRMain />;
    case 'accounting':
      return <AccountingMain />;
    case 'blockchain':
      return <BlockchainMain />;
    case 'crm':
      return <CRMMain />;
    case 'procurement':
      return <ProcurementMain />;
    default:
        break;
    }
  }

  // Show HR dashboard for HR admins
  if (user?.role === 'hr_admin') {
    return <HRMain />;
  }

  // Show company overview/analytics for owners/admins (no department or executive roles)
  // (Do NOT render module dashboards here)
      return (
        <DashboardLayout>
          <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-black">
                Company Overview
              </h2>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Module Summaries */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* HR Module Summary */}
              {orgModules.includes('hr') && (
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                        <div className="bg-blue-600 text-white rounded-full p-1">
                          <Users className="h-3 w-3" />
                        </div>
                        HR Management
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Total Employees</span>
                        <span className="font-bold text-blue-700">{employees?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Active</span>
                        <span className="font-bold text-blue-700">
                          {employees?.filter((e: any) => e.status === 'active').length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">This Month</span>
                        <span className="font-bold text-blue-700">
                          {employees?.filter((e: any) => {
                            const joinDate = new Date(e.hireDate || e.createdAt);
                            const thisMonth = new Date();
                            return joinDate.getMonth() === thisMonth.getMonth() && 
                                   joinDate.getFullYear() === thisMonth.getFullYear();
                          }).length || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* POS Module Summary */}
              {orgModules.includes('pos') && (
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-800">
                        <div className="bg-green-600 text-white rounded-full p-1">
                          <ShoppingCart className="h-3 w-3" />
                        </div>
                        Point of Sale
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">Total Orders</span>
                        <span className="font-bold text-green-700">{posOrders?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">Customers</span>
                        <span className="font-bold text-green-700">{customers?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">Products</span>
                        <span className="font-bold text-green-700">{inventory?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Accounting Module Summary */}
              {orgModules.includes('accounting') && (
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-800">
                        <div className="bg-purple-600 text-white rounded-full p-1">
                          <CreditCard className="h-3 w-3" />
                        </div>
                        Accounting
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">Transactions</span>
                        <span className="font-bold text-purple-700">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">Accounts</span>
                        <span className="font-bold text-purple-700">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">Reports</span>
                        <span className="font-bold text-purple-700">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blockchain Module Summary */}
              {orgModules.includes('blockchain') && (
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-800">
                        <div className="bg-orange-600 text-white rounded-full p-1">
                          <Building2 className="h-3 w-3" />
                        </div>
                        Blockchain
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-600">Transactions</span>
                        <span className="font-bold text-orange-700">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-600">Wallets</span>
                        <span className="font-bold text-orange-700">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-600">Smart Contracts</span>
                        <span className="font-bold text-orange-700">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CRM Module Summary */}
              {orgModules.includes('crm') && (
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-800">
                        <div className="bg-indigo-600 text-white rounded-full p-1">
                          <Briefcase className="h-3 w-3" />
                        </div>
                        CRM
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-indigo-600">Leads</span>
                        <span className="font-bold text-indigo-700">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-indigo-600">Customers</span>
                        <span className="font-bold text-indigo-700">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-indigo-600">Deals</span>
                        <span className="font-bold text-indigo-700">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Enhanced Attendance Cards - Only show if HR module is enabled */}
            {orgModules.includes('hr') && attendanceData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Live Attendance Overview</h3>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-800">Present Employees</CardTitle>
                      <div className="bg-green-600 text-white rounded-full p-2">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-700">{attendanceData.present || 0}</div>
                      <p className="text-xs text-green-600 font-medium">
                        out of {employees?.length || 0} total
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-green-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(employees?.length || 0) > 0 ? ((attendanceData.present || 0) / (employees?.length || 0)) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            {(employees?.length || 0) > 0 ? Math.round(((attendanceData.present || 0) / (employees?.length || 0)) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-red-800">Absent Employees</CardTitle>
                      <div className="bg-red-600 text-white rounded-full p-2">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-700">{attendanceData.absent || 0}</div>
                      <p className="text-xs text-red-600 font-medium">
                        out of {employees?.length || 0} total
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-red-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(employees?.length || 0) > 0 ? ((attendanceData.absent || 0) / (employees?.length || 0)) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-red-600 font-medium">
                            {(employees?.length || 0) > 0 ? Math.round(((attendanceData.absent || 0) / (employees?.length || 0)) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-yellow-800">Late Employees</CardTitle>
                      <div className="bg-yellow-600 text-white rounded-full p-2">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-700">{attendanceData.late || 0}</div>
                      <p className="text-xs text-yellow-600 font-medium">
                        currently late
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-yellow-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(employees?.length || 0) > 0 ? ((attendanceData.late || 0) / (employees?.length || 0)) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-yellow-600 font-medium">
                            {(employees?.length || 0) > 0 ? Math.round(((attendanceData.late || 0) / (employees?.length || 0)) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800">Attendance Rate</CardTitle>
                      <div className="bg-blue-600 text-white rounded-full p-2">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-700">
                        {(employees?.length || 0) > 0 ? Math.round(((attendanceData.present || 0) / (employees?.length || 0)) * 100) : 0}%
                      </div>
                      <p className="text-xs text-blue-600 font-medium">
                        overall attendance
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(employees?.length || 0) > 0 ? ((attendanceData.present || 0) / (employees?.length || 0)) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-blue-600 font-medium">
                            {attendanceData.present || 0} present
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Quick Attendance Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => setLocation('/attendance')} 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Attendance
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setLocation('/attendance/manual')} 
                        className="flex-1"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Manual Entry
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setLocation('/attendance/remote')} 
                        className="flex-1"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Remote Attendance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

        {/* High-level analytics and company stats only. No module dashboards. */}
        {['pos','hr','accounting','blockchain'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <BusinessHealth />
              </div>
            )}
        {['pos','hr','accounting','blockchain'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <AIAnalytics />
              </div>
            )}
        {['hr','pos','accounting'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <AssetsAtWork />
              </div>
            )}
        {['pos','hr','accounting','blockchain'].some(m => orgModules.includes(m)) && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <OngoingOperations />
              </div>
            )}
        {orgModules.includes('blockchain') && (
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <Web3Features />
              </div>
            )}

        {/* AI Department Insights - only show if AI is enabled */}
        {user?.organization?.settings?.ai?.isEnabled && (
          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <AIDepartmentInsights 
              department={user?.department}
              showAllDepartments={user?.role === 'owner' || user?.role === 'admin'}
            />
          </div>
        )}

        {/* Procurement Approvals for Finance and Executive Users */}
        {(user?.role === 'finance' || user?.role === 'executive' || user?.role === 'admin' || user?.role === 'owner') && (
          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  Procurement Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProcurementApprovals />
              </CardContent>
            </Card>
          </div>
        )}
        {/* ...other company-wide analytics sections... */}
          </div>
        </DashboardLayout>
      );
}