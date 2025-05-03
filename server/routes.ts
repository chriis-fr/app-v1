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
import type { User as PrismaUser, ModuleAccess, Prisma } from '@prisma/client';
import type { MongooseUser } from './models/user.model';
import type { User as SharedUser } from '@shared/schema';
import bcrypt from 'bcryptjs';
import hrRouter from './src/routes/hr';

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
  isAuthenticated(): this is AuthenticatedRequest;
  user: SharedUser;
}

export async function registerRoutes(app: express.Express): Promise<Server> {
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
      const userToUpdate = userId || '65f8a1b2c3d4e5f6a7b8c9d0'; // Replace with actual user ID from auth
      
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

  // Dormant API endpoints for future implementation
  const httpServer = createServer(app);

  // POS endpoints
  app.get('/api/pos/orders', async (_req, res) => {
    try {
      // Mock order data for testing
      const orders = [
        {
          id: '1',
          orderNumber: 'ORD-001',
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
          total: 37.97,
          status: 'completed',
          paymentMethod: 'credit_card',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
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
          total: 17.97,
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

  app.post('/api/pos/orders', async (req, res) => {
    try {
      const orderData = req.body;
      
      // Mock order creation response
      const order = {
        id: Math.random().toString(36).substring(7),
        orderNumber: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/pos/inventory', async (_req, res) => {
    try {
      // Mock inventory data for testing
      const inventory = [
        {
          id: '1',
          name: 'Product 1',
          sku: 'SKU-001',
          quantity: 100,
          price: 10.99,
          category: 'Electronics',
          status: 'in_stock',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Product 2',
          sku: 'SKU-002',
          quantity: 50,
          price: 15.99,
          category: 'Clothing',
          status: 'low_stock',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Product 3',
          sku: 'SKU-003',
          quantity: 0,
          price: 5.99,
          category: 'Food',
          status: 'out_of_stock',
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

  app.post('/api/pos/inventory', async (req, res) => {
    try {
      const inventoryData = req.body;
      
      // Mock inventory creation response
      const inventory = {
        id: Math.random().toString(36).substring(7),
        sku: `SKU-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...inventoryData,
        status: inventoryData.quantity > 0 ? 'in_stock' : 'out_of_stock',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(inventory);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({ message: "Failed to create inventory item" });
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

  // Get actual users from MongoDB
  app.get('/api/mongodb/users', async (_req, res) => {
    try {
      const users = await UserModel.find({}, {
        password: 0, // Exclude password field
        __v: 0 // Exclude version field
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users from MongoDB:', error);
      res.status(500).json({ message: "Failed to fetch users from database" });
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
        username: userDataWithoutMongoFields.username,
        email: userDataWithoutMongoFields.email,
        firstName: userDataWithoutMongoFields.firstName,
        lastName: userDataWithoutMongoFields.lastName,
        phoneNumber: userDataWithoutMongoFields.phoneNumber,
        position: userDataWithoutMongoFields.position,
        role: userDataWithoutMongoFields.role,
        department: userDataWithoutMongoFields.department,
        organizationId: userDataWithoutMongoFields.organizationId,
        isOwner: userDataWithoutMongoFields.isOwner,
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
            username: prismaData.username as string,
            email: prismaData.email as string,
            password: updatedUserMongoose.password || 'default_password', // Use a default password if not available
            role: prismaData.role as string,
            firstName: prismaData.firstName as string,
            lastName: prismaData.lastName as string,
            phoneNumber: prismaData.phoneNumber as string,
            position: prismaData.position as string,
            department: prismaData.department as string,
            organizationId: prismaData.organizationId as string,
            isOwner: prismaData.isOwner as boolean,
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
            permissions: prismaData.permissions as any
          };
          
          // Add moduleAccess if it exists
          if (prismaData.moduleAccess) {
            // For creation, we only need the create part, not deleteMany
            (createData as any).moduleAccess = {
              create: prismaData.moduleAccess.create || []
            };
          }
          
          updatedUserPrisma = await prisma.user.create({
            data: createData,
            include: {
              moduleAccess: true
            }
          });
          console.log('Successfully created user in Prisma');
        } else {
          // For updates, we need to include deleteMany
          const updateData = {
            ...prismaData,
            moduleAccess: prismaData.moduleAccess || {
              deleteMany: {},
              create: []
            }
          };
          
          updatedUserPrisma = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
              moduleAccess: true
            }
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

      // Create new organization in MongoDB
      const organization = new Organization({
        ...orgData,
        activeModules: ['accounting'], // Default module
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Save to database
      await organization.save();
      console.log('Organization saved to database:', organization);

      res.status(201).json(organization);
    } catch (error) {
      console.error('Error creating organization in MongoDB:', error);
      res.status(500).json({ message: 'Failed to create organization in database' });
    }
  });

  // Create user in MongoDB
  app.post('/api/mongodb/users', async (req, res) => {
    try {
      const userData = req.body;
      console.log('Creating user with data:', userData);

      // Hash the password before saving
      const hashedPassword = await hashPassword(userData.password);
      
      // Create new user in MongoDB
      const user = new UserModel({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Save to database
      await user.save();
      console.log('User saved to database:', user);

      // Return user without sensitive data
      const { password, ...userWithoutPassword } = user.toObject();
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user in MongoDB:', error);
      res.status(500).json({ message: 'Failed to create user in database' });
    }
  });

  return httpServer;
}
