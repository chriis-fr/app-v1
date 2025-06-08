import express, { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from '../middleware/auth';
import User, { UserDocument } from '../models/User';
import { Employee } from '../mongodb/models/hr';
import { checkModuleAccess } from '../middleware/module-access';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sendActivationEmail } from '../utils/email';

const router = express.Router();

// Define interfaces
interface HRData {
  employmentGrade?: string;
  contractType?: string;
  contractExpiryDate?: Date;
  division?: string;
  workLocation?: string;
  costCenter?: string;
  employmentStatus?: string;
  bankDetails?: {
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
    accountType?: string;
    currency?: string;
  };
  children?: Array<{
    name: string;
    dateOfBirth: Date;
    gender: string;
  }>;
  maritalStatus?: string;
  addresses?: Array<{
    type: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
  }>;
}

interface ChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  changeType: 'create' | 'update' | 'delete';
  department: string;
}

interface ModulePermission {
  module: string;
  permissions: string[];
}

// Extend UserDocument interface
declare module '../models/User' {
  interface UserDocument {
    modulePermissions: ModulePermission[];
    changeLog: ChangeLog[];
    department: string;
    updatedBy: string;
    updatedAt: Date;
  }
}

// Middleware to check module access level
const checkModulePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = req.user as unknown as UserDocument;
    const hasAccess = user.modulePermissions?.some(
      (mp: ModulePermission) => mp.permissions.includes(requiredPermission)
    ) || user.role === 'owner';

    if (!hasAccess) {
      return res.status(403).json({ 
        message: `Access denied. Required permission: ${requiredPermission}` 
      });
    }

    next();
  };
};

// Middleware to check department access
const checkDepartmentAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isOwner = req.user.role === 'owner';
  const isAdmin = req.user.role === 'admin';
  const targetDepartment = req.body.department || req.params.department;

  if (!isOwner && isAdmin && req.user.department !== targetDepartment) {
    return res.status(403).json({ message: 'Access denied to this department' });
  }

  next();
};

// Get all users with HR data sync and department filtering
router.get('/', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = req.user as unknown as UserDocument;
    const { department } = req.query;

    // Only allow owners, admins, or HR admins
    if (!(user.role === 'owner' || user.role === 'admin' || user.role === 'hr_admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Define query type
    interface UserQuery {
      organizationId: string;
      department?: string;
      canLogin: boolean;
    }

    // Strict organization filtering - this is the primary filter
    const query: UserQuery = {
      organizationId: user.organizationId,
      canLogin: true
    };

    // Add department filter only if needed
    if (user.role !== 'owner' && user.role === 'admin') {
      query.department = user.department;
    } else if (department) {
      query.department = department as string;
    }

    // Use find to ensure organization and canLogin filter is applied
    const users = await User.find(query)
      .select('-password')
      .lean();

    // Sync with HR data
    const usersWithHRData = await Promise.all(users.map(async (user) => {
      // Derive moduleAccess and permissions for frontend
      const modulePermissions = user.modulePermissions || [];
      const moduleAccess = modulePermissions.map(mp => mp.module);
      const permissions = modulePermissions.map(mp => ({
        module: mp.module,
        actions: mp.permissions
      }));

      const hrData = await Employee.findOne({ 
        employeeNumber: user.employeeId,
        organizationId: user.organizationId // Ensure HR data is also filtered
      });
      return {
        ...user,
        moduleAccess,
        permissions,
        hrData: hrData ? {
          employmentGrade: hrData.employmentGrade,
          contractType: hrData.contractType,
          contractExpiryDate: hrData.contractExpiryDate,
          division: hrData.division,
          workLocation: hrData.workLocation,
          costCenter: hrData.costCenter,
          employmentStatus: hrData.employmentStatus,
          bankDetails: hrData.bankDetails,
          children: hrData.children,
          maritalStatus: hrData.maritalStatus,
          addresses: hrData.addresses
        } : null
      };
    }));

    res.json(usersWithHRData);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Generate random password
const generatePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Add after middleware, before main POST / route
router.post('/generate-employee-id', isAuthenticated, async (req, res) => {
  const { firstName, lastName, email, organizationId } = req.body;
  if (!firstName || !lastName || !email || !organizationId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  // Use organizationId and email to generate a unique employeeId
  const prefix = organizationId.slice(-3).toUpperCase();
  const emailPart = email.split('@')[0].toUpperCase();
  // Count users with this org
  const count = await User.countDocuments({ organizationId });
  const employeeId = `${prefix}-${emailPart}-${(count + 1).toString().padStart(4, '0')}`;
  res.json({ employeeId });
});

// Create new user with direct password set (no activation email)
router.post('/', isAuthenticated, checkModulePermission('create_user'), checkDepartmentAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = req.user as unknown as UserDocument;
    const userData = req.body;
    const changeLog: ChangeLog[] = [];
    // Require password at creation
    if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6) {
      return res.status(400).json({ message: 'Password is required and must be at least 6 characters.' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    // Convert date fields to Date objects if present
    const hireDate = userData.hireDate ? new Date(userData.hireDate) : new Date();
    const contractExpiryDate = userData.contractExpiryDate ? new Date(userData.contractExpiryDate) : undefined;
    const employmentDate = userData.employmentDate ? new Date(userData.employmentDate) : hireDate;

    // Create user with hashed password, active by default
    const newUser = await User.create({
      ...userData,
      hireDate,
      contractExpiryDate,
      employmentDate,
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
      activationToken: undefined,
      tokenExpiresAt: undefined,
      changeLog,
    });
    // Create corresponding Employee record
    const employeeData = {
      organizationId: newUser.organizationId,
      employeeNumber: String(newUser._id),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      department: newUser.department,
      position: newUser.position,
      employmentDate,
      employmentGrade: userData.employmentGrade,
      contractType: userData.contractType,
      contractExpiryDate,
      division: userData.division,
      workLocation: userData.workLocation,
      costCenter: userData.costCenter,
      employmentStatus: userData.employmentStatus || 'active',
      bankDetails: userData.bankDetails,
      children: userData.children,
      maritalStatus: userData.maritalStatus,
      addresses: userData.addresses,
      canLogin: newUser.canLogin,
      role: newUser.role,
      status: newUser.status || 'active',
      supervisor: userData.supervisor,
      salary: userData.salary,
      benefits: userData.benefits,
      // Add any other relevant fields here
    };
    const newEmployee = await Employee.create(employeeData);
    res.status(201).json({
      user: {
        ...newUser.toObject(),
        password: undefined,
        activationToken: undefined,
        tokenExpiresAt: undefined,
      },
      employee: newEmployee,
      message: 'User and employee created successfully.'
    });
  } catch (error) {
    console.error('[User Creation] Error creating user:', error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Activation endpoint
router.post('/activate', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ activationToken: token, tokenExpiresAt: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.password = await bcrypt.hash(password, 10);
    user.isActive = true;
    user.emailVerified = true;
    user.activationToken = null;
    user.tokenExpiresAt = null;
    await user.save();
    res.json({ message: 'Account activated' });
  } catch (error) {
    res.status(500).json({ error: 'Activation failed' });
  }
});

// Update user with change tracking
router.put('/:id', isAuthenticated, checkModulePermission('update_user'), checkDepartmentAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.params.id;
    const updateData = req.body;

    // Get current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check department access
    if (req.user.role === 'admin' && currentUser.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied to this department' });
    }

    // Track changes
    const changes: ChangeLog[] = [];
    Object.keys(updateData).forEach(key => {
      const currentValue = currentUser.get(key);
      if (JSON.stringify(currentValue) !== JSON.stringify(updateData[key])) {
        changes.push({
          field: key,
          oldValue: currentValue,
          newValue: updateData[key],
          changedBy: req.user!.id,
          changedAt: new Date(),
          changeType: 'update',
          department: currentUser.department
        });
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...updateData,
          updatedBy: req.user.id,
          updatedAt: new Date()
        },
        $push: { changeLog: { $each: changes } }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sync with HR data if employeeId exists
    if (updatedUser.employeeId) {
      const hrUpdateData: HRData = {
        employmentGrade: updateData.employmentGrade,
        contractType: updateData.contractType,
        contractExpiryDate: updateData.contractExpiryDate,
        division: updateData.division,
        workLocation: updateData.workLocation,
        costCenter: updateData.costCenter,
        employmentStatus: updateData.employmentStatus,
        bankDetails: updateData.bankDetails,
        children: updateData.children,
        maritalStatus: updateData.maritalStatus,
        addresses: updateData.addresses
      };

      // Remove undefined fields
      Object.keys(hrUpdateData).forEach(key => {
        if (hrUpdateData[key as keyof HRData] === undefined) {
          delete hrUpdateData[key as keyof HRData];
        }
      });

      await Employee.findOneAndUpdate(
        { employeeNumber: updatedUser.employeeId },
        {
          $set: {
            ...hrUpdateData,
            updatedBy: req.user.id,
            updatedAt: new Date()
          }
        }
      );
    }

    res.json({
      user: updatedUser,
      changes
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Get user change history
router.get('/:id/changes', isAuthenticated, checkModulePermission('view_changes'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.params.id)
      .select('changeLog department')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check department access
    if (req.user.role === 'admin' && user.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied to this department' });
    }

    res.json(user.changeLog || []);
  } catch (error) {
    console.error('Error fetching user changes:', error);
    res.status(500).json({ message: "Failed to fetch user changes" });
  }
});

// Update user module permissions
router.put('/:id/permissions', isAuthenticated, checkModulePermission('manage_permissions'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { modulePermissions } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has permission to modify this user's permissions
    if (req.user.role !== 'owner' && 
        req.user.role === 'admin' && 
        user.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied to this department' });
    }

    // Update module permissions
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          modulePermissions,
          updatedBy: req.user.id,
          updatedAt: new Date()
        },
        $push: {
          changeLog: {
            field: 'modulePermissions',
            oldValue: user.modulePermissions,
            newValue: modulePermissions,
            changedBy: req.user.id,
            changedAt: new Date(),
            changeType: 'update',
            department: user.department
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ message: "Failed to update user permissions" });
  }
});

// Get user's module permissions
router.get('/:id/permissions', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.params.id)
      .select('modulePermissions department')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users can only view their own permissions unless they have manage_permissions
    const canView = req.user.id === req.params.id || 
                   req.user.modulePermissions?.some((mp: ModulePermission) => 
                     mp.permissions.includes('manage_permissions')
                   ) ||
                   req.user.role === 'owner';

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user.modulePermissions || []);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ message: "Failed to fetch user permissions" });
  }
});

// Get user by ID with HR data sync
router.get('/:id', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user has access to view this profile
    const canView = req.user.id === req.params.id || 
                   req.user.moduleAccess?.includes('hr') || 
                   req.user.role === 'hr_admin';

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId // Add organization filter
    })
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Derive moduleAccess and permissions for frontend
    const modulePermissions = user.modulePermissions || [];
    const moduleAccess = modulePermissions.map(mp => mp.module);
    const permissions = modulePermissions.map(mp => ({
      module: mp.module,
      actions: mp.permissions
    }));

    // Sync with HR data
    const hrData = await Employee.findOne({ 
      employeeNumber: user.employeeId,
      organizationId: req.user.organizationId
    });
    const userWithHRData = {
      ...user,
      moduleAccess,
      permissions,
      hrData: hrData ? {
        employmentGrade: hrData.employmentGrade,
        contractType: hrData.contractType,
        contractExpiryDate: hrData.contractExpiryDate,
        division: hrData.division,
        workLocation: hrData.workLocation,
        costCenter: hrData.costCenter,
        employmentStatus: hrData.employmentStatus,
        bankDetails: hrData.bankDetails,
        children: hrData.children,
        maritalStatus: hrData.maritalStatus,
        addresses: hrData.addresses
      } : null
    };

    res.json(userWithHRData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Update user with HR data sync
router.put('/:id', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user has permission to update
    const canUpdate = req.user.id === req.params.id || 
                     req.user.moduleAccess?.includes('hr') || 
                     req.user.role === 'hr_admin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userId = req.params.id;
    const updateData = req.body;

    // Update user in User collection with organization filter
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        organizationId: req.user.organizationId // Add organization filter
      },
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sync with HR data if employeeId exists
    if (updatedUser.employeeId) {
      // Map user fields to HR fields
      const hrUpdateData: HRData = {
        employmentGrade: updateData.employmentGrade,
        contractType: updateData.contractType,
        contractExpiryDate: updateData.contractExpiryDate,
        division: updateData.division,
        workLocation: updateData.workLocation,
        costCenter: updateData.costCenter,
        employmentStatus: updateData.employmentStatus,
        bankDetails: updateData.bankDetails,
        children: updateData.children,
        maritalStatus: updateData.maritalStatus,
        addresses: updateData.addresses
      };

      // Remove undefined fields
      Object.keys(hrUpdateData).forEach(key => {
        if (hrUpdateData[key as keyof HRData] === undefined) {
          delete hrUpdateData[key as keyof HRData];
        }
      });

      // Update HR data with organization filter
      await Employee.findOneAndUpdate(
        { 
          employeeNumber: updatedUser.employeeId,
          organizationId: req.user.organizationId // Add organization filter
        },
        { $set: hrUpdateData }
      );

      const hrData = await Employee.findOne({ 
        employeeNumber: updatedUser.employeeId,
        organizationId: req.user.organizationId // Add organization filter
      });
      const userWithHRData = {
        ...updatedUser.toObject(),
        hrData: hrData ? {
          employmentGrade: hrData.employmentGrade,
          contractType: hrData.contractType,
          contractExpiryDate: hrData.contractExpiryDate,
          division: hrData.division,
          workLocation: hrData.workLocation,
          costCenter: hrData.costCenter,
          employmentStatus: hrData.employmentStatus,
          bankDetails: hrData.bankDetails,
          children: hrData.children,
          maritalStatus: hrData.maritalStatus,
          addresses: hrData.addresses
        } : null
      };
      res.json(userWithHRData);
    } else {
      res.json(updatedUser);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Get user's own dependents with HR sync
router.get('/dependents', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('dependents maritalStatus dependentEntitlements employeeId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get HR data for dependents if available
    const hrData = await Employee.findOne({ employeeNumber: user.employeeId });
    const dependentsData = hrData ? {
      ...user.toObject(),
      hrDependents: hrData.children || [],
      hrMaritalStatus: hrData.maritalStatus,
      addresses: hrData.addresses
    } : user;

    res.json(dependentsData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dependents' });
  }
});

// Request to add a dependent
router.post('/dependents/request', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if adding dependent exceeds the limit
    const maxDependents = user.dependentPolicy?.maxDependents || 5;
    if ((user.dependents?.length || 0) >= maxDependents) {
      return res.status(400).json({ message: 'Maximum number of dependents reached' });
    }

    // Validate dependent age for children
    if (req.body.relationship === 'Child') {
      const maxChildAge = user.dependentPolicy?.maxChildAge || 18;
      const age = new Date().getFullYear() - new Date(req.body.dateOfBirth).getFullYear();
      if (age > maxChildAge) {
        return res.status(400).json({ message: 'Child exceeds maximum age limit' });
      }
    }

    // Add dependent with pending status
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          dependents: {
            ...req.body,
            status: 'Pending',
            lastVerifiedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting dependent addition' });
  }
});

// Update own dependent information
router.put('/dependents/:dependentId', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'dependents._id': req.params.dependentId
      },
      {
        $set: {
          'dependents.$': {
            ...req.body,
            status: 'Pending', // Set to pending for HR review
            lastVerifiedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User or dependent not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating dependent' });
  }
});

// Request to remove a dependent
router.delete('/dependents/:dependentId', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          dependents: { _id: req.params.dependentId }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Dependent removal requested' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting dependent removal' });
  }
});

// Upload dependent document
router.post('/dependents/:dependentId/documents', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'dependents._id': req.params.dependentId
      },
      {
        $push: {
          'dependents.$.documents': {
            ...req.body,
            uploadedAt: new Date(),
            uploadedBy: req.user.id,
            status: 'Pending'
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User or dependent not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Update marital status with HR sync
router.put('/marital-status', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          maritalStatus: req.body.maritalStatus
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sync with HR data if employeeId exists
    if (user.employeeId) {
      await Employee.findOneAndUpdate(
        { employeeNumber: user.employeeId },
        { 
          $set: { 
            maritalStatus: req.body.maritalStatus,
            updatedAt: new Date()
          }
        }
      );
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating marital status' });
  }
});

// Get dependent entitlements
router.get('/dependent-entitlements', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('dependentEntitlements dependents maritalStatus');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      entitlements: user.dependentEntitlements,
      dependents: user.dependents,
      maritalStatus: user.maritalStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entitlements' });
  }
});

// Get dependent policy
router.get('/dependent-policy', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('dependentPolicy');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.dependentPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policy' });
  }
});

// HR-specific route to update employee data
router.put('/:id/hr-data', isAuthenticated, checkModulePermission('manage_hr_data'), async (req: Request, res) => {
  try {
    const userId = req.params.id;
    const hrUpdateData: HRData = req.body;

    const user = await User.findOne({
      _id: userId,
      organizationId: req.user!.organizationId // Add organization filter
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.employeeId) {
      return res.status(400).json({ message: 'User is not an employee' });
    }

    // Update HR data with organization filter
    const updatedHRData = await Employee.findOneAndUpdate(
      { 
        employeeNumber: user.employeeId,
        organizationId: req.user!.organizationId // Add organization filter
      },
      { $set: hrUpdateData },
      { new: true }
    );

    if (!updatedHRData) {
      return res.status(404).json({ message: 'HR data not found' });
    }

    // Map HR fields to user fields
    const userUpdateData: HRData = {
      employmentGrade: hrUpdateData.employmentGrade,
      contractType: hrUpdateData.contractType,
      contractExpiryDate: hrUpdateData.contractExpiryDate,
      division: hrUpdateData.division,
      workLocation: hrUpdateData.workLocation,
      costCenter: hrUpdateData.costCenter,
      employmentStatus: hrUpdateData.employmentStatus,
      bankDetails: hrUpdateData.bankDetails,
      children: hrUpdateData.children,
      maritalStatus: hrUpdateData.maritalStatus,
      addresses: hrUpdateData.addresses
    };

    // Remove undefined fields
    Object.keys(userUpdateData).forEach(key => {
      if (userUpdateData[key as keyof HRData] === undefined) {
        delete userUpdateData[key as keyof HRData];
      }
    });

    // Update user data with organization filter
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        organizationId: req.user!.organizationId // Add organization filter
      },
      { $set: userUpdateData },
      { new: true }
    ).select('-password');

    res.json({
      user: updatedUser,
      hrData: updatedHRData
    });
  } catch (error) {
    console.error('Error updating HR data:', error);
    res.status(500).json({ message: 'Error updating HR data' });
  }
});

// Get user's default module for redirection
router.get('/default-module', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('modulePermissions role')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is admin, return their primary module
    if (user.role === 'admin') {
      const adminModule = user.modulePermissions?.[0]?.module;
      if (adminModule) {
        return res.json({ defaultModule: adminModule });
      }
    }

    // For regular users, return their first accessible module
    const accessibleModule = user.modulePermissions?.find(mp => 
      mp.permissions.includes('view')
    )?.module;

    if (!accessibleModule) {
      return res.status(404).json({ message: 'No accessible modules found' });
    }

    res.json({ defaultModule: accessibleModule });
  } catch (error) {
    console.error('Error fetching default module:', error);
    res.status(500).json({ message: "Failed to fetch default module" });
  }
});

// Update user's password
router.put('/change-password', isAuthenticated, async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedBy = req.user.id;
    user.updatedAt = new Date();

    // Add to change log
    user.changeLog.push({
      field: 'password',
      oldValue: null, // Don't store old password
      newValue: null, // Don't store new password
      changedBy: req.user.id,
      changedAt: new Date(),
      changeType: 'update',
      department: user.department
    });

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: "Failed to update password" });
  }
});

// Admin: Add user to module
router.post('/:id/modules', isAuthenticated, checkModulePermission('manage_permissions'), async (req: Request, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { module, permissions } = req.body;
    const userId = req.params.id;

    const user = await User.findOne({
      _id: userId,
      organizationId: req.user.organizationId // Add organization filter
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if admin has access to the module
    const adminHasAccess = req.user.modulePermissions?.some((mp: ModulePermission) => 
      mp.module === module && mp.permissions.includes('manage')
    );

    if (!adminHasAccess && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied to this module' });
    }

    // Add or update module permissions
    const existingModuleIndex = user.modulePermissions.findIndex(mp => mp.module === module);
    if (existingModuleIndex >= 0) {
      user.modulePermissions[existingModuleIndex].permissions = permissions;
    } else {
      user.modulePermissions.push({ module, permissions });
    }

    // Add to change log
    user.changeLog.push({
      field: 'modulePermissions',
      oldValue: user.modulePermissions,
      newValue: [...user.modulePermissions],
      changedBy: req.user.id,
      changedAt: new Date(),
      changeType: 'update',
      department: user.department
    });

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error adding user to module:', error);
    res.status(500).json({ message: "Failed to add user to module" });
  }
});

export default router; 