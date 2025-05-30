import { Router } from 'express';
import { z } from 'zod';
import { UserModel } from '../../models/user.model';
import { hashPassword } from '../../auth';
import { isAuthenticated } from '../../middleware/auth';
import { checkModuleAccess } from '../../middleware/module-access';
import { Request, Response } from 'express';
import { AuthenticatedUser } from '../../src/middleware/auth';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user: NonNullable<Express.User>;
}

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['owner', 'admin', 'manager', 'employee', 'contractor']),
  department: z.string(),
  position: z.string(),
  status: z.enum(['active', 'inactive']),
  moduleAccess: z.array(z.string()).optional(),
  organizationId: z.string(),
  isOwner: z.boolean().default(false),
});

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  moduleAccess: z.array(z.string()).optional(),
});

// Get all users
router.get('/', async (req, res) => {
  try {
    // Mock user data for testing
    const users = [
      {
        id: '1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        department: 'IT',
        position: 'Manager',
        status: 'active',
        moduleAccess: [
          { moduleName: 'dashboard' },
          { moduleName: 'order_management' },
          { moduleName: 'inventory' },
          { moduleName: 'hr' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        username: 'janesmith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        department: 'Sales',
        position: 'Representative',
        status: 'active',
        moduleAccess: [
          { moduleName: 'dashboard' },
          { moduleName: 'order_management' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Create user
router.post('/', isAuthenticated, checkModuleAccess('users'), async (req: Request, res: Response) => {
  try {
    const userData = createUserSchema.parse(req.body);
    const currentUser = req.user as AuthenticatedUser;

    if (!currentUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if current user has permission to create users in the target department
    if (!currentUser.isOwner) {
      if (currentUser.role === 'admin' && currentUser.department !== userData.department) {
        return res.status(403).json({ message: 'You can only create users in your department' });
      }
      if (currentUser.role === 'manager' && userData.department !== 'HR') {
        return res.status(403).json({ message: 'Managers can only create users in the HR department' });
      }
    }

    // Set default module access based on role and department
    const defaultModuleAccess = {
      'owner': ['*'],
      'admin': ['dashboard', 'users', 'documents', 'analytics'],
      'manager': ['hr', 'payroll', 'attendance'],
      'employee': ['dashboard', 'profile'],
      'contractor': ['dashboard', 'profile'],
    };

    // Set module access based on role and department
    userData.moduleAccess = defaultModuleAccess[userData.role] || [];

    // Add department-specific modules
    if (userData.department) {
      const departmentModules = {
        'HR': ['hr', 'payroll', 'attendance'],
        'Finance': ['finance', 'accounting', 'payroll'],
        'IT': ['it', 'system', 'security'],
        'Operations': ['inventory', 'warehouse', 'supply_chain'],
        'Sales': ['crm', 'sales', 'marketing'],
      };
      const deptModules = departmentModules[userData.department as keyof typeof departmentModules] || [];
      // Use Array.from to convert Set to array
      userData.moduleAccess = Array.from(new Set([...userData.moduleAccess, ...deptModules]));
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = new UserModel({
      ...userData,
      password: hashedPassword,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    });

    await user.save();
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        moduleAccess: user.moduleAccess,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Mock user data for testing
    const user = {
      id: userId,
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      department: 'IT',
      position: 'Manager',
      status: 'active',
      moduleAccess: [
        { moduleName: 'dashboard' },
        { moduleName: 'order_management' },
        { moduleName: 'inventory' },
        { moduleName: 'hr' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const userId = req.params.id;
    
    // Mock user data for testing
    const user = {
      id: userId,
      username: validatedData.username || 'johndoe',
      firstName: validatedData.firstName || 'John',
      lastName: validatedData.lastName || 'Doe',
      email: validatedData.email || 'john.doe@example.com',
      role: validatedData.role || 'admin',
      department: validatedData.department || 'IT',
      position: validatedData.position || 'Manager',
      status: validatedData.status || 'active',
      moduleAccess: validatedData.moduleAccess?.map(module => ({ moduleName: module })) || [
        { moduleName: 'dashboard' },
        { moduleName: 'order_management' },
        { moduleName: 'inventory' },
        { moduleName: 'hr' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    res.json({ message: `User ${userId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router; 