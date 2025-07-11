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
      
      const positions = Array.from(new Set(employees.map((emp: any) => emp.position || emp.designation).filter(Boolean)));
      
      const employeesWithSalary = employees.filter(emp => emp.salary?.amount);
      const averageSalary = employeesWithSalary.length > 0
        ? employeesWithSalary.reduce((sum, emp) => sum + (emp.salary?.amount || 0), 0) / employeesWithSalary.length
        : undefined;

      // Recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHires = employees.filter(emp => 
        emp.employmentDate && new Date(emp.employmentDate) > thirtyDaysAgo
      ).length;

      // Turnover rate
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const terminatedEmployees = employees.filter(emp => 
        emp.employmentStatus === 'terminated' && emp.employmentDate && new Date(emp.employmentDate) > ninetyDaysAgo
      ).length;
      const turnoverRate = totalEmployees > 0 ? (terminatedEmployees / totalEmployees) * 100 : 0;

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
      const employees = await Employee.find({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        employmentStatus: 'active'
      }).lean();

      const salaries = employees
        .map(emp => emp.salary?.amount)
        .filter(salary => salary && salary > 0);

      const totalPayroll = salaries.reduce((sum, salary) => sum + (salary || 0), 0);
      const averageSalary = salaries.length > 0 ? totalPayroll / salaries.length : 0;

      // Salary distribution
      const salaryDistribution: { [range: string]: number } = {
        '0-25000': 0,
        '25001-50000': 0,
        '50001-75000': 0,
        '75001-100000': 0,
        '100001+': 0
      };

      salaries.forEach(salary => {
        if (salary <= 25000) salaryDistribution['0-25000']++;
        else if (salary <= 50000) salaryDistribution['25001-50000']++;
        else if (salary <= 75000) salaryDistribution['50001-75000']++;
        else if (salary <= 100000) salaryDistribution['75001-100000']++;
        else salaryDistribution['100001+']++;
      });

      // Department budgets (estimated based on average salary)
      const departmentBudgets: { [department: string]: number } = {};
      const departmentEmployees: { [department: string]: number } = {};

      employees.forEach(emp => {
        const dept = emp.department || 'Unknown';
        departmentEmployees[dept] = (departmentEmployees[dept] || 0) + 1;
      });

      Object.keys(departmentEmployees).forEach(dept => {
        const deptEmployees = employees.filter(emp => emp.department === dept);
        const deptSalaries = deptEmployees
          .map(emp => emp.salary?.amount)
          .filter(salary => salary && salary > 0);
        
        const deptAverageSalary = deptSalaries.length > 0
          ? deptSalaries.reduce((sum, salary) => sum + (salary || 0), 0) / deptSalaries.length
          : averageSalary;
        
        departmentBudgets[dept] = deptEmployees.length * deptAverageSalary;
      });

      return {
        totalPayroll,
        averageSalary,
        salaryDistribution,
        departmentBudgets
      };
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }
  }
} 