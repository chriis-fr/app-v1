const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleNotifications() {
  try {
    // Get the first organization and user for testing
    const organization = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst({
      where: { organizationId: organization.id }
    });

    if (!organization || !user) {
      console.log('No organization or user found');
      return;
    }

    const now = new Date();
    
    const sampleNotifications = [
      {
        type: 'meeting',
        title: 'Team Standup Meeting',
        message: 'Daily team standup meeting starts in 15 minutes',
        userId: user.id,
        organizationId: organization.id,
        priority: 'high',
        actionUrl: '/meetings',
        metadata: JSON.stringify({ meetingId: 'meeting-1' }),
        isRead: false,
        createdAt: new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        type: 'task',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: Review Q4 financial reports',
        userId: user.id,
        organizationId: organization.id,
        priority: 'medium',
        actionUrl: '/hr/tasks',
        metadata: JSON.stringify({ taskId: 'task-1' }),
        isRead: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        type: 'approval',
        title: 'Invoice Approval Required',
        message: 'Invoice #INV-2024-001 requires your approval ($2,500)',
        userId: user.id,
        organizationId: organization.id,
        priority: 'high',
        actionUrl: '/finance',
        metadata: JSON.stringify({ amount: 2500 }),
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight at 2:00 AM UTC',
        userId: user.id,
        organizationId: organization.id,
        priority: 'low',
        actionUrl: null,
        metadata: null,
        isRead: true,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        type: 'user',
        title: 'New User Registration',
        message: 'John Smith joined the organization',
        userId: user.id,
        organizationId: organization.id,
        priority: 'low',
        actionUrl: null,
        metadata: JSON.stringify({ userId: 'user-1', userName: 'John Smith' }),
        isRead: true,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        type: 'inventory',
        title: 'Low Stock Alert',
        message: 'Product "Premium Widget" is running low on stock (5 items remaining)',
        userId: user.id,
        organizationId: organization.id,
        priority: 'medium',
        actionUrl: '/inventory',
        metadata: JSON.stringify({ itemCount: 5 }),
        isRead: false,
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000) // 8 hours ago
      }
    ];

    // Create notifications
    for (const notification of sampleNotifications) {
      await prisma.notification.create({
        data: notification
      });
    }

    console.log('Sample notifications created successfully');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleNotifications(); 