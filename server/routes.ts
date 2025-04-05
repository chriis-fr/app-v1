import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hasModuleAccess, hasRole } from "./auth";
import { storage } from "./storage"
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User, Organization, OrganizationSettings, Role } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { User as UserModel, Organization as OrganizationModel } from './mongodb/models';
import usersRouter from './src/routes/users';

// Add type declarations for organization document
interface IOrganizationDocument {
  settings: OrganizationSettings;
  roles: Role[];
  save(): Promise<IOrganizationDocument>;
}

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
  user: User;
}

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Mount users routes
  app.use('/api/users', usersRouter);

  // User profile routes
  app.put('/api/user/profile', async (req: Request, res: Response) => {
    if (!(req as AuthenticatedRequest).isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { firstName, lastName, email, phoneNumber } = req.body;
      const user = await storage.getUser((req as AuthenticatedRequest).user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user fields
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.phoneNumber = phoneNumber;
      user.updatedAt = new Date();

      const updatedUser = await user.save();
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Profile photo upload
  app.post('/api/user/photo', upload.single('photo'), async (req: Request, res: Response) => {
    if (!(req as AuthenticatedRequest).isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const user = await storage.getUser((req as AuthenticatedRequest).user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old photo if exists
      if (user.avatarUrl) {
        const oldPhotoPath = path.join('uploads', path.basename(user.avatarUrl));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Save new photo URL
      user.avatarUrl = `/uploads/${file.filename}`;
      user.updatedAt = new Date();
      await user.save();

      res.json({ url: user.avatarUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Profile photo deletion
  app.delete('/api/user/photo', async (req: Request, res: Response) => {
    if (!(req as AuthenticatedRequest).isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser((req as AuthenticatedRequest).user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.avatarUrl) {
        const photoPath = path.join('uploads', path.basename(user.avatarUrl));
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      user.avatarUrl = null;
      user.updatedAt = new Date();
      await user.save();

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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const org = await storage.getOrganization(req.user.organizationId.toString());
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json({
      modules: org.activeModules,
      role: req.user.role,
      maxModules: org.maxModules
    });
  });

  // Dormant API endpoints for future implementation
  const httpServer = createServer(app);

  // POS endpoints
  app.get('/api/pos/orders', hasModuleAccess('order_management'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));
  app.post('/api/pos/orders', hasModuleAccess('order_management'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));
  app.get('/api/pos/inventory', hasModuleAccess('inventory'), hasRole(['admin', 'manager', 'employee']), (_req, res) => res.sendStatus(501));
  app.post('/api/pos/inventory', hasModuleAccess('inventory'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));

  // HR endpoints
  app.get('/api/hr/employees', hasModuleAccess('hr'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));
  app.post('/api/hr/employees', hasModuleAccess('hr'), hasRole(['admin']), (_req, res) => res.sendStatus(501));
  app.get('/api/hr/payroll', hasModuleAccess('hr'), hasRole(['admin']), (_req, res) => res.sendStatus(501));
  app.post('/api/hr/payroll', hasModuleAccess('hr'), hasRole(['admin']), (_req, res) => res.sendStatus(501));

  // Accounting endpoints
  app.get('/api/accounting/invoices', (_req, res) => res.sendStatus(501));
  app.post('/api/accounting/invoices', (_req, res) => res.sendStatus(501));
  app.get('/api/accounting/ledger', (_req, res) => res.sendStatus(501));
  app.post('/api/accounting/ledger', (_req, res) => res.sendStatus(501));

  // Blockchain endpoints
  app.get('/api/blockchain/transactions', (_req, res) => res.sendStatus(501));
  app.post('/api/blockchain/transactions', (_req, res) => res.sendStatus(501));

  // Organization Settings Routes
  app.get('/api/organization/settings', hasModuleAccess('organization'), async (req, res) => {
    try {
      const organization = await OrganizationModel.findById(req.user?.organizationId) as unknown as IOrganizationDocument;
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      res.json(organization.settings || {});
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/organization/settings', hasModuleAccess('organization'), async (req, res) => {
    try {
      const organization = await OrganizationModel.findById(req.user?.organizationId) as unknown as IOrganizationDocument;
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      const settings = req.body as OrganizationSettings;
      organization.settings = settings;
      await organization.save();
      res.json(organization.settings);
    } catch (error) {
      console.error('Error updating organization settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Organization Roles Routes
  app.get('/api/organization/roles', hasModuleAccess('organization'), async (req, res) => {
    try {
      const organization = await OrganizationModel.findById(req.user?.organizationId) as unknown as IOrganizationDocument;
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      res.json(organization.roles || []);
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/organization/roles', hasModuleAccess('organization'), async (req, res) => {
    try {
      const organization = await OrganizationModel.findById(req.user?.organizationId) as unknown as IOrganizationDocument;
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      const role = req.body as Omit<Role, 'id'>;
      const newRole: Role = {
        ...role,
        id: uuidv4(),
        isSystem: false
      };
      organization.roles = organization.roles || [];
      organization.roles.push(newRole);
      await organization.save();
      res.status(201).json(newRole);
    } catch (error) {
      console.error('Error creating organization role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/organization/roles/:roleId', hasModuleAccess('organization'), async (req, res) => {
    try {
      const organization = await OrganizationModel.findById(req.user?.organizationId) as unknown as IOrganizationDocument;
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      const roleId = req.params.roleId;
      const roleIndex = organization.roles.findIndex((r: Role) => r.id === roleId);
      if (roleIndex === -1) {
        return res.status(404).json({ error: 'Role not found' });
      }
      if (organization.roles[roleIndex].isSystem) {
        return res.status(403).json({ error: 'Cannot modify system roles' });
      }
      const updatedRole = req.body as Omit<Role, 'id' | 'isSystem'>;
      organization.roles[roleIndex] = {
        ...organization.roles[roleIndex],
        ...updatedRole
      };
      await organization.save();
      res.json(organization.roles[roleIndex]);
    } catch (error) {
      console.error('Error updating organization role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return httpServer;
}
