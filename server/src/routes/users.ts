import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string(),
  department: z.string(),
  position: z.string(),
  status: z.enum(['active', 'inactive']),
  moduleAccess: z.array(z.string()).optional(),
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
router.post('/', async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const { password, ...userData } = validatedData;

    // Mock user data for testing
    const user = {
      id: Math.random().toString(36).substring(7),
      ...userData,
      moduleAccess: userData.moduleAccess?.map(module => ({ moduleName: module })) || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
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