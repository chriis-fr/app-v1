import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  FileText,
  Users,
  Package,
  Building2,
  Eye,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { api } from '@/lib/api';

interface ProcurementNotification {
  id: string;
  type: 'request' | 'approval' | 'expense' | 'supplier' | 'budget' | 'policy' | 'committee';
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
  actionRequired: boolean;
  expiresAt?: string;
}

export default function ProcurementNotifications() {
  const [notifications, setNotifications] = useState<ProcurementNotification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Set up real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/procurement/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/procurement/notifications/${id}/read`, {});
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, status: 'read' } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const archiveNotification = async (id: string) => {
    try {
      await api.put(`/procurement/notifications/${id}/archive`, {});
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, status: 'archived' } : notif
        )
      );
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <FileText className="h-4 w-4" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4" />;
      case 'expense':
        return <DollarSign className="h-4 w-4" />;
      case 'supplier':
        return <Building2 className="h-4 w-4" />;
      case 'budget':
        return <DollarSign className="h-4 w-4" />;
      case 'policy':
        return <FileText className="h-4 w-4" />;
      case 'committee':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.status === 'unread';
    if (filter === 'urgent') return notification.priority === 'urgent';
    if (filter === 'action-required') return notification.actionRequired;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Real-time updates and alerts for procurement activities
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Badge variant="outline">
              {unreadCount} unread
            </Badge>
          )}
          {urgentCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {urgentCount} urgent
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'urgent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('urgent')}
        >
          Urgent ({urgentCount})
        </Button>
        <Button
          variant={filter === 'action-required' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('action-required')}
        >
          Action Required
        </Button>
        <Button
          variant={filter === 'request' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('request')}
        >
          Requests
        </Button>
        <Button
          variant={filter === 'approval' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approval')}
        >
          Approvals
        </Button>
        <Button
          variant={filter === 'expense' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('expense')}
        >
          Expenses
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${
                notification.status === 'unread' ? 'border-blue-200 bg-blue-50' : ''
              } ${
                notification.priority === 'urgent' ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(notification.priority)}
                    {getTypeIcon(notification.type)}
                    <div>
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(notification.priority)}
                    {notification.actionRequired && (
                      <Badge className="bg-orange-100 text-orange-800">Action Required</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {notification.expiresAt && (
                      <span>Expires: {new Date(notification.expiresAt).toLocaleDateString()}</span>
                    )}
                    {notification.relatedType && (
                      <span>Related: {notification.relatedType}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {notification.status === 'unread' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => archiveNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Archive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            Export Notifications
          </Button>
        </div>
      </div>
    </div>
  );
} 