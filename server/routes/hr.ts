// @ts-nocheck
// Temporary TypeScript suppression until Prisma client is regenerated

import express, { Request, Response, NextFunction } from 'express';
import { Employee, Attendance, Payroll } from '../mongodb/models/hr';
import { isAuthenticated } from '../middleware/auth';
import { checkModuleAccess } from '../middleware/module-access';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Test endpoint to check if HR routes are working
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'HR routes are working' });
});

// Payroll settings schema
const payrollSettingsSchema = z.object({
  taxRate: z.number().min(0).max(50),
  benefitsRate: z.number().min(0).max(20),
  overtimeRate: z.number().min(1).max(3),
  currency: z.string(),
  paymentFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
  autoProcess: z.boolean(),
  requireApproval: z.boolean(),
  deductions: z.object({
    healthInsurance: z.number().min(0).max(10),
    retirementPlan: z.number().min(0).max(10),
    lifeInsurance: z.number().min(0).max(5),
    otherDeductions: z.number().min(0).max(10)
  })
});

// Helper function to get user and organization from request
const getUserAndOrg = (req: any) => {
  console.log('getUserAndOrg called with req.user:', req.user);
  const user = req.user;
  const organizationId = user?.organizationId;
  
  if (!user || !organizationId) {
    console.error('User or organization not found. User:', user, 'organizationId:', organizationId);
    throw new Error('User or organization not found');
  }
  
  return { user, organizationId };
};

// Timesheet schemas
const createTimesheetSchema = z.object({
  userId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['active', 'paused', 'completed', 'stopped']).default('active'),
  type: z.enum(['task', 'project', 'meeting', 'break', 'training', 'other']).default('work')
});

const updateTimesheetSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['active', 'paused', 'completed', 'stopped']).optional(),
  type: z.enum(['task', 'project', 'meeting', 'break', 'training', 'other']).optional()
});

// Leave request schemas
const createLeaveRequestSchema = z.object({
  employeeId: z.string(),
  leaveType: z.enum(['paid', 'casual', 'sick', 'marriage', 'unpaid']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

const updateLeaveRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().optional()
});

// GET /api/hr/timesheets - Get all timesheets for organization
router.get('/timesheets', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    const timesheets = await prisma.timeTrackingEntry.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// POST /api/hr/timesheets - Create new timesheet entry
router.post('/timesheets', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    const validatedData = createTimesheetSchema.parse(req.body);
    
    const timesheet = await prisma.timeTrackingEntry.create({
      data: {
        userId: req.body.userId || user.id,
        organizationId,
        startTime: new Date(req.body.startTime),
        endTime: req.body.endTime ? new Date(req.body.endTime) : null,
        status: req.body.status || 'active',
        type: req.body.type || 'work'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(timesheet);
  } catch (error) {
    console.error('Error creating timesheet:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create timesheet' });
  }
});

// PUT /api/hr/timesheets/:id - Update timesheet entry
router.put('/timesheets/:id', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    const validatedData = updateTimesheetSchema.parse(req.body);
    
    const timesheet = await prisma.timeTrackingEntry.update({
      where: { id },
      data: {
        startTime: req.body.startTime ? new Date(req.body.startTime) : undefined,
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
        status: req.body.status,
        type: req.body.type
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(timesheet);
  } catch (error) {
    console.error('Error updating timesheet:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update timesheet' });
  }
});

// DELETE /api/hr/timesheets/:id - Delete timesheet entry
router.delete('/timesheets/:id', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    await prisma.timeTrackingEntry.delete({
      where: { id }
    });

    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    res.status(500).json({ error: 'Failed to delete timesheet' });
  }
});

// GET /api/hr/leave-requests - Get all leave requests for organization
router.get('/leave-requests', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Mock data for leave requests until we add the model to schema
    const leaveRequests = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'John Doe',
        leaveType: 'paid',
        startDate: '2024-03-15T00:00:00.000Z',
        endDate: '2024-03-17T00:00:00.000Z',
        reason: 'Family vacation',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Jane Smith',
        leaveType: 'sick',
        startDate: '2024-03-20T00:00:00.000Z',
        endDate: '2024-03-21T00:00:00.000Z',
        reason: 'Medical appointment',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// POST /api/hr/leave-requests - Create new leave request
router.post('/leave-requests', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    const validatedData = createLeaveRequestSchema.parse(req.body);
    
    // Mock creation until we add the model to schema
    const leaveRequest = {
      id: Date.now().toString(),
      ...validatedData,
      employeeName: 'Employee Name', // Would be fetched from user data
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// PUT /api/hr/leave-requests/:id - Update leave request status
router.put('/leave-requests/:id', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    const validatedData = updateLeaveRequestSchema.parse(req.body);
    
    // Mock update until we add the model to schema
    const leaveRequest = {
      id,
      employeeId: '1',
      employeeName: 'John Doe',
      leaveType: 'paid',
      startDate: '2024-03-15T00:00:00.000Z',
      endDate: '2024-03-17T00:00:00.000Z',
      reason: 'Family vacation',
      status: validatedData.status,
      notes: validatedData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json(leaveRequest);
  } catch (error) {
    console.error('Error updating leave request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update leave request' });
  }
});

// GET /api/hr/leave-balance - Get leave balance for organization
router.get('/leave-balance', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Mock leave balance data
    const leaveBalance = {
      paidLeave: 15,
      casualLeave: 10,
      sickLeave: 7,
      marriageLeave: 3,
      unpaidLeave: 30
    };

    res.json(leaveBalance);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
});

// Middleware to check if user is HR admin or owner
const isHRAdminOrOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== 'hr_admin' && !req.user.isOwner) {
    return res.status(403).json({ message: 'Access denied. HR admin or owner privileges required.' });
  }
  next();
};

// Get all employees (HR admin or owner only)
router.get('/employees', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Fetch users with login access from Prisma
    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        role: true,
        status: true,
        username: true,
        position: true,
        hireDate: true,
        salaryAmount: true,
        payoutMethod: true,
        currencyPreference: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Transform users to employee format
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status || 'active',
      position: user.position || 'Not specified',
      joinDate: user.hireDate ? user.hireDate.toISOString() : user.createdAt.toISOString(),
      isActive: user.status === 'active',
      canLogin: !!user.username,
      username: user.username,
      salaryAmount: user.salaryAmount,
      payoutMethod: user.payoutMethod,
      currencyPreference: user.currencyPreference,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      source: 'user' // Indicate this came from User model
    }));

    // Fetch employees without login access from MongoDB
    const employees = await Employee.find({ organizationId }).lean();
    
    // Transform employees to match the same format
    const transformedEmployees = employees.map((employee: any) => ({
      id: employee._id.toString(),
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      role: 'employee', // Default role for non-login employees
      status: employee.status || 'active',
      position: employee.position || 'Not specified',
      joinDate: employee.createdAt ? new Date(employee.createdAt).toISOString() : new Date().toISOString(),
      isActive: employee.status === 'active',
      canLogin: false, // These employees don't have login access
      username: null,
      salaryAmount: employee.salaryAmount || null,
      payoutMethod: employee.payoutMethod || null,
      currencyPreference: employee.currencyPreference || null,
      createdAt: new Date(employee.createdAt).toISOString(),
      updatedAt: new Date(employee.updatedAt).toISOString(),
      source: 'employee', // Indicate this came from Employee model
      employeeId: employee.employeeId
    }));

    // Combine both arrays
    const allEmployees = [...transformedUsers, ...transformedEmployees];

    console.log('Combined employees:', allEmployees);
    res.json(allEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID (HR admin, owner, or self)
router.get('/employees/:id', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    console.log('Individual employee endpoint called with ID:', req.params.id);
    console.log('Request user:', req.user);
    const { user, organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    // Allow HR admins, owners, or self
    const canView = user.role === 'hr_admin' || user.isOwner || user.id === id;
    console.log('User role:', user.role, 'isOwner:', user.isOwner, 'user.id:', user.id, 'requested id:', id, 'canView:', canView);
    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // First, try to find the employee in Prisma User model (employees with login)
    let employee = await prisma.user.findFirst({
      where: { 
        id: id,
        organizationId: organizationId 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        role: true,
        status: true,
        username: true,
        position: true,
        hireDate: true,
        salaryAmount: true,
        payoutMethod: true,
        currencyPreference: true,
        phoneNumber: true,
        employeeId: true,
        managerId: true,
        team: true,
        location: true,
        workSchedule: true,
        emergencyContact: true,
        skills: true,
        certifications: true,
        education: true,
        performance: true,
        compensation: true,
        benefits: true,
        equipment: true,
        accessLevels: true,
        documents: true,
        wallet: true,
        legalDetails: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    let source = 'user';
    
    // If not found in Prisma, try MongoDB Employee model (employees without login)
    if (!employee) {
      console.log('Employee not found in Prisma, checking MongoDB Employee model...');
      const mongoEmployee = await Employee.findOne({ 
        _id: id,
        organizationId: organizationId 
      }).lean();
      
      if (mongoEmployee) {
        employee = {
          id: mongoEmployee._id.toString(),
          firstName: mongoEmployee.firstName,
          lastName: mongoEmployee.lastName,
          email: mongoEmployee.email,
          department: mongoEmployee.department,
          role: 'employee', // Default role for non-login employees
          status: mongoEmployee.status || 'active',
          username: null, // No username for non-login employees
          position: mongoEmployee.position,
          hireDate: null,
          salaryAmount: mongoEmployee.salaryAmount || null,
          payoutMethod: mongoEmployee.payoutMethod || null,
          currencyPreference: mongoEmployee.currencyPreference || null,
          phoneNumber: mongoEmployee.phoneNumber || null,
          employeeId: mongoEmployee.employeeId,
          managerId: mongoEmployee.managerId || null,
          team: mongoEmployee.team || null,
          location: mongoEmployee.location || null,
          workSchedule: mongoEmployee.workSchedule || null,
          emergencyContact: mongoEmployee.emergencyContact || null,
          skills: mongoEmployee.skills || [],
          certifications: mongoEmployee.certifications || [],
          education: mongoEmployee.education || null,
          performance: mongoEmployee.performance || null,
          compensation: mongoEmployee.compensation || null,
          benefits: mongoEmployee.benefits || null,
          equipment: mongoEmployee.equipment || null,
          accessLevels: mongoEmployee.accessLevels || null,
          documents: mongoEmployee.documents || [],
          wallet: mongoEmployee.wallet || null,
          legalDetails: mongoEmployee.legalDetails || null,
          address: mongoEmployee.address || null,
          createdAt: mongoEmployee.createdAt,
          updatedAt: mongoEmployee.updatedAt
        };
        source = 'employee';
      }
    }
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Transform the data to match frontend expectations
    const transformedEmployee = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      status: employee.status,
      position: employee.position || 'Not specified',
      joinDate: employee.hireDate ? employee.hireDate.toISOString() : new Date(employee.createdAt).toISOString(),
      isActive: employee.status === 'active',
      canLogin: !!employee.username,
      username: employee.username,
      salaryAmount: employee.salaryAmount,
      payoutMethod: employee.payoutMethod,
      currencyPreference: employee.currencyPreference,
      phoneNumber: employee.phoneNumber,
      employeeId: employee.employeeId,
      managerId: employee.managerId,
      team: employee.team,
      location: employee.location,
      workSchedule: employee.workSchedule,
      emergencyContact: employee.emergencyContact,
      skills: employee.skills,
      certifications: employee.certifications,
      education: employee.education,
      performance: employee.performance,
      compensation: employee.compensation,
      benefits: employee.benefits,
      equipment: employee.equipment,
      accessLevels: employee.accessLevels,
      documents: employee.documents,
      wallet: employee.wallet,
      legalDetails: employee.legalDetails,
      address: employee.address,
      createdAt: new Date(employee.createdAt).toISOString(),
      updatedAt: new Date(employee.updatedAt).toISOString(),
      source: source // Indicate which model this came from
    };
    
    res.json(transformedEmployee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// Update employee (HR admin only)
router.put('/employees/:id', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
    try {
    const { user, organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    // First, try to update in Prisma User model (employees with login)
    let updatedEmployee = await prisma.user.updateMany({
      where: { 
        id: id,
        organizationId: organizationId 
      },
      data: req.body
    });
    
    let source = 'user';
    
    // If no rows were updated in Prisma, try MongoDB Employee model (employees without login)
    if (updatedEmployee.count === 0) {
      console.log('Employee not found in Prisma, updating in MongoDB Employee model...');
      const mongoEmployee = await Employee.findOneAndUpdate(
        { _id: id, organizationId: organizationId },
      { $set: req.body },
      { new: true }
      );
      
      if (mongoEmployee) {
        // Transform MongoDB employee to match the expected format
        updatedEmployee = {
          id: mongoEmployee._id.toString(),
          firstName: mongoEmployee.firstName,
          lastName: mongoEmployee.lastName,
          email: mongoEmployee.email,
          department: mongoEmployee.department,
          role: 'employee',
          status: mongoEmployee.status || 'active',
          username: null,
          position: mongoEmployee.position,
          hireDate: null,
          salaryAmount: mongoEmployee.salaryAmount || null,
          payoutMethod: mongoEmployee.payoutMethod || null,
          currencyPreference: mongoEmployee.currencyPreference || null,
          phoneNumber: mongoEmployee.phoneNumber || null,
          employeeId: mongoEmployee.employeeId,
          managerId: mongoEmployee.managerId || null,
          team: mongoEmployee.team || null,
          location: mongoEmployee.location || null,
          workSchedule: mongoEmployee.workSchedule || null,
          emergencyContact: mongoEmployee.emergencyContact || null,
          skills: mongoEmployee.skills || [],
          certifications: mongoEmployee.certifications || [],
          education: mongoEmployee.education || null,
          performance: mongoEmployee.performance || null,
          compensation: mongoEmployee.compensation || null,
          benefits: mongoEmployee.benefits || null,
          equipment: mongoEmployee.equipment || null,
          accessLevels: mongoEmployee.accessLevels || null,
          documents: mongoEmployee.documents || [],
          wallet: mongoEmployee.wallet || null,
          legalDetails: mongoEmployee.legalDetails || null,
          address: mongoEmployee.address || null,
          createdAt: mongoEmployee.createdAt,
          updatedAt: mongoEmployee.updatedAt
        };
        source = 'employee';
      } else {
      return res.status(404).json({ message: 'Employee not found' });
    }
    } else {
      // If updated in Prisma, fetch the updated user data
      const userData = await prisma.user.findFirst({
        where: { 
          id: id,
          organizationId: organizationId 
        }
      });
      
      if (userData) {
        updatedEmployee = userData;
      } else {
        return res.status(404).json({ message: 'Employee not found' });
      }
    }
    
    // Transform the data to match frontend expectations
    const transformedEmployee = {
      id: updatedEmployee.id,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      email: updatedEmployee.email,
      department: updatedEmployee.department,
      role: updatedEmployee.role,
      status: updatedEmployee.status,
      position: updatedEmployee.position || 'Not specified',
      joinDate: updatedEmployee.hireDate ? updatedEmployee.hireDate.toISOString() : new Date(updatedEmployee.createdAt).toISOString(),
      isActive: updatedEmployee.status === 'active',
      canLogin: !!updatedEmployee.username,
      username: updatedEmployee.username,
      salaryAmount: updatedEmployee.salaryAmount,
      payoutMethod: updatedEmployee.payoutMethod,
      currencyPreference: updatedEmployee.currencyPreference,
      phoneNumber: updatedEmployee.phoneNumber,
      employeeId: updatedEmployee.employeeId,
      managerId: updatedEmployee.managerId,
      team: updatedEmployee.team,
      location: updatedEmployee.location,
      workSchedule: updatedEmployee.workSchedule,
      emergencyContact: updatedEmployee.emergencyContact,
      skills: updatedEmployee.skills,
      certifications: updatedEmployee.certifications,
      education: updatedEmployee.education,
      performance: updatedEmployee.performance,
      compensation: updatedEmployee.compensation,
      benefits: updatedEmployee.benefits,
      equipment: updatedEmployee.equipment,
      accessLevels: updatedEmployee.accessLevels,
      documents: updatedEmployee.documents,
      wallet: updatedEmployee.wallet,
      legalDetails: updatedEmployee.legalDetails,
      address: updatedEmployee.address,
      createdAt: new Date(updatedEmployee.createdAt).toISOString(),
      updatedAt: new Date(updatedEmployee.updatedAt).toISOString(),
      source: source
    };

    res.json(transformedEmployee);
    } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
    }
});

// Delete employee (HR admin only)
router.delete('/employees/:id', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
    try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, organizationId: organizationId });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

// Get employee attendance
router.get('/employees/:id/attendance', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    let attendance = [];
    try {
      attendance = await Attendance.find({
        employeeId: req.params.id,
        organizationId: organizationId
      });
      if (!attendance) attendance = [];
    } catch (err) {
      console.error('Error fetching attendance:', err);
      attendance = [];
    }
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
});

// Record attendance
router.post('/attendance', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
    try {
    const { user, organizationId } = getUserAndOrg(req);
    const attendance = new Attendance({
      ...req.body,
        organizationId: organizationId
    });
    await attendance.save();
    res.status(201).json(attendance);
    } catch (error) {
    res.status(500).json({ message: 'Error recording attendance' });
  }
});

// Get employee payroll
router.get('/employees/:id/payroll', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    let payroll = [];
    try {
      payroll = await Payroll.find({
        employeeId: req.params.id,
        organizationId: organizationId
      });
      if (!payroll) payroll = [];
    } catch (err) {
      console.error('Error fetching payroll:', err);
      payroll = [];
    }
    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ message: 'Error fetching payroll' });
  }
});

// Create payroll record
router.post('/payroll', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
    try {
    const { user, organizationId } = getUserAndOrg(req);
      const payroll = new Payroll({
        ...req.body,
        organizationId: organizationId,
      createdAt: new Date()
      });
      await payroll.save();
      res.status(201).json(payroll);
    } catch (error) {
      res.status(500).json({ message: 'Error creating payroll record' });
    }
});

// Add disciplinary record (HR admin only)
router.post('/employees/:id/disciplinary', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: organizationId },
      {
        $push: {
          disciplinaryRecords: {
            ...req.body,
            reportedBy: user.id,
            status: 'Pending'
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error adding disciplinary record' });
  }
});

// Update disciplinary record status (HR admin only)
router.put('/employees/:id/disciplinary/:recordId', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: organizationId,
        'disciplinaryRecords._id': req.params.recordId
      },
      {
        $set: {
          'disciplinaryRecords.$.status': req.body.status,
          'disciplinaryRecords.$.approvedBy': user.id
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee or record not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating disciplinary record' });
  }
});

// Upload document (HR admin or self)
router.post('/employees/:id/documents', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    // Check if user is HR admin or uploading their own document
    const { user, organizationId } = getUserAndOrg(req);
    if (user.role !== 'hr_admin' && user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: organizationId },
      {
        $push: {
          documents: {
            ...req.body,
            uploadedBy: user.id,
            uploadedAt: new Date(),
            status: 'Pending'
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Approve document (HR admin only)
router.put('/employees/:id/documents/:docId', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
    try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: organizationId,
        'documents._id': req.params.docId
      },
      {
        $set: {
          'documents.$.status': req.body.status,
          'documents.$.approvedBy': user.id,
          'documents.$.approvedAt': new Date()
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee or document not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error approving document' });
  }
});

// Get employee competencies (HR admin or self)
router.get('/employees/:id/competencies', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOne({
      _id: req.params.id,
      organizationId: organizationId
    }).select('competencies');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Allow access if user is HR admin or viewing their own competencies
    if (user.role !== 'hr_admin' && user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee.competencies || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching competencies' });
  }
});

// Update employee competencies (HR admin only)
router.put('/employees/:id/competencies', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: organizationId },
      { $set: { competencies: req.body } },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating competencies' });
      }
});

// Match competencies to job requirements (HR admin only)
router.post('/employees/match-competencies', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const { jobRequirements } = req.body;
    const employees: any[] = await Employee.find({
      organizationId: organizationId,
      'competencies.name': { $in: jobRequirements.skills }
    }).select('firstName lastName competencies');

    const matches: { employee: any; score: number }[] = employees.map((employee: any) => ({
      employee,
      score: calculateMatchScore(employee.competencies, jobRequirements.skills)
    }));

    matches.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error matching competencies' });
  }
});

// Helper function to calculate match score
function calculateMatchScore(competencies: any[] | undefined, requirements: string[]): number {
  if (!competencies) return 0;
  
  const requiredSkills = new Set(requirements);
  let score = 0;
  
  competencies.forEach((comp: any) => {
    if (requiredSkills.has(comp.name)) {
      // Convert string level to numeric score
      score += 1;
    }
  });
  
  return score;
}

// Get employee dependents (HR admin or self)
router.get('/employees/:id/dependents', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    // Allow HR admins to view any employee's dependents, or users to view their own
    const { user, organizationId } = getUserAndOrg(req);
    if (!user || (user.role !== 'hr_admin' && user.id !== req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await Employee.findById(req.params.id)
      .select('children');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      dependents: employee.children || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dependents' });
  }
});

// Add dependent (HR admin only)
router.post('/employees/:id/dependents', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if adding dependent exceeds the limit
    const maxDependents = 5; // Default value since dependentPolicy does not exist
    if ((employee.children?.length || 0) >= maxDependents) {
      return res.status(400).json({ message: 'Maximum number of dependents reached' });
    }

    // Validate dependent age for children
    if (req.body.relationship === 'Child') {
      const maxChildAge = employee.dependentPolicy?.maxChildAge || 18;
      const age = new Date().getFullYear() - new Date(req.body.dateOfBirth).getFullYear();
      if (age > maxChildAge) {
        return res.status(400).json({ message: 'Child exceeds maximum age limit' });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          children: {
            ...req.body,
            status: 'Active',
            lastVerifiedAt: new Date(),
            verifiedBy: user.id
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error adding dependent' });
  }
});

// Update dependent (HR admin only)
router.put('/employees/:id/dependents/:dependentId', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        'children._id': req.params.dependentId
      },
      {
        $set: {
          'children.$': {
            ...req.body,
            lastVerifiedAt: new Date(),
            verifiedBy: user.id
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee or dependent not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating dependent' });
  }
});

// Delete dependent (HR admin only)
router.delete('/employees/:id/dependents/:dependentId', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          children: { _id: req.params.dependentId }
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Dependent removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing dependent' });
  }
});

// Upload dependent document (HR admin only)
router.post('/employees/:id/dependents/:dependentId/documents', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndUpdate(
        {
          _id: req.params.id,
        'children._id': req.params.dependentId
      },
      {
        $push: {
          'children.$.documents': {
            ...req.body,
            uploadedAt: new Date(),
            uploadedBy: user.id,
            status: 'Approved',
            approvedBy: user.id,
            approvedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee or dependent not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Update dependent entitlements (HR admin only)
router.put('/employees/:id/dependent-entitlements', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dependentEntitlements: {
            ...req.body,
            lastUpdated: new Date(),
            updatedBy: user.id
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating entitlements' });
  }
});

// Update dependent policy (HR admin only)
router.put('/employees/:id/dependent-policy', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dependentPolicy: {
            ...req.body,
            lastUpdated: new Date(),
            updatedBy: user.id
          }
        }
        },
        { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
      }

    res.json(employee);
    } catch (error) {
    res.status(500).json({ message: 'Error updating policy' });
  }
});

// Verify dependent eligibility (HR admin only)
router.post('/employees/:id/dependents/:dependentId/verify', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        'children._id': req.params.dependentId
      },
      {
        $set: {
          'children.$.status': 'Active',
          'children.$.lastVerifiedAt': new Date(),
          'children.$.verifiedBy': user.id,
          'children.$.notes': req.body.notes
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee or dependent not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying dependent' });
    }
});

// Get all payroll records (HR admin or owner only)
router.get('/payroll', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const payroll = await Payroll.find({
      organizationId: organizationId
    });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payroll records' });
  }
});

// Get all attendance records (HR admin or owner only)
router.get('/attendance', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const attendance = await Attendance.find({
      organizationId: organizationId
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get leave requests
router.get('/leave-requests', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Fetch real leave requests from database using AbsenceRecord model
    const AbsenceRecord = require('../mongodb/models/hr').AbsenceRecord;
    const leaveRequests = await AbsenceRecord.find({
      organizationId: organizationId,
      type: { $in: ['ANNUAL', 'SICKNESS', 'STUDY', 'COMPASSIONATE', 'DEPENDENT', 'CAREER_BREAK', 'UNPAID'] }
    })
    .populate('employeeId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Transform to match frontend expectations
    const transformedRequests = leaveRequests.map((request: any) => ({
      id: request._id.toString(),
      employeeName: request.employeeId ? `${request.employeeId.firstName} ${request.employeeId.lastName}` : 'Unknown Employee',
      startDate: request.startDate.toISOString().split('T')[0],
      endDate: request.endDate.toISOString().split('T')[0],
      leaveType: request.type.toLowerCase(),
      status: request.status.toLowerCase(),
      reason: request.reason,
      duration: request.duration
    }));
    
    res.json(transformedRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
});

// Get holidays
router.get('/holidays', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // For now, return sample holidays since we don't have a holidays collection
    // In a real implementation, you'd have a Holidays collection
    const holidays = [
      { id: '1', name: 'New Year\'s Day', date: '2024-01-01', type: 'public' },
      { id: '2', name: 'Christmas Day', date: '2024-12-25', type: 'public' },
      { id: '3', name: 'Company Anniversary', date: '2024-06-15', type: 'company' },
      { id: '4', name: 'Independence Day', date: '2024-07-04', type: 'public' },
      { id: '5', name: 'Thanksgiving', date: '2024-11-28', type: 'public' }
    ];
    
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Error fetching holidays' });
  }
});

// Get birthdays for current month
router.get('/birthdays', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get real employees and filter for current month birthdays
    const employees = await Employee.find({
      organizationId: organizationId,
      role: { $ne: 'owner' },
      dateOfBirth: { $exists: true, $ne: null }
    }).select('firstName lastName dateOfBirth department');
    
    const currentMonth = new Date().getMonth();
    const birthdays = employees
      .filter(emp => emp.dateOfBirth && new Date(emp.dateOfBirth).getMonth() === currentMonth)
      .map(emp => ({
        id: emp._id.toString(),
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date: emp.dateOfBirth.toISOString().split('T')[0],
        department: emp.department
      }));
    
    res.json(birthdays);
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    res.status(500).json({ message: 'Error fetching birthdays' });
  }
});

// Get work anniversaries for current month
router.get('/work-anniversaries', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get real employees and filter for current month anniversaries
    const employees = await Employee.find({
      organizationId: organizationId,
      role: { $ne: 'owner' },
      employmentDate: { $exists: true, $ne: null }
    }).select('firstName lastName employmentDate department');
    
    const currentMonth = new Date().getMonth();
    const anniversaries = employees
      .filter(emp => emp.employmentDate && new Date(emp.employmentDate).getMonth() === currentMonth)
      .map(emp => {
        const hireDate = new Date(emp.employmentDate);
        const yearsCompleted = new Date().getFullYear() - hireDate.getFullYear();
        return {
          id: emp._id.toString(),
          employeeName: `${emp.firstName} ${emp.lastName}`,
          date: emp.employmentDate.toISOString().split('T')[0],
          yearsCompleted,
          department: emp.department
        };
      });
    
    res.json(anniversaries);
  } catch (error) {
    console.error('Error fetching work anniversaries:', error);
    res.status(500).json({ message: 'Error fetching work anniversaries' });
  }
});

// Get leave balance
router.get('/leave-balance', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Fetch real leave entitlements from database
    const LeaveEntitlement = require('../mongodb/models/hr').LeaveEntitlement;
    const currentYear = new Date().getFullYear();
    
    const entitlements = await LeaveEntitlement.find({
      organizationId: organizationId,
      year: currentYear
    });
    
    // Calculate totals
    const leaveBalance = {
      paidLeave: 0,
      casualLeave: 0,
      sickLeave: 0,
      marriageLeave: 0,
      unpaidLeave: 0,
      totalLeave: 0,
      usedLeave: 0,
      remainingLeave: 0
    };
    
    entitlements.forEach((entitlement: any) => {
      const type = entitlement.type.toLowerCase();
      if (type === 'annual') {
        leaveBalance.paidLeave += entitlement.totalDays;
        leaveBalance.usedLeave += entitlement.usedDays;
      } else if (type === 'sick') {
        leaveBalance.sickLeave += entitlement.totalDays;
        leaveBalance.usedLeave += entitlement.usedDays;
      } else if (type === 'study') {
        leaveBalance.casualLeave += entitlement.totalDays;
        leaveBalance.usedLeave += entitlement.usedDays;
      }
      
      leaveBalance.totalLeave += entitlement.totalDays;
      leaveBalance.remainingLeave += entitlement.remainingDays;
    });
    
    res.json(leaveBalance);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ message: 'Error fetching leave balance' });
  }
});

// Get HR notifications and activities
router.get('/notifications', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get real notifications based on actual data
    const notifications: Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
      status: string;
      priority: string;
    }> = [];
    
    // Check for pending leave requests
    const AbsenceRecord = require('../mongodb/models/hr').AbsenceRecord;
    const pendingLeaveRequests = await AbsenceRecord.find({
      organizationId: organizationId,
      status: 'PENDING'
    })
    .populate('employeeId', 'firstName lastName')
    .limit(5);
    
    pendingLeaveRequests.forEach((request: any, index: number) => {
      notifications.push({
        id: `leave_${index}`,
        type: 'leave_request',
        message: `New ${request.type.toLowerCase()} leave request from ${request.employeeId ? `${request.employeeId.firstName} ${request.employeeId.lastName}` : 'Employee'}`,
        timestamp: request.createdAt.toISOString(),
        status: 'unread',
        priority: 'medium'
      });
    });
    
    // Check for upcoming birthdays
    const currentDate = new Date();
    const upcomingBirthdays = await Employee.find({
      organizationId: organizationId,
      role: { $ne: 'owner' },
      dateOfBirth: { $exists: true, $ne: null },
      $expr: {
        $and: [
          { $eq: [{ $month: '$dateOfBirth' }, currentDate.getMonth() + 1] },
          { $gte: [{ $dayOfMonth: '$dateOfBirth' }, currentDate.getDate()] }
        ]
      }
    }).limit(3);
    
    upcomingBirthdays.forEach((employee: any, index: number) => {
      notifications.push({
        id: `birthday_${index}`,
        type: 'birthday',
        message: `Upcoming birthday: ${employee.firstName} ${employee.lastName} on ${employee.dateOfBirth.toISOString().split('T')[0]}`,
        timestamp: new Date().toISOString(),
        status: 'unread',
        priority: 'low'
      });
    });
    
    // Check for upcoming work anniversaries
    const upcomingAnniversaries = await Employee.find({
      organizationId: organizationId,
      role: { $ne: 'owner' },
      employmentDate: { $exists: true, $ne: null },
      $expr: {
        $and: [
          { $eq: [{ $month: '$employmentDate' }, currentDate.getMonth() + 1] },
          { $gte: [{ $dayOfMonth: '$employmentDate' }, currentDate.getDate()] }
        ]
      }
    }).limit(3);
    
    upcomingAnniversaries.forEach((employee: any, index: number) => {
      const yearsCompleted = currentDate.getFullYear() - employee.employmentDate.getFullYear();
      notifications.push({
        id: `anniversary_${index}`,
        type: 'anniversary',
        message: `${employee.firstName} ${employee.lastName} will complete ${yearsCompleted} years with the company`,
        timestamp: new Date().toISOString(),
        status: 'unread',
        priority: 'high'
      });
    });
    
    // Sort by timestamp and return
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(notifications.slice(0, 10));
  } catch (error) {
    console.error('Error fetching HR notifications:', error);
    res.status(500).json({ message: 'Error fetching HR notifications' });
  }
});

// Get HR activity logs
router.get('/activity-logs', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get real activity logs from AbsenceRecord and Employee changes
    const AbsenceRecord = require('../mongodb/models/hr').AbsenceRecord;
    
    // Get recent leave activities
    const recentLeaveActivities = await AbsenceRecord.find({
      organizationId: organizationId
    })
    .populate('employeeId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Get recent employee changes (new hires, status changes, etc.)
    const recentEmployeeChanges = await Employee.find({
      organizationId: organizationId,
      role: { $ne: 'owner' }
    })
    .sort({ updatedAt: -1 })
    .limit(5);
    
    // Combine and format activity logs
    const activityLogs: Array<{
      id: string;
      action: string;
      description: string;
      user: string;
      timestamp: string;
      details: any;
    }> = [];
    
    // Add leave activities
    recentLeaveActivities.forEach((activity: any) => {
      activityLogs.push({
        id: activity._id.toString(),
        action: 'leave_request',
        description: `${activity.employeeId ? `${activity.employeeId.firstName} ${activity.employeeId.lastName}` : 'Employee'} submitted ${activity.type.toLowerCase()} leave request`,
        user: activity.employeeId ? `${activity.employeeId.firstName} ${activity.employeeId.lastName}` : 'Unknown',
        timestamp: activity.createdAt.toISOString(),
        details: { 
          employeeId: activity.employeeId?._id.toString(),
          leaveType: activity.type,
          duration: activity.duration,
          status: activity.status
        }
      });
    });
    
    // Add employee activities
    recentEmployeeChanges.forEach((employee: any) => {
      activityLogs.push({
        id: employee._id.toString(),
        action: 'employee_updated',
        description: `Employee ${employee.firstName} ${employee.lastName} information updated`,
        user: 'HR System',
        timestamp: employee.updatedAt.toISOString(),
        details: { 
          employeeId: employee._id.toString(),
          department: employee.department,
          status: employee.employmentStatus
        }
      });
    });
    
    // Sort by timestamp and limit to 15 most recent
    activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(activityLogs.slice(0, 15));
  } catch (error) {
    console.error('Error fetching HR activity logs:', error);
    res.status(500).json({ message: 'Error fetching HR activity logs' });
  }
});

// Get HR dashboard summary
router.get('/dashboard-summary', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get real employee count
    const totalEmployees = await Employee.countDocuments({
      organizationId: organizationId,
      role: { $ne: 'owner' }
    });
    
    // Get active employees
    const activeEmployees = await Employee.countDocuments({
      organizationId: organizationId,
      role: { $ne: 'owner' },
      employmentStatus: 'active'
    });
    
    // Get pending leave requests
    const AbsenceRecord = require('../mongodb/models/hr').AbsenceRecord;
    const pendingLeaveRequests = await AbsenceRecord.countDocuments({
      organizationId: organizationId,
      status: 'PENDING'
    });
    
    // Get upcoming birthdays (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingBirthdays = await Employee.countDocuments({
      organizationId: organizationId,
      role: { $ne: 'owner' },
      dateOfBirth: { $exists: true, $ne: null },
      $expr: {
        $and: [
          { $eq: [{ $month: '$dateOfBirth' }, { $month: new Date() }] },
          { $gte: [{ $dayOfMonth: '$dateOfBirth' }, { $dayOfMonth: new Date() }] }
        ]
      }
    });
    
    // Get upcoming work anniversaries (next 30 days)
    const upcomingAnniversaries = await Employee.countDocuments({
      organizationId: organizationId,
      role: { $ne: 'owner' },
      employmentDate: { $exists: true, $ne: null },
      $expr: {
        $and: [
          { $eq: [{ $month: '$employmentDate' }, { $month: new Date() }] },
          { $gte: [{ $dayOfMonth: '$employmentDate' }, { $dayOfMonth: new Date() }] }
        ]
      }
    });
    
    // Calculate total payroll (if payroll data exists)
    const Payroll = require('../mongodb/models/hr').Payroll;
    const payrollData = await Payroll.find({
      organizationId: organizationId
    });
    
    const totalPayroll = payrollData.reduce((sum: number, payroll: any) => sum + (payroll.amount || 0), 0);
    
    // Return real-time dashboard summary
    const summary = {
      totalEmployees,
      activeEmployees,
      pendingLeaveRequests,
      upcomingBirthdays,
      upcomingAnniversaries,
      totalPayroll: `$${totalPayroll.toLocaleString()}`,
      averageAttendance: '95%', // This would need attendance tracking
      recentActivities: pendingLeaveRequests + upcomingBirthdays + upcomingAnniversaries
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching HR dashboard summary:', error);
    res.status(500).json({ message: 'Error fetching HR dashboard summary' });
  }
});

// HR Module Settings Management
router.get('/settings', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get organization settings from Prisma
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const settings = organization.settings as any;
    const hrSettings = settings?.modules?.moduleSettings?.hr || {
      enableLeaveManagement: true,
      enablePayroll: true,
      enablePerformanceReviews: true,
      enableTimeTracking: true,
      enableRecruitment: true,
      enableTraining: true,
      enableBenefits: true,
      enableAttendance: true,
      enableTermination: true,
      enableSkillMatching: true,
      enableCredentialVerification: true,
      policies: {
        leavePolicy: {
          annualLeaveDays: 21,
          sickLeaveDays: 10,
          maternityLeaveDays: 90,
          paternityLeaveDays: 14,
          carryForwardDays: 5,
          maxCarryForwardDays: 10
        },
        attendancePolicy: {
          workingHours: 8,
          overtimeThreshold: 40,
          lateThreshold: 15,
          earlyDepartureThreshold: 15,
          gracePeriod: 5
        },
        payrollPolicy: {
          paymentFrequency: 'monthly',
          paymentDay: 25,
          overtimeRate: 1.5,
          holidayPay: 2.0,
          taxDeduction: true,
          socialSecurity: true
        },
        performancePolicy: {
          reviewFrequency: 'quarterly',
          ratingScale: 5,
          probationPeriod: 90,
          improvementPlanDuration: 30
        }
      },
      workflows: {
        leaveApproval: ['manager', 'hr'],
        recruitmentApproval: ['hr', 'department_head'],
        terminationApproval: ['hr', 'executive'],
        performanceReview: ['manager', 'hr'],
        payrollApproval: ['hr', 'finance']
      },
      notifications: {
        leaveRequests: true,
        attendanceAlerts: true,
        payrollReminders: true,
        performanceReviews: true,
        recruitmentUpdates: true,
        terminationNotifications: true
      },
      integrations: {
        payrollSystem: '',
        timeTrackingSystem: '',
        recruitmentPlatform: '',
        learningManagementSystem: '',
        benefitsProvider: '',
        backgroundCheckService: ''
      },
      customFields: {
        employee: [],
        leave: [],
        performance: [],
        recruitment: []
      }
    };

    res.json(hrSettings);
  } catch (error) {
    console.error('Error fetching HR settings:', error);
    res.status(500).json({ error: 'Failed to fetch HR settings' });
  }
});

router.put('/settings', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user has HR admin permissions
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { role: true, permissions: true }
    });

    const canManageHRSettings = ['owner', 'admin', 'hr'].includes(user?.role || '');
    if (!canManageHRSettings) {
      return res.status(403).json({ error: 'Insufficient permissions to manage HR settings' });
    }

    const hrSettings = req.body;

    // Get current organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const currentSettings = organization.settings as any || {};
    
    // Update HR module settings
    const updatedSettings = {
      ...currentSettings,
      modules: {
        ...currentSettings.modules,
        moduleSettings: {
          ...currentSettings.modules?.moduleSettings,
          hr: hrSettings
        }
      }
    };

    // Update organization settings
    await prisma.organization.update({
      where: { id: organizationId },
      data: { settings: updatedSettings }
    });

    res.json({ message: 'HR settings updated successfully', settings: hrSettings });
  } catch (error) {
    console.error('Error updating HR settings:', error);
    res.status(500).json({ error: 'Failed to update HR settings' });
  }
});

// Get HR module feature status
router.get('/features/status', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const settings = organization.settings as any;
    const hrSettings = settings?.modules?.moduleSettings?.hr || {};

    const featureStatus = {
      leaveManagement: hrSettings.enableLeaveManagement ?? true,
      payroll: hrSettings.enablePayroll ?? true,
      performanceReviews: hrSettings.enablePerformanceReviews ?? true,
      timeTracking: hrSettings.enableTimeTracking ?? true,
      recruitment: hrSettings.enableRecruitment ?? true,
      training: hrSettings.enableTraining ?? true,
      benefits: hrSettings.enableBenefits ?? true,
      attendance: hrSettings.enableAttendance ?? true,
      termination: hrSettings.enableTermination ?? true,
      skillMatching: hrSettings.enableSkillMatching ?? true,
      credentialVerification: hrSettings.enableCredentialVerification ?? true
    };

    res.json(featureStatus);
  } catch (error) {
    console.error('Error fetching HR feature status:', error);
    res.status(500).json({ error: 'Failed to fetch HR feature status' });
  }
});

// Payroll routes with accounting integration
router.get('/payroll', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get payroll data with accounting integration
    const payrollData = await getPayrollData(organizationId);
    
    res.json(payrollData);
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    res.status(500).json({ error: 'Failed to fetch payroll data' });
  }
});

router.post('/payroll/process', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const { periodStart, periodEnd, employeeIds } = req.body;
    
    // Process payroll with accounting integration
    const payrollService = new PayrollService();
    const payrollRun = await payrollService.processPayroll({
      organizationId,
      period: { startDate: new Date(periodStart), endDate: new Date(periodEnd) },
      employeeIds: employeeIds || [],
      approvedBy: req.user.id
    });
    
    // Create accounting entries for the payroll run
    await createPayrollAccountingEntries(payrollRun);
    
    res.json({
      success: true,
      payrollRun,
      message: 'Payroll processed successfully with accounting integration'
    });
  } catch (error) {
    console.error('Error processing payroll:', error);
    res.status(500).json({ error: 'Failed to process payroll' });
  }
});

router.get('/payroll/accounting-summary', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get payroll accounting summary for finance dashboard
    const accountingSummary = await getPayrollAccountingSummary(organizationId);
    
    res.json(accountingSummary);
  } catch (error) {
    console.error('Error fetching payroll accounting summary:', error);
    res.status(500).json({ error: 'Failed to fetch payroll accounting summary' });
  }
});

// Helper functions for payroll accounting integration
async function getPayrollData(organizationId: string) {
  // Mock payroll data with accounting integration
  return [
    {
      id: '1',
      employeeName: 'John Doe',
      employeeId: 'emp001',
      netSalary: 5000,
      currency: 'USD',
      status: 'processed',
      date: new Date().toISOString(),
      accountingEntry: {
        reference: 'PAYROLL-001',
        description: 'Monthly payroll - John Doe',
        debit: 5000,
        credit: 5000,
        account: 'Payroll Expense'
      }
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      employeeId: 'emp002',
      netSalary: 4500,
      currency: 'USD',
      status: 'processed',
      date: new Date().toISOString(),
      accountingEntry: {
        reference: 'PAYROLL-002',
        description: 'Monthly payroll - Jane Smith',
        debit: 4500,
        credit: 4500,
        account: 'Payroll Expense'
      }
    }
  ];
}

async function createPayrollAccountingEntries(payrollRun: any) {
  // Create accounting journal entries for payroll
  console.log('Creating accounting entries for payroll run:', payrollRun.id);
  
  // In a real implementation, this would create actual journal entries
  // in the accounting system and sync with the finance module
  const accountingEntry = {
    date: new Date(),
    reference: `PAYROLL-${payrollRun.id}`,
    description: `Payroll for period ${payrollRun.period.startDate.toLocaleDateString()} - ${payrollRun.period.endDate.toLocaleDateString()}`,
    totalAmount: payrollRun.totalAmount,
    employeeCount: payrollRun.employeeCount,
    status: 'posted'
  };
  
  console.log('Accounting entry created:', accountingEntry);
  return accountingEntry;
}

async function getPayrollAccountingSummary(organizationId: string) {
  // Mock payroll accounting summary for finance dashboard
  return {
    totalPayrollExpense: 9500,
    totalTaxPayable: 1900,
    totalBenefitsPayable: 950,
    totalNetPay: 6650,
    currency: 'USD',
    period: {
      start: new Date().toISOString(),
      end: new Date().toISOString()
    },
    accountingEntries: [
      {
        reference: 'PAYROLL-001',
        description: 'Monthly payroll processing',
        amount: 9500,
        type: 'expense',
        date: new Date().toISOString()
      }
    ]
  };
}

// Payroll onboarding endpoint
router.post('/employees/payroll-onboard', async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      country,
      currencyPreference,
      payoutMethod,
      walletAddress,
      bankAccountNumber,
      bankName,
      taxId,
      salaryAmount,
      salaryFrequency,
      contractType,
      startDate,
      deductions
    } = req.body;

    // Validate required fields
    if (!employeeId || !fullName || !country || !salaryAmount || !taxId) {
      return res.status(400).json({ 
        error: 'Missing required fields: employeeId, fullName, country, salaryAmount, taxId' 
      });
    }

    // Update the existing employee with payroll data
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: {
        fullName,
        country,
        currencyPreference,
        payoutMethod,
        walletAddress,
        taxId,
        salaryAmount: parseFloat(salaryAmount),
        salaryFrequency,
        contractType,
        startDate: new Date(startDate),
        deductions: deductions || {},
        // Update bank account info if provided
        wallet: {
          bankAccounts: bankAccountNumber && bankName ? [{
            bankName,
            accountNumber: bankAccountNumber,
            accountType: 'checking',
            isDefault: true
          }] : []
        }
      }
    });

    // Create notification for the employee
    await prisma.notification.create({
      data: {
        type: 'payroll',
        title: 'Added to Payroll System',
        message: `You have been successfully added to the payroll system. Your salary will be processed according to your payment preferences.`,
        userId: employeeId,
        organizationId: req.user.organizationId,
        priority: 'medium'
      }
    });

    res.json({
      success: true,
      message: 'Employee successfully added to payroll',
      employee: {
        id: updatedEmployee.id,
        fullName: updatedEmployee.fullName,
        salaryAmount: updatedEmployee.salaryAmount,
        payoutMethod: updatedEmployee.payoutMethod,
        currencyPreference: updatedEmployee.currencyPreference
      }
    });

  } catch (error) {
    console.error('Error adding employee to payroll:', error);
    res.status(500).json({ 
      error: 'Failed to add employee to payroll',
      details: error.message 
    });
  }
});

// GET /api/hr/payroll-settings - Get payroll settings for organization
router.get('/payroll-settings', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    // Get organization settings for payroll
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true }
    });
    
    // Default payroll settings
    const defaultSettings = {
      taxRate: 15,
      benefitsRate: 5,
      overtimeRate: 1.5,
      currency: 'USD',
      paymentFrequency: 'monthly',
      autoProcess: false,
      requireApproval: true,
      deductions: {
        healthInsurance: 2,
        retirementPlan: 3,
        lifeInsurance: 1,
        otherDeductions: 0
      }
    };
    
    // Return settings from organization or defaults
    const settings = organization?.settings?.payroll || defaultSettings;
    res.json(settings);
  } catch (error) {
    console.error('Error fetching payroll settings:', error);
    res.status(500).json({ error: 'Failed to fetch payroll settings' });
  }
});

// POST /api/hr/payroll-settings - Update payroll settings for organization
router.post('/payroll-settings', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    const validatedData = payrollSettingsSchema.parse(req.body);
    
    // Update organization settings with new payroll settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true }
    });
    
    const currentSettings = organization?.settings || {};
    const updatedSettings = {
      ...currentSettings,
      payroll: validatedData
    };
    
    await prisma.organization.update({
      where: { id: organizationId },
      data: { settings: updatedSettings }
    });
    
    res.json({
      success: true,
      message: 'Payroll settings updated successfully',
      settings: validatedData
    });
  } catch (error) {
    console.error('Error updating payroll settings:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update payroll settings' });
  }
});

// Get procurement requests for HR dashboard
router.get('/procurement-requests', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const { organizationId } = getUserAndOrg(req);
    
    const requests = await (prisma as any).procurementRequest.findMany({
      where: { organizationId },
      include: {
        requester: { select: { firstName: true, lastName: true, email: true, department: true } },
        approvedByUser: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching procurement requests:', error);
    res.status(500).json({ error: 'Failed to fetch procurement requests' });
  }
});

export default router; 