import { Express } from 'express';
import User from '../models/User';
import { Employee } from '../mongodb/models/hr';

export class EmployeeService {
  static async getAllEmployees(organizationId: string) {
    return Employee.find({ organizationId }).sort({ lastName: 1 });
  }

  static async getEmployeeById(id: string) {
    return User.findById(id).select('-password');
  }

  static async createEmployee(data: any, user: Express.User) {
    const employee = new Employee({
      ...data,
      organizationId: user.organizationId,
      createdBy: user.id
    });
    return employee.save();
  }

  static async updateEmployee(id: string, data: any, user: Express.User) {
    return Employee.findOneAndUpdate(
      { _id: id, organizationId: user.organizationId },
      {
        ...data,
        updatedBy: user.id,
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  static async deleteEmployee(id: string, organizationId: string) {
    return Employee.findOneAndDelete({ _id: id, organizationId });
  }

  static async getEmployeeAttendance(id: string, organizationId: string) {
    return Employee.findById(id)
      .select('attendance')
      .where('organizationId').equals(organizationId);
  }

  static async getEmployeePayroll(id: string, organizationId: string) {
    return Employee.findById(id)
      .select('payroll')
      .where('organizationId').equals(organizationId);
  }

  static async searchEmployees(query: string, organizationId: string) {
    return Employee.find({
      organizationId,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { employeeNumber: { $regex: query, $options: 'i' } }
      ]
    });
  }

  static async getEmployeesByDepartment(department: string, organizationId: string) {
    return Employee.find({ department, organizationId });
  }

  static async getEmployeesByStatus(status: string, organizationId: string) {
    return Employee.find({ employmentStatus: status, organizationId });
  }

  static async getEmployeesByContractType(contractType: string, organizationId: string) {
    return Employee.find({ contractType, organizationId });
  }

  static async getEmployeesByDateRange(startDate: Date, endDate: Date, organizationId: string) {
    return Employee.find({
      organizationId,
      employmentDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  static async getEmployeesByOrganization(organizationId: string) {
    return User.find({ organizationId }).select('-password');
  }
} 