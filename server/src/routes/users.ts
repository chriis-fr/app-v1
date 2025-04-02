import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { hash } from 'bcryptjs';
import { authenticate } from '../middleware/auth';

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

// Create user
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const { email, password, moduleAccess, ...userData } = validatedData;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user with module access
    const user = await db.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword,
        moduleAccess: {
          create: moduleAccess?.map(module => ({ moduleName: module })) || [],
        },
      },
      include: {
        moduleAccess: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.params.id },
      include: {
        moduleAccess: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const { moduleAccess, ...userData } = validatedData;

    // First, update the user data
    const user = await db.user.update({
      where: { id: req.params.id },
      data: userData,
      include: {
        moduleAccess: true,
      },
    });

    // Then, update module access if provided
    if (moduleAccess) {
      // Delete existing module access
      await db.moduleAccess.deleteMany({
        where: { userId: req.params.id },
      });

      // Create new module access
      await db.moduleAccess.createMany({
        data: moduleAccess.map(module => ({
          userId: req.params.id,
          moduleName: module,
        })),
      });

      // Fetch updated user with module access
      const updatedUser = await db.user.findUnique({
        where: { id: req.params.id },
        include: {
          moduleAccess: true,
        },
      });

      return res.json(updatedUser);
    }

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // First delete module access
    await db.moduleAccess.deleteMany({
      where: { userId: req.params.id },
    });

    // Then delete the user
    await db.user.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router; 