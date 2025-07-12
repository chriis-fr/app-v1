import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Type assertion to bypass Prisma client type issues for attendance models
const prismaClient = prisma as any;

// Dynamic import for MongoDB Employee model
const getEmployeeModel = async () => {
  try {
    const { Employee } = await import('../mongodb/models/hr');
    return Employee;
  } catch (error) {
    console.error('Failed to import Employee model:', error);
    return null;
  }
};

// Mark attendance for today
router.post('/mark', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { employeeId, employeeName, status, checkInTime, notes, workDescription } = req.body;
    const userId = (req as any).user.id;
    const organizationId = (req as any).user.organizationId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already exists for today
    const existingAttendance = await prismaClient.attendance.findUnique({
      where: {
        employeeId_date_organizationId: {
          employeeId,
          date: today,
          organizationId
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    // Create attendance record
    const attendance = await prismaClient.attendance.create({
      data: {
        employeeId,
        employeeName,
        date: today,
        status: status || 'present',
        checkInTime: checkInTime ? new Date(checkInTime) : new Date(),
        notes,
        markedBy: userId,
        organizationId
      }
    });

    // Create attendance log
    await prismaClient.attendanceLog.create({
      data: {
        employeeId,
        employeeName,
        logType: 'check-in',
        timestamp: new Date(),
        location: req.body.location,
        device: req.body.device,
        notes,
        organizationId,
        markedBy: userId
      }
    });

    // Create work note if provided
    if (workDescription && workDescription.trim()) {
      await prismaClient.workNote.create({
        data: {
          employeeId,
          employeeName,
          date: today,
          workDescription,
          hoursWorked: req.body.hoursWorked ? parseFloat(req.body.hoursWorked) : null,
          project: req.body.project || null,
          tasks: req.body.tasks || null,
          organizationId
        }
      });
    }

    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

// Check out for today
router.post('/checkout', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    const organizationId = (req as any).user.organizationId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await prismaClient.attendance.findUnique({
      where: {
        employeeId_date_organizationId: {
          employeeId,
          date: today,
          organizationId
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    const checkOutTime = new Date();
    const totalHours = attendance.checkInTime 
      ? (checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60)
      : null;

    // Update attendance with checkout time
    const updatedAttendance = await prismaClient.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        totalHours
      }
    });

    // Create checkout log
    await prismaClient.attendanceLog.create({
      data: {
        employeeId,
        employeeName: attendance.employeeName,
        logType: 'check-out',
        timestamp: checkOutTime,
        location: req.body.location,
        device: req.body.device,
        notes: req.body.notes,
        organizationId,
        markedBy: (req as any).user.id
      }
    });

    res.json({ message: 'Checkout successful', attendance: updatedAttendance });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Failed to checkout' });
  }
});

// Get live attendance status for today
router.get('/live', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all users from the organization (employees with login access)
    const users = await prisma.user.findMany({
      where: { 
        organizationId
      },
      select: { id: true, firstName: true, lastName: true, department: true, role: true }
    });

    // Get all basic employees from MongoDB (employees without login access)
    const Employee = await getEmployeeModel();
    let basicEmployees: any[] = [];
    
    if (Employee) {
      try {
        basicEmployees = await Employee.find({ 
          organizationId,
          employmentStatus: 'active'
        }).lean();
      } catch (error) {
        console.error('Error fetching MongoDB employees:', error);
        // Continue with just Prisma users if MongoDB fails
      }
    }

    // Get today's attendance for all employees
    const todayAttendance = await prismaClient.attendance.findMany({
      where: {
        organizationId,
        date: today
      }
    });

    // Create attendance status map for users
    const userAttendanceStatus = users.map((user: any) => {
      const attendance = todayAttendance.find((a: any) => a.employeeId === user.id);
      return {
        employeeId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        department: user.department,
        status: attendance?.status || 'absent',
        checkInTime: attendance?.checkInTime,
        checkOutTime: attendance?.checkOutTime,
        totalHours: attendance?.totalHours,
        isPresent: attendance?.status === 'present',
        isLate: attendance?.status === 'late',
        source: 'user'
      };
    });

    // Create attendance status map for basic employees
    const basicEmployeeAttendanceStatus = basicEmployees.map((emp: any) => {
      const attendance = todayAttendance.find((a: any) => a.employeeId === emp._id.toString());
      return {
        employeeId: emp._id.toString(),
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        status: attendance?.status || 'absent',
        checkInTime: attendance?.checkInTime,
        checkOutTime: attendance?.checkOutTime,
        totalHours: attendance?.totalHours,
        isPresent: attendance?.status === 'present',
        isLate: attendance?.status === 'late',
        source: 'employee'
      };
    });

    // Add manual attendance entries
    const manualAttendance = todayAttendance.filter((a: any) => 
      !users.find((u: any) => u.id === a.employeeId) &&
      !basicEmployees.find((e: any) => e._id.toString() === a.employeeId)
    );

    const manualStatus = manualAttendance.map((a: any) => ({
      employeeId: a.employeeId,
      employeeName: a.employeeName,
      department: 'Manual Entry',
      status: a.status,
      checkInTime: a.checkInTime,
      checkOutTime: a.checkOutTime,
      totalHours: a.totalHours,
      isPresent: a.status === 'present',
      isLate: a.status === 'late',
      source: 'manual'
    }));

    const allAttendance = [...userAttendanceStatus, ...basicEmployeeAttendanceStatus, ...manualStatus];

    res.json({
      date: today,
      totalEmployees: allAttendance.length,
      present: allAttendance.filter(a => a.isPresent).length,
      absent: allAttendance.filter(a => a.status === 'absent').length,
      late: allAttendance.filter(a => a.isLate).length,
      attendance: allAttendance
    });
  } catch (error) {
    console.error('Error getting live attendance:', error);
    res.status(500).json({ message: 'Failed to get live attendance' });
  }
});

// Get attendance history for an employee
router.get('/employee/:employeeId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    const organizationId = (req as any).user.organizationId;

    const where: any = {
      employeeId,
      organizationId
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const attendance = await prismaClient.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        workNotes: true
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error getting employee attendance:', error);
    res.status(500).json({ message: 'Failed to get attendance history' });
  }
});

// Manual attendance entry (for workers without login access)
router.post('/manual', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { employeeName, status, checkInTime, notes, workDescription } = req.body;
    const organizationId = (req as any).user.organizationId;
    const markedBy = (req as any).user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate unique employee ID for manual entry
    const employeeId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create attendance record
    const attendance = await prismaClient.attendance.create({
      data: {
        employeeId,
        employeeName,
        date: today,
        status: status || 'present',
        checkInTime: checkInTime ? new Date(checkInTime) : new Date(),
        notes,
        markedBy,
        organizationId
      }
    });

    // Create attendance log
    await prismaClient.attendanceLog.create({
      data: {
        employeeId,
        employeeName,
        logType: 'check-in',
        timestamp: new Date(),
        location: req.body.location,
        device: req.body.device,
        notes,
        organizationId,
        markedBy
      }
    });

    // Create work note if provided
    if (workDescription && workDescription.trim()) {
      await prismaClient.workNote.create({
        data: {
          employeeId,
          employeeName,
          date: today,
          workDescription,
          hoursWorked: req.body.hoursWorked ? parseFloat(req.body.hoursWorked) : null,
          project: req.body.project || null,
          tasks: req.body.tasks || null,
          organizationId
        }
      });
    }

    res.json({ message: 'Manual attendance marked successfully', attendance });
  } catch (error) {
    console.error('Error marking manual attendance:', error);
    res.status(500).json({ message: 'Failed to mark manual attendance' });
  }
});

// Get employees for dropdown (organization-specific)
router.get('/employees', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    
    // Fetch users with login access from Prisma (same as HR routes)
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
    
    // Transform users to employee format (same as HR routes)
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

    // Fetch employees without login access from MongoDB (same as HR routes)
    const Employee = await getEmployeeModel();
    let employees: any[] = [];
    
    if (Employee) {
      try {
        employees = await Employee.find({ organizationId }).lean();
      } catch (error) {
        console.error('Error fetching MongoDB employees:', error);
        // Continue with just Prisma users if MongoDB fails
      }
    }
    
    // Transform employees to match the same format (same as HR routes)
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

    // Combine both arrays (same as HR routes)
    const allEmployees = [...transformedUsers, ...transformedEmployees];

    console.log('Combined employees for attendance:', allEmployees);
    res.json(allEmployees);
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({ message: 'Failed to get employees' });
  }
});

// Get attendance summary for HR dashboard
router.get('/summary', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all users from the organization (employees with login access)
    const users = await prisma.user.findMany({
      where: { 
        organizationId
      },
      select: { id: true, firstName: true, lastName: true, department: true, role: true }
    });

    // Get all basic employees from MongoDB (employees without login access)
    const Employee = await getEmployeeModel();
    let basicEmployees: any[] = [];
    
    if (Employee) {
      try {
        basicEmployees = await Employee.find({ 
          organizationId,
          employmentStatus: 'active'
        }).lean();
      } catch (error) {
        console.error('Error fetching MongoDB employees:', error);
        // Continue with just Prisma users if MongoDB fails
      }
    }

    // Get today's attendance
    const todayAttendance = await prismaClient.attendance.findMany({
      where: {
        organizationId,
        date: today
      }
    });

    // Combine all employees
    const allEmployees = [
      ...users.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        source: 'user'
      })),
      ...basicEmployees.map((emp: any) => ({
        id: emp._id.toString(),
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department,
        source: 'employee'
      }))
    ];

    // Calculate summary
    const totalEmployees = allEmployees.length;
    const presentCount = todayAttendance.filter((a: any) => a.status === 'present').length;
    const absentCount = totalEmployees - presentCount;
    const lateCount = todayAttendance.filter((a: any) => a.status === 'late').length;
    const halfDayCount = todayAttendance.filter((a: any) => a.status === 'half-day').length;

    // Get department-wise breakdown
    const departmentStats = allEmployees.reduce((acc: any, emp: any) => {
      const dept = emp.department || 'Unknown';
      const attendance = todayAttendance.find((a: any) => a.employeeId === emp.id);
      
      if (!acc[dept]) {
        acc[dept] = { total: 0, present: 0, absent: 0, late: 0 };
      }
      
      acc[dept].total++;
      if (attendance) {
        if (attendance.status === 'present') acc[dept].present++;
        else if (attendance.status === 'late') acc[dept].late++;
        else acc[dept].absent++;
      } else {
        acc[dept].absent++;
      }
      
      return acc;
    }, {});

    res.json({
      date: today,
      summary: {
        total: totalEmployees,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        halfDay: halfDayCount
      },
      departmentStats,
      attendance: todayAttendance
    });
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    res.status(500).json({ message: 'Failed to get attendance summary' });
  }
});

// Remote attendance endpoints for workers without login access

// Generate daily attendance codes for SMS/WhatsApp
router.post('/remote/generate-codes', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all employees (users + basic employees)
    const users = await prisma.user.findMany({
      where: { organizationId },
      select: { id: true, firstName: true, lastName: true, department: true, role: true }
    });

    const Employee = await getEmployeeModel();
    let basicEmployees: any[] = [];
    
    if (Employee) {
      try {
        basicEmployees = await Employee.find({ 
          organizationId,
          employmentStatus: 'active'
        }).lean();
      } catch (error) {
        console.error('Error fetching MongoDB employees:', error);
      }
    }

    // Generate unique codes for each employee
    const attendanceCodes = [
      ...users.map((user: any) => ({
        employeeId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        department: user.department,
        code: `ATT${Date.now()}${user.id.slice(-4)}`,
        phoneNumber: null // Would be fetched from employee profile
      })),
      ...basicEmployees.map((emp: any) => ({
        employeeId: emp._id.toString(),
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        code: `ATT${Date.now()}${emp._id.toString().slice(-4)}`,
        phoneNumber: emp.phoneNumber || null
      }))
    ];

    // Store codes in database (you might want to create a separate table for this)
    // For now, we'll return the codes

    res.json({
      message: 'Attendance codes generated successfully',
      date: today,
      codes: attendanceCodes
    });
  } catch (error) {
    console.error('Error generating attendance codes:', error);
    res.status(500).json({ message: 'Failed to generate attendance codes' });
  }
});

// Mark attendance via SMS/WhatsApp code
router.post('/remote/mark-via-code', async (req: Request, res: Response) => {
  try {
    const { code, employeeName, notes, workDescription } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Attendance code is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Extract employee ID from code (this is a simplified approach)
    const employeeId = `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create attendance record
    const attendance = await prismaClient.attendance.create({
      data: {
        employeeId,
        employeeName: employeeName || 'Remote Worker',
        date: today,
        status: 'present',
        checkInTime: new Date(),
        notes,
        markedBy: 'remote_system',
        organizationId: 'remote' // This would need to be determined from the code
      }
    });

    // Create attendance log
    await prismaClient.attendanceLog.create({
      data: {
        employeeId,
        employeeName: employeeName || 'Remote Worker',
        logType: 'check-in',
        timestamp: new Date(),
        location: 'Remote',
        device: 'SMS/WhatsApp',
        notes,
        organizationId: 'remote',
        markedBy: 'remote_system'
      }
    });

    // Create work note if provided
    if (workDescription && workDescription.trim()) {
      await prismaClient.workNote.create({
        data: {
          employeeId,
          employeeName: employeeName || 'Remote Worker',
          date: today,
          workDescription,
          hoursWorked: req.body.hoursWorked ? parseFloat(req.body.hoursWorked) : null,
          project: req.body.project || null,
          tasks: req.body.tasks || null,
          organizationId: 'remote'
        }
      });
    }

    res.json({ 
      message: 'Remote attendance marked successfully', 
      attendance,
      code: code 
    });
  } catch (error) {
    console.error('Error marking remote attendance:', error);
    res.status(500).json({ message: 'Failed to mark remote attendance' });
  }
});

// QR code attendance marking
router.post('/remote/qr-mark', async (req: Request, res: Response) => {
  try {
    const { qrCode, employeeId, employeeName, notes, workDescription } = req.body;
    
    if (!qrCode || !employeeId) {
      return res.status(400).json({ message: 'QR code and employee ID are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create attendance record
    const attendance = await prismaClient.attendance.create({
      data: {
        employeeId,
        employeeName: employeeName || 'QR Worker',
        date: today,
        status: 'present',
        checkInTime: new Date(),
        notes,
        markedBy: 'qr_system',
        organizationId: 'qr' // This would need to be determined from the QR code
      }
    });

    // Create attendance log
    await prismaClient.attendanceLog.create({
      data: {
        employeeId,
        employeeName: employeeName || 'QR Worker',
        logType: 'check-in',
        timestamp: new Date(),
        location: 'QR Location',
        device: 'QR Scanner',
        notes,
        organizationId: 'qr',
        markedBy: 'qr_system'
      }
    });

    // Create work note if provided
    if (workDescription && workDescription.trim()) {
      await prismaClient.workNote.create({
        data: {
          employeeId,
          employeeName: employeeName || 'QR Worker',
          date: today,
          workDescription,
          hoursWorked: req.body.hoursWorked ? parseFloat(req.body.hoursWorked) : null,
          project: req.body.project || null,
          tasks: req.body.tasks || null,
          organizationId: 'qr'
        }
      });
    }

    res.json({ 
      message: 'QR attendance marked successfully', 
      attendance,
      qrCode: qrCode 
    });
  } catch (error) {
    console.error('Error marking QR attendance:', error);
    res.status(500).json({ message: 'Failed to mark QR attendance' });
  }
});

// Generate QR codes for locations
router.post('/remote/generate-qr', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { location, organizationId } = req.body;
    
    if (!location || !organizationId) {
      return res.status(400).json({ message: 'Location and organization ID are required' });
    }

    // Generate QR code data
    const qrData = {
      type: 'attendance',
      location,
      organizationId,
      timestamp: Date.now(),
      code: `QR${Date.now()}${Math.random().toString(36).substr(2, 6)}`
    };

    // In a real implementation, you would generate an actual QR code image
    // For now, we'll return the data that would be encoded in the QR code

    res.json({
      message: 'QR code generated successfully',
      qrData,
      qrUrl: `/api/attendance/qr/${qrData.code}` // URL for QR code scanning
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Voice call attendance marking (simplified)
router.post('/remote/voice-mark', async (req: Request, res: Response) => {
  try {
    const { employeeId, employeeName, phoneNumber, notes } = req.body;
    
    if (!employeeId || !phoneNumber) {
      return res.status(400).json({ message: 'Employee ID and phone number are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create attendance record
    const attendance = await prismaClient.attendance.create({
      data: {
        employeeId,
        employeeName: employeeName || 'Voice Worker',
        date: today,
        status: 'present',
        checkInTime: new Date(),
        notes,
        markedBy: 'voice_system',
        organizationId: 'voice' // This would need to be determined from the call
      }
    });

    // Create attendance log
    await prismaClient.attendanceLog.create({
      data: {
        employeeId,
        employeeName: employeeName || 'Voice Worker',
        logType: 'check-in',
        timestamp: new Date(),
        location: 'Voice Call',
        device: 'Phone',
        notes,
        organizationId: 'voice',
        markedBy: 'voice_system'
      }
    });

    res.json({ 
      message: 'Voice attendance marked successfully', 
      attendance,
      phoneNumber 
    });
  } catch (error) {
    console.error('Error marking voice attendance:', error);
    res.status(500).json({ message: 'Failed to mark voice attendance' });
  }
});

export default router; 