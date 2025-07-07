import React, { useState, useEffect } from 'react';
import { Bell, Calendar, CheckCircle, AlertTriangle, Users, Clock, FileText, DollarSign, Package, Settings, X, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'meeting' | 'task' | 'approval' | 'system' | 'user' | 'finance' | 'inventory';
  title: string;
  message: string;
  timestamp: Date | string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: {
    userId?: string;
    userName?: string;
    meetingId?: string;
    taskId?: string;
    amount?: number;
    itemCount?: number;
  };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        // Fallback to mock data if API fails
        setNotifications(generateMockNotifications());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = (): Notification[] => {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'meeting',
        title: 'Upcoming Team Meeting',
        message: 'Team standup meeting starts in 15 minutes',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actionUrl: '/meetings',
        metadata: { meetingId: 'meeting-1' }
      },
      {
        id: '2',
        type: 'task',
        title: 'Task Assignment',
        message: 'New task assigned: Review Q4 financial reports',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        actionUrl: '/hr/tasks',
        metadata: { taskId: 'task-1' }
      },
      {
        id: '3',
        type: 'approval',
        title: 'Approval Required',
        message: 'Invoice #INV-2024-001 requires your approval',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actionUrl: '/finance',
        metadata: { amount: 2500 }
      },
      {
        id: '4',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight at 2:00 AM UTC',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        isRead: true,
        priority: 'low'
      },
      {
        id: '5',
        type: 'user',
        title: 'New User Registration',
        message: 'John Smith joined the organization',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        isRead: true,
        priority: 'low',
        metadata: { userId: 'user-1', userName: 'John Smith' }
      },
      {
        id: '6',
        type: 'inventory',
        title: 'Low Stock Alert',
        message: 'Product "Premium Widget" is running low on stock',
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        actionUrl: '/inventory',
        metadata: { itemCount: 5 }
      }
    ];
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'task':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'approval':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      case 'user':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'finance':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'inventory':
        return <Package className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - timestampDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestampDate.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead) ||
      notification.type === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with organizational activities and important alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={async () => {
                try {
                  await fetch('/api/notifications/sample', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  fetchNotifications();
                } catch (error) {
                  console.error('Error creating sample notifications:', error);
                }
              }}
              variant="outline"
              size="sm"
            >
              Create Sample Notifications
            </Button>
            <Button
              onClick={() => setLocation('/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications Overview
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {unreadCount} unread
                </Badge>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="approval">Approvals</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You\'re all caught up! No new notifications.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {notification.title}
                            </h3>
                            <Badge className={cn("text-xs", getPriorityColor(notification.priority))}>
                              {notification.priority}
                            </Badge>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(notification.actionUrl!);
                              }}
                            >
                              View
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 