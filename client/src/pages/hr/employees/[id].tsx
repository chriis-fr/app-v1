import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { EmployeeProfile } from '@/components/hr/EmployeeProfile';
import HRPayroll from '@/components/modules/hr/HRPayroll';
import HRAttendance from '@/components/modules/hr/HRAttendance';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function EmployeeHRDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<any>(null);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/hr/employees/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employee');
        }
        const data = await response.json();
        // Set default values for UI fields if they don't exist in the database
        const employeeWithDefaults = {
          ...data,
          position: data.position || '',
          status: data.status || 'active',
          department: data.department || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          joinDate: data.joinDate || '',
          employmentStatus: data.employmentStatus || '',
          contractType: data.contractType || '',
          employeeNumber: data.employeeNumber || '',
          credentials: data.credentials || [],
          leaveEntitlements: data.leaveEntitlements || [],
          documents: data.documents || [],
        };
        setEmployee(employeeWithDefaults);

        // Fetch payroll
        const payrollRes = await fetch(`/api/hr/employees/${id}/payroll`);
        let payrollData = [];
        if (payrollRes.ok) {
          payrollData = await payrollRes.json();
        }
        setPayroll(payrollData);

        // Fetch attendance
        const attendanceRes = await fetch(`/api/hr/employees/${id}/attendance`);
        let attendanceData = [];
        if (attendanceRes.ok) {
          attendanceData = await attendanceRes.json();
        }
        setAttendance(attendanceData);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    setShowError(true);
  }, [error]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading employee data...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    // return (
    //   <DashboardLayout>
    //     <div className="flex flex-col items-center justify-center h-64">
    //       <p className="text-red-500">{error}</p>
    //       <Button variant="ghost" onClick={() => setLocation('/hr')}>Back to HR</Button>
    //     </div>
    //   </DashboardLayout>
    // );
  }

  if (!employee) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        {error && showError && (
          <Alert variant="destructive" className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowError(false)}>
                Dismiss
              </Button>
            </div>
          </Alert>
        )}
        <Button variant="ghost" className="mb-4" onClick={() => setLocation('/hr')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to HR
        </Button>
        <h1 className="text-2xl font-bold mb-2">{employee.firstName} {employee.lastName}</h1>
        <p className="text-muted-foreground mb-6">{employee.position || employee.department}</p>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pay">Pay History</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <EmployeeProfile employee={employee} onUpdate={async () => {}} />
          </TabsContent>
          <TabsContent value="pay">
            <Card>
              <CardHeader>
                <CardTitle>Pay History</CardTitle>
              </CardHeader>
              <CardContent>
                {payroll.length === 0 ? (
                  <p className="text-muted-foreground">No pay history found.</p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Period</th>
                        <th className="px-2 py-1">Net Pay</th>
                        <th className="px-2 py-1">Status</th>
                        <th className="px-2 py-1">Paid At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payroll.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-2 py-1">{p.period?.startDate ? new Date(p.period.startDate).toLocaleDateString() : ''} - {p.period?.endDate ? new Date(p.period.endDate).toLocaleDateString() : ''}</td>
                          <td className="px-2 py-1">{p.netPay ? `$${p.netPay.toFixed(2)}` : '-'}</td>
                          <td className="px-2 py-1">{p.status}</td>
                          <td className="px-2 py-1">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <p className="text-muted-foreground">No attendance records found.</p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Date</th>
                        <th className="px-2 py-1">Check In</th>
                        <th className="px-2 py-1">Check Out</th>
                        <th className="px-2 py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-2 py-1">{a.date ? new Date(a.date).toLocaleDateString() : ''}</td>
                          <td className="px-2 py-1">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '-'}</td>
                          <td className="px-2 py-1">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '-'}</td>
                          <td className="px-2 py-1">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle>Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <pre>{JSON.stringify(employee.leaveEntitlements || [], null, 2)}</pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <pre>{JSON.stringify(employee.documents || [], null, 2)}</pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 