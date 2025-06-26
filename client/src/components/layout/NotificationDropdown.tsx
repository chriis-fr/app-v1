import React, { useState, useEffect } from 'react';
import { Bell, Calendar, CheckCircle, AlertTriangle, Users, Clock, FileText, DollarSign, Package, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'meeting' | 'task' | 'approval' | 'system' | 'user' | 'finance' | 'inventory';
  title: string;
  message: string;
  timestamp: Date;
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

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

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
        method: 'POST',
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

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
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
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'task':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'approval':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'finance':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'inventory':
        return <Package className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
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
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                      !notification.isRead && "bg-blue-50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", getPriorityColor(notification.priority))}>
                              {notification.priority}
                            </Badge>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/notifications')}
                className="w-full text-blue-600 hover:text-blue-700"
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 