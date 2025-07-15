import { PrismaClient } from '@prisma/client';
import { Employee } from '../mongodb/models/hr';
import mongoose from 'mongoose';

const prisma = new PrismaClient();

export interface OrganizationData {
  id: string;
  name: string;
  type: string;
  industry: string;
  size?: string;
  employeeCount: number;
  activeEmployees: number;
  departments: string[];
  departmentStats: {
    [department: string]: {
      count: number;
      positions: string[];
    };
  };
  recentHires: number;
  turnoverRate: number;
  averageSalary?: number;
  totalPayroll?: number;
  modules: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: string;
  hireDate?: Date;
  salaryAmount?: number;
  employmentStatus: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  department?: string;
  userId?: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface MeetingData {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  organizerId: string;
  organizerName: string;
  attendees: string[];
  department?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location?: string;
  isVirtual: boolean;
  meetingUrl?: string;
}

export interface ProcurementData {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  requestedAmount: number;
  approvedAmount?: number;
  vendor?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface DepartmentSummary {
  department: string;
  employeeCount: number;
  activeEmployees: number;
  recentHires: number;
  turnoverRate: number;
  averageSalary?: number;
  pendingProcurements: number;
  upcomingMeetings: number;
  unreadNotifications: number;
  topPositions: string[];
  recentActivity: {
    type: 'hire' | 'termination' | 'procurement' | 'meeting' | 'notification';
    description: string;
    timestamp: Date;
  }[];
}

export interface ComprehensiveOrganizationData extends OrganizationData {
  notifications: NotificationData[];
  meetings: MeetingData[];
  procurements: ProcurementData[];
  departmentSummaries: DepartmentSummary[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: Date;
    department?: string;
  }[];
  alerts: {
    type: 'procurement' | 'meeting' | 'notification' | 'employee' | 'financial';
    message: string;
    priority: 'low' | 'medium' | 'high';
    department?: string;
  }[];
}

export class OrganizationDataService {
  /**
   * Get comprehensive organization data for AI insights
   */
  static async getOrganizationData(organizationId: string): Promise<OrganizationData> {
    try {
      // Get organization details from Prisma
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          users: {
            where: {
              role: { not: 'owner' }
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              position: true,
              role: true,
              status: true,
              hireDate: true,
              salaryAmount: true,
              createdAt: true
            }
          }
        }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Get employees from MongoDB HR collection
      const employees = await Employee.find({ 
        organizationId: new mongoose.Types.ObjectId(organizationId),
        role: { $ne: 'owner' }
      }).lean();

      // Combine users and employees
      const allEmployees = [
        ...organization.users.map((user: any) => ({
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          department: user.department || 'Unknown',
          position: user.position || 'Unknown',
          role: user.role,
          status: user.status || 'active',
          hireDate: user.hireDate,
          salaryAmount: user.salaryAmount,
          employmentStatus: 'active',
          source: 'prisma'
        })),
        ...employees.map((emp: any) => ({
          id: (emp._id as mongoose.Types.ObjectId).toString(),
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          department: emp.department || 'Unknown',
          position: emp.position || emp.designation || 'Unknown',
          role: emp.role || 'employee',
          status: emp.employmentStatus || 'active',
          hireDate: emp.employmentDate,
          salaryAmount: emp.salary?.amount,
          employmentStatus: emp.employmentStatus || 'active',
          source: 'mongodb'
        }))
      ];

      // Calculate statistics
      const totalEmployees = allEmployees.length;
      const activeEmployees = allEmployees.filter(emp => emp.status === 'active').length;
      
      // Department statistics
      const departmentStats: { [key: string]: { count: number; positions: string[] } } = {};
      const departments = new Set<string>();
      
      allEmployees.forEach(emp => {
        const dept = emp.department;
        departments.add(dept);
        
        if (!departmentStats[dept]) {
          departmentStats[dept] = { count: 0, positions: [] };
        }
        
        departmentStats[dept].count++;
        if (emp.position && !departmentStats[dept].positions.includes(emp.position)) {
          departmentStats[dept].positions.push(emp.position);
        }
      });

      // Calculate recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHires = allEmployees.filter(emp => 
        emp.hireDate && new Date(emp.hireDate) > thirtyDaysAgo
      ).length;

      // Calculate turnover rate (employees who left in last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const terminatedEmployees = allEmployees.filter(emp => 
        emp.status === 'terminated' && emp.hireDate && new Date(emp.hireDate) > ninetyDaysAgo
      ).length;
      const turnoverRate = totalEmployees > 0 ? (terminatedEmployees / totalEmployees) * 100 : 0;

      // Calculate salary statistics
      const employeesWithSalary = allEmployees.filter(emp => emp.salaryAmount);
      const averageSalary = employeesWithSalary.length > 0 
        ? employeesWithSalary.reduce((sum, emp) => sum + (emp.salaryAmount || 0), 0) / employeesWithSalary.length
        : undefined;
      
      const totalPayroll = employeesWithSalary.reduce((sum, emp) => sum + (emp.salaryAmount || 0), 0);

      return {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        industry: organization.industry,
        size: organization.size || undefined,
        employeeCount: totalEmployees,
        activeEmployees,
        departments: Array.from(departments).filter(Boolean),
        departmentStats,
        recentHires,
        turnoverRate,
        averageSalary,
        totalPayroll,
        modules: organization.activeModules || [],
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt
      };
    } catch (error) {
      console.error('Error fetching organization data:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive organization data including notifications, meetings, and procurements
   */
  static async getComprehensiveOrganizationData(organizationId: string): Promise<ComprehensiveOrganizationData> {
    try {
      // Get basic organization data
      const baseData = await this.getOrganizationData(organizationId);

      // Get notifications (from Prisma or your notification system)
      const notifications = await this.getNotifications(organizationId);

      // Get meetings (from your meeting system)
      const meetings = await this.getMeetings(organizationId);

      // Get procurements (from your procurement system)
      const procurements = await this.getProcurements(organizationId);

      // Generate department summaries
      const departmentSummaries = await this.generateDepartmentSummaries(
        organizationId,
        baseData,
        notifications,
        meetings,
        procurements
      );

      // Generate recent activity
      const recentActivity = await this.generateRecentActivity(
        organizationId,
        notifications,
        meetings,
        procurements
      );

      // Generate alerts
      const alerts = await this.generateAlerts(
        baseData,
        notifications,
        meetings,
        procurements
      );

      return {
        ...baseData,
        notifications,
        meetings,
        procurements,
        departmentSummaries,
        recentActivity,
        alerts
      };
    } catch (error) {
      console.error('Error fetching comprehensive organization data:', error);
      throw error;
    }
  }

  /**
   * Get notifications for the organization
   */
  private static async getNotifications(organizationId: string): Promise<NotificationData[]> {
    try {
      // Fetch real notifications from the database
      const notifications = await prisma.notification.findMany({
        where: {
          organizationId: organizationId
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              department: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit to recent notifications
      });

      return notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as 'info' | 'warning' | 'error' | 'success',
        priority: notification.priority as 'low' | 'medium' | 'high',
        department: notification.user?.department === null ? undefined : notification.user?.department,
        userId: notification.userId,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        expiresAt: undefined // Not stored in current schema
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get meetings for the organization
   */
  private static async getMeetings(organizationId: string): Promise<MeetingData[]> {
    try {
      // Fetch real meetings from the database
      const meetings = await prisma.meeting.findMany({
        where: {
          organizationId: organizationId
        },
        include: {
          organizer: {
            select: {
              firstName: true,
              lastName: true,
              department: true
            }
          },
          attendees: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  department: true
                }
              }
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        take: 50 // Limit to recent meetings
      });

      return meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description || '',
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        organizerId: meeting.organizerId,
        organizerName: `${meeting.organizer.firstName || ''} ${meeting.organizer.lastName || ''}`.trim(),
        attendees: meeting.attendees.map(attendee => attendee.userId),
        department: meeting.organizer.department === null ? undefined : meeting.organizer.department,
        status: meeting.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
        location: meeting.location || undefined,
        isVirtual: meeting.isVirtual,
        meetingUrl: meeting.meetingUrl || undefined
      }));
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return [];
    }
  }

  /**
   * Get procurements for the organization
   */
  private static async getProcurements(organizationId: string): Promise<ProcurementData[]> {
    try {
      // Fetch real procurement requests from the database
      const procurements = await prisma.procurementRequest.findMany({
        where: {
          organizationId: organizationId
        },
        include: {
          requester: {
            select: {
              firstName: true,
              lastName: true,
              department: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit to recent procurements
      });

      return procurements.map(procurement => ({
        id: procurement.id,
        title: procurement.title,
        description: procurement.description,
        requesterId: procurement.requesterId,
        requesterName: `${procurement.requester.firstName || ''} ${procurement.requester.lastName || ''}`.trim(),
        department: procurement.requester.department || procurement.departments[0] || 'Unknown',
        status: procurement.status as 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed',
        priority: procurement.priority as 'low' | 'medium' | 'high',
        budget: procurement.estimatedCost || 0,
        requestedAmount: procurement.estimatedCost || 0,
        approvedAmount: undefined, // Not stored in current schema
        vendor: procurement.preferredSupplier || undefined,
        category: procurement.category,
        createdAt: procurement.createdAt,
        updatedAt: procurement.updatedAt,
        dueDate: procurement.expectedDeliveryDate || undefined
      }));
    } catch (error) {
      console.error('Error fetching procurements:', error);
      return [];
    }
  }

  /**
   * Generate department summaries
   */
  private static async generateDepartmentSummaries(
    organizationId: string,
    baseData: OrganizationData,
    notifications: NotificationData[],
    meetings: MeetingData[],
    procurements: ProcurementData[]
  ): Promise<DepartmentSummary[]> {
    const summaries: DepartmentSummary[] = [];

    for (const dept of baseData.departments) {
      const deptStats = baseData.departmentStats[dept];
      const deptNotifications = notifications.filter(n => n.department === dept);
      const deptMeetings = meetings.filter(m => m.department === dept);
      const deptProcurements = procurements.filter(p => p.department === dept);

      const summary: DepartmentSummary = {
        department: dept,
        employeeCount: deptStats.count,
        activeEmployees: deptStats.count, // Assuming all are active for now
        recentHires: 0, // Would need to calculate from employee data
        turnoverRate: 0, // Would need to calculate from employee data
        averageSalary: undefined, // Would need to calculate from employee data
        pendingProcurements: deptProcurements.filter(p => p.status === 'pending').length,
        upcomingMeetings: deptMeetings.filter(m => 
          m.status === 'scheduled' && m.startTime > new Date()
        ).length,
        unreadNotifications: deptNotifications.filter(n => !n.isRead).length,
        topPositions: deptStats.positions.slice(0, 5),
        recentActivity: []
      };

      summaries.push(summary);
    }

    return summaries;
  }

  /**
   * Generate recent activity
   */
  private static async generateRecentActivity(
    organizationId: string,
    notifications: NotificationData[],
    meetings: MeetingData[],
    procurements: ProcurementData[]
  ): Promise<ComprehensiveOrganizationData['recentActivity']> {
    const activities: ComprehensiveOrganizationData['recentActivity'] = [];

    // Add notification activities
    notifications.forEach(notification => {
      activities.push({
        type: 'notification',
        description: notification.title,
        timestamp: notification.createdAt,
        department: notification.department
      });
    });

    // Add meeting activities
    meetings.forEach(meeting => {
      activities.push({
        type: 'meeting',
        description: `${meeting.title} - ${meeting.organizerName}`,
        timestamp: meeting.startTime,
        department: meeting.department
      });
    });

    // Add procurement activities
    procurements.forEach(procurement => {
      activities.push({
        type: 'procurement',
        description: `${procurement.title} - ${procurement.requesterName}`,
        timestamp: procurement.createdAt,
        department: procurement.department
      });
    });

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate alerts based on data analysis
   */
  private static async generateAlerts(
    baseData: OrganizationData,
    notifications: NotificationData[],
    meetings: MeetingData[],
    procurements: ProcurementData[]
  ): Promise<ComprehensiveOrganizationData['alerts']> {
    const alerts: ComprehensiveOrganizationData['alerts'] = [];

    // High priority unread notifications
    const highPriorityUnread = notifications.filter(n => 
      !n.isRead && n.priority === 'high'
    );
    if (highPriorityUnread.length > 0) {
      alerts.push({
        type: 'notification',
        message: `${highPriorityUnread.length} high priority notifications require attention`,
        priority: 'high'
      });
    }

    // Pending procurements
    const pendingProcurements = procurements.filter(p => p.status === 'pending');
    if (pendingProcurements.length > 0) {
      alerts.push({
        type: 'procurement',
        message: `${pendingProcurements.length} procurement requests pending approval`,
        priority: pendingProcurements.some(p => p.priority === 'high') ? 'high' : 'medium'
      });
    }

    // Upcoming meetings
    const upcomingMeetings = meetings.filter(m => 
      m.status === 'scheduled' && 
      m.startTime > new Date() && 
      m.startTime < new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
    );
    if (upcomingMeetings.length > 0) {
      alerts.push({
        type: 'meeting',
        message: `${upcomingMeetings.length} meetings scheduled for today`,
        priority: 'medium'
      });
    }

    // Employee turnover alert
    if (baseData.turnoverRate > 10) {
      alerts.push({
        type: 'employee',
        message: `High turnover rate of ${baseData.turnoverRate.toFixed(1)}% detected`,
        priority: 'high'
      });
    }

    return alerts;
  }

  /**
   * Get employee data for specific analysis
   */
  static async getEmployeeData(organizationId: string, filters?: {
    department?: string;
    status?: string;
    role?: string;
  }): Promise<EmployeeData[]> {
    try {
      // Build query
      const query: any = { organizationId: new mongoose.Types.ObjectId(organizationId) };
      
      if (filters?.department) {
        query.department = filters.department;
      }
      if (filters?.status) {
        query.employmentStatus = filters.status;
      }
      if (filters?.role) {
        query.role = filters.role;
      }

      // Get employees from MongoDB
      const employees = await Employee.find(query).lean();

      return employees.map((emp: any) => ({
        id: (emp._id as mongoose.Types.ObjectId).toString(),
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        department: emp.department || 'Unknown',
        position: emp.position || emp.designation || 'Unknown',
        role: emp.role || 'employee',
        status: emp.employmentStatus || 'active',
        hireDate: emp.employmentDate,
        salaryAmount: emp.salary?.amount,
        employmentStatus: emp.employmentStatus || 'active'
      }));
    } catch (error) {
      console.error('Error fetching employee data:', error);
      throw error;
    }
  }

  /**
   * Get department-specific statistics
   */
  static async getDepartmentStats(organizationId: string, department: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    positions: string[];
    averageSalary?: number;
    recentHires: number;
    turnoverRate: number;
  }> {
    try {
      const employees = await Employee.find({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        department: department
      }).lean();

      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => emp.employmentStatus === 'active').length;
      
      // Calculate recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHires = employees.filter(emp => 
        emp.employmentDate && new Date(emp.employmentDate) > thirtyDaysAgo
      ).length;

      // Calculate turnover rate
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const terminatedEmployees = employees.filter(emp => 
        emp.employmentStatus === 'terminated' && 
        emp.employmentDate && 
        new Date(emp.employmentDate) > ninetyDaysAgo
      ).length;
      const turnoverRate = totalEmployees > 0 ? (terminatedEmployees / totalEmployees) * 100 : 0;

      // Calculate average salary
      const employeesWithSalary = employees.filter(emp => emp.salary?.amount);
      const averageSalary = employeesWithSalary.length > 0 
        ? employeesWithSalary.reduce((sum, emp) => sum + (emp.salary.amount || 0), 0) / employeesWithSalary.length
        : undefined;

      // Get unique positions
      const allPositions = employees.map(emp => emp.position || emp.designation).filter(Boolean);
      const positions = allPositions.filter((position, index) => allPositions.indexOf(position) === index);

      return {
        totalEmployees,
        activeEmployees,
        positions,
        averageSalary,
        recentHires,
        turnoverRate
      };
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  }

  /**
   * Get financial data for the organization
   */
  static async getFinancialData(organizationId: string): Promise<{
    totalPayroll: number;
    averageSalary: number;
    salaryDistribution: { [range: string]: number };
    departmentBudgets?: { [department: string]: number };
  }> {
    try {
      // Get all employees with salary data
      const employees = await Employee.find({
        organizationId: new mongoose.Types.ObjectId(organizationId)
      }).lean();

      const employeesWithSalary = employees.filter(emp => emp.salary?.amount);
      const totalPayroll = employeesWithSalary.reduce((sum, emp) => sum + (emp.salary.amount || 0), 0);
      const averageSalary = employeesWithSalary.length > 0 
        ? totalPayroll / employeesWithSalary.length
        : 0;

      // Calculate salary distribution
      const salaryDistribution: { [range: string]: number } = {
        '0-50k': 0,
        '50k-100k': 0,
        '100k-150k': 0,
        '150k+': 0
      };

      employeesWithSalary.forEach(emp => {
        const salary = emp.salary.amount;
        if (salary < 50000) salaryDistribution['0-50k']++;
        else if (salary < 100000) salaryDistribution['50k-100k']++;
        else if (salary < 150000) salaryDistribution['100k-150k']++;
        else salaryDistribution['150k+']++;
      });

      return {
        totalPayroll,
        averageSalary,
        salaryDistribution
      };
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }
  }
} 