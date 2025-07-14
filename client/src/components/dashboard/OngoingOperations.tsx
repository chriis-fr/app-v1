import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Users, FileText, ArrowRightLeft, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { staticData } from '@/data/static';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export function OngoingOperations() {
  const { blockchain, hr, accounting } = staticData;
  const { user } = useAuth();

  // Fetch live attendance data
  const { data: attendanceData } = useQuery({
    queryKey: ['attendance-live-operations'],
    queryFn: () => api.get('/attendance/live'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch employees data for consistent employee count
  const { data: employees = [] } = useQuery({
    queryKey: ['hr-employees-operations'],
    queryFn: () => api.get('/hr/employees'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Combine recent activities from different modules
  const recentActivities = [
    ...blockchain.transactions.map(tx => ({
      type: 'transaction',
      title: `${tx.type} Transaction`,
      description: `${tx.amount} ETH - ${tx.status}`,
      timestamp: new Date(tx.createdAt),
      status: tx.status
    })),
    ...hr.employees.map(emp => ({
      type: 'employee',
      title: `${emp.firstName} ${emp.lastName} joined`,
      description: `New employee in ${emp.department}`,
      timestamp: new Date(emp.joinDate),
      status: 'Active'
    })),
    ...accounting.invoices.map(inv => ({
      type: 'invoice',
      title: `Invoice #${inv.id}`,
      description: `$${inv.amount} - ${inv.status}`,
      timestamp: new Date(inv.createdAt),
      status: inv.status
    }))
  ]
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  .slice(0, 5);

  // Add attendance activities if data is available
  const attendanceActivities = attendanceData ? [
    {
      type: 'attendance',
      title: 'Live Attendance Update',
      description: `${attendanceData.present || 0} present, ${attendanceData.absent || 0} absent, ${attendanceData.late || 0} late`,
      timestamp: new Date(),
      status: 'Live'
    }
  ] : [];

  const allActivities = [...attendanceActivities, ...recentActivities]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Ongoing Operations</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.type === 'transaction' && <ArrowRightLeft className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'employee' && <Users className="h-4 w-4 text-green-500" />}
                    {activity.type === 'invoice' && <FileText className="h-4 w-4 text-purple-500" />}
                    {activity.type === 'attendance' && <Calendar className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'Completed' || activity.status === 'Paid' || activity.status === 'Live' ? 'bg-green-100 text-green-700' :
                        activity.status === 'Pending' || activity.status === 'Absent' || activity.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Transaction Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Pending Transactions</p>
                  <p className="text-2xl font-bold">
                    {blockchain.transactions.filter(tx => tx.status === 'Pending').length}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Completed Today</p>
                  <p className="text-2xl font-bold">
                    {blockchain.transactions.filter(tx => 
                      tx.status === 'Completed' && 
                      new Date(tx.createdAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-medium mb-2">Recent Transactions</h4>
                <div className="space-y-2">
                  {blockchain.transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {tx.amount} ETH
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

       
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alerts and Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accounting.invoices
              .filter(inv => inv.status === 'Pending')
              .map(inv => (
                <div key={inv.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Pending Invoice</p>
                    <p className="text-xs text-muted-foreground">
                      Invoice #{inv.id} - ${inv.amount} due {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 