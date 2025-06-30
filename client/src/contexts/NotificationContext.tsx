import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;

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

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Fetch notifications on mount and set up real-time updates
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time updates - fetch every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 