import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, BarChart3, Briefcase, Calendar, UserX, DollarSign, ArrowLeft, Target, Activity } from 'lucide-react';
import { HRReports } from '@/components/hr/HRReports';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface Metrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  terminated: number;
  payrollTotal: number;
}

export default function HRReportsPage() {
  const [, setLocation] = useLocation();
  const [metrics, setMetrics] = useState<Metrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    terminated: 0,
    payrollTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const res = await fetch('/api/hr/employees');
        const data = await res.json();
        const totalEmployees = data.length;
        const activeEmployees = data.filter((e: any) => e.status === 'active').length;
        const onLeave = data.filter((e: any) => e.status === 'on_leave').length;
        const terminated = data.filter((e: any) => e.status === 'terminated').length;
        const payrollTotal = data.filter((e: any) => e.salaryAmount && e.salaryAmount > 0).reduce((sum: number, e: any) => sum + (e.salaryAmount || 0), 0);
        setMetrics({ totalEmployees, activeEmployees, onLeave, terminated, payrollTotal });
      } catch {
        setMetrics({ totalEmployees: 0, activeEmployees: 0, onLeave: 0, terminated: 0, payrollTotal: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 py-6">
        {/* Enhanced Header */}
        <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm">
          <div className="flex items-center justify-between px-8 py-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/dashboard/hr/info')}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-indigo-200 hover:bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to HR Info
              </Button>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-indigo-900 mb-1">HR Reports & Analytics</h1>
                  <p className="text-indigo-700 text-sm">Visualize, generate, and export comprehensive HR reports for your organization.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Summary */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                  <div className="bg-blue-600 text-white rounded-full p-1">
                    <Users className="h-3 w-3" />
                  </div>
                  Total Employees
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-1">{loading ? '...' : metrics.totalEmployees}</div>
              <p className="text-xs text-blue-500">All employees</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-800">
                  <div className="bg-green-600 text-white rounded-full p-1">
                    <Briefcase className="h-3 w-3" />
                  </div>
                  Active
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 mb-1">{loading ? '...' : metrics.activeEmployees}</div>
              <p className="text-xs text-green-500">Currently working</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-800">
                  <div className="bg-orange-600 text-white rounded-full p-1">
                    <Calendar className="h-3 w-3" />
                  </div>
                  On Leave
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 mb-1">{loading ? '...' : metrics.onLeave}</div>
              <p className="text-xs text-orange-500">Currently on leave</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-800">
                  <div className="bg-red-600 text-white rounded-full p-1">
                    <UserX className="h-3 w-3" />
                  </div>
                  Terminated
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 mb-1">{loading ? '...' : metrics.terminated}</div>
              <p className="text-xs text-red-500">No longer employed</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-800">
                  <div className="bg-indigo-600 text-white rounded-full p-1">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  Payroll (Monthly)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-700 mb-1">{loading ? '...' : `$${metrics.payrollTotal.toLocaleString()}`}</div>
              <p className="text-xs text-indigo-500">Gross payroll</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Chart Placeholder */}
        <Card className="mt-6 border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-2">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-indigo-900">HR Analytics Overview</CardTitle>
                <CardDescription className="text-indigo-700">Trends in headcount, turnover, and leave (coming soon)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-indigo-400" />
                <span className="text-indigo-600 font-medium">Charts and analytics coming soon...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Reports Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full p-2">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate & Export HR Reports</h2>
              <p className="text-gray-600 text-sm">Create comprehensive reports with custom parameters and export options</p>
            </div>
          </div>
          
          <Card className="border-2 border-dashed border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white rounded-full p-2">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-green-900">Advanced Report Generator</CardTitle>
                  <CardDescription className="text-green-700">Create comprehensive HR reports with custom parameters and export options</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Report Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Employee Summary
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Payroll Analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Leave Reports
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Performance Reviews
                    </div>
                  </div>
                </div>
                <HRReports />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 