import express, { Request, Response, NextFunction } from 'express';
import { Employee, Attendance, Payroll } from '../mongodb/models/hr';
import { isAuthenticated } from '../middleware/auth';
import { checkModuleAccess } from '../middleware/module-access';

const router = express.Router();

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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Exclude owners and filter by organizationId
    const query: any = {
      role: { $ne: 'owner' },
      organizationId: req.user.organizationId
    };
    if (typeof req.query.canLogin !== 'undefined') {
      query.canLogin = req.query.canLogin === 'true';
    }
    const employees = await Employee.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    console.log('EMPLOYEES RETURNED:', employees);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Get employee by ID (HR admin, owner, or self)
router.get('/employees/:id', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Allow HR admins, owners, or self
    const canView = req.user.role === 'hr_admin' || req.user.isOwner || req.user.id === req.params.id;
    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Strict organization filtering
    const employee = await Employee.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .select('-password')
      .lean();
    if (!employee || typeof employee !== 'object' || Array.isArray(employee)) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    // Try to find the linked user (if any)
    let user = null;
    if (employee.employeeNumber && typeof employee.employeeNumber === 'string') {
      try {
        user = await require('../models/User').default.findOne({
          employeeId: employee.employeeNumber,
          organizationId: req.user.organizationId
        }).select('-password').lean();
      } catch (userErr) {
        user = null;
      }
    }
    // Merge employee and user data for frontend compatibility
    const employeeWithUserData = {
      ...employee,
      user: user ? {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        status: user.status,
        canLogin: user.canLogin,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        moduleAccess: user.moduleAccess,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } : null
    };
    res.json(employeeWithUserData);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// DEPRECATED: Employee creation is now handled via the user creation route (/api/users)
// router.post('/employees', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
//   try {
//     const {
//       firstName, lastName, email, username, password, department, position, employmentType, salary, benefits, supervisor, canLogin, role, moduleAccess
//     } = req.body;
//
//     // Validate required fields
//     if (!firstName || !lastName || !department || !position || !employmentType || !salary) {
//       return res.status(400).json({ message: 'Missing required employee fields.' });
//     }
//
//     // If login is enabled, validate user fields
//     if (canLogin) {
//       if (!email || !username || !password || !role || !Array.isArray(moduleAccess) || moduleAccess.length === 0) {
//         return res.status(400).json({ message: 'Missing required user fields for login-enabled employee.' });
//       }
//       // Check for existing user/email
//       const existingUser = await require('../models/User').default.findOne({ $or: [ { email }, { username } ] });
//       if (existingUser) {
//         return res.status(409).json({ message: 'A user with this email or username already exists.' });
//       }
//     }
//
//     // Create Employee first
//     const employee = new Employee({
//       firstName,
//       lastName,
//       department,
//       position,
//       employmentType,
//       salary,
//       benefits,
//       supervisor,
//       canLogin: !!canLogin,
//       role: canLogin ? role : 'Employee',
//       status: 'Active',
//       organizationId: req.user!.organizationId
//     });
//     await employee.save();
//
//     let user = null;
//     if (canLogin) {
//       const bcrypt = require('bcrypt');
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRounds);
//       // Use employee._id as employeeNumber for linking
//       const employeeNumber = employee._id.toString();
//       // Create User
//       const UserModel = require('../models/User').default;
//       user = new UserModel({
//         firstName,
//         lastName,
//         email,
//         username,
//         password: hashedPassword,
//         department,
//         position,
//         status: 'active',
//         employeeId: employeeNumber,
//         organizationId: req.user!.organizationId,
//         role,
//         moduleAccess,
//         canLogin: true,
//         isOwner: false,
//         isActive: false, // Set to false until activation
//         emailVerified: false
//       });
//       await user.save();
//       // Link employee to user (optional: store userId in employee if desired)
//       employee.employeeNumber = employeeNumber;
//       await employee.save();
//       // TODO: Send activation email here if desired
//     }
//
//     res.status(201).json({ employee, user });
//   } catch (error) {
//     console.error('Error creating employee:', error);
//     res.status(500).json({ message: 'Error creating employee' });
//   }
// });

// Update employee (HR admin only)
router.put('/employees/:id', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
    try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
    } catch (error) {
    res.status(500).json({ message: 'Error updating employee' });
    }
});

// Delete employee (HR admin only)
router.delete('/employees/:id', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
    try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
    
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
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    let attendance = [];
    try {
      attendance = await Attendance.find({
        employeeId: req.params.id,
        organizationId: req.user.organizationId
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
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
      }
    const attendance = new Attendance({
      ...req.body,
        organizationId: req.user.organizationId
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
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    let payroll = [];
    try {
      payroll = await Payroll.find({
        employeeId: req.params.id,
        organizationId: req.user.organizationId
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
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
      }
      const payroll = new Payroll({
        ...req.body,
        organizationId: req.user.organizationId,
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
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user?.organizationId },
      {
        $push: {
          disciplinaryRecords: {
            ...req.body,
            reportedBy: req.user?.id,
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
    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user?.organizationId,
        'disciplinaryRecords._id': req.params.recordId
      },
      {
        $set: {
          'disciplinaryRecords.$.status': req.body.status,
          'disciplinaryRecords.$.approvedBy': req.user?.id
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
    if (req.user?.role !== 'hr_admin' && req.user?.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user?.organizationId },
      {
        $push: {
          documents: {
            ...req.body,
            uploadedBy: req.user?.id,
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
    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user?.organizationId,
        'documents._id': req.params.docId
      },
      {
        $set: {
          'documents.$.status': req.body.status,
          'documents.$.approvedBy': req.user?.id,
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
    const employee = await Employee.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId
    }).select('competencies');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Allow access if user is HR admin or viewing their own competencies
    if (req.user?.role !== 'hr_admin' && req.user?.id !== req.params.id) {
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
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user?.organizationId },
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
    const { jobRequirements } = req.body;
    const employees: any[] = await Employee.find({
      organizationId: req.user?.organizationId,
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
    if (!req.user || (req.user.role !== 'hr_admin' && req.user.id !== req.params.id)) {
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
            verifiedBy: req.user?.id
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
            verifiedBy: req.user?.id
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
            uploadedBy: req.user?.id,
            status: 'Approved',
            approvedBy: req.user?.id,
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
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dependentEntitlements: {
            ...req.body,
            lastUpdated: new Date(),
            updatedBy: req.user?.id
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
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dependentPolicy: {
            ...req.body,
            lastUpdated: new Date(),
            updatedBy: req.user?.id
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
    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        'children._id': req.params.dependentId
      },
      {
        $set: {
          'children.$.status': 'Active',
          'children.$.lastVerifiedAt': new Date(),
          'children.$.verifiedBy': req.user?.id,
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payroll = await Payroll.find({
      organizationId: req.user.organizationId
    });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payroll records' });
  }
});

// Get all attendance records (HR admin or owner only)
router.get('/attendance', isAuthenticated, checkModuleAccess('hr'), isHRAdminOrOwner, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const attendance = await Attendance.find({
      organizationId: req.user.organizationId
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get leave requests
router.get('/leave-requests', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Fetch real leave requests from database using AbsenceRecord model
    const AbsenceRecord = require('../mongodb/models/hr').AbsenceRecord;
    const leaveRequests = await AbsenceRecord.find({
      organizationId: req.user.organizationId,
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get real employees and filter for current month birthdays
    const employees = await Employee.find({
      organizationId: req.user.organizationId,
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get real employees and filter for current month anniversaries
    const employees = await Employee.find({
      organizationId: req.user.organizationId,
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Fetch real leave entitlements from database
    const LeaveEntitlement = require('../mongodb/models/hr').LeaveEntitlement;
    const currentYear = new Date().getFullYear();
    
    const entitlements = await LeaveEntitlement.find({
      organizationId: req.user.organizationId,
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
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
      organizationId: req.user.organizationId,
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
      organizationId: req.user.organizationId,
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
      organizationId: req.user.organizationId,
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get real activity logs from AbsenceRecord and Employee changes
    const AbsenceRecord = require('../mongodb/models/hr').AbsenceRecord;
    
    // Get recent leave activities
    const recentLeaveActivities = await AbsenceRecord.find({
      organizationId: req.user.organizationId
    })
    .populate('employeeId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Get recent employee changes (new hires, status changes, etc.)
    const recentEmployeeChanges = await Employee.find({
      organizationId: req.user.organizationId,
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get real employee count
    const totalEmployees = await Employee.countDocuments({
      organizationId: req.user.organizationId,
      role: { $ne: 'owner' }
    });
    
    // Get active employees
    const activeEmployees = await Employee.countDocuments({
      organizationId: req.user.organizationId,
      role: { $ne: 'owner' },
      employmentStatus: 'active'
    });
    
    // Get pending leave requests
    const AbsenceRecord = require('../mongodb/models/hr').AbsenceRecord;
    const pendingLeaveRequests = await AbsenceRecord.countDocuments({
      organizationId: req.user.organizationId,
      status: 'PENDING'
    });
    
    // Get upcoming birthdays (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingBirthdays = await Employee.countDocuments({
      organizationId: req.user.organizationId,
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
      organizationId: req.user.organizationId,
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
      organizationId: req.user.organizationId
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

export default router; 