import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hasModuleAccess, hasRole, hashPassword } from "./auth";
import { storage } from "./storage"
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User, Organization as OrganizationType, OrganizationSettings, Role } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from "./models/user.model";
import { Organization } from "./mongodb/models";
import usersRouter from './src/routes/users';
import prisma from './prisma';
import type { User as PrismaUser, Prisma } from '@prisma/client';
import type { User as SharedUser } from '@shared/schema';
import bcrypt from 'bcryptjs';
import hrRouter from './src/routes/hr';
import jwt from 'jsonwebtoken';
import { getCountryConfig } from '@/config/countries';
import { businessTypeConfig } from './config/business-types';
import { CountryConfig } from './types';
import { isAuthenticated } from './middleware/auth';
import { UserDocument } from './models/User';
import cookieParser from 'cookie-parser';
import { availableModules } from '../shared/schema';

// Add type declarations for organization document
interface IOrganizationDocument {
  settings: OrganizationSettings;
  roles: Role[];
  save(): Promise<IOrganizationDocument>;
}

// Add type for Prisma user update data
type PrismaUserUpdateData = Prisma.UserUpdateInput & {
  moduleAccess?: {
    deleteMany?: {};
    create?: { module: string; access: string; }[];
  };
  employeeId?: string | null;
  managerId?: string | null;
  team?: string | null;
  phoneNumber?: string | null;
  position?: string | null;
  status?: string | null;
  lastLogin?: Date | null;
  hireDate?: Date | null;
  location?: Prisma.JsonValue;
  workSchedule?: Prisma.JsonValue;
  emergencyContact?: Prisma.JsonValue;
  skills?: Prisma.JsonValue;
  certifications?: Prisma.JsonValue;
  education?: Prisma.JsonValue;
  performance?: Prisma.JsonValue;
  compensation?: Prisma.JsonValue;
  benefits?: Prisma.JsonValue;
  equipment?: Prisma.JsonValue;
  accessLevels?: Prisma.JsonValue;
  documents?: Prisma.JsonValue;
  wallet?: Prisma.JsonValue;
  legalDetails?: Prisma.JsonValue;
  address?: Prisma.JsonValue;
  permissions?: Prisma.JsonValue;
};

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req: Request, file: any, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  },
});

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    organizationId: string;
    role: string;
    email: string;
    isOwner: boolean;
    moduleAccess: string[];
    permissions: {
      module: string;
      actions: string[];
    }[];
    modulePermissions: {
      module: string;
      permissions: string[];
    }[];
  };
}

// Define industry types
type Industry = 'technology' | 'manufacturing' | 'retail' | 'healthcare' | 'finance' | 
  'education' | 'construction' | 'logistics' | 'hospitality' | 'real_estate' | 
  'legal' | 'consulting' | 'agriculture' | 'media' | 'energy';

// Industry-specific module recommendations
const industryModules: Record<Industry | 'default', string[]> = {
  technology: ['project', 'inventory', 'hr', 'crm'],
  manufacturing: ['inventory', 'manufacturing', 'warehouse', 'procurement'],
  retail: ['pos', 'inventory', 'crm', 'ecommerce'],
  healthcare: ['hr', 'inventory', 'crm', 'compliance'],
  finance: ['accounting', 'blockchain', 'compliance', 'analytics'],
  education: ['hr', 'crm', 'projects', 'calendar'],
  construction: ['projects', 'inventory', 'warehouse', 'procurement'],
  logistics: ['warehouse', 'inventory', 'logistics', 'procurement'],
  hospitality: ['pos', 'crm', 'calendar', 'inventory'],
  real_estate: ['crm', 'projects', 'calendar', 'inventory'],
  legal: ['crm', 'projects', 'calendar', 'compliance'],
  consulting: ['projects', 'crm', 'calendar', 'hr'],
  agriculture: ['inventory', 'warehouse', 'procurement', 'manufacturing'],
  media: ['projects', 'crm', 'calendar', 'inventory'],
  energy: ['inventory', 'projects', 'compliance', 'analytics'],
  default: ['hr', 'inventory', 'crm', 'projects']
};

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Add cookie-parser middleware
  app.use(cookieParser());

  // Set up authentication routes
  setupAuth(app);

  // Mount users routes
  app.use('/api/users', usersRouter);

  // Mount HR routes
  app.use('/api/hr', hrRouter);

  // User profile routes
  app.put('/api/user/profile', async (req: Request, res: Response) => {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phoneNumber,
        position,
        department,
        employeeId,
        hireDate,
        managerId,
        team,
        location,
        workSchedule,
        emergencyContact,
        userId
      } = req.body;
      
      // Get the current user ID from the request or use the provided one
      const userToUpdate = userId || ''; // Replace with actual user ID from auth
      
      // Update the user in MongoDB
      const updatedUser = await UserModel.findByIdAndUpdate(
        userToUpdate,
        { 
          firstName, 
          lastName, 
          email, 
          phoneNumber,
          position,
          department,
          employeeId,
          hireDate,
          managerId,
          team,
          location,
          workSchedule,
          emergencyContact,
          updatedAt: new Date() 
        },
        { new: true, select: '-password -__v' }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Add password change endpoint
  app.put('/api/user/password', async (req: Request, res: Response) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      console.log(newPassword);
      
      // Find the user in MongoDB
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify the current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update only the password field in MongoDB
      await UserModel.findByIdAndUpdate(
        userId,
        { $set: { password: hashedPassword } },
        { new: true }
      );
      
      // Try to update in Prisma if the user exists there
      try {
        const prismaUser = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (prismaUser) {
          await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
          });
        }
      } catch (prismaError) {
        console.error('Error updating password in Prisma:', prismaError);
        // Continue even if Prisma update fails
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Profile photo upload
  app.post('/api/user/photo', upload.single('photo'), async (req: Request, res: Response) => {
    // Bypass authentication check
    try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

      // Mock response
      res.json({ url: `/uploads/${file.filename}` });
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Profile photo deletion
  app.delete('/api/user/photo', async (req: Request, res: Response) => {
    // Bypass authentication check
    try {
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Module access check endpoint
  app.get('/api/modules/access', async (req, res) => {
    // Bypass authentication check
    // Return mock data
    res.json({
      modules: ['dashboard', 'order_management', 'inventory', 'hr'],
      role: 'admin',
      maxModules: 10
    });
  });

  // POS endpoints
  app.get('/api/pos/products', async (_req, res) => {
    try {
      // Mock product data for testing
      const products = [
        {
          id: '1',
          name: 'Premium Coffee',
          price: 4.99,
          category: 'Beverages',
          stock: 50,
          image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
          sku: 'COF-001',
          cost: 2.50,
          taxRate: 0.08,
          status: 'available',
          barcode: '123456789',
          description: 'Premium Arabica coffee beans',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          name: 'Chocolate Croissant',
          price: 3.99,
          category: 'Pastries',
          stock: 25,
          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
          sku: 'PAS-001',
          cost: 1.75,
          taxRate: 0.08,
          status: 'available',
          barcode: '234567890',
          description: 'Buttery croissant with chocolate filling',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '3',
          name: 'Fresh Orange Juice',
          price: 5.99,
          category: 'Beverages',
          stock: 30,
          image: 'https://images.unsplash.com/photo-1613478223719655c1a0d0f7',
          sku: 'BEV-001',
          cost: 3.00,
          taxRate: 0.08,
          status: 'available',
          barcode: '345678901',
          description: 'Freshly squeezed orange juice',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '4',
          name: 'Blueberry Muffin',
          price: 3.49,
          category: 'Pastries',
          stock: 20,
          image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa',
          sku: 'PAS-002',
          cost: 1.50,
          taxRate: 0.08,
          status: 'available',
          barcode: '456789012',
          description: 'Moist muffin with fresh blueberries',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '5',
          name: 'Green Tea',
          price: 3.99,
          category: 'Beverages',
          stock: 40,
          image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5',
          sku: 'BEV-002',
          cost: 1.75,
          taxRate: 0.08,
          status: 'available',
          barcode: '567890123',
          description: 'Premium Japanese green tea',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '6',
          name: 'Chocolate Chip Cookie',
          price: 2.49,
          category: 'Pastries',
          stock: 35,
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
          sku: 'PAS-003',
          cost: 1.00,
          taxRate: 0.08,
          status: 'available',
          barcode: '678901234',
          description: 'Classic chocolate chip cookie',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/pos/customers', async (_req, res) => {
    try {
      const customers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          loyaltyPoints: 150,
          membershipLevel: 'silver',
          discount: 0.05,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1987654321',
          loyaltyPoints: 500,
          membershipLevel: 'gold',
          discount: 0.10,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/pos/orders', async (_req, res) => {
    try {
      const orders = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customer: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com'
          },
          items: [
            {
              id: '1',
              name: 'Premium Coffee',
              quantity: 2,
              price: 4.99,
              total: 9.98
            },
            {
              id: '2',
              name: 'Chocolate Croissant',
              quantity: 1,
              price: 3.99,
              total: 3.99
            }
          ],
          subtotal: 13.97,
          tax: 1.12,
          discount: 0,
          total: 15.09,
          status: 'completed',
          paymentMethod: 'card',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customer: {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com'
          },
          items: [
            {
              id: '3',
              name: 'Fresh Orange Juice',
              quantity: 1,
              price: 5.99,
              total: 5.99
            }
          ],
          subtotal: 5.99,
          tax: 0.48,
          discount: 0.60,
          total: 5.87,
          status: 'pending',
          paymentMethod: 'cash',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/pos/inventory', async (_req, res) => {
    try {
      const inventory = [
        {
          id: '1',
          name: 'Premium Coffee',
          sku: 'COF-001',
          quantity: 50,
          price: 4.99,
          category: 'Beverages',
          status: 'in_stock',
          reorderPoint: 10,
          image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
          cost: 2.50,
          taxRate: 0.08,
          barcode: '123456789',
          description: 'Premium Arabica coffee beans',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Chocolate Croissant',
          sku: 'PAS-001',
          quantity: 25,
          price: 3.99,
          category: 'Pastries',
          status: 'in_stock',
          reorderPoint: 5,
          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
          cost: 1.75,
          taxRate: 0.08,
          barcode: '234567890',
          description: 'Buttery croissant with chocolate filling',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Fresh Orange Juice',
          sku: 'BEV-001',
          quantity: 30,
          price: 5.99,
          category: 'Beverages',
          status: 'in_stock',
          reorderPoint: 8,
          image: 'https://images.unsplash.com/photo-1613478223719655c1a0d0f7',
          cost: 3.00,
          taxRate: 0.08,
          barcode: '345678901',
          description: 'Freshly squeezed orange juice',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          name: 'Blueberry Muffin',
          sku: 'PAS-002',
          quantity: 20,
          price: 3.49,
          category: 'Pastries',
          status: 'in_stock',
          reorderPoint: 5,
          image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa',
          cost: 1.50,
          taxRate: 0.08,
          barcode: '456789012',
          description: 'Moist muffin with fresh blueberries',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          name: 'Green Tea',
          sku: 'BEV-002',
          quantity: 40,
          price: 3.99,
          category: 'Beverages',
          status: 'in_stock',
          reorderPoint: 10,
          image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5',
          cost: 1.75,
          taxRate: 0.08,
          barcode: '567890123',
          description: 'Premium Japanese green tea',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '6',
          name: 'Chocolate Chip Cookie',
          sku: 'PAS-003',
          quantity: 35,
          price: 2.49,
          category: 'Pastries',
          status: 'in_stock',
          reorderPoint: 8,
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
          cost: 1.00,
          taxRate: 0.08,
          barcode: '678901234',
          description: 'Classic chocolate chip cookie',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get('/api/pos/users', async (_req, res) => {
    try {
      const users = [
        {
          id: '1',
          name: 'Cashier 1',
          email: 'cashier1@example.com',
          role: 'cashier',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Manager 1',
          email: 'manager1@example.com',
          role: 'manager',
          status: 'active',
          lastLogin: new Date(),
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

  app.get('/api/pos/recent-sales', async (_req, res) => {
    try {
      const recentSales = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customer: 'John Doe',
          items: 3,
          total: 15.09,
          paymentMethod: 'card',
          status: 'completed',
          timestamp: new Date()
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customer: 'Jane Smith',
          items: 1,
          total: 5.87,
          paymentMethod: 'cash',
          status: 'pending',
          timestamp: new Date()
        }
      ];
      
      res.json(recentSales);
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      res.status(500).json({ message: "Failed to fetch recent sales" });
    }
  });

  // HR endpoints
  app.get('/api/hr/employees', async (_req, res) => {
    try {
      // Mock employee data for testing
      const employees = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          department: 'IT',
          position: 'Manager',
          salary: 75000,
          startDate: new Date('2020-01-01'),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '0987654321',
          department: 'Sales',
          position: 'Representative',
          salary: 55000,
          startDate: new Date('2021-03-15'),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/hr/employees', async (req, res) => {
    try {
      const employeeData = req.body;
      
      // Mock employee creation response
      const employee = {
        id: Math.random().toString(36).substring(7),
        ...employeeData,
        status: 'active',
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.get('/api/hr/payroll', async (_req, res) => {
    try {
      // Mock payroll data for testing
      const payroll = [
        {
          id: '1',
          employeeId: '1',
          employeeName: 'John Doe',
          department: 'IT',
          position: 'Manager',
          baseSalary: 75000,
          bonuses: 5000,
          deductions: 15000,
          netSalary: 65000,
          period: '2024-03',
          status: 'paid',
          paymentDate: new Date('2024-03-31'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          employeeId: '2',
          employeeName: 'Jane Smith',
          department: 'Sales',
          position: 'Representative',
          baseSalary: 55000,
          bonuses: 2000,
          deductions: 11000,
          netSalary: 46000,
          period: '2024-03',
          status: 'pending',
          paymentDate: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(payroll);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      res.status(500).json({ message: "Failed to fetch payroll" });
    }
  });

  app.post('/api/hr/payroll', async (req, res) => {
    try {
      const payrollData = req.body;
      
      // Mock payroll creation response
      const payroll = {
        id: Math.random().toString(36).substring(7),
        ...payrollData,
        status: 'pending',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(payroll);
    } catch (error) {
      console.error('Error creating payroll:', error);
      res.status(500).json({ message: "Failed to create payroll" });
    }
  });

  // Accounting endpoints
  app.get('/api/accounting/invoices', async (_req, res) => {
    try {
      // Mock invoice data for testing
      const invoices = [
        {
          id: '1',
          invoiceNumber: 'INV-001',
          customer: {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '1234567890'
          },
          items: [
            {
              id: '1',
              name: 'Product 1',
              quantity: 2,
              price: 10.99,
              total: 21.98
            },
            {
              id: '2',
              name: 'Product 2',
              quantity: 1,
              price: 15.99,
              total: 15.99
            }
          ],
          subtotal: 37.97,
          tax: 3.04,
          total: 41.01,
          status: 'paid',
          dueDate: new Date('2024-04-30'),
          paymentDate: new Date('2024-03-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          invoiceNumber: 'INV-002',
          customer: {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '0987654321'
          },
          items: [
            {
              id: '3',
              name: 'Product 3',
              quantity: 3,
              price: 5.99,
              total: 17.97
            }
          ],
          subtotal: 17.97,
          tax: 1.44,
          total: 19.41,
          status: 'pending',
          dueDate: new Date('2024-04-15'),
          paymentDate: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post('/api/accounting/invoices', async (req, res) => {
    try {
      const invoiceData = req.body;
      
      // Mock invoice creation response
      const invoice = {
        id: Math.random().toString(36).substring(7),
        invoiceNumber: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...invoiceData,
        status: 'pending',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get('/api/accounting/ledger', async (_req, res) => {
    try {
      // Mock ledger data for testing
      const ledger = [
        {
          id: '1',
          date: new Date('2024-03-01'),
          description: 'Initial balance',
          type: 'credit',
          amount: 10000.00,
          balance: 10000.00,
          category: 'equity',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          date: new Date('2024-03-15'),
          description: 'Invoice payment - INV-001',
          type: 'credit',
          amount: 41.01,
          balance: 10041.01,
          category: 'revenue',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          date: new Date('2024-03-20'),
          description: 'Office supplies',
          type: 'debit',
          amount: 150.00,
          balance: 9891.01,
          category: 'expense',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(ledger);
    } catch (error) {
      console.error('Error fetching ledger:', error);
      res.status(500).json({ message: "Failed to fetch ledger" });
    }
  });

  app.post('/api/accounting/ledger', async (req, res) => {
    try {
      const ledgerData = req.body;
      
      // Mock ledger entry creation response
      const ledger = {
        id: Math.random().toString(36).substring(7),
        ...ledgerData,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(ledger);
    } catch (error) {
      console.error('Error creating ledger entry:', error);
      res.status(500).json({ message: "Failed to create ledger entry" });
    }
  });

  // Blockchain endpoints
  app.get('/api/blockchain/transactions', async (_req, res) => {
    try {
      // Mock blockchain transaction data for testing
      const transactions = [
        {
          id: '1',
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          from: '0xabcdef1234567890abcdef1234567890abcdef12',
          to: '0x1234567890abcdef1234567890abcdef12345678',
          value: '1.5',
          currency: 'ETH',
          status: 'confirmed',
          blockNumber: 12345678,
          timestamp: new Date('2024-03-15T10:30:00Z'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          from: '0x1234567890abcdef1234567890abcdef12345678',
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          value: '0.5',
          currency: 'ETH',
          status: 'pending',
          blockNumber: null,
          timestamp: new Date('2024-03-15T11:45:00Z'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching blockchain transactions:', error);
      res.status(500).json({ message: "Failed to fetch blockchain transactions" });
    }
  });

  app.post('/api/blockchain/transactions', async (req, res) => {
    try {
      const transactionData = req.body;
      
      // Mock transaction creation response
      const transaction = {
        id: Math.random().toString(36).substring(7),
        hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
        ...transactionData,
        status: 'pending',
        blockNumber: null,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating blockchain transaction:', error);
      res.status(500).json({ message: "Failed to create blockchain transaction" });
    }
  });

  // Organization Settings Routes
  app.get('/api/organization/settings', async (_req, res) => {
    try {
      // Mock organization settings data for testing
      const settings = {
        name: 'Acme Corporation',
        address: '123 Main St, Anytown, USA',
        phone: '123-456-7890',
        email: 'contact@acmecorp.com',
        website: 'www.acmecorp.com',
        logo: '/uploads/logo.png',
        theme: {
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          fontFamily: 'Roboto'
        },
        modules: ['dashboard', 'order_management', 'inventory', 'hr', 'accounting', 'blockchain'],
        maxUsers: 10,
        maxStorage: 1000, // MB
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.json(settings);
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/organization/settings', async (req, res) => {
    try {
      const settingsData = req.body;
      
      // Mock organization settings update response
      const settings = {
        ...settingsData,
        updatedAt: new Date()
      };
      
      res.json(settings);
    } catch (error) {
      console.error('Error updating organization settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Organization Roles Routes
  app.get('/api/organization/roles', async (_req, res) => {
    try {
      // Mock organization roles data for testing
      const roles = [
        {
          id: '1',
          name: 'Admin',
          description: 'Full access to all features',
          permissions: ['all'],
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Access to most features except sensitive data',
          permissions: ['dashboard', 'order_management', 'inventory', 'hr'],
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Employee',
          description: 'Basic access to required features',
          permissions: ['dashboard', 'order_management'],
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      res.json(roles);
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/organization/roles', async (req, res) => {
    try {
      const roleData = req.body;
      
      // Mock role creation response
      const role = {
        id: Math.random().toString(36).substring(7),
        ...roleData,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(role);
    } catch (error) {
      console.error('Error creating organization role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/organization/roles/:roleId', async (req, res) => {
    try {
      const roleId = req.params.roleId;
      const roleData = req.body;
      
      // Mock role update response
      const role = {
        id: roleId,
        ...roleData,
        isSystem: false,
        updatedAt: new Date()
      };
      
      res.json(role);
    } catch (error) {
      console.error('Error updating organization role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get users by organizationId (and optionally department/role) - no authentication
  app.get('/api/mongodb/users', async (req, res) => {
    try {
      const { organizationId, department, role } = req.query;
      if (!organizationId) {
        return res.status(400).json({ message: 'organizationId is required' });
      }
      const query: any = { organizationId };
      if (department) query.department = department;
      if (role) query.role = role;
      const users = await UserModel.find(query, {
        password: 0, // Exclude password field
        __v: 0
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Get a single user by ID from MongoDB
  app.get('/api/mongodb/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await UserModel.findById(userId, {
        password: 0, // Exclude password field
        __v: 0 // Exclude version field
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user from MongoDB:', error);
      res.status(500).json({ message: "Failed to fetch user from database" });
    }
  });

  // Update a user in MongoDB
  app.put('/api/mongodb/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      // Remove MongoDB-specific fields
      const { _id, __v, ...userDataWithoutMongoFields } = userData;
      
      // Handle password update if provided
      if (userDataWithoutMongoFields.password) {
        userDataWithoutMongoFields.password = await hashPassword(userDataWithoutMongoFields.password);
      } else {
        delete userDataWithoutMongoFields.password;
      }

      // Convert department to enum value if needed
      if (userDataWithoutMongoFields.department) {
        userDataWithoutMongoFields.department = userDataWithoutMongoFields.department.replace(' ', '_');
      }

      // Define fields that should be handled as dates
      const dateFields = ['lastLogin', 'hireDate'] as const;

      // Define fields that should be handled as JSON
      const jsonFields = [
        'location', 'workSchedule', 'emergencyContact', 'skills',
        'certifications', 'education', 'performance', 'compensation',
        'benefits', 'equipment', 'accessLevels', 'documents',
        'wallet', 'legalDetails', 'address', 'permissions'
      ] as const;

      // Create a copy of the data for Prisma
      const prismaData: PrismaUserUpdateData = {
        email: userDataWithoutMongoFields.email,
        firstName: userDataWithoutMongoFields.firstName,
        lastName: userDataWithoutMongoFields.lastName,
        position: userDataWithoutMongoFields.position,
        role: userDataWithoutMongoFields.role,
        status: userDataWithoutMongoFields.status,
        employeeId: userDataWithoutMongoFields.employeeId,
        managerId: userDataWithoutMongoFields.managerId,
        team: userDataWithoutMongoFields.team,
        updatedAt: new Date()
      };

      // Handle date fields
      for (const field of dateFields) {
        if (userDataWithoutMongoFields[field]) {
          (prismaData as any)[field] = new Date(userDataWithoutMongoFields[field]);
        }
      }

      // Handle JSON fields
      for (const field of jsonFields) {
        if (userDataWithoutMongoFields[field]) {
          // If the field is already a string, use it as is, otherwise stringify it
          (prismaData as any)[field] = typeof userDataWithoutMongoFields[field] === 'string'
            ? userDataWithoutMongoFields[field]
            : userDataWithoutMongoFields[field];
        }
      }

      // Handle moduleAccess separately as it's a relation
      if (Array.isArray(userDataWithoutMongoFields.moduleAccess)) {
        // For Prisma, we need to format moduleAccess as a relation
        prismaData.moduleAccess = {
          deleteMany: {},
          create: userDataWithoutMongoFields.moduleAccess.map((module: string) => ({
            module,
            access: 'read_write' // Default access level
          }))
        };
      } else if (userDataWithoutMongoFields.moduleAccess && typeof userDataWithoutMongoFields.moduleAccess === 'object') {
        // If moduleAccess is already an object with the correct structure, use it as is
        prismaData.moduleAccess = userDataWithoutMongoFields.moduleAccess;
      }

      // Before updating in Prisma, sanitize ObjectId fields
      const objectIdFields = ['employeeId', 'managerId', 'organizationId'];
      for (const field of objectIdFields) {
        if ((prismaData as any)[field] === '') {
          (prismaData as any)[field] = null;
        }
      }

      // Update in MongoDB first
      const updatedUserMongoose = await UserModel.findByIdAndUpdate(
        userId,
        { ...userDataWithoutMongoFields, updatedAt: new Date() },
        { new: true, select: '-password -__v' }
      );
      
      if (!updatedUserMongoose) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Try to update in Prisma, but don't fail if it doesn't work
      let updatedUserPrisma = null;
      try {
        console.log('Attempting to update user in Prisma with ID:', userId);
        console.log('Prisma update data:', JSON.stringify(prismaData, null, 2));
        // Check if the user exists in Prisma before updating
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        });
        if (!existingUser) {
          console.log('User not found in Prisma database, creating new user');
          // Create the user in Prisma instead of updating
          const createData = {
            id: userId, // Use the same ID as MongoDB
            email: prismaData.email as string,
            password: updatedUserMongoose.password || 'default_password', // Use a default password if not available
            role: prismaData.role as string,
            firstName: prismaData.firstName as string,
            lastName: prismaData.lastName as string,
            position: prismaData.position as string,
            status: prismaData.status as string,
            employeeId: prismaData.employeeId as string,
            managerId: prismaData.managerId as string,
            team: prismaData.team as string,
            location: prismaData.location as any,
            workSchedule: prismaData.workSchedule as any,
            emergencyContact: prismaData.emergencyContact as any,
            skills: prismaData.skills as any,
            certifications: prismaData.certifications as any,
            education: prismaData.education as any,
            performance: prismaData.performance as any,
            compensation: prismaData.compensation as any,
            benefits: prismaData.benefits as any,
            equipment: prismaData.equipment as any,
            accessLevels: prismaData.accessLevels as any,
            documents: prismaData.documents as any,
            wallet: prismaData.wallet as any,
            legalDetails: prismaData.legalDetails as any,
            address: prismaData.address as any,
            permissions: prismaData.permissions as any,
            ...(userDataWithoutMongoFields.organizationId && { organization: { connect: { id: userDataWithoutMongoFields.organizationId } } })
          };
          // Add moduleAccess if it exists
          if (prismaData.moduleAccess) {
            (createData as any).moduleAccess = {
              create: prismaData.moduleAccess.create || []
            };
          }
          updatedUserPrisma = await prisma.user.create({
            data: createData
          });
          console.log('Successfully created user in Prisma');
        } else {
          // For updates, we need to include deleteMany
          const updateData = {
            ...prismaData,
            organizationId: userDataWithoutMongoFields.organizationId,
            moduleAccess: prismaData.moduleAccess || {
              deleteMany: {},
              create: []
            }
          };
          updatedUserPrisma = await prisma.user.update({
            where: { id: userId },
            data: updateData
          });
          console.log('Successfully updated user in Prisma');
        }
      } catch (error) {
        const prismaError = error as { message?: string };
        console.error('Error updating user in Prisma:', prismaError);
        console.error('Prisma error details:', JSON.stringify(prismaError, null, 2));
        // Check if it's a database connection error
        if (prismaError.message && prismaError.message.includes('empty database name not allowed')) {
          console.error('Prisma database connection error: The database name is missing or invalid');
        }
        // Continue with the MongoDB update
      }
      
      // If Prisma update failed, just return the MongoDB user
      if (!updatedUserPrisma) {
        return res.json(updatedUserMongoose);
      }
      
      // Parse JSON fields from Prisma response
      const parsedPrismaUser = {
        ...updatedUserPrisma,
        // Parse each JSON field
        ...Object.fromEntries(
          jsonFields
            .filter(field => (updatedUserPrisma as any)[field])
            .map(field => [field, typeof (updatedUserPrisma as any)[field] === 'string' 
              ? JSON.parse((updatedUserPrisma as any)[field] as string) 
              : (updatedUserPrisma as any)[field]])
        )
      };
      
      res.json(parsedPrismaUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: "Failed to update user in database" });
    }
  });

  // Create organization in MongoDB
  app.post('/api/organization', async (req, res) => {
    try {
      const orgData = req.body;
      console.log('Creating organization with data:', orgData);

      // Check if email is already used
      const emailToCheck = orgData.owner?.email || orgData.email;
      console.log('Checking for existing user with email:', emailToCheck);
      const existingUser = await prisma.user.findUnique({
        where: { 
          email: emailToCheck
        }
      });
      console.log('Existing user check result:', existingUser);

      if (existingUser) {
        console.log('Found existing user:', existingUser);
        return res.status(400).json({ 
          message: 'This email is already registered. Please use a different email address.' 
        });
      }

      // Get business type configuration
      const businessType = orgData.organization.businessType || 'tech_sme';
      const businessPreset = businessTypeConfig.getPreset(businessType);
      
      // Get recommended modules based on business type
      const recommendedModules = businessPreset.modules
        .filter(module => module.recommended)
        .map(module => module.id);
      
      // Use user-selected modules if present, otherwise recommended modules or default
      const selectedModules = orgData.selectedModules || [];
      const activeModules = selectedModules.length > 0
        ? selectedModules
        : (recommendedModules.length > 0 ? recommendedModules : ["accounting", "hr", "ai_analytics"]);
      
      // Get country configuration
      const countryConfig = getCountryConfig(orgData.organization.country) as CountryConfig;

      // Create new organization in Prisma with all data
      const organizationData = {
        name: orgData.organization.name,
        type: orgData.organization.type || 'business',
        industry: businessPreset.industry,
        size: businessPreset.size,
        activeModules: activeModules,
        maxModules: 5,
        address: orgData.organization.address,
        country: orgData.organization.country,
        taxId: orgData.organization.taxId,
        website: orgData.organization.website,
        walletAddress: orgData.organization.walletAddress || '',
        settings: JSON.stringify({
          theme: {
            primaryColor: '#282881',
            secondaryColor: '#ffffff',
            darkMode: false,
            fontFamily: 'Inter',
            borderRadius: '0.5rem',
            spacing: '1rem'
          },
          branding: {
            logo: null,
            favicon: null,
            companyName: orgData.organization.name,
            tagline: orgData.organization.tagline || '',
            website: orgData.organization.website || '',
            email: orgData.owner.email || '',
            phone: orgData.owner.phoneNumber || '',
            address: orgData.organization.address || '',
            socialMedia: {
              facebook: orgData.organization.socialMedia?.facebook || '',
              twitter: orgData.organization.socialMedia?.twitter || '',
              linkedin: orgData.organization.socialMedia?.linkedin || '',
              instagram: orgData.organization.socialMedia?.instagram || ''
            }
          },
          accounting: {
            fiscalYearStart: countryConfig.accounting.fiscalYearStart,
            fiscalPeriod: countryConfig.accounting.reportingPeriods[0],
            defaultCurrency: countryConfig.currency,
            taxTypes: [countryConfig.taxSystem.type],
            chartOfAccounts: businessPreset.defaultAccounts
          },
          modules: {
            enabled: activeModules,
            defaultModule: activeModules[0]
          },
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordPolicy: {
              minLength: 8,
              requireSpecialChars: true,
              requireNumbers: true
            }
          },
          integrations: {
            paymentGateways: [],
            emailService: '',
            smsService: ''
          },
          backup: {
            frequency: 'daily',
            retention: 30,
            autoBackup: true
          },
          kpis: businessPreset.keyKPIs,
          recommendedSettings: businessPreset.recommendedSettings
        }),
        roles: JSON.stringify([
          {
            name: 'Owner',
            description: 'Full access to all features',
            permissions: ['all'],
            isSystem: true,
            moduleAccess: activeModules.map((module: string) => ({
              module,
              access: 'read_write'
            }))
          },
          {
            name: 'Admin',
            description: 'Access to most features except sensitive data',
            permissions: ['dashboard', 'order_management', 'inventory', 'hr'],
            isSystem: true,
            moduleAccess: activeModules.map((module: string) => ({
              module,
              access: 'read_write'
            }))
          },
          {
            name: 'Employee',
            description: 'Basic access to required features',
            permissions: ['dashboard', 'order_management'],
            isSystem: true,
            moduleAccess: activeModules.map((module: string) => ({
              module,
              access: 'read'
            }))
          }
        ]),
        waitlistedModules: orgData.waitlistedModules || []
      };

      const organization = await prisma.organization.create({
        data: organizationData
      });

      // Create the owner user with full access
      const ownerPassword = await bcrypt.hash(orgData.owner.password, 10);
      const ownerEmail = orgData.owner.email;
      console.log('Creating owner user with data:', {
        email: ownerEmail,
        role: 'owner',
        firstName: orgData.owner.firstName,
        lastName: orgData.owner.lastName,
        organizationId: organization.id
      });
      
      const owner = await prisma.user.create({
        data: {
          ...(orgData.owner as any), // Use all fields from owner, including username
          email: ownerEmail,
          password: ownerPassword,
          role: 'owner',
          department: 'Executive',
          firstName: orgData.owner.firstName,
          lastName: orgData.owner.lastName,
          organizationId: organization.id,
          isOwner: true,
          status: 'active',
          position: 'Owner',
          moduleAccess: {
            create: activeModules.map((module: string) => ({
              module: module,
              access: 'read_write'
            }))
          },
          permissions: JSON.stringify(activeModules.map((module: string) => ({
            module,
            actions: ['read', 'write', 'delete', 'create']
          })))
        } as any, // <-- Use as any to bypass Prisma type error
        // Remove 'include: { moduleAccess: true }' if it causes errors, or use as any
        include: ({} as any)
      });
      console.log('Owner user created successfully:', owner.id);

      // Generate JWT token for automatic login
      const token = jwt.sign(
        { 
          id: owner.id,
          email: owner.email,
          role: owner.role,
          organizationId: organization.id,
          isOwner: true
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        organization,
        owner,
        token
      });

      if (orgData.waitlistedModules && orgData.waitlistedModules.length > 0) {
        // Notify owner and system admin (for now, just log)
        console.log(`Organization ${organization.name} joined waitlist for modules:`, orgData.waitlistedModules);
        // TODO: Integrate with notification system (email, in-app, etc.)
      }
    } catch (error: any) {
      console.error('Error creating organization:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          return res.status(400).json({ 
            message: 'A user with this email already exists' 
          });
        } else if (field === 'walletAddress') {
          return res.status(400).json({
            message: 'This wallet address is already registered'
          });
        }
        return res.status(400).json({ 
          message: `A record with this ${field} already exists` 
        });
      }
      
      if (error.code === 'P2010') {
        return res.status(500).json({ 
          message: 'Database connection error. Please check your database configuration.' 
        });
      }

      // Handle MongoDB Atlas errors
      if (error.message?.includes('empty database name not allowed')) {
        return res.status(500).json({ 
          message: 'Database configuration error. Please check your MongoDB connection string.' 
        });
      }

      res.status(500).json({ 
        message: 'Failed to create organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Create user in MongoDB
  app.post('/api/mongodb/users', async (req, res) => {
    try {
      const userData = req.body;
      console.log('Creating user with data:', userData);

      // Validate vendor roles require vendorId
      const vendorRoles = ['vendor_admin', 'vendor_manager', 'vendor_employee'];
      if (vendorRoles.includes(userData.role) && !userData.vendorId) {
        return res.status(400).json({ message: 'Vendor ID is required for vendor roles' });
      }

      // Hash the password before saving
      const hashedPassword = await hashPassword(userData.password);
      
      // If moduleAccess is missing or empty, derive it from permissions
      let moduleAccess = userData.moduleAccess;
      if (userData.role === 'owner') {
        // Owners get all modules
        moduleAccess = Array.isArray(moduleAccess) && moduleAccess.length > 0 ? moduleAccess : availableModules;
      } else if (vendorRoles.includes(userData.role)) {
        // Vendor roles get limited access
        moduleAccess = ['inventory', 'pos'];
      } else if ((!moduleAccess || moduleAccess.length === 0) && userData.permissions) {
        moduleAccess = userData.permissions.map((p: any) =>
          typeof p === 'string'
            ? p
            : p.module
              ? p.module
              : null
        ).filter(Boolean);
      }
      // Ensure moduleAccess is always an array of strings
      moduleAccess = Array.isArray(moduleAccess) ? moduleAccess.map((m: any) => typeof m === 'string' ? m : m.module) : [];
      
      // Sanitize managerId: set to null if not a valid ObjectId
      const managerId = userData.managerId && typeof userData.managerId === 'string' && userData.managerId.length === 24 ? userData.managerId : null;
      // Convert hireDate and other date fields to Date objects if present
      const hireDate = userData.hireDate ? new Date(userData.hireDate) : undefined;
      
      // Prepare user data for creation
      const userCreateData = {
        ...(userData as any),
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId: userData.organizationId,
        status: 'active',
        position: userData.position,
        hireDate,
        managerId,
        moduleAccess,
        // Include vendorId if provided
        ...(userData.vendorId && { vendorId: userData.vendorId }),
      } as any;

      // Create new user in Prisma
      const user = await prisma.user.create({
        data: userCreateData,
        include: ({} as any)
      });

      // Return user without sensitive data
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Analytics endpoint
  app.get('/api/analytics', async (req, res) => {
    try {
      if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const timeRange = req.query.timeRange as string || '7d';
      const days = parseInt(timeRange.replace(/[^0-9]/g, '')) || 7;

      // Get organization metrics for the current user's organization
      const organization = await prisma.organization.findUnique({
        where: { id: req.user.organizationId },
        include: { users: true }
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Safely fetch and transform users
      const users = organization.users || [];
      const safeUsers = users.map(user => {
        const safeUser = { ...user } as any;
        
        // Safely convert date fields
        const dateFields = ['hireDate', 'lastLogin', 'createdAt', 'updatedAt'] as const;
        dateFields.forEach(field => {
          if (safeUser[field]) {
            try {
              safeUser[field] = new Date(safeUser[field]).toISOString();
            } catch (e) {
              safeUser[field] = null;
            }
          } else {
            safeUser[field] = null;
          }
        });

        return safeUser;
      });

      // Calculate metrics using safeUsers
      const activeUsers = safeUsers.filter(u => u.status === 'active');
      const newUsers = safeUsers.filter(u => {
        if (!u.createdAt) return false;
        const createdDate = new Date(u.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      });

      // System metrics
      const systemMetrics = {
        users: {
          total: safeUsers.length,
          active: activeUsers.length,
          new: newUsers.length,
          inactive: safeUsers.filter(u => u.status === 'inactive').length
        },
        activity: {
          transactions: 0,
          journalEntries: 0,
          employees: activeUsers.length,
          businessPartners: 0
        },
        storage: {
          total: 1024 * 1024 * 1024 * 10,
          used: 1024 * 1024 * 1024 * 4,
          free: 1024 * 1024 * 1024 * 6
        },
        performance: {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          uptime: 99.9
        }
      };

      // Daily stats for the specified time range
      const dailyStats = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          transactions: Math.floor(Math.random() * 100) + 50,
          errors: Math.floor(Math.random() * 5),
          latency: Math.floor(Math.random() * 50) + 100
        };
      }).reverse();

      // Top users based on last login
      const topUsers = safeUsers
        .map(user => ({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.username || user.id,
          activity: user.lastLogin ? 1 : 0,
          lastLogin: user.lastLogin
        }))
        .sort((a, b) => {
          if (!a.lastLogin) return 1;
          if (!b.lastLogin) return -1;
          return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
        })
        .slice(0, 5);

      // Module usage stats
      const modules = organization.activeModules || [];
      const moduleUsage = modules.map(module => ({
        module,
        usageCount: Math.floor(Math.random() * 100) + 10,
        lastUsed: new Date(Date.now() - Math.floor(Math.random() * days) * 86400000).toISOString()
      }));

      // Login activity
      const loginActivity = safeUsers.map(user => ({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.username || user.id,
        logins: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
          count: user.lastLogin ? 1 : 0
        }))
      }));

      // AI insights
      const aiInsights = [
        { type: 'success', title: 'User Engagement Up', description: 'User logins increased 20% this week.' },
        { type: 'info', title: 'Module Usage', description: 'Inventory and HR modules are most used.' },
        { type: 'warning', title: 'Load Time Spike', description: 'Average load time spiked on Monday.' }
      ];

      res.json({
        systemMetrics,
        dailyStats,
        topUsers,
        moduleUsage,
        loginActivity,
        aiInsights,
        organization: {
          name: organization.name,
          size: organization.size,
          createdAt: organization.createdAt?.toISOString(),
          activeModules: organization.activeModules
        }
      });
    } catch (error: unknown) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      // Fetch full user data with organization
      const fullUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { organization: true }
      });

      // Always set isOwner true for owners
      if (fullUser && fullUser.role === 'owner') {
        (fullUser as any).isOwner = true;
      }

      // Parse permissions if string
      if (fullUser && typeof (fullUser as any).permissions === 'string') {
        try {
          (fullUser as any).permissions = JSON.parse((fullUser as any).permissions);
        } catch (e) {
          (fullUser as any).permissions = [];
        }
      }

      // For owners, set moduleAccess to all modules if missing/empty
      if (fullUser && (fullUser as any).isOwner && (!(fullUser as any).moduleAccess || (fullUser as any).moduleAccess.length === 0)) {
        (fullUser as any).moduleAccess = [
          'accounting', 'procurement', 'manufacturing', 'inventory', 'order_management', 'warehouse', 'supply_chain', 'crm', 'project_service', 'workforce', 'hr', 'ecommerce', 'marketing', 'pos', 'quality', 'maintenance', 'project', 'analytics', 'global_finance', 'international_trade', 'customer_experience', 'vendor_management', 'ai_analytics', 'ecommerce_global', 'localization', 'digital_currency'
        ];
      }

      // Log the full user object for debugging
      console.dir(fullUser, { depth: null, colors: true });

      if (!fullUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = fullUser;
      res.json({
        ...userWithoutPassword,
        moduleAccess: (fullUser as any).moduleAccess || [],
        organization: fullUser.organization ? {
          id: fullUser.organization.id,
          name: fullUser.organization.name,
          type: (fullUser.organization as any)?.type ?? null,
          industry: (fullUser.organization as any)?.industry ?? null,
          size: (fullUser.organization as any)?.size ?? null,
          walletAddress: (fullUser.organization as any)?.walletAddress ?? null,
          activeModules: (fullUser.organization as any)?.activeModules || [],
          maxModules: (fullUser.organization as any)?.maxModules ?? 2,
          address: (fullUser.organization as any)?.address ?? null,
          country: (fullUser.organization as any)?.country ?? null,
          taxId: (fullUser.organization as any)?.taxId ?? null,
          website: (fullUser.organization as any)?.website ?? null,
          settings: (fullUser.organization as any)?.settings ?? null,
          roles: (fullUser.organization as any)?.roles ?? null
        } : null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  // Financial Metrics endpoint
  app.get('/api/financial/metrics', async (req, res) => {
    // Always return data, even if there's an error
    const financialData = {
      overview: {
        revenue: {
          current: 125000,
          previous: 100000,
          growth: 25,
          trend: 'up'
        },
        expenses: {
          current: 75000,
          previous: 80000,
          growth: -6.25,
          trend: 'down'
        },
        profit: {
          current: 50000,
          previous: 20000,
          growth: 150,
          trend: 'up'
        },
        cashFlow: {
          current: 45000,
          previous: 15000,
          growth: 200,
          trend: 'up'
        }
      },
      accounts: {
        receivable: {
          current: 35000,
          previous: 30000,
          growth: 16.67,
          trend: 'up'
        },
        payable: {
          current: 25000,
          previous: 28000,
          growth: -10.71,
          trend: 'down'
        }
      },
      monthlyMetrics: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        revenue: Math.floor(Math.random() * 50000) + 50000,
        expenses: Math.floor(Math.random() * 30000) + 20000,
        profit: Math.floor(Math.random() * 20000) + 10000
      })),
      topExpenses: [
        { category: 'Payroll', amount: 35000, percentage: 46.67 },
        { category: 'Rent', amount: 12000, percentage: 16 },
        { category: 'Utilities', amount: 8000, percentage: 10.67 },
        { category: 'Marketing', amount: 7000, percentage: 9.33 },
        { category: 'Supplies', amount: 5000, percentage: 6.67 }
      ],
      revenueByCategory: [
        { category: 'Product Sales', amount: 75000, percentage: 60 },
        { category: 'Services', amount: 30000, percentage: 24 },
        { category: 'Subscriptions', amount: 15000, percentage: 12 },
        { category: 'Other', amount: 5000, percentage: 4 }
      ],
      cashFlow: {
        operating: 45000,
        investing: -15000,
        financing: 5000,
        net: 35000
      },
      ratios: {
        currentRatio: 2.5,
        quickRatio: 1.8,
        debtToEquity: 0.4,
        returnOnEquity: 0.15
      },
      forecasts: {
        nextMonth: {
          revenue: 130000,
          expenses: 78000,
          profit: 52000
        },
        nextQuarter: {
          revenue: 400000,
          expenses: 240000,
          profit: 160000
        }
      }
    };

    res.json(financialData);
  });

  // Blockchain Data endpoint
  app.get('/api/blockchain/data', async (req, res) => {
    try {
      if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Dummy blockchain data
      const blockchainData = {
        // Ethereum data
        ethereum: {
          balance: {
            eth: 15.5,
            usdc: 5000,
            usdt: 3000
          },
          recentTransactions: Array.from({ length: 10 }, (_, i) => ({
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            type: ['transfer', 'swap', 'contract'][Math.floor(Math.random() * 3)],
            amount: (Math.random() * 2).toFixed(4),
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            status: ['success', 'pending'][Math.floor(Math.random() * 2)],
            from: `0x${Math.random().toString(16).substr(2, 40)}`,
            to: `0x${Math.random().toString(16).substr(2, 40)}`,
            gasUsed: Math.floor(Math.random() * 100000) + 21000,
            gasPrice: (Math.random() * 50 + 20).toFixed(2)
          })),
          tokenHoldings: [
            { symbol: 'ETH', amount: 15.5, value: 31000 },
            { symbol: 'USDT', amount: 5000, value: 5000 },
            { symbol: 'USDC', amount: 3000, value: 3000 }
          ],
          networkStats: {
            gasPrice: {
              current: 25,
              previous: 30,
              trend: 'down'
            },
            networkLoad: {
              current: 65,
              previous: 70,
              trend: 'down'
            },
            blockTime: {
              current: 12,
              previous: 15,
              trend: 'down'
            }
          },
          smartContracts: [
            {
              name: 'Payment Processor',
              address: `0x${Math.random().toString(16).substr(2, 40)}`,
              type: 'payment',
              status: 'active',
              transactions: Math.floor(Math.random() * 1000)
            },
            {
              name: 'Token Swap',
              address: `0x${Math.random().toString(16).substr(2, 40)}`,
              type: 'swap',
              status: 'active',
              transactions: Math.floor(Math.random() * 500)
            }
          ],
          monthlyMetrics: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
            transactions: Math.floor(Math.random() * 100) + 50,
            volume: Math.floor(Math.random() * 100000) + 10000,
            gasUsed: Math.floor(Math.random() * 1000) + 500
          }))
        },

        // Stellar data
        stellar: {
          balance: {
            xlm: 5000,
            usdc: 2500,
            eur: 1800
          },
          recentTransactions: Array.from({ length: 10 }, (_, i) => ({
            id: `stellar_${Math.random().toString(36).substr(2, 9)}`,
            type: ['payment', 'trustline', 'offer'][Math.floor(Math.random() * 3)],
            amount: (Math.random() * 1000).toFixed(2),
            asset: ['XLM', 'USDC', 'EUR'][Math.floor(Math.random() * 3)],
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            status: ['success', 'pending'][Math.floor(Math.random() * 2)],
            from: `G${Math.random().toString(36).substr(2, 56)}`,
            to: `G${Math.random().toString(36).substr(2, 56)}`,
            memo: ['Payment for services', 'Monthly subscription', 'Refund'][Math.floor(Math.random() * 3)]
          })),
          trustlines: [
            { asset: 'USDC', limit: '10000', balance: '2500' },
            { asset: 'EUR', limit: '5000', balance: '1800' }
          ],
          offers: [
            { selling: 'XLM', buying: 'USDC', amount: '1000', price: '0.25' },
            { selling: 'USDC', buying: 'EUR', amount: '500', price: '0.85' }
          ],
          payments: {
            total: 150,
            pending: 3,
            completed: 147,
            failed: 0
          },
          networkStats: {
            ledgerCount: 45000000,
            operationCount: 150000000,
            transactionCount: 75000000,
            averageFee: '0.00001'
          },
          monthlyMetrics: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
            transactions: Math.floor(Math.random() * 1000) + 500,
            volume: Math.floor(Math.random() * 1000000) + 100000,
            operations: Math.floor(Math.random() * 2000) + 1000
          }))
        }
      };

      res.json(blockchainData);
    } catch (error: unknown) {
      console.error('Error fetching blockchain data:', error);
      res.status(500).json({
        error: 'Failed to fetch blockchain data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return createServer(app);
}
