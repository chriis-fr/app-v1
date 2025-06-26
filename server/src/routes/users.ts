import { Router } from 'express';
import { z } from 'zod';
import { UserModel } from '../../models/user.model';
import { hashPassword } from '../../auth';
import { isAuthenticated } from '../../middleware/auth';
import { checkModuleAccess } from '../../middleware/module-access';
import { Request, Response } from 'express';
import { AuthenticatedUser } from '../../src/middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const currentUser = req.user as AuthenticatedUser;
    
    if (!currentUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fetch real users from database
    const users = await prisma.user.findMany({
      where: {
        organizationId: currentUser.organizationId
      },
      include: {
        moduleAccess: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform moduleAccess to expected format
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      status: user.status,
      moduleAccess: user.moduleAccess?.map(access => ({ 
        moduleName: access.module 
      })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    res.json(formattedUsers);
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
    const currentUser = req.user as AuthenticatedUser;
    
    if (!currentUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fetch real user from database
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: currentUser.organizationId
      },
      include: {
        moduleAccess: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform moduleAccess to expected format
    const formattedUser = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      status: user.status,
      moduleAccess: user.moduleAccess?.map(access => ({ 
        moduleName: access.module 
      })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json(formattedUser);
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
    const currentUser = req.user as AuthenticatedUser;
    
    if (!currentUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user exists and belongs to the same organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: currentUser.organizationId
      }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove moduleAccess from validatedData since it's a relation
    const { moduleAccess, ...updateData } = validatedData;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        moduleAccess: true
      }
    });

    // Transform moduleAccess to expected format
    const formattedUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      position: updatedUser.position,
      status: updatedUser.status,
      moduleAccess: updatedUser.moduleAccess?.map(access => ({ 
        moduleName: access.module 
      })) || [],
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
    
    res.json(formattedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user as AuthenticatedUser;
    
    if (!currentUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user exists and belongs to the same organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: currentUser.organizationId
      }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the current user
    if (userId === currentUser.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete user from database
    await prisma.user.delete({
      where: {
        id: userId
      }
    });
    
    res.json({ message: `User ${userId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router; 