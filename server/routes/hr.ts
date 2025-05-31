import express, { Request, Response, NextFunction } from 'express';
import { Employee, Attendance, Payroll } from '../mongodb/models/hr';
import { isAuthenticated } from '../middleware/auth';
import { checkModuleAccess } from '../middleware/module-access';

const router = express.Router();

// Middleware to check if user is HR admin
const isHRAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== 'hr_admin') {
    return res.status(403).json({ message: 'Access denied. HR admin privileges required.' });
  }
  next();
};

// Get all employees (HR admin only)
router.get('/employees', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Exclude owners and filter by organizationId
    const employees = await Employee.find({
      role: { $ne: 'owner' },
      organizationId: req.user.organizationId
    })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Get employee by ID (HR admin or self)
router.get('/employees/:id', isAuthenticated, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    // Allow HR admins to view any employee, or users to view their own profile
    if (!req.user || (req.user.role !== 'hr_admin' && req.user.id !== req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await Employee.findById(req.params.id)
      .select('-password');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// Create new employee (HR admin only)
router.post('/employees', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
  try {
    const employee = new Employee({
      ...req.body,
      role: 'Employee',
      status: 'Active',
      canLogin: req.body.canLogin ?? false // Default to false if not provided
    });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee' });
  }
});

// Update employee (HR admin only)
router.put('/employees/:id', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
    try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
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
router.delete('/employees/:id', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
    try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
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
    const attendance = await Attendance.find({
      employeeId: req.params.id,
      organizationId: req.user.organizationId
    });
      res.json(attendance);
    } catch (error) {
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
    const payroll = await Payroll.find({
      employeeId: req.params.id,
      organizationId: req.user.organizationId
    });
    res.json(payroll);
  } catch (error) {
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
router.post('/employees/:id/disciplinary', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.put('/employees/:id/disciplinary/:recordId', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.put('/employees/:id/documents/:docId', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.put('/employees/:id/competencies', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.post('/employees/match-competencies', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.post('/employees/:id/dependents', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.put('/employees/:id/dependents/:dependentId', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.delete('/employees/:id/dependents/:dependentId', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.post('/employees/:id/dependents/:dependentId/documents', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.put('/employees/:id/dependent-entitlements', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.put('/employees/:id/dependent-policy', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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
router.post('/employees/:id/dependents/:dependentId/verify', isAuthenticated, checkModuleAccess('hr'), isHRAdmin, async (req: Request, res: Response) => {
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

export default router; 