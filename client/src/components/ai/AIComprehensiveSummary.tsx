import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Calendar, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Building2,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  department?: string;
  isRead: boolean;
  createdAt: Date;
}

interface MeetingData {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  organizerName: string;
  department?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location?: string;
  isVirtual: boolean;
}

interface ProcurementData {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  requestedAmount: number;
  category: string;
  dueDate?: Date;
}

interface AlertData {
  type: 'procurement' | 'meeting' | 'notification' | 'employee' | 'financial';
  message: string;
  priority: 'low' | 'medium' | 'high';
  department?: string;
}

interface ComprehensiveSummary {
  notifications: NotificationData[];
  meetings: MeetingData[];
  procurements: ProcurementData[];
  alerts: AlertData[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: Date;
    department?: string;
  }[];
}

interface AIComprehensiveSummaryProps {
  onOpenChat?: (context?: string) => void;
}

export function AIComprehensiveSummary({ onOpenChat }: AIComprehensiveSummaryProps) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ComprehensiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComprehensiveData();
  }, []);

  const fetchComprehensiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/test-comprehensive-org-data', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comprehensive data');
      }

      const data = await response.json();
      setSummary(data.data);
    } catch (error) {
      console.error('Error fetching comprehensive data:', error);
      setError('Failed to load comprehensive data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'procurement': return <ShoppingCart className="h-4 w-4" />;
      case 'employee': return <Users className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-blue-900">AI Comprehensive Summary</CardTitle>
              <p className="text-blue-700 text-sm">Loading organizational data...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full p-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-red-900">Error Loading Data</CardTitle>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={fetchComprehensiveData}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const unreadNotifications = summary.notifications.filter(n => !n.isRead);
  const upcomingMeetings = summary.meetings.filter(m => 
    m.status === 'scheduled' && new Date(m.startTime) > new Date()
  );
  const pendingProcurements = summary.procurements.filter(p => p.status === 'pending');
  const highPriorityAlerts = summary.alerts.filter(a => a.priority === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-900">AI Comprehensive Summary</CardTitle>
                <p className="text-blue-700 text-sm">
                  Real-time overview of notifications, meetings, procurements, and alerts
                </p>
              </div>
            </div>
            <Button 
              onClick={fetchComprehensiveData}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Unread Notifications</p>
                <p className="text-2xl font-bold text-red-900">{unreadNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Upcoming Meetings</p>
                <p className="text-2xl font-bold text-purple-900">{upcomingMeetings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Pending Procurements</p>
                <p className="text-2xl font-bold text-orange-900">{pendingProcurements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">High Priority Alerts</p>
                <p className="text-2xl font-bold text-yellow-900">{highPriorityAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="border-2 border-red-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
              <Badge variant="outline" className={getPriorityColor('medium')}>
                {unreadNotifications.length} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {unreadNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {notification.department && (
                            <Badge variant="outline" className="text-xs">
                              {notification.department}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {unreadNotifications.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No unread notifications</p>
                )}
              </div>
            </ScrollArea>
            {onOpenChat && (
              <Button 
                onClick={() => onOpenChat('Discuss notifications and alerts')}
                className="w-full mt-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                Ask AI about Notifications
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Meetings */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                {upcomingMeetings.length} scheduled
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {upcomingMeetings.slice(0, 5).map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{meeting.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{meeting.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(meeting.status)}>
                            {meeting.status}
                          </Badge>
                          {meeting.department && (
                            <Badge variant="outline" className="text-xs">
                              {meeting.department}
                            </Badge>
                          )}
                          {meeting.isVirtual && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Virtual
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {meeting.organizerName} • {new Date(meeting.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingMeetings.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No upcoming meetings</p>
                )}
              </div>
            </ScrollArea>
            {onOpenChat && (
              <Button 
                onClick={() => onOpenChat('Discuss upcoming meetings and scheduling')}
                className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Ask AI about Meetings
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Procurements */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Pending Procurements</CardTitle>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                {pendingProcurements.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {pendingProcurements.slice(0, 5).map((procurement) => (
                  <div key={procurement.id} className="p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{procurement.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{procurement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(procurement.priority)}>
                            {procurement.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {procurement.department}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            ${procurement.requestedAmount.toLocaleString()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {procurement.requesterName} • {procurement.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingProcurements.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No pending procurements</p>
                )}
              </div>
            </ScrollArea>
            {onOpenChat && (
              <Button 
                onClick={() => onOpenChat('Discuss procurement requests and approvals')}
                className="w-full mt-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Ask AI about Procurements
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-2 border-yellow-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">System Alerts</CardTitle>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {summary.alerts.length} alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {summary.alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                          {alert.department && (
                            <Badge variant="outline" className="text-xs">
                              {alert.department}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {summary.alerts.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No active alerts</p>
                )}
              </div>
            </ScrollArea>
            {onOpenChat && (
              <Button 
                onClick={() => onOpenChat('Discuss system alerts and issues')}
                className="w-full mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                Ask AI about Alerts
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-2 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {summary.recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
                  <div className="text-green-600">
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                      {activity.department && ` • ${activity.department}`}
                    </p>
                  </div>
                </div>
              ))}
              {summary.recentActivity.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent activity</p>
              )}
            </div>
          </ScrollArea>
          {onOpenChat && (
            <Button 
              onClick={() => onOpenChat('Discuss recent organizational activity and trends')}
              className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Ask AI about Activity
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 